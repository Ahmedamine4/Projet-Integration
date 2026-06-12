terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "portfolio-terraform-state-582797602217"  #  582797602217 c'est l'id du compte aws
    key            = "prod/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    //dynamodb_table = "terraform-locks"
  }
}
