@echo off
REM AI Brand Audit System - Docker Setup Script for Windows
REM This script sets up the complete AI Brand Audit System using Docker

echo.
echo 🐳 AI Brand Audit System - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
echo [INFO] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    echo Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed
echo.

REM Check if .env file exists
echo [INFO] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found. Creating from template...
    if exist "env.example" (
        copy env.example .env >nul
        echo [SUCCESS] .env file created from template
        echo.
        echo [WARNING] Please edit .env file with your API keys before continuing
        echo.
        echo Required API keys:
        echo 1. GOOGLE_AI_API_KEY - Get from: https://aistudio.google.com/app/apikey
        echo 2. CONVERTAPI_SECRET - Get from: https://www.convertapi.com/
        echo.
        pause
    ) else (
        echo [ERROR] env.example file not found. Please create .env file manually.
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] .env file found
)
echo.

REM Setup database
echo [INFO] Setting up database...
docker-compose up -d db

REM Wait for database to be ready
echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Check if database is healthy
docker-compose exec db pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Database is ready
) else (
    echo [ERROR] Database failed to start
    pause
    exit /b 1
)
echo.

REM Build and start application
echo [INFO] Building and starting application...
docker-compose up --build -d
echo [SUCCESS] Application started successfully
echo.

REM Run database migrations
echo [INFO] Running database migrations...
timeout /t 15 /nobreak >nul

REM Try to run migrations
docker-compose exec app npm run db:migrate >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Database migrations completed
) else (
    echo [WARNING] Migration command not found, trying alternative setup...
    docker-compose exec app node setup-database.js >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Database setup completed
    ) else (
        echo [WARNING] Could not run migrations automatically. Please run manually:
        echo docker-compose exec app node setup-database.js
    )
)
echo.

REM Check application health
echo [INFO] Checking application health...
timeout /t 10 /nobreak >nul

REM Check if application is responding
curl -f http://localhost:5173/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Application is healthy and running
    echo.
    echo 🎉 Setup Complete!
    echo ==================
    echo Application URL: http://localhost:5173
    echo API Health: http://localhost:5173/api/health
    echo Database: localhost:5432
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
    echo To restart: docker-compose restart
) else (
    echo [WARNING] Application may still be starting up...
    echo Check logs with: docker-compose logs app
    echo Application URL: http://localhost:5173
)
echo.

echo [SUCCESS] Docker setup completed successfully!
echo.
echo Next steps:
echo 1. Visit http://localhost:5173 to access the application
echo 2. Upload a brand guidelines PDF
echo 3. Enter a website URL to analyze
echo 4. View the visual audit results
echo.
echo For development, use: docker-compose -f docker-compose.dev.yml up
echo.
pause
