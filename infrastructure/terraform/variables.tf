variable "aws_region" {
  description = "Région AWS"
  type        = string
  default     = "eu-west-3"
}

variable "db_password"{
  description ="mdp database pour prisma"
  type=string
  sensitive=true
}

variable "environment" {
  description = "Environnement"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "portfolio"
}

variable "vpc_cidr" {
  description = "CIDR block de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks des subnets publiques"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks des subnets privées"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "Zones de disponibilité"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b"]
}

variable "ssh_public_key_path" {
  description = "Chemin vers ta clé publique SSH"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "your_ip" {
  description = "Ton adresse IP publique (pour SSH et debug RDS)"
  type        = string
  default     = "160.177.124.101"
}