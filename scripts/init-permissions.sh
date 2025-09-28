#!/bin/bash

echo "🚀 Initializing permissions system..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔐 Initializing permissions..."
npx tsx scripts/init-permissions.ts

if [ $? -eq 0 ]; then
    echo "✅ Permissions system initialized successfully!"
    echo ""
    echo "📊 You can now:"
    echo "  - Access /permissions to manage permissions"
    echo "  - Use PermissionGuard components in your pages"
    echo "  - Check permissions with usePermissions hook"
else
    echo "❌ Failed to initialize permissions system."
    exit 1
fi
