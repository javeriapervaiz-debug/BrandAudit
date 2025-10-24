#!/bin/bash

# EternaBrand Deployment Script
# This script helps prepare and deploy your EternaBrand application

echo "🚀 EternaBrand Deployment Helper"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Check if there are uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Uncommitted changes detected. Adding all files..."
    git add .
    
    # Prompt for commit message
    echo "💬 Enter commit message (or press Enter for default):"
    read -r commit_message
    
    if [[ -z "$commit_message" ]]; then
        commit_message="Deploy EternaBrand v$(node -p "require('./package.json').version")"
    fi
    
    git commit -m "$commit_message"
    echo "✅ Changes committed"
fi

# Run quality checks
echo "🔍 Running linting..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed. Please fix errors before deploying."
    exit 1
fi

echo "🔧 Running type checking..."
npm run check

if [ $? -eq 0 ]; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed. Please fix errors before deploying."
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "📖 Check DEPLOYMENT.md for more information"
echo "🌐 Your app should be live shortly"
