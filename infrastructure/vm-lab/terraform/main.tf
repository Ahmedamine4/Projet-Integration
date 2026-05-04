terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# VM1

variable "vm1_ip" {
  description = "IP of the pre-existing VM1 (not managed here)"
  type        = string
  default     = "192.168.56.10"
}

# Spin up VM2 and VM3 via Vagrant

resource "null_resource" "vagrant_vms" {

  provisioner "local-exec" {
    command     = "vagrant up"
    working_dir = "${path.module}/.."
    interpreter = ["cmd", "/C"]          # Windows CMD
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "vagrant destroy -f"
    working_dir = "${path.module}/.."
    interpreter = ["cmd", "/C"]
  }
}

# Outputs

output "vm1_ip" {
  description = "Pre-existing VM1 (external)"
  value       = var.vm1_ip
}

output "vm2_ip" {
  description = "Auto-created VM2 (basic tools)"
  value       = "192.168.56.11"
}

output "vm3_ip" {
  description = "Auto-created VM3 (PostgreSQL)"
  value       = "192.168.56.12"
}