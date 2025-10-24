#!/bin/bash

# AI Brand Audit System - Docker Setup Script
# This script sets up the complete AI Brand Audit System using Docker

set -e

echo "🐳 AI Brand Audit System - Docker Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    print_status "Checking environment configuration..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success ".env file created from template"
            print_warning "Please edit .env file with your API keys before continuing"
            echo ""
            echo "Required API keys:"
            echo "1. GOOGLE_AI_API_KEY - Get from: https://aistudio.google.com/app/apikey"
            echo "2. CONVERTAPI_SECRET - Get from: https://www.convertapi.com/"
            echo ""
            read -p "Press Enter after updating .env file..."
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    else
        print_success ".env file found"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start database service
    docker-compose up -d db
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Check if database is healthy
    if docker-compose exec db pg_isready -U postgres; then
        print_success "Database is ready"
    else
        print_error "Database failed to start"
        exit 1
    fi
}

# Build and start application
start_application() {
    print_status "Building and starting application..."
    
    # Build and start all services
    docker-compose up --build -d
    
    print_success "Application started successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for application to be ready
    sleep 15
    
    # Run migrations
    if docker-compose exec app npm run db:migrate 2>/dev/null; then
        print_success "Database migrations completed"
    else
        print_warning "Migration command not found, trying alternative setup..."
        if docker-compose exec app node setup-database.js 2>/dev/null; then
            print_success "Database setup completed"
        else
            print_warning "Could not run migrations automatically. Please run manually:"
            echo "docker-compose exec app node setup-database.js"
        fi
    fi
}

# Check application health
check_health() {
    print_status "Checking application health..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:5173/api/health &> /dev/null; then
        print_success "Application is healthy and running"
        echo ""
        echo "🎉 Setup Complete!"
        echo "=================="
        echo "Application URL: http://localhost:5173"
        echo "API Health: http://localhost:5173/api/health"
        echo "Database: localhost:5432"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        echo "To restart: docker-compose restart"
    else
        print_warning "Application may still be starting up..."
        echo "Check logs with: docker-compose logs app"
        echo "Application URL: http://localhost:5173"
    fi
}

# Main setup function
main() {
    echo ""
    print_status "Starting Docker setup for AI Brand Audit System"
    echo ""
    
    # Check prerequisites
    check_docker
    check_env
    
    # Setup services
    setup_database
    start_application
    run_migrations
    check_health
    
    echo ""
    print_success "Docker setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Visit http://localhost:5173 to access the application"
    echo "2. Upload a brand guidelines PDF"
    echo "3. Enter a website URL to analyze"
    echo "4. View the visual audit results"
    echo ""
    echo "For development, use: docker-compose -f docker-compose.dev.yml up"
    echo ""
}

# Run main function
main "$@"
