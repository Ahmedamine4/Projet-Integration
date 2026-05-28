# Security Group Public (pour ALB / Load Balancer)
resource "aws_security_group" "public" {
  name        = "${var.project_name}-sg-public"
  description = "Public security group for ALB"
  vpc_id      = aws_vpc.main.id

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
    Name        = "${var.project_name}-sg-public"
    Environment = var.environment
  }
}

# Security Group Backend 
resource "aws_security_group" "backend" {
  name        = "${var.project_name}-sg-backend"
  description = "Security group for backend application"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.public.id]
  }

  ingress {
    from_port       = 3000        # port backend
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.public.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg-backend"
    Environment = var.environment
  }
}

# Pare-feu pour le Load Balancer 
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  vpc_id      = aws_vpc.main.id
  description = "Autorise le trafic HTTP public vers le Load Balancer"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Pare-feu pour l'EC2 
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-${var.environment}-app-sg"
  vpc_id      = aws_vpc.main.id
  description = "Autorise ALB a envoyer du trafic sur le port 3000 de EC2"

  ingress {
    from_port       = 3000 # Le port backend
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Requis pour que l'IA télécharge ses scripts/modèles via la NAT Gateway
  }
}

# Pare-feu pour PostgreSQL 
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-${var.environment}-db-sg"
  vpc_id      = aws_vpc.main.id
  description = "Autorise uniquement l EC2 backend a se connecter"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
}