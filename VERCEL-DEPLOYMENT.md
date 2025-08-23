# Vercel Deployment Guide

## Why Vercel?
- **Perfect for Next.js** (made by the same team)
- **Free tier with generous limits**
- **Automatic GitHub deployments**
- **Built-in environment variable management**
- **Serverless functions work perfectly**

## Database Options (Free)

### Option 1: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) 
2. Sign up with GitHub
3. Create new project: "treatment-scheduler"
4. Copy the connection string

### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub  
3. Create new project: "treatment-scheduler"
4. Go to Settings → Database → Copy connection string

### Option 3: PlanetScale
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create database: "treatment-scheduler"
4. Copy connection string

## Deployment Steps

### Step 1: Get Database URL
Choose one of the database options above and get your `DATABASE_URL`.

### Step 2: Deploy to Vercel
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "Add New..." → "Project"**
4. **Import your repository**: `celi21/feattreatmentschedulingapp`
5. **Configure Project**:
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
6. **Add Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: (your database connection string)
7. **Click "Deploy"**

### Step 3: Automatic Setup
The `vercel-build` command will automatically:
- Generate Prisma client
- Push database schema
- Seed database with initial data
- Build the Next.js app

## Environment Variables Needed

```
DATABASE_URL="postgresql://username:password@host:5432/database"
```

## Features
- ✅ Automatic deployments on git push
- ✅ Preview deployments for pull requests  
- ✅ Custom domains
- ✅ Built-in analytics
- ✅ Edge functions
- ✅ Image optimization

## Free Tier Limits
- **100GB bandwidth/month**
- **1000 serverless function invocations/day**
- **100 deployments/day**
- **Unlimited projects**

Perfect for your treatment scheduler app!
