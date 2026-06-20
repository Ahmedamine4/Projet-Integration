output "test_message" {
  value = " Terraform est bien initialise et respecte le schema !"
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "app_public_ip" {
  description = "IP publique EC2 Backend"
  value       = aws_instance.app.public_ip
}

output "ai_public_ip" {
  description = "IP publique EC2 AI"
  value       = aws_instance.ai.public_ip
}

output "monitoring_public_ip" {
  description = "IP publique EC2 Monitoring"
  value       = aws_instance.monitoring.public_ip
}

output "app_private_ip" {
  description = "IP privee EC2 Backend"
  value       = aws_instance.app.private_ip
}

output "ai_private_ip" {
  description = "IP privee EC2 AI"
  value       = aws_instance.ai.private_ip
}

output "monitoring_private_ip" {
  description = "IP privee EC2 Monitoring"
  value       = aws_instance.monitoring.private_ip
}

output "api_url" {
  description = "URL publique du backend Node.js (ALB)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "database_endpoint" {
  description = "Endpoint RDS PostgreSQL (Prive)"
  value       = aws_db_instance.postgres.endpoint
}

output "cloudfront_domain_name" {
  description = "URL CloudFront HTTPS (frontend + API)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "ssh_app" {
  description = "SSH vers EC2 Backend"
  value       = "ssh -i keys/id_rsa admin@${aws_instance.app.public_ip}"
}

output "ssh_ai" {
  description = "SSH vers EC2 AI"
  value       = "ssh -i keys/id_rsa admin@${aws_instance.ai.public_ip}"
}

output "ssh_monitoring" {
  description = "SSH vers EC2 Monitoring"
  value       = "ssh -i keys/id_rsa admin@${aws_instance.monitoring.public_ip}"
}

output "grafana_url" {
  description = "URL Grafana (login: admin/admin)"
  value       = "http://${aws_instance.monitoring.public_ip}:3001"
}

output "prometheus_url" {
  description = "URL Prometheus"
  value       = "http://${aws_instance.monitoring.public_ip}:9090"
}

output "resume" {
  value = <<-EOT

=================================================================
       INFRASTRUCTURE DEPLOYEE AVEC SUCCES
=================================================================
 EC2 Backend   : ${aws_instance.app.public_ip} (t3.medium)
 EC2 AI        : ${aws_instance.ai.public_ip} (t3.medium)
 EC2 Monitoring: ${aws_instance.monitoring.public_ip} (t3.small)
 ALB           : ${aws_lb.main.dns_name}
 RDS PostgreSQL: ${aws_db_instance.postgres.endpoint}
 CloudFront    : ${aws_cloudfront_distribution.main.domain_name}
 Grafana       : http://${aws_instance.monitoring.public_ip}:3001 (admin/admin)
 Prometheus    : http://${aws_instance.monitoring.public_ip}:9090
=================================================================
  EOT
}
