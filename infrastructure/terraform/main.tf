# --- BASE DE DONNÉES RDS (POSTGRESQL POUR PRISMA) ---
resource "aws_db_subnet_group" "db_subnets" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id  # ✅ PRIVÉ (pas public)

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  db_name                = "portfolio_db"
  username               = "portfolio_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = true  # ✅ PRIVÉ (sécurisé)

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

# --- EC2 BACKEND + IA ---
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-${var.environment}-key"
public_key = file("${path.module}/keys/id_rsa.pub")
}

resource "aws_instance" "app_server" {
  ami                    = "ami-00ac45f3035ff009e"  # Ubuntu 22.04 LTS eu-west-3
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  key_name               = aws_key_pair.deployer.key_name
  
  # ✅ Script de setup automatique
  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y git curl postgresql-client
    
    # Installation NVM + Node.js
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="/root/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts
    ln -sf $(which node) /usr/local/bin/node
    ln -sf $(which npm) /usr/local/bin/npm
    
    # PM2 pour gérer l'application
    npm install -g pm2
    
    echo "✅ Backend EC2 prêt"
  EOF
  )

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-ai"
  }
}

# --- LOAD BALANCER (ALB) ---
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-${var.environment}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/api/health"  # ✅ Ajoute un vrai endpoint de health check
    protocol            = "HTTP"
    port                = "3000"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = aws_lb_target_group.main.arn
  target_id        = aws_instance.app_server.id
  port             = 3000
}

# --- S3 FRONTEND ---
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"  # ✅ Unique avec account ID

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  depends_on = [aws_s3_bucket_public_access_block.frontend]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # Vue Router SPA
  }
}

# ✅ Récupérer l'account ID
data "aws_caller_identity" "current" {}


resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-app-eip"
  }
} 