# 🐳 Docker Setup Guide for AI Brand Audit System

This guide will help you set up and run the AI Brand Audit System using Docker on a new system.

## 📋 Prerequisites

- **Docker Desktop** installed on your system
- **Git** for cloning the repository
- **API Keys** for external services (Google AI, ConvertAPI)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/javeriapervaiz-debug/BrandAudit.git
cd BrandAudit
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your API keys:

```env
# Google AI Studio API Key (FREE - Recommended)
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# ConvertAPI Key for PDF processing
# Get your API key from: https://www.convertapi.com/
CONVERTAPI_SECRET=your_convertapi_secret_here

# Database Configuration
DATABASE_URL=postgresql://postgres:password@db:5432/brandaudit

# Application Configuration
NODE_ENV=production
PORT=5173
```

### 3. Docker Compose Setup

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: brandaudit
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # AI Brand Audit Application
  app:
    build: .
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/brandaudit
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./static:/app/static
      - ./debug-text-files:/app/debug-text-files
    restart: unless-stopped

volumes:
  postgres_data:
```

### 4. Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/api/health || exit 1

# Start the application
CMD ["npm", "run", "preview"]
```

### 5. Start the System

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 6. Verify Installation

Check if all services are running:

```bash
# Check container status
docker-compose ps

# Check application logs
docker-compose logs app

# Check database logs
docker-compose logs db
```

## 🔧 Development Setup

For development with hot reload:

### 1. Development Docker Compose

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: brandaudit
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # AI Brand Audit Application (Development)
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/brandaudit
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. Development Dockerfile

Create `Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 3. Run Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🗄️ Database Setup

### 1. Initialize Database

```bash
# Run database migrations
docker-compose exec app npm run db:migrate

# Or manually run setup
docker-compose exec app node setup-database.js
```

### 2. Database Management

```bash
# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d brandaudit

# Backup database
docker-compose exec db pg_dump -U postgres brandaudit > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres brandaudit < backup.sql
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :5173

# Kill the process or change the port in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Restart database service
docker-compose restart db
```

#### 3. Puppeteer Issues
```bash
# Check if Chromium is installed
docker-compose exec app which chromium-browser

# Check Puppeteer configuration
docker-compose exec app node -e "console.log(require('puppeteer').executablePath())"
```

#### 4. Environment Variables
```bash
# Check if environment variables are loaded
docker-compose exec app env | grep -E "(GOOGLE_AI|CONVERTAPI|DATABASE)"
```

### Debug Commands

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f app

# Execute shell in container
docker-compose exec app sh

# Check container resource usage
docker stats

# Clean up containers and volumes
docker-compose down -v
docker system prune -a
```

## 📊 Monitoring

### Health Checks

The application includes health check endpoints:

- **Application Health**: `http://localhost:5173/api/health`
- **Database Health**: Check via `docker-compose ps`

### Logs

```bash
# Application logs
docker-compose logs app

# Database logs
docker-compose logs db

# All services logs
docker-compose logs
```

## 🚀 Production Deployment

### 1. Production Environment

```bash
# Set production environment
export NODE_ENV=production

# Start production services
docker-compose up -d --build
```

### 2. SSL/HTTPS Setup

For production, consider using a reverse proxy like Nginx:

```yaml
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### 3. Backup Strategy

```bash
# Create backup script
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec db pg_dump -U postgres brandaudit > "backup_${DATE}.sql"
```

## 📝 API Keys Setup

### 1. Google AI Studio API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` file:
   ```
   GOOGLE_AI_API_KEY=your_actual_api_key_here
   ```

### 2. ConvertAPI Key

1. Visit [ConvertAPI](https://www.convertapi.com/)
2. Sign up for a free account
3. Get your API secret
4. Add to `.env` file:
   ```
   CONVERTAPI_SECRET=your_actual_secret_here
   ```

## 🎯 Accessing the Application

Once everything is running:

- **Main Application**: http://localhost:5173
- **API Health Check**: http://localhost:5173/api/health
- **Database**: localhost:5432

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)

## 🆘 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables: `docker-compose exec app env`
3. Test database connection: `docker-compose exec app npm run db:test`
4. Check API keys are valid and have proper permissions

---

**Happy Brand Auditing! 🎨✨**
