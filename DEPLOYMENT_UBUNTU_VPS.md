# Ubuntu VPS Deployment Guide (No Docker)

This guide deploys the app on Ubuntu with:
- FastAPI backend as a `systemd` service
- React frontend built with Vite and served by Nginx
- PostgreSQL installed directly on the VPS
- Optional HTTPS via Certbot

## 1. Prerequisites

- Ubuntu 22.04 or 24.04 VPS
- A sudo user
- Domain name pointing to the VPS (recommended)
- Open ports in firewall/security group:
  - `22` (SSH)
  - `80` (HTTP)
  - `443` (HTTPS)

## 2. Install System Packages

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip postgresql postgresql-contrib nginx nodejs npm ufw
```

Optional firewall setup:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 3. Clone Project

```bash
cd /opt
sudo git clone https://github.com/dev28-bitl/Onboarding-Checklist-App.git onboarding-app
sudo chown -R $USER:$USER /opt/onboarding-app
cd /opt/onboarding-app
```

## 4. Setup PostgreSQL

Login as postgres user:

```bash
sudo -u postgres psql
```

Create DB and user:

```sql
CREATE DATABASE onboarding;
CREATE USER onboarding WITH PASSWORD 'CHANGE_THIS_DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE onboarding TO onboarding;
\q
```

## 5. Configure Backend

```bash
cd /opt/onboarding-app/onboarding-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Create backend env file:

```bash
cat > /opt/onboarding-app/onboarding-backend/.env << 'EOF'
DATABASE_URL=postgresql+psycopg2://onboarding:CHANGE_THIS_DB_PASSWORD@localhost:5432/onboarding
SECRET_KEY=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOF
```

Quick test backend manually:

```bash
cd /opt/onboarding-app/onboarding-backend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Test in another shell:

```bash
curl http://127.0.0.1:8000/health
```

Stop test server after checking.

## 6. Create Backend systemd Service

Create service file:

```bash
sudo tee /etc/systemd/system/onboarding-backend.service > /dev/null << 'EOF'
[Unit]
Description=Onboarding Checklist Backend (FastAPI)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/onboarding-app/onboarding-backend
EnvironmentFile=/opt/onboarding-app/onboarding-backend/.env
ExecStart=/opt/onboarding-app/onboarding-backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
```

Permissions for service user:

```bash
sudo chown -R www-data:www-data /opt/onboarding-app/onboarding-backend
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable onboarding-backend
sudo systemctl start onboarding-backend
sudo systemctl status onboarding-backend --no-pager
```

## 7. Build Frontend

```bash
cd /opt/onboarding-app/onboarding-frontend
npm install
```

Create frontend env so browser calls same domain:

```bash
cat > /opt/onboarding-app/onboarding-frontend/.env.production << 'EOF'
VITE_API_BASE_URL=/api
EOF
```

Build frontend:

```bash
npm run build
```

Copy build output to web root:

```bash
sudo mkdir -p /var/www/onboarding-frontend
sudo cp -r /opt/onboarding-app/onboarding-frontend/dist/* /var/www/onboarding-frontend/
sudo chown -R www-data:www-data /var/www/onboarding-frontend
```

## 8. Configure Nginx

Create Nginx site config:

```bash
sudo tee /etc/nginx/sites-available/onboarding-app > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/onboarding-frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF
```

Enable site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/onboarding-app /etc/nginx/sites-enabled/onboarding-app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Enable HTTPS (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Verify auto-renew:

```bash
sudo certbot renew --dry-run
```

## 10. Post-Deploy Checks

```bash
curl http://127.0.0.1:8000/health
curl -I http://your-domain.com
curl -I http://your-domain.com/api/health || true
```

Open in browser:
- `http(s)://your-domain.com`
- Login with your seeded/demo user accounts if available

## 11. Update / Redeploy Workflow

```bash
cd /opt/onboarding-app
git pull

# Backend
cd /opt/onboarding-app/onboarding-backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart onboarding-backend

# Frontend
cd /opt/onboarding-app/onboarding-frontend
npm install
npm run build
sudo cp -r dist/* /var/www/onboarding-frontend/
sudo systemctl reload nginx
```

## 12. Logs and Troubleshooting

Backend logs:

```bash
sudo journalctl -u onboarding-backend -f
sudo systemctl status onboarding-backend --no-pager
```

Nginx logs:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

Common fixes:
- `502 Bad Gateway`: backend service is down or wrong port in Nginx proxy
- CORS/API mismatch: confirm `VITE_API_BASE_URL=/api` and Nginx `/api/` proxy
- DB auth error: verify `DATABASE_URL` credentials and postgres user permissions

## 13. Security Notes

- Rotate `SECRET_KEY` and DB password immediately
- Use strong unique secrets
- Disable password SSH login and use SSH keys
- Keep packages updated:

```bash
sudo apt update && sudo apt upgrade -y
```
