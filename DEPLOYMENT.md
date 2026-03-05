# Deployment Guide

Guide to deploying the Payroll Management System to production.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Environment Setup

### Production Environment Variables

Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info

# CORS Configuration (for production domain)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting (optional)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Node.js Version

Make sure you're using Node.js 14+ (LTS recommended):

```bash
node --version
npm --version
```

---

## Backend Deployment

### 1. Prepare Backend

```bash
cd server

# Install dependencies
npm install --production

# Build (if using TypeScript - not required for ES modules)
npm run build  # (if applicable)

# Test
npm start
```

### 2. Using PM2 (Recommended)

PM2 allows process management and auto-restart on crashes.

**Install PM2 globally:**
```bash
npm install -g pm2
```

**Create ecosystem config file `server/ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [
    {
      name: 'payroll-server',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save         # Save configuration
pm2 startup      # Auto-start on system reboot
pm2 monit        # Monitor processes
```

### 3. Using Systemd (Linux)

Create `/etc/systemd/system/payroll.service`:

```ini
[Unit]
Description=Payroll Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/payroll/server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/payroll/server.log
StandardError=append:/var/log/payroll/error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable payroll
sudo systemctl start payroll
sudo systemctl status payroll
```

### 4. Using Docker

See [Docker Deployment](#docker-deployment) section below.

---

## Frontend Deployment

### 1. Build Frontend

```bash
cd client

# Install dependencies
npm install

# Build for production
npm run build
```

This creates an optimized `dist/` folder.

### 2. Serve with Static Server

**Option A: Using Serve Package**

```bash
npm install -g serve

# Test locally
serve -s dist -l 3000

# In production
serve -s dist -l 3000 -e 404
```

**Option B: Using Nginx**

Create `/etc/nginx/sites-available/payroll`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Certificate (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
    gzip_min_length 1000;
    
    root /var/www/payroll/client/dist;
    index index.html;
    
    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/payroll /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Option C: Using Apache**

Create `/etc/apache2/sites-available/payroll.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAdmin admin@yourdomain.com
    
    # Redirect to HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAdmin admin@yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # Document Root
    DocumentRoot /var/www/payroll/client/dist
    
    # Enable Gzip
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
    
    # Enable mod_rewrite for SPA routing
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    # API Proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:5000/api/
    ProxyPassReverse /api/ http://localhost:5000/api/
    
    # Cache headers
    <FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</VirtualHost>
```

Enable site:
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod ssl
sudo a2ensite payroll
sudo apache2ctl configtest
sudo systemctl restart apache2
```

---

## Docker Deployment

### 1. Create Dockerfile (Backend)

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads logs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
```

### 2. Create Dockerfile (Frontend)

Create `client/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### 3. Create Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
    volumes:
      - ./server/uploads:/app/uploads
      - ./server/logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    environment:
      - VITE_API_URL=http://localhost:5000

volumes:
  uploads:
  logs:
```

### 4. Build and Run Docker Containers

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up
docker-compose down -v
```

---

## Cloud Deployment

### AWS Deployment

#### Using Elastic Beanstalk

1. **Install AWS EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB application**
   ```bash
   cd server
   eb init -p node.js-18 payroll-app
   ```

3. **Create environment**
   ```bash
   eb create payroll-env
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

5. **Set environment variables**
   ```bash
   eb setenv NODE_ENV=production PORT=5000
   ```

#### Using EC2

1. **Launch EC2 Instance** (Ubuntu 20.04 LTS, t2.medium)

2. **Configure Security Groups**
   - Allow HTTP (80)
   - Allow HTTPS (443)
   - Allow SSH (22)

3. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs -y

   # Install Git
   sudo apt install git -y

   # Clone repository
   git clone https://github.com/yourrepo/payroll.git
   cd payroll

   # Install dependencies
   cd server && npm install --production
   cd ../client && npm install && npm run build
   cd ..

   # Install Nginx
   sudo apt install nginx -y

   # Configure Nginx and PM2 (see above sections)
   ```

#### Using Heroku (Frontend)

```bash
cd client

# Create Heroku app
heroku create payroll-app

# Deploy
git push heroku main

# Set environment variables
heroku config:set VITE_API_URL=https://payroll-api.herokuapp.com
```

#### Using Railway

Railway supports deployment from Git repositories:

1. Connect GitHub repository
2. Add backend and frontend services
3. Set environment variables
4. Deploy automatically

---

## Security Considerations

### 1. HTTPS/SSL

Always use HTTPS in production:

```bash
# Using Certbot with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### 2. Environment Variables

Never commit `.env` files. Use:
- GitHub Secrets
- CI/CD environment variables
- Cloud provider secret management

### 3. CORS Configuration

Update Vite config for production:

```javascript
// client/vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.yourdomain.com',
        changeOrigin: true,
      },
    },
  },
}
```

### 4. Security Headers

Add to backend (server.js):

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 5. Rate Limiting

```bash
npm install express-rate-limit
```

### 6. Input Validation

- Validate file uploads
- Sanitize user input
- Check file size limits

### 7. Logging

Use structured logging:

```bash
npm install winston
```

---

## Performance Optimization

### 1. Frontend Optimization

- Minification (handled by Vite)
- Code splitting (Vite default)
- Image optimization
- Lazy loading

### 2. Backend Optimization

- Connection pooling (if DB is added)
- Caching strategy
- Gzip compression

```javascript
import compression from 'compression';
app.use(compression());
```

### 3. CDN

Use CDN for static assets:
- CloudFlare
- AWS CloudFront
- Azure CDN

### 4. Monitoring

Track performance metrics:
- Response times
- Error rates
- Server resources
- API usage

---

## Monitoring & Maintenance

### 1. Logging

Implement structured logging:

```bash
npm install winston
```

### 2. Error Tracking

Use services like:
- Sentry
- Rollbar
- New Relic

### 3. Performance Monitoring

Use services like:
- New Relic
- DataDog
- AWS CloudWatch

### 4. Health Checks

Regular health endpoint checks:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
```

### 5. Backup Strategy

- Regular backups of uploaded files
- Database backups (when added)
- Configuration backups

### 6. Update & Patching

Keep dependencies updated:

```bash
npm outdated        # Check for updates
npm update          # Update packages
npm audit           # Check security issues
npm audit fix       # Fix vulnerabilities
```

---

## Troubleshooting Deployment

### Issue: Backend can't connect to frontend

**Solution:** Check CORS configuration and API URL

### Issue: Port already in use

```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: Out of memory

Increase memory limit:
```bash
node --max-old-space-size=4096 server.js
```

### Issue: Permission denied errors

```bash
# Give proper permissions
sudo chown -R www-data:www-data /var/www/payroll
sudo chmod -R 755 /var/www/payroll
sudo chmod -R 755 /var/www/payroll/server/uploads
```

---

## Scaling for Production

### Horizontal Scaling

```javascript
// ecosystem.config.js
instances: 'max',        // Use all CPU cores
exec_mode: 'cluster',    // Enable clustering
```

### Load Balancing

Use Nginx or HAProxy to distribute requests:

```nginx
upstream payroll_backend {
    server localhost:5001;
    server localhost:5002;
    server localhost:5003;
}

server {
    listen 5000;
    
    location / {
        proxy_pass http://payroll_backend;
    }
}
```

---

## Maintenance Checklist

- [ ] Update Node.js to latest LTS
- [ ] Update dependencies monthly
- [ ] Check security vulnerabilities
- [ ] Clean up old uploaded files
- [ ] Review logs for errors
- [ ] Monitor server resources
- [ ] Test disaster recovery
- [ ] Update documentation

---

## Support

For deployment issues, refer to:
- [README.md](README.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Cloud provider documentation

---

## Additional Resources

- PM2 Documentation: https://pm2.keymetrics.io/
- Docker Documentation: https://docs.docker.com/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

---

## Uploads and Hosting Recommendations

- **Current behavior:** Uploaded Excel files are accepted by the backend, parsed, and then deleted from the local `uploads/` folder immediately after parsing. This prevents the `uploads/` directory from growing indefinitely and makes the app safer to run on hosts with limited disk space.

- **Why this matters for cloud hosts:**
  - Vercel: serverless functions use ephemeral file storage and are not intended for persistent file storage. Writing files to disk is possible but unreliable across invocations. Prefer keeping uploads in memory or using object storage when deploying on Vercel.
  - Render: a web service on Render allows disk writes during the container lifetime but storage is not persistent across deploys. Deleting temporary files after parsing reduces disk usage and avoids filling the container.

- **Recommended deployment patterns:**
  1. Simple / quick: Keep the current delete-after-parse behavior and deploy backend on Render (or any VM/container). Frontend on Vercel is fine.
 2. Serverless-friendly (Vercel): Switch multer to `memoryStorage` and adapt `parseExcelFile` to accept a buffer (no disk writes). Good for small/medium files.
 3. Production-grade (persistent storage): Upload files directly to object storage (AWS S3, Azure Blob, Google Cloud Storage) and process from the object or via streams. This is recommended if you need audit/history or persistent archives.

- **How to switch to memoryStorage (quick guidance):**
  - Update `server/routes/uploadRoutes.js` to use `multer.memoryStorage()`.
  - Change `parseExcelFile` to accept a Buffer (or create a new helper that reads from buffer using `workbook.xlsx.load(buffer)`).

- **How to add S3 (production):**
  - Configure an S3 bucket and credentials (use IAM role or environment variables).
  - Upload incoming files directly to S3 from the client (presigned URLs) or from the server.
  - Process files either by streaming them from S3 or by using S3 event triggers / background jobs.

- **Note:** For most users the current delete-after-parse approach is adequate during development and small deployments. If you expect high upload volume or need to retain uploaded files long-term, use S3 or a similar object store.

If you want, I can implement either `memoryStorage` parsing now, or add S3 integration. Otherwise the repository is already updated to delete uploads after parsing.

---

Version: 1.0.0
Last Updated: March 2026
