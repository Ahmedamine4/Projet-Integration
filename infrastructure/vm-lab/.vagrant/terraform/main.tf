terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# VM IPs

variable "vm1_ip" {
  description = "IP of VM1 monitoring"
  type        = string
  default     = "192.168.56.10"
}

variable "vm2_ip" {
  description = "IP of VM2 application"
  type        = string
  default     = "192.168.56.11"
}

variable "vm3_ip" {
  description = "IP of VM3 database"
  type        = string
  default     = "192.168.56.12"
}

variable "vm4_ip" {
  description = "IP of VM4 AI service"
  type        = string
  default     = "192.168.56.13"
}

# Start all VMs using Vagrant

resource "null_resource" "vagrant_vms" {
  triggers = {
    project_root = abspath("${path.module}/..")
  }

  provisioner "local-exec" {
    command     = "vagrant up"
    working_dir = self.triggers.project_root
    interpreter = ["cmd", "/C"]
  }

  provisioner "local-exec" {
    when        = destroy
    command     = "vagrant destroy -f"
    working_dir = self.triggers.project_root
    interpreter = ["cmd", "/C"]
  }
}

# Outputs

output "vm1_ip" {
  description = "VM1 monitoring"
  value       = var.vm1_ip
}

output "vm2_ip" {
  description = "VM2 application"
  value       = var.vm2_ip
}

output "vm3_ip" {
  description = "VM3 database"
  value       = var.vm3_ip
}

output "vm4_ip" {
  description = "VM4 AI service"
  value       = var.vm4_ip
}