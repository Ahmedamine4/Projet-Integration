provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "portfolio"
      ManagedBy   = "Terraform"
    }
  }
}

// VPC

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

// Internet Gateway

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

//  AMI (CUDA PRE-INSTALLER)

data "aws_ami" "deep_learning" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["Deep Learning AMI GPU PyTorch*Ubuntu 20.04*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

//  SUBNETS PUBLIQUES 

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

  resource "aws_instance" "a100" {
  ami                    = data.aws_ami.deep_learning.id
  instance_type          = var.a100_instance_type   
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.a100_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.a100_profile.name

  dynamic "instance_market_options" {
    for_each = var.use_spot ? [1] : []
    content {
      market_type = "spot"
      spot_options {
        instance_interruption_behavior = "terminate"
        spot_instance_type             = "one-time"
      }
    }
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.a100_volume_size_gb
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-a100-volume"
    }
  }

  /*  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "=== GPU Check ===" >> /var/log/gpu-init.log
    nvidia-smi >> /var/log/gpu-init.log 2>&1
    nvcc --version >> /var/log/gpu-init.log 2>&1
    echo "=== Init complete ===" >> /var/log/gpu-init.log
  EOF
  )  */

  tags = {
    Name = "${var.project_name}-a100"
    GPU  = "NVIDIA-A100"
    Spot = tostring(var.use_spot)
  }
}


//IAM
resource "aws_iam_role" "a100_role" {
  name = "${var.project_name}-a100-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "a100_ssm" {
  role       = aws_iam_role.a100_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "a100_s3" {
  role       = aws_iam_role.a100_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

resource "aws_iam_instance_profile" "a100_profile" {
  name = "${var.project_name}-a100-profile"
  role = aws_iam_role.a100_role.name
}


//  SUBNETS PRIVÉES 

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
  }
}

// ROUTE TABLE PUBLIQUE 

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

// Elastic IPs pour les NAT Gateways          //obligatoire et necessaire pour NAT Gateway public
resource "aws_eip" "nat" {
  count = length(var.public_subnet_cidrs)

  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }
}

// NAT Gateways (un par subnet public / AZ)
resource "aws_nat_gateway" "main" {
  count = length(var.public_subnet_cidrs)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  // Important : on attend que l'Internet Gateway soit créé
  depends_on = [aws_internet_gateway.main]

  tags = {
    Name        = "${var.project_name}-nat-gateway-${count.index + 1}"
    Environment = var.environment
  }
}

// Route table privée 
resource "aws_route_table" "private" {
  count  = length(var.private_subnet_cidrs)
  vpc_id = aws_vpc.main.id

  // Route vers Internet via le NAT Gateway correspondant
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "${var.project_name}-private-rt-${count.index + 1}"
    Environment = var.environment
  }
}

// Association des subnets privés à leurs route tables     (on a deja des association pour les subnets publics)
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}











