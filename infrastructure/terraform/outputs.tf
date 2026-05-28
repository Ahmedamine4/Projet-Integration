

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

output "api_url" {
  description = "L'URL publique pour appeler ton backend Node.js"
  value       = "http://${aws_lb.main.dns_name}"
}

output "database_endpoint" {
  description = "L'adresse de ta base de données à coller dans ton .env Prisma"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "Le nom de ton bucket S3 pour uploader ton build Vue.js"
  value       = aws_s3_bucket.frontend.bucket
}