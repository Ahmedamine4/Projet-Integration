
provider "aws" {
  region = var.aws_region
}

# KEY PAIR


resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-key"
  public_key = file("${path.module}/keys/id_rsa.pub")

  tags = {
    Name = "${var.project_name}-keypair"
  }
}

# ============================================================================
# RDS POSTGRES
# ============================================================================

resource "aws_db_subnet_group" "postgres" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.db_1.id, aws_subnet.db_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage       = 20
  storage_type            = "gp2"
  storage_encrypted       = true
  publicly_accessible     = false
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.db.id]
  backup_retention_period = 7
  multi_az                = true
  skip_final_snapshot     = true

  tags = {
    Name = "${var.project_name}-db"
  }
}

# ============================================================================
# EC2 INSTANCES
# ============================================================================

resource "aws_instance" "app_1" {
  ami                    = "ami-090543c0c8acd0a28" # Debian 12
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.deployer.key_name

  tags = {
    Name = "${var.project_name}-app-1"
  }
}

resource "aws_instance" "app_2" {
  ami                    = "ami-090543c0c8acd0a28" # Debian 12
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public_2.id
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = aws_key_pair.deployer.key_name

  tags = {
    Name = "${var.project_name}-app-2"
  }
}

# ============================================================================
# LOAD BALANCER
# ============================================================================

resource "aws_lb" "app" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  tags = {
    Name = "${var.project_name}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg"
  }
}

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-frontend-tg"
  }
}

resource "aws_lb_target_group_attachment" "app_1" {
  target_group_arn = aws_lb_target_group.app.arn
  target_id        = aws_instance.app_1.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "app_2" {
  target_group_arn = aws_lb_target_group.app.arn
  target_id        = aws_instance.app_2.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "frontend_1" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app_1.id
  port             = 80
}

resource "aws_lb_target_group_attachment" "frontend_2" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app_2.id
  port             = 80
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.app.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ============================================================================
# S3 & CLOUDFRONT
# ============================================================================

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled = true

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "ALBFrontendOrigin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALBFrontendOrigin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cf-frontend"
  }
}

resource "aws_cloudfront_distribution" "api" {
  enabled = true

  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "ALBOrigin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALBOrigin"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cf-api"
  }
}

# ============================================================================
# ANSIBLE DEPLOYMENT
# ============================================================================

resource "terraform_data" "ansible_deploy" {
  triggers_replace = [
    timestamp(),
    aws_instance.app_1.id,
    aws_instance.app_2.id,
    aws_db_instance.postgres.endpoint,
    aws_cloudfront_distribution.api.domain_name,
    aws_cloudfront_distribution.frontend.domain_name,
    filesha256("${path.module}/../ansible/deploy.yml"),
    filesha256("${path.module}/../ansible/run-from-terraform.ps1")
  ]

  provisioner "local-exec" {
    working_dir = path.module
    command     = "powershell -ExecutionPolicy Bypass -File ../ansible/run-from-terraform.ps1"

    environment = {
      INSTANCE_1_IP              = aws_instance.app_1.public_ip
      INSTANCE_2_IP              = aws_instance.app_2.public_ip
      SSH_KEY_FILE               = "keys/id_rsa"
      DB_HOST                    = split(":", aws_db_instance.postgres.endpoint)[0]
      DB_PASSWORD                = var.db_password
      JWT_SECRET                 = var.jwt_secret
      JWT_REFRESH_SECRET         = var.jwt_refresh_secret
      SUPABASE_SERVICE_ROLE_KEY  = var.supabase_service_role_key
      GITHUB_CLIENT_SECRET       = var.github_client_secret
      CLOUDFRONT_API_DOMAIN      = aws_cloudfront_distribution.api.domain_name
      CLOUDFRONT_FRONTEND_DOMAIN = aws_cloudfront_distribution.frontend.domain_name
    }
  }

  depends_on = [
    aws_lb_listener.app,
    aws_lb_listener_rule.api,
    aws_lb_target_group_attachment.app_1,
    aws_lb_target_group_attachment.app_2,
    aws_lb_target_group_attachment.frontend_1,
    aws_lb_target_group_attachment.frontend_2
  ]
}


data "aws_caller_identity" "current" {}

