output "test_message" {
  value = " Terraform est bien initialisé et respecte le schéma !"
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

#  URL du Load Balancer
output "api_url" {
  description = "URL publique du backend Node.js (ALB)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "database_endpoint" {
  description = "Endpoint RDS PostgreSQL (Privé)"
  value       = aws_db_instance.postgres.endpoint
}

#  S3 Frontend
output "s3_bucket_name" {
  description = "Nom du bucket S3 pour uploader Vue.js"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_domain_name" {
  description = "URL CloudFront HTTPS du frontend"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

#  Résumé mis à jour
output "resume" {
  value = <<-EOT

╔═══════════════════════════════════════════════════════════╗
║       INFRASTRUCTURE MULTI-AZ DÉPLOYÉE AVEC SUCCÈS        ║
╠═══════════════════════════════════════════════════════════╣
║ 🌐 Point d'entrée API ALB : ${aws_lb.main.dns_name}
║ 🔒 Auto Scaling Group    : Activé (Min: 2, Max: 4) en Privé
║ 🗄️  PostgreSQL Isolée     : ${aws_db_instance.postgres.endpoint}
║ 📦 S3 Frontend (CDN)     : ${aws_cloudfront_distribution.s3_distribution.domain_name}
╠═══════════════════════════════════════════════════════════╣
║ Prochaines étapes :
║ 1. Build de ton application frontend.
║ 2. Sync du build vers le bucket S3 : ${aws_s3_bucket.frontend.bucket}
║ 3. Déploiement/CI-CD du code backend sur les instances de l'ASG.
╚═══════════════════════════════════════════════════════════╝
  EOT
}