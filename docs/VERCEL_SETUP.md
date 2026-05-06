# Vercel Deployment Setup Guide

## Problem: 404 Error When Loading Categories

If you're seeing "Error loading categories: Request failed with status code 404", the most likely cause is missing environment variables on Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Supabase Database URL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Settings** > **Database**
4. Under "Connection String", select **Node.js** from the dropdown
5. Copy the connection string (it will look like `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`personal-expense-tracker-vercel`)
3. Click **Settings** > **Environment Variables**
4. Add the following variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

### Step 3: Deploy

1. Go to **Deployments** in your Vercel project
2. Click the three dots (...) on the latest deployment
3. Select **Redeploy** to redeploy with the new environment variables

Alternatively, push a new commit to trigger a redeploy:
```bash
git commit --allow-empty -m "Trigger redeploy with environment variables"
git push
```

## For Local Development

1. Create a `.env` file in the `frontend-vue` directory (use `.env.example` as a template)
2. Add your local database connection string:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/your_database
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   ```
3. Make sure your PostgreSQL database is running
4. Run `npm install` and `npm run dev`

## Getting Supabase Credentials

### API Keys
- Go to **Settings** > **API** in your Supabase project
- Copy the "anon" (public) key - use this for VITE_SUPABASE_ANON_KEY
- Copy the "service_role" (secret) key - use this for SUPABASE_SERVICE_ROLE_KEY (Vercel only)

### Database Connection
- Go to **Settings** > **Database**  
- Select **Node.js** from the connection string type dropdown
- Copy the full connection string - use this for DATABASE_URL

## Troubleshooting

### Still getting 404?
1. Check that all environment variables are set correctly on Vercel
2. Redeploy your project
3. Check the Vercel deployment logs for errors:
   - Go to **Deployments**
   - Click on your latest deployment
   - Click **Runtime Logs** to see error messages

### Database connection refused?
- Make sure your Supabase project is active
- Check that your IP address is whitelisted in Supabase (usually not needed for Vercel as Supabase allows connections from anywhere)
- Verify the connection string is correct (especially the password and host)

### 401 Unauthorized?
- This is different from 404 - it means the API is working but you're not authenticated
- Make sure you've signed in to the app
- Check your Supabase authentication configuration
