$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$terraformDir = Resolve-Path (Join-Path $scriptDir "../terraform")
$keysDir = Join-Path $terraformDir "keys"
$sshKeyPath = Join-Path $terraformDir "keys/id_rsa"
$knownHostsFile = Join-Path $scriptDir "known_hosts"
$playbookFile = Join-Path $scriptDir "deploy.yml"
$inventoryFile = Join-Path $scriptDir "inventory.ini"
$dockerImage = "cytopia/ansible:latest"

$requiredVars = @(
    "INSTANCE_1_IP",
    "INSTANCE_2_IP",
    "DB_HOST",
    "DB_PASSWORD",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GITHUB_CLIENT_SECRET",
    "CLOUDFRONT_API_DOMAIN",
    "CLOUDFRONT_FRONTEND_DOMAIN"
)

foreach ($varName in $requiredVars) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($varName))) {
        Write-Error "Missing environment variable: $varName"
    }
}

function Test-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Write-Inventory {
    param([Parameter(Mandatory = $true)][string]$PrivateKeyPath)

    $inventory = @"
[backend_servers]
backend1 ansible_host=$env:INSTANCE_1_IP ansible_user=admin ansible_ssh_private_key_file=$PrivateKeyPath ansible_ssh_common_args='-o StrictHostKeyChecking=no'
backend2 ansible_host=$env:INSTANCE_2_IP ansible_user=admin ansible_ssh_private_key_file=$PrivateKeyPath ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[all:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_timeout=60
"@

    Set-Content -Path $inventoryFile -Value $inventory -Encoding ASCII
    Write-Host "[OK] Ansible inventory generated: $inventoryFile"
}

function Invoke-LocalAnsible {
    Write-Inventory -PrivateKeyPath "keys/id_rsa"

    Write-Host "[INFO] Waiting for SSH on EC2 instances with local Ansible..."
    ansible all -i $inventoryFile -m wait_for_connection -a "timeout=300"

    Write-Host "[INFO] Running Ansible playbook with local Ansible..."
    ansible-playbook `
        -i $inventoryFile `
        -e "db_host=$env:DB_HOST" `
        -e "db_password=$env:DB_PASSWORD" `
        -e "jwt_secret=$env:JWT_SECRET" `
        -e "jwt_refresh_secret=$env:JWT_REFRESH_SECRET" `
        -e "supabase_service_role_key=$env:SUPABASE_SERVICE_ROLE_KEY" `
        -e "github_client_secret=$env:GITHUB_CLIENT_SECRET" `
        -e "cloudfront_api_domain=$env:CLOUDFRONT_API_DOMAIN" `
        -e "cloudfront_frontend_domain=$env:CLOUDFRONT_FRONTEND_DOMAIN" `
        $playbookFile
}

function Invoke-DockerAnsible {
    if (-not (Test-Command "docker")) {
        throw "Docker command not found"
    }

    Write-Inventory -PrivateKeyPath "/tmp/id_rsa"

    Write-Host "[INFO] Local Ansible not found. Running Ansible with Docker image: $dockerImage"

    $shellCommand = @"
set -e
cp /keys/id_rsa /tmp/id_rsa
chmod 600 /tmp/id_rsa
ansible all -i /ansible/inventory.ini -m wait_for_connection -a 'timeout=300'
ansible-playbook \
  -i /ansible/inventory.ini \
  -e "db_host=$env:DB_HOST" \
  -e "db_password=$env:DB_PASSWORD" \
  -e "jwt_secret=$env:JWT_SECRET" \
  -e "jwt_refresh_secret=$env:JWT_REFRESH_SECRET" \
  -e "supabase_service_role_key=$env:SUPABASE_SERVICE_ROLE_KEY" \
  -e "github_client_secret=$env:GITHUB_CLIENT_SECRET" \
  -e "cloudfront_api_domain=$env:CLOUDFRONT_API_DOMAIN" \
  -e "cloudfront_frontend_domain=$env:CLOUDFRONT_FRONTEND_DOMAIN" \
  /ansible/deploy.yml
"@

    docker run --rm `
        -v "${scriptDir}:/ansible" `
        -v "${keysDir}:/keys:ro" `
        -w /ansible `
        --entrypoint sh `
        $dockerImage `
        -lc $shellCommand
}

function Wait-Ssh {
    param([Parameter(Mandatory = $true)][string]$HostIp)

    Write-Host "[INFO] Waiting for SSH on $HostIp..."

    for ($i = 1; $i -le 30; $i++) {
        ssh `
            -i $sshKeyPath `
            -o StrictHostKeyChecking=no `
            -o UserKnownHostsFile=$knownHostsFile `
            -o LogLevel=ERROR `
            -o ConnectTimeout=10 `
            admin@$HostIp `
            "echo ready" 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] SSH ready on $HostIp"
            return
        }

        Start-Sleep -Seconds 10
    }

    Write-Error "SSH is not ready on $HostIp after 5 minutes."
}

function Invoke-RemoteDeploy {
    param([Parameter(Mandatory = $true)][string]$HostIp)

    Wait-Ssh -HostIp $HostIp

    $remoteScript = @"
set -e

if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y curl ca-certificates
  curl -fsSL https://get.docker.com | sudo sh
fi

sudo systemctl enable docker
sudo systemctl start docker

sudo docker rm -f portfolio-backend >/dev/null 2>&1 || true
sudo docker pull tijabdel/backend:prod
sudo docker run -d \
  --name portfolio-backend \
  --restart always \
  -p 3000:3000 \
  -e 'DATABASE_URL=postgresql://portfolio_user:${env:DB_PASSWORD}@${env:DB_HOST}:5432/portfolio_db?schema=public' \
  -e 'NODE_ENV=production' \
  -e 'PORT=3000' \
  -e 'SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co' \
  -e 'SUPABASE_SERVICE_ROLE_KEY=${env:SUPABASE_SERVICE_ROLE_KEY}' \
  -e 'JWT_SECRET=${env:JWT_SECRET}' \
  -e 'JWT_EXPIRES_IN=2h' \
  -e 'JWT_REFRESH_SECRET=${env:JWT_REFRESH_SECRET}' \
  -e 'JWT_REFRESH_EXPIRES_IN=7d' \
  -e 'GITHUB_CLIENT_ID=Ov23liLr8BGE52aNeqd9' \
  -e 'GITHUB_CLIENT_SECRET=${env:GITHUB_CLIENT_SECRET}' \
  tijabdel/backend:prod

sudo docker rm -f portfolio-frontend >/dev/null 2>&1 || true
sudo docker pull tijabdel/frontend:prod
sudo docker run -d \
  --name portfolio-frontend \
  --restart always \
  -p 80:80 \
  -e 'VITE_API_BASE_URL=https://${env:CLOUDFRONT_API_DOMAIN}/api' \
  -e 'VITE_SUPABASE_URL=https://xfnburehcqkcmebvpfqh.supabase.co' \
  -e 'VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZQQ8oG_TDafB9ZbN49Qexg_1olm0MsT' \
  tijabdel/frontend:prod

sudo docker ps
"@

    $remoteScript = ($remoteScript -replace "`r`n", "`n") -replace "`r", "`n"
    $localScriptPath = Join-Path ([System.IO.Path]::GetTempPath()) "portfolio-deploy-$HostIp.sh"
    $remoteScriptPath = "/tmp/portfolio-deploy.sh"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($localScriptPath, $remoteScript, $utf8NoBom)

    Write-Host "[INFO] Uploading deployment script to $HostIp..."

    scp `
        -i $sshKeyPath `
        -o StrictHostKeyChecking=no `
        -o UserKnownHostsFile=$knownHostsFile `
        -o LogLevel=ERROR `
        $localScriptPath `
        "admin@$HostIp`:$remoteScriptPath"

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Could not upload deployment script to $HostIp"
    }

    Write-Host "[INFO] Deploying containers on $HostIp with direct SSH..."

    ssh `
        -i $sshKeyPath `
        -o StrictHostKeyChecking=no `
        -o UserKnownHostsFile=$knownHostsFile `
        -o LogLevel=ERROR `
        admin@$HostIp `
        "chmod +x $remoteScriptPath && sudo bash $remoteScriptPath && rm -f $remoteScriptPath"

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Remote SSH deployment failed on $HostIp"
    }
}

function Invoke-SshDeploy {
    if (-not (Test-Command "ssh")) {
        Write-Error "Ansible is not installed, Docker fallback failed, and ssh was not found."
    }

    Write-Inventory -PrivateKeyPath "keys/id_rsa"

    Invoke-RemoteDeploy -HostIp $env:INSTANCE_1_IP
    Invoke-RemoteDeploy -HostIp $env:INSTANCE_2_IP
}

Invoke-SshDeploy
