# --- BASE DE DONNÉES RDS (POSTGRESQL - 100% PRIVÉE) ---
resource "aws_db_subnet_group" "db_subnets" {
  name_prefix = "${var.project_name}-${var.environment}-db-subnet-" # ◄ Change 'name' par 'name_prefix' (ajoute un tiret à la fin)
  subnet_ids  = aws_subnet.private[*].id

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
  publicly_accessible    = false # ✅ PRIVÉ (Invisible depuis Internet)

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

# --- Clé SSH ---
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = file("${path.module}/keys/id_rsa.pub")
}

# ---  TEMPLATE DE LANCEMENT (LAUNCH TEMPLATE) POUR EC2 ---
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-${var.environment}-lt-"
  image_id      = "ami-090543c0c8acd0a28" # Debian 12 eu-west 3
  instance_type = "t3.medium"
  key_name      = aws_key_pair.deployer.key_name
  /*iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }*/
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  /*user_data = base64encode(<<-EOF
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
    
    echo " Backend EC2 prêt"
  EOF
  )*/
user_data = base64encode(<<-EOF
  #!/bin/bash
  set -e
  apt-get update -y
  apt-get install -y curl
  
  # Installer Docker
  curl -fsSL https://get.docker.com | sh
  systemctl start docker
  systemctl enable docker
  
  # Créer le dossier pour l'env
  mkdir -p /etc/portfolio
  
  # Créer le fichier .env
  cat > /etc/portfolio/.env << 'ENVFILE'
DATABASE_URL="postgresql://portfolio_user:${var.db_password}@${aws_db_instance.postgres.endpoint}/portfolio_db?schema=public"
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${var.supabase_service_role_key}
JWT_SECRET=${var.jwt_secret}
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=${var.jwt_refresh_secret}
JWT_REFRESH_EXPIRES_IN=7d
GITHUB_CLIENT_ID=Ov23liLr8BGE52aNeqd9
GITHUB_CLIENT_SECRET=${var.github_client_secret}
GITHUB_REDIRECT_URI=http://portfolio-prod-alb-201423850.eu-west-3.elb.amazonaws.com/api/github/callback
AI_API_URL=portfolio-prod-alb-201423850.eu-west-3.elb.amazonaws.com
ENVFILE
  
  echo " Instance prête. Docker installé, .env créé"
EOF
)

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-${var.environment}-backend-ai"
    }
  }
}

# --- ✅ AUTO SCALING GROUP (ASG MULTI-AZ) ---
resource "aws_autoscaling_group" "app_asg" {
  name                = "${var.project_name}-${var.environment}-asg"
  desired_capacity    = 2
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = aws_subnet.public[*].id # ✅ Déploiement dans les Subnets Privés
  target_group_arns   = [aws_lb_target_group.main.arn] # ✅ Attachement automatique à l'ALB

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- LOAD BALANCER (ALB) ---
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id # L'ALB reste public pour recevoir le trafic

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
  path                = "/"
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

# --- S3 FRONTEND ---
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"

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
  bucket     = aws_s3_bucket.frontend.id
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
    key = "index.html"
  }
}

data "aws_caller_identity" "current" {}

# --- CLOUDFRONT ---
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_distribution" "api_distribution" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "api_cloudfront_domain" {
  value = aws_cloudfront_distribution.api_distribution.domain_name
}


#pour session manager
/*

resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}



resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_role_policy" "ssm_inline_policy" {
  name   = "${var.project_name}-${var.environment}-ssm-policy"
  role   = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:UpdateInstanceInformation",
          "ssmmessages:AcknowledgeMessage",
          "ssmmessages:GetEndpoint",
          "ssmmessages:GetMessages",
          "ec2messages:AcknowledgeMessage",
          "ec2messages:GetEndpoint",
          "ec2messages:GetMessages"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::aws-ssm-${data.aws_region.current.name}/*"
      }
    ]
  })
}

data "aws_region" "current" {}*/