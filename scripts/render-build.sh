#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

echo "📦 Installing dependencies with npm ci..."
npm ci

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
