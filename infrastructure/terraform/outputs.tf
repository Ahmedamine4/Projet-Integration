output "test_message" {
  value = "✅ Terraform est bien initialisé !"
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

# ✅ URL du Load Balancer
output "api_url" {
  description = "URL publique du backend Node.js"
  value       = "http://${aws_lb.main.dns_name}"
}

# ✅ DATABASE_URL complète
output "database_url" {
  description = "DATABASE_URL à coller dans ton .env Prisma"
  value       = "postgresql://portfolio_user:${var.db_password}@${aws_db_instance.postgres.endpoint}/portfolio_db"
  sensitive   = true
}

output "database_endpoint" {
  description = "Endpoint RDS PostgreSQL"
  value       = aws_db_instance.postgres.endpoint
}

# ✅ Commande SSH
output "ec2_ssh_command" {
  description = "Commande SSH pour accéder à l'EC2"
  value       = "ssh -i ~/keys/id_rsa ubuntu@${aws_instance.app_server.private_ip}"
}

output "ec2_private_ip" {
  description = "IP privée de l'EC2 (derrière NAT)"
  value       = aws_instance.app_server.private_ip
}

# ✅ S3 Frontend
output "s3_bucket_name" {
  description = "Nom du bucket S3 pour uploader Vue.js"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_website_url" {
  description = "URL du frontend Vue.js hébergé sur S3"
  value       = "http://${aws_s3_bucket.frontend.bucket_regional_domain_name}"
}

# ✅ Résumé
output "resume" {
  value = <<-EOT

╔═══════════════════════════════════════════════════════════╗
║         INFRASTRUCTURE DÉPLOYÉE AVEC SUCCÈS              ║
╠═══════════════════════════════════════════════════════════╣
║ 🌐 Backend API   : ${aws_lb.main.dns_name}
║ 🗄️  PostgreSQL   : ${aws_db_instance.postgres.endpoint}
║ 📦 S3 Frontend   : ${aws_s3_bucket.frontend.bucket}
║ 💻 EC2 IP privée : ${aws_instance.app_server.private_ip}
╠═══════════════════════════════════════════════════════════╣
║ Prochaines étapes :
║ 1. terraform output database_url
║ 2. Coller dans .env du backend
║ 3. npx prisma migrate deploy
║ 4. npm run build && S3 upload
╚═══════════════════════════════════════════════════════════╝
  EOT
}


output "cloudfront_domain_name" {
  description = "URL CloudFront HTTPS du frontend"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}
