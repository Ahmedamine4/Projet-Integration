#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAYBOOK_FILE="${SCRIPT_DIR}/deploy.yml"
INVENTORY_FILE="${SCRIPT_DIR}/inventory.ini"

required_commands=(ansible ansible-playbook)
for cmd in "${required_commands[@]}"; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "[ERROR] $cmd not found. Install Ansible before running terraform apply." >&2
        exit 1
    fi
done

required_vars=(
    INSTANCE_1_IP
    INSTANCE_2_IP
    SSH_KEY_FILE
    DB_HOST
    DB_PASSWORD
    JWT_SECRET
    JWT_REFRESH_SECRET
    SUPABASE_SERVICE_ROLE_KEY
    GITHUB_CLIENT_SECRET
    CLOUDFRONT_API_DOMAIN
    CLOUDFRONT_FRONTEND_DOMAIN
)

for var_name in "${required_vars[@]}"; do
    if [ -z "${!var_name:-}" ]; then
        echo "[ERROR] Missing environment variable: $var_name" >&2
        exit 1
    fi
done

cat > "$INVENTORY_FILE" <<EOF
[backend_servers]
backend1 ansible_host=${INSTANCE_1_IP} ansible_user=admin ansible_ssh_private_key_file=${SSH_KEY_FILE} ansible_ssh_common_args='-o StrictHostKeyChecking=no'
backend2 ansible_host=${INSTANCE_2_IP} ansible_user=admin ansible_ssh_private_key_file=${SSH_KEY_FILE} ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[all:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_timeout=60
EOF

echo "[OK] Ansible inventory generated: $INVENTORY_FILE"
echo "[INFO] Waiting for SSH on EC2 instances..."
ansible all -i "$INVENTORY_FILE" -m wait_for_connection -a "timeout=300"

echo "[INFO] Running Ansible playbook..."
ansible-playbook \
    -i "$INVENTORY_FILE" \
    -e "db_host=$DB_HOST" \
    -e "db_password=$DB_PASSWORD" \
    -e "jwt_secret=$JWT_SECRET" \
    -e "jwt_refresh_secret=$JWT_REFRESH_SECRET" \
    -e "supabase_service_role_key=$SUPABASE_SERVICE_ROLE_KEY" \
    -e "github_client_secret=$GITHUB_CLIENT_SECRET" \
    -e "cloudfront_api_domain=$CLOUDFRONT_API_DOMAIN" \
    -e "cloudfront_frontend_domain=$CLOUDFRONT_FRONTEND_DOMAIN" \
    "$PLAYBOOK_FILE"
