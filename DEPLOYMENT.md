# Deployment Instructions for Render.com

## Why Render.com?

Render.com is perfect for this Next.js application because:
- Native support for Node.js applications with databases
- Automatic SSL certificates
- Built-in PostgreSQL database
- Simple deployment from Git repositories
- Free tier available

## Deployment Methods

### Option 1: Using render.yaml (Recommended)

1. **Push your code** to GitHub/GitLab
2. **Connect to Render**: Go to [render.com](https://render.com) and sign up
3. **Create new Blueprint**: Click "New +" → "Blueprint"
4. **Connect repository**: Select your GitHub/GitLab repository
5. **Deploy**: Render will automatically:
   - Create a PostgreSQL database
   - Build and deploy your web service
   - Set up environment variables

### Option 2: Manual Setup

1. **Create PostgreSQL Database**:
   - Go to Render dashboard → "New +" → "PostgreSQL"
   - Choose free tier
   - Note the connection string

2. **Create Web Service**:
   - Go to Render dashboard → "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Build Command**: `npx prisma generate && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       - `NODE_ENV`: `production`
       - `DATABASE_URL`: (use your PostgreSQL connection string)

## Database Setup

After deployment, set up your database:

1. **Access your web service shell** (from Render dashboard)
2. **Push database schema**: `npm run db:push`
3. **Seed the database**: `npm run db:seed`

## Environment Variables

The following are automatically configured with render.yaml:
- `NODE_ENV=production`
- `DATABASE_URL` (from PostgreSQL service)

## Local Development

1. Install dependencies: `npm install`
2. Set up your local database URL in `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/treatment_scheduler"
   ```
3. Generate Prisma client: `npm run db:generate`
4. Push database schema: `npm run db:push`
5. Seed database: `npm run db:seed`
6. Start development server: `npm run dev`

## Features

- ✅ Automatic SSL certificates
- ✅ Custom domains supported
- ✅ Automatic deployments on git push
- ✅ Built-in monitoring and logs
- ✅ Free PostgreSQL database (up to 1GB)
- ✅ Free web service (750 hours/month)
