@echo off
echo 🚀 Initializing permissions system...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

echo 🔐 Initializing permissions...
call npx tsx scripts/init-permissions.ts

if %errorlevel% equ 0 (
    echo ✅ Permissions system initialized successfully!
    echo.
    echo 📊 You can now:
    echo   - Access /permissions to manage permissions
    echo   - Use PermissionGuard components in your pages
    echo   - Check permissions with usePermissions hook
) else (
    echo ❌ Failed to initialize permissions system.
)

pause
