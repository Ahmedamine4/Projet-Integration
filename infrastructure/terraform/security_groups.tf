# Pare-feu pour le Load Balancer
resource "aws_security_group" "alb_sg" {
  name_prefix        = "${var.project_name}-${var.environment}-alb-sg"
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

# Pare-feu pour l'EC2 backend (ASG)
resource "aws_security_group" "app_sg" {
  name_prefix        = "${var.project_name}-${var.environment}-app-sg"
  vpc_id      = aws_vpc.main.id
  description = "EC2 backend - port 3000 from ALB only"

  # ✅ ALB → EC2 port 3000
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # ✅ SSH pour debug (Note: Comme l'EC2 est privée, l'accès SSH se fera via Session Manager ou un Bastion)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["102.53.139.14/32"] # Ton IP
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

# Pare-feu pour PostgreSQL
resource "aws_security_group" "db_sg" {
  name_prefix        = "${var.project_name}-${var.environment}-db-sg"
  vpc_id      = aws_vpc.main.id
  description = "PostgreSQL - only from app tier"

  # ✅ EC2 (ASG) → RDS port 5432
  ingress {
    description     = "PostgreSQL from app tier"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  # 🛑 Règle de l'IP publique supprimée car la DB n'a plus de route vers Internet.
  # Pour exécuter Prisma Migrate, il faudra le lancer depuis l'instance EC2 elle-même.

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