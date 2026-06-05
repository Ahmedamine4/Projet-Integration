
output "instance_1_ip" {
  value = aws_instance.app_1.public_ip
}

output "instance_2_ip" {
  value = aws_instance.app_2.public_ip
}

output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "database_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "cloudfront_frontend_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_api_domain" {
  value = aws_cloudfront_distribution.api.domain_name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}


#  Résumé mis à jour
/*output "resume" {
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
}*/