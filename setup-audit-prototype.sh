#!/bin/bash

# AI Brand Guideline Assistant - Audit Prototype Setup Script
# This script sets up the audit prototype branch and installs dependencies

echo "🎯 Setting up AI Brand Guideline Assistant - Audit Prototype"
echo "=============================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed or not in PATH"
    exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Switch to audit-prototype branch
echo "🔄 Switching to audit-prototype branch..."
git checkout audit-prototype

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to switch to audit-prototype branch"
    echo "💡 Make sure you have the latest changes: git fetch origin"
    exit 1
fi

echo "✅ Switched to audit-prototype branch"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# AI Brand Guideline Assistant - Environment Variables
# Copy this file and add your API keys

# Optional: OpenAI API Key
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Google AI Studio API Key  
# Get your key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
EOF
    echo "✅ Created .env file template"
    echo "💡 Edit .env file to add your API keys (optional)"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Edit .env file to add your API keys (optional)"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:5173/dashboard/audit"
echo ""
echo "📚 For detailed instructions, see AUDIT_PROTOTYPE_README.md"
echo ""
echo "🧪 Test with mock websites:"
echo "   - GitHub Mock: http://localhost:5173/mock-github"
echo "   - Apple Mock: http://localhost:5173/mock-apple"
echo "   - Buffer Mock: http://localhost:5173/mock-buffer"
echo ""
echo "Happy auditing! 🎯"
