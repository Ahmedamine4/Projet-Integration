# Pare-feu pour le Load Balancer
resource "aws_security_group" "alb_sg" {
  name_prefix = "${var.project_name}-${var.environment}-alb-sg"
  vpc_id      = aws_vpc.main.id
  description = "ALB - accept HTTP/HTTPS from internet"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

/*resource "aws_security_group_rule" "ai_from_backend" {
  type              = "ingress"
  from_port         = 8000
  to_port           = 8000
  protocol          = "tcp"
  security_group_id = aws_security_group.ai_sg.id
  source_security_group_id = aws_security_group.app_sg.id
  description       = "From Backend to AI"
}*/


# Pare-feu pour l'EC2 Backend (App)
resource "aws_security_group" "app_sg" {
  name_prefix = "${var.project_name}-${var.environment}-app-sg"
  vpc_id      = aws_vpc.main.id
  description = "EC2 backend - port 3000 from ALB, SSH from user"

  # ALB -> EC2 port 3000 (backend)
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # ALB -> EC2 port 80 (frontend)
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "ALB to frontend"
  }

  # Prometheus scraping
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring_sg.id]
    description     = "Prometheus metrics"
  }

  # SSH from user
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.your_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-app-sg"
  }
}

# Pare-feu pour l'EC2 AI
resource "aws_security_group" "ai_sg" {
  name_prefix = "${var.project_name}-${var.environment}-ai-sg"
  vpc_id      = aws_vpc.main.id
  description = "EC2 AI - port 5000 from app, SSH from user"

  # App -> AI port 5000
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "Backend to AI"
  }

  # Prometheus scraping
  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.monitoring_sg.id]
    description     = "Prometheus metrics"
  }

  # SSH from user
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.your_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ai-sg"
  }
}

# Pare-feu pour l'EC2 Monitoring (Prometheus + Grafana)
resource "aws_security_group" "monitoring_sg" {
  name_prefix = "${var.project_name}-${var.environment}-monitoring-sg"
  vpc_id      = aws_vpc.main.id
  description = "Monitoring - Prometheus 9090, Grafana 3001, SSH"

  # Prometheus UI from user
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["${var.your_ip}/32"]
    description = "Prometheus UI"
  }

  # Grafana from user
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["${var.your_ip}/32"]
    description = "Grafana UI"
  }

  # SSH from user
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.your_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-monitoring-sg"
  }
}

# Pare-feu pour PostgreSQL
resource "aws_security_group" "db_sg" {
  name_prefix = "${var.project_name}-${var.environment}-db-sg"
  vpc_id      = aws_vpc.main.id
  description = "PostgreSQL - only from app tier"

  # EC2 (ASG) -> RDS port 5432
  ingress {
    description     = "PostgreSQL from app tier"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-db-sg"
  }
}
