variable "aws_region" {
  description = "Région AWS"
  type        = string
  default     = "eu-west-3"
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


//instance A100

variable "a100_instance_type" {
  description = "p4d.24xlarge (8x A100 40GB) ou p4de.24xlarge (8x A100 80GB)"
  type        = string
  default     = "p4d.24xlarge"
}

variable "a100_volume_size_gb" {
  type    = number
  default = 25
}
//fin instance A100

variable "ssh_key_name" {
  description = "Nom de la Key Pair AWS pour SSH" # important 
  type        = string
  default     = "ma-cle-ssh"
}

variable "allowed_ssh_cidr" {
  description = "IP(s) autorisées pour SSH "
  type        = list(string)
  default     = ["0.0.0.0/0"] # Sécurité : Limiter à ton IP !
}



variable "instance_type" {
  description = "Type d'instance EC2"
  type        = string
}

variable "use_spot" {
  description = "Utiliser une instance Spot"
  type        = bool
}

variable "key_pair_name" {
  description = "Nom de la key pair SSH"
  type        = string
}
variable "root_volume_size_gb" {
  description = "Taille du disque root"
  type        = number
}