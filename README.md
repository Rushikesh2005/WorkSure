# WorkSure - Job Marketplace Platform

A full-stack job marketplace application connecting service providers with customers. Built with PHP, MySQL, HTML5, CSS3, and JavaScript.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

WorkSure is a job marketplace platform that allows:
- **Users** to post jobs and hire service providers
- **Workers** to find jobs, build profiles, and earn ratings
- **Real-time** job requests and notifications
- **Reviews and ratings** system for quality assurance
- **Messaging** between users and workers

## 🛠 Tech Stack

- **Backend**: PHP 8.2 with Apache
- **Database**: MySQL 8.0
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Containerization**: Docker & Docker Compose
- **API**: RESTful JSON API

## 📦 Prerequisites

### For Local Development
- Docker Desktop (includes Docker and Docker Compose)
- Git
- A code editor (VS Code, Sublime Text, etc.)

### For Production
- Docker and Docker Compose installed on server
- Linux server (Ubuntu 20.04+ recommended)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## 🚀 Local Development Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd worksure
\`\`\`

### 2. Configure Environment Variables

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` with your local settings (defaults are fine for development):

\`\`\`env
DB_HOST=db
DB_USER=worksure_user
DB_PASS=worksure_pass
DB_ROOT_PASSWORD=rootpassword
DB_NAME=worksure_db
DB_PORT=3306
WEB_PORT=80
APP_ENV=development
\`\`\`

### 3. Start Docker Containers

\`\`\`bash
docker-compose up -d
\`\`\`

This will:
- Build the PHP/Apache image
- Start MySQL database
- Initialize the database with schema and sample data
- Start the web server

### 4. Verify Installation

\`\`\`bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f web
docker-compose logs -f db
\`\`\`

### 5. Access the Application

- **Frontend**: http://localhost
- **Login Page**: http://localhost/login.html
- **Signup Page**: http://localhost/signup.html
- **Worker Dashboard**: http://localhost/worker-dashboard.html

### 6. Test Sample Data

The database is automatically seeded with 4 sample workers:
- **John Doe** (Electrician) - john.doe@example.com
- **Rajesh Kumar** (Plumber) - rajesh.kumar@example.com
- **Priya Sharma** (Carpenter) - priya.sharma@example.com
- **Amit Patel** (Painter) - amit.patel@example.com

All sample accounts use the same hashed password (you can update in database2.sql).

### 7. Stop Development Environment

\`\`\`bash
docker-compose down

# To also remove database volume (WARNING: deletes data)
docker-compose down -v
\`\`\`

## 🌐 Production Deployment

### 1. Server Setup

\`\`\`bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
\`\`\`

### 2. Clone and Configure

\`\`\`bash
# Clone repository
git clone <repository-url> /opt/worksure
cd /opt/worksure

# Create production .env file
cp .env.example .env.production
\`\`\`

### 3. Production Environment Variables

Edit \`.env.production\` with secure values:

\`\`\`env
# Use strong passwords in production!
DB_HOST=db
DB_USER=worksure_prod_user
DB_PASS=<STRONG_PASSWORD_HERE>
DB_ROOT_PASSWORD=<STRONG_ROOT_PASSWORD_HERE>
DB_NAME=worksure_db
DB_PORT=3306
WEB_PORT=80
APP_ENV=production
APP_DEBUG=false
\`\`\`

### 4. Start Production Containers

\`\`\`bash
# Use production env file
docker-compose --env-file .env.production up -d

# Verify containers are running
docker-compose ps
\`\`\`

### 5. Setup Nginx Reverse Proxy (Recommended)

Create \`/etc/nginx/sites-available/worksure\`:

\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Enable the site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/worksure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 6. Setup SSL with Let's Encrypt

\`\`\`bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

### 7. Database Backups

\`\`\`bash
# Create backup script
cat > /opt/worksure/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/worksure/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db mysqldump -u worksure_prod_user -p<PASSWORD> worksure_db > $BACKUP_DIR/backup_$TIMESTAMP.sql
# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/worksure/backup.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/worksure/backup.sh") | crontab -
\`\`\`

### 8. Monitoring and Logs

\`\`\`bash
# View logs
docker-compose logs -f web
docker-compose logs -f db

# Check container resource usage
docker stats

# View specific container logs
docker logs -f worksure_web
docker logs -f worksure_db
\`\`\`

## 📊 Database

### Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **user_profiles**: User profile information
- **worker_profiles**: Worker-specific information and ratings
- **jobs**: Job postings
- **job_requests**: Job request notifications
- **messages**: User messaging system
- **reviews**: Worker reviews and ratings
- **user_roles**: User role assignments

### Database Initialization

The database is automatically initialized from \`database2.sql\` when containers start. To manually initialize:

\`\`\`bash
docker-compose exec db mysql -u worksure_user -p worksure_db < database2.sql
\`\`\`

## 🔌 API Endpoints

### Authentication
- \`POST /api/signup.php\` - Register new user
- \`POST /api/login.php\` - User login

### Jobs
- \`GET /api/get_job_requests.php\` - Get job requests
- \`POST /api/accept_job_request.php\` - Accept job request
- \`POST /api/decline_job_request.php\` - Decline job request

### Profiles
- \`GET /api/get_profile.php\` - Get user profile
- \`POST /api/update_profile.php\` - Update user profile
- \`GET /api/get_workers.php\` - Get available workers
- \`GET /api/get_worker_stats.php\` - Get worker statistics

## 📁 Project Structure

\`\`\`
worksure/
├── api/                          # API endpoints
│   ├── login.php
│   ├── signup.php
│   ├── get_job_requests.php
│   ├── accept_job_request.php
│   ├── decline_job_request.php
│   ├── get_profile.php
│   ├── update_profile.php
│   ├── get_workers.php
│   └── get_worker_stats.php
├── public/                       # Static assets
│   ├── placeholder-logo.png
│   ├── placeholder-user.jpg
│   └── placeholder.svg
├── index.html                    # Home page
├── login.html                    # Login page
├── signup.html                   # Signup page
├── worker-dashboard.html         # Worker dashboard
├── worker-profile.html           # Worker profile
├── db_config.php                 # Database configuration
├── database2.sql                 # Database schema
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Docker Compose configuration
├── php.ini                       # PHP configuration
├── .env.example                  # Environment variables template
└── README.md                     # This file
\`\`\`

## 🐛 Troubleshooting

### Container won't start

\`\`\`bash
# Check logs
docker-compose logs web
docker-compose logs db

# Rebuild containers
docker-compose down
docker-compose up -d --build
\`\`\`

### Database connection error

\`\`\`bash
# Verify database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Verify environment variables
cat .env
\`\`\`

### Port already in use

\`\`\`bash
# Change port in .env
WEB_PORT=8080
DB_PORT=3307

# Restart containers
docker-compose down
docker-compose up -d
\`\`\`

### Database not initialized

\`\`\`bash
# Manually run initialization
docker-compose exec db mysql -u root -p<ROOT_PASSWORD> < database2.sql

# Or remove volume and restart
docker-compose down -v
docker-compose up -d
\`\`\`

### Permission issues

\`\`\`bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
\`\`\`

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | db | Database hostname |
| DB_USER | worksure_user | Database username |
| DB_PASS | worksure_pass | Database password |
| DB_ROOT_PASSWORD | rootpassword | MySQL root password |
| DB_NAME | worksure_db | Database name |
| DB_PORT | 3306 | Database port |
| WEB_PORT | 80 | Web server port |
| APP_ENV | development | Application environment |
| APP_DEBUG | true | Debug mode |

## 🔒 Security Recommendations

1. **Change default passwords** in production
2. **Use strong passwords** (min 16 characters, mixed case, numbers, symbols)
3. **Enable HTTPS** with SSL certificates
4. **Set APP_DEBUG=false** in production
5. **Regularly backup** your database
6. **Keep Docker images updated**
7. **Use environment variables** for sensitive data
8. **Implement rate limiting** on API endpoints
9. **Validate and sanitize** all user inputs
10. **Use prepared statements** for database queries

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Docker logs: \`docker-compose logs\`
3. Check database connectivity
4. Verify environment variables are set correctly

## 📄 License

[Add your license information here]

## 👥 Contributors

Sankait Hangloo , 
Mukesh Jatale , 
Rushikesh Shinde , 
Ujwal Thakare
