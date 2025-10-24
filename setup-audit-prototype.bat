@echo off
REM AI Brand Guideline Assistant - Audit Prototype Setup Script
REM This script sets up the audit prototype branch and installs dependencies

echo 🎯 Setting up AI Brand Guideline Assistant - Audit Prototype
echo ==============================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Switch to audit-prototype branch
echo 🔄 Switching to audit-prototype branch...
git checkout audit-prototype

if errorlevel 1 (
    echo ❌ Error: Failed to switch to audit-prototype branch
    echo 💡 Make sure you have the latest changes: git fetch origin
    pause
    exit /b 1
)

echo ✅ Switched to audit-prototype branch

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # AI Brand Guideline Assistant - Environment Variables
        echo # Copy this file and add your API keys
        echo.
        echo # Optional: OpenAI API Key
        echo # Get your key from: https://platform.openai.com/api-keys
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo.
        echo # Optional: Google AI Studio API Key  
        echo # Get your key from: https://aistudio.google.com/app/apikey
        echo GOOGLE_AI_API_KEY=your_google_ai_api_key_here
    ) > .env
    echo ✅ Created .env file template
    echo 💡 Edit .env file to add your API keys (optional)
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🚀 Next steps:
echo 1. Edit .env file to add your API keys (optional)
echo 2. Start the development server: npm run dev
echo 3. Open http://localhost:5173/dashboard/audit
echo.
echo 📚 For detailed instructions, see AUDIT_PROTOTYPE_README.md
echo.
echo 🧪 Test with mock websites:
echo    - GitHub Mock: http://localhost:5173/mock-github
echo    - Apple Mock: http://localhost:5173/mock-apple
echo    - Buffer Mock: http://localhost:5173/mock-buffer
echo.
echo Happy auditing! 🎯
pause
