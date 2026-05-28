# --- BASE DE DONNÉES RDS (POSTGRESQL POUR PRISMA) ---
resource "aws_db_subnet_group" "db_subnets" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id # Utilise tes subnets prives (apres error je teste avec public)
}

resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro" # AWS Free Tier
  db_name                = "portfolio_db"
  username               = "portfolio_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = true
}

# (BACKEND & IA )
resource "aws_instance" "app_server" {
  ami                    = "ami-00ac45f3035ff009e" # Ubuntu 22.04 LTS a Paris (eu-west-3)
  instance_type          = "t3.medium"             # 2 vCPUs, 4 Go RAM (Parfait pour charger ton backend + IA)
  subnet_id              = aws_subnet.private[0].id 
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-ai"
  }
}

# ALB
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id 
}

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-${var.environment}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/" 
    protocol            = "HTTP"
    port                = "3000"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
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

#S3
resource "aws_s3_bucket" "frontend" {
  bucket = "projet-integration-2026-25052005" # Doit etre unique
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}