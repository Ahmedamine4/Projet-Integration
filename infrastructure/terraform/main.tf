/*# --- BASE DE DONNEES RDS (POSTGRESQL - 100% PRIVEE) ---
resource "aws_db_subnet_group" "db_subnets" {
  name_prefix = "${var.project_name}-${var.environment}-db-subnet-"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  db_name                = "portfolio_db"
  username               = "portfolio_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

# --- CLE SSH ---
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = file("${path.module}/keys/id_rsa.pub")
}

# --- EC2 APP (Backend) ---
resource "aws_instance" "app" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.medium"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer le dossier et le fichier .env ---
mkdir -p /opt/app

cat > /opt/app/.env << 'ENVEOF'
DATABASE_URL="postgresql://portfolio_user:${var.db_password}@${aws_db_instance.postgres.endpoint}/appdb?schema=public"
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${var.supabase_service_role_key}
JWT_SECRET=${var.jwt_secret}
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=${var.jwt_refresh_secret}
JWT_REFRESH_EXPIRES_IN=7d
GITHUB_CLIENT_ID=Ov23liLr8BGE52aNeqd9
GITHUB_CLIENT_SECRET=${var.github_client_secret}
GITHUB_REDIRECT_URI=http://${aws_lb.main.dns_name}/api/github/callback
AI_API_URL=http://${aws_instance.ai.private_ip}:5000
ENVEOF

cat > /opt/app/.env.frontend << 'ENVEOF'
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZQQ8oG_TDafB9ZbN49Qexg_1olm0MsT
ENVEOF

# --- Creer docker-compose.yml ---
cat > /opt/app/docker-compose.yml << 'COMPEOF'
services:
  backend:
    image: ahmedamine04/foliocraft:backend
    ports:
      - "3000:3000"
    env_file:
      - /opt/app/.env
    restart: unless-stopped

  frontend:
    image: ahmedamine04/foliocraft:frontend
    ports:
      - "80:8080"
    env_file:
      - /opt/app/.env.frontend
    restart: unless-stopped
COMPEOF

# --- Lancer le container ---
cd /opt/app
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-app"
  }
}

# --- EC2 AI ---
resource "aws_instance" "ai" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.medium"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ai_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer docker-compose.yml ---
mkdir -p /opt/ai

cat > /opt/ai/docker-compose.yml << 'COMPEOF'
services:
  ai:
    image: tijabdel/ai:prod
    ports:
      - "5000:5000"
    restart: unless-stopped
COMPEOF

# --- Lancer le container ---
cd /opt/ai
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-ai"
  }
}

# --- EC2 MONITORING ---
resource "aws_instance" "monitoring" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.small"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.monitoring_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer les dossiers ---
mkdir -p /opt/monitoring/prometheus
mkdir -p /opt/monitoring/grafana/provisioning/datasources

# --- Creer la config Prometheus ---
cat > /opt/monitoring/prometheus/prometheus.yml << 'PROMEOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['${aws_instance.app.private_ip}:3000']
    metrics_path: '/'

  - job_name: 'ai'
    static_configs:
      - targets: ['${aws_instance.ai.private_ip}:5000']
    metrics_path: '/'

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
PROMEOF

# --- Creer le datasource Grafana ---
cat > /opt/monitoring/grafana/provisioning/datasources/prometheus.yml << 'GRAFEOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
GRAFEOF

# --- Creer docker-compose.yml ---
cat > /opt/monitoring/docker-compose.yml << 'COMPEOF'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    restart: unless-stopped
COMPEOF

# --- Lancer les containers ---
cd /opt/monitoring
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-monitoring"
  }
}

# --- LOAD BALANCER (ALB) ---
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-${var.environment}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    port                = "3000"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

resource "aws_lb_target_group" "frontend" {
  name     = "${var.project_name}-${var.environment}-fe-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    port                = "80"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-fe-tg"
  }
}

resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = aws_lb_target_group.main.arn
  target_id        = aws_instance.app.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "app_frontend" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app.id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

data "aws_caller_identity" "current" {}

# --- CLOUDFRONT (Unique entree : ALB → frontend + API) ---
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
*/

# --- BASE DE DONNEES RDS (POSTGRESQL - 100% PRIVEE) ---
resource "aws_db_subnet_group" "db_subnets" {
  name_prefix = "${var.project_name}-${var.environment}-db-subnet-"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  db_name                = "portfolio_db"
  username               = "portfolio_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}

# --- CLE SSH ---
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = file("${path.module}/keys/id_rsa.pub")
}

# --- EC2 APP (Backend + Frontend + Nginx Custom) ---
resource "aws_instance" "app" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.medium"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer les dossiers ---
mkdir -p /opt/app/nginx

cat > /opt/app/.env << 'ENVEOF'
DATABASE_URL="postgresql://portfolio_user:${var.db_password}@${aws_db_instance.postgres.endpoint}/appdb?schema=public"
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${var.supabase_service_role_key}
JWT_SECRET=${var.jwt_secret}
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=${var.jwt_refresh_secret}
JWT_REFRESH_EXPIRES_IN=7d
GITHUB_CLIENT_ID=Ov23liLr8BGE52aNeqd9
GITHUB_CLIENT_SECRET=${var.github_client_secret}
GITHUB_REDIRECT_URI=http://${aws_lb.main.dns_name}/api/github/callback
AI_API_URL=http://${aws_instance.ai.private_ip}:8000
ENVEOF

cat > /opt/app/.env.frontend << 'ENVEOF'
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZQQ8oG_TDafB9ZbN49Qexg_1olm0MsT
ENVEOF

# --- Creer le Dockerfile Nginx ---
cat > /opt/app/nginx/Dockerfile << 'DOCKEREOF'
FROM nginx:alpine

# Copier la config nginx personnalisee
COPY default.prod.conf /etc/nginx/nginx.conf

# Security et optimisations
RUN apk add --no-cache openssl && \
    chmod 755 /etc/nginx && \
    chmod 755 /var/cache/nginx && \
    mkdir -p /etc/nginx/ssl

EXPOSE 8080 8443

CMD ["nginx", "-g", "daemon off;"]
DOCKEREOF

# --- Creer la config Nginx ---
cat > /opt/app/nginx/nginx.conf << 'NGXEOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  client_max_body_size 10M;

  upstream backend {
    server backend:3000;
  }

  upstream frontend {
    server frontend:8080;
  }

  server {
    listen 8080 default_server;
    server_name _;

    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}


  # HTTPS server (optionnel - a configurer plus tard)
  server {
    listen 8443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto https;
      proxy_redirect off;
    }

    location /api/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto https;
      proxy_redirect off;
    }
  }
}
NGXEOF

# --- Creer docker-compose.yml ---
cat > /opt/app/docker-compose.yml << 'COMPEOF'
services:
  nginx:
    container_name: nginx-proxy
    image: tijabdel/nginx:prod
    ports:
      - "80:8080"
      - "443:8443"
    volumes:
      - nginx-certs:/etc/nginx/ssl
      - /opt/app/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    privileged: true

    security_opt:
      - no-new-privileges:false
    cap_drop:
      - ALL
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  backend:
    image: tijabdel/backend:prod
    ports:
      - "3000:3000"
    env_file:
      - /opt/app/.env
    restart: unless-stopped

  frontend:
    image: tijabdel/frontend:prod
    
    env_file:
      - /opt/app/.env.frontend
    restart: unless-stopped

volumes:
  nginx-certs:
COMPEOF

# --- Lancer les containers ---
cd /opt/app
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-app"
  }
}

# --- EC2 AI ---
resource "aws_instance" "ai" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.medium"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ai_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer docker-compose.yml ---
mkdir -p /opt/ai

cat > /opt/ai/docker-compose.yml << 'COMPEOF'
services:
  ai:
    image: tijabdel/ai:prod
    ports:
      - "8000:8000"
    restart: unless-stopped
COMPEOF

# --- Lancer le container ---
cd /opt/ai
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-ai"
  }
}

# --- EC2 MONITORING ---
resource "aws_instance" "monitoring" {
  ami                    = "ami-090543c0c8acd0a28"
  instance_type          = "t3.small"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.monitoring_sg.id]

  user_data = <<-EOF
#!/bin/bash
set -euxo pipefail

# --- Installer Docker ---
apt-get update -y
apt-get install -y curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
usermod -aG docker admin

# --- Creer les dossiers ---
mkdir -p /opt/monitoring/prometheus
mkdir -p /opt/monitoring/grafana/provisioning/datasources

# --- Creer la config Prometheus ---
cat > /opt/monitoring/prometheus/prometheus.yml << 'PROMEOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['${aws_instance.app.private_ip}:3000']
    metrics_path: '/'

  - job_name: 'ai'
    static_configs:
      - targets: ['${aws_instance.ai.private_ip}:8000']
    metrics_path: '/'

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
PROMEOF

# --- Creer le datasource Grafana ---
cat > /opt/monitoring/grafana/provisioning/datasources/prometheus.yml << 'GRAFEOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
GRAFEOF

# --- Creer docker-compose.yml ---
cat > /opt/monitoring/docker-compose.yml << 'COMPEOF'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    restart: unless-stopped
COMPEOF

# --- Lancer les containers ---
cd /opt/monitoring
docker compose pull
docker compose up -d
  EOF

  tags = {
    Name = "${var.project_name}-${var.environment}-monitoring"
  }
}

# --- LOAD BALANCER (ALB) ---
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-${var.environment}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    port                = "3000"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

resource "aws_lb_target_group" "frontend" {
  name     = "${var.project_name}-${var.environment}-fe-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    port                = "80"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-fe-tg"
  }
}

resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = aws_lb_target_group.main.arn
  target_id        = aws_instance.app.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "app_frontend" {
  target_group_arn = aws_lb_target_group.frontend.arn
  target_id        = aws_instance.app.id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

data "aws_caller_identity" "current" {}

# --- CLOUDFRONT (Unique entree : ALB → frontend + API) ---
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
