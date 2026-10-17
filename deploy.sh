#!/bin/bash
# ==============================================================================
# StayBite Suite — 1-Click Oracle Cloud Always Free Automated Deployment Script
# ==============================================================================
set -e

echo "🏨 [StayBite] Starting automated deployment setup..."

# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 [StayBite] Installing Docker & Docker Compose..."
    sudo apt install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# 3. Configure Firewall & iptables for Oracle Cloud
echo "🛡️ [StayBite] Configuring Oracle Cloud firewall ports (80, 443, 8080, 5432)..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save || true

# 4. Build and Start StayBite Containers
echo "🚀 [StayBite] Launching PostgreSQL (200GB), Redis, Backend, and Nginx..."
docker compose pull || true
docker compose up -d --build

echo "✅ [StayBite] Enterprise Suite is LIVE and running on your Oracle Cloud server!"
echo "🌐 Web Dashboard: http://$(curl -s ifconfig.me)"
