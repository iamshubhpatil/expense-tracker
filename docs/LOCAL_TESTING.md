# Local Testing Guide - Serverless APIs with Supabase

This guide will help you test the app locally with Supabase PostgreSQL before deploying to Vercel.

## Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Supabase Account** - [Sign up free](https://supabase.com/)
3. **Git** (optional) - For version control

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project (if not done)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (or use existing one)
3. Note your project details:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: From Settings > API
   - **Database Password**: Set during project creation

### 1.2 Get Database Connection String

1. Go to **Settings > Database** in your Supabase project
2. Click on **Connection String** tab
3. Choose **Node.js** from the dropdown
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. Example: `postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:6543/postgres?schema=public`

### 1.3 Get API Keys

1. Go to **Settings > API** in Supabase
2. Copy:
   - **Project URL** (for VITE_SUPABASE_URL)
   - **Anon Key** (for VITE_SUPABASE_ANON_KEY)

## Step 2: Local Environment Setup

### 2.1 Update .env File

Edit `frontend-vue/.env` with your actual Supabase credentials:

```bash
# ============================================
# Supabase Frontend Configuration
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

# ============================================
# Database Connection (for Serverless APIs)
# ============================================
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:6543/postgres?schema=public

# ============================================
# JWT Configuration (generate strong random strings!)
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-abcd1234
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars-xyz9876
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ============================================
# Node Environment
# ============================================
NODE_ENV=development
PORT=3000
```

### 2.2 Verify Database Schema

Your Supabase database needs these tables. Check if they exist:

```bash
# From Supabase Dashboard > SQL Editor, run:
\dt
```

Required tables:
- `users`
- `accounts`
- `expenses`
- `income`
- `expense_categories`
- `income_categories`
- `budgets`
- `transfers`

**If tables don't exist**, run migrations from `backend/migrations/00_consolidated.sql`:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy content from `backend/migrations/00_consolidated.sql`
4. Click **Run**

## Step 3: Install Dependencies

```bash
cd frontend-vue

# Install all dependencies
npm install

# Verify pg package installed (needed for database connection)
npm list pg
```

## Step 4: Test API Locally

### 4.1 Start Development Server

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:3000/
```

### 4.2 Test API Health Check

Open a new terminal:

```bash
# Test if API is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","message":"API is running","timestamp":"..."}
```

### 4.3 Test Authentication Endpoints

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!",
    "firstName":"John",
    "lastName":"Doe"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "User registered successfully",
#   "data": {
#     "user": {"id":"...", "email":"...", "role":"user"},
#     "tokens": {"accessToken":"...", "refreshToken":"..."}
#   }
# }
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }'

# Copy the accessToken from response
```

**Use Token for Protected Routes:**
```bash
# Get your profile (replace TOKEN with the accessToken)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Expected response:
# {
#   "success": true,
#   "data": {"id":"...", "email":"...", "first_name":"...", ...}
# }
```

### 4.4 Test Account Endpoints

```bash
# Get all accounts
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer TOKEN"

# Create new account
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name":"Savings",
    "accountType":"Savings",
    "balance":5000,
    "currency":"INR"
  }'
```

### 4.5 Test Expense Endpoints

```bash
# Get expense categories (should be auto-created at signup)
curl -X GET http://localhost:3000/api/expense-categories \
  -H "Authorization: Bearer TOKEN"

# Create expense (get accountId and categoryId from above endpoints)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "accountId":"ACCOUNT_ID",
    "categoryId":"CATEGORY_ID",
    "amount":500,
    "description":"Lunch",
    "date":"2024-05-06"
  }'
```

## Step 5: Test Frontend Application

1. Open browser: `http://localhost:3000`
2. You should see the landing page
3. Click **Sign Up**
4. Create a test account
5. Dashboard should load with:
   - Account balance
   - Expense categories
   - Empty transaction list

## Step 6: Remove Unnecessary Backend Directory (Optional)

Since we're using serverless APIs, you can remove the old backend copy:

```bash
# From frontend-vue directory
rm -rf backend

# This removes the old Express backend copy
# Keep the root /backend directory if you want to reference the schema
```

## Troubleshooting

### Error: "Cannot find module 'pg'"

```bash
# Install missing database package
npm install pg --save
```

### Error: "Database connection timeout"

- Verify DATABASE_URL is correct
- Check Supabase project is running
- Ensure your IP is allowed (Supabase allows all IPs by default)
- Try using connection pooler instead of direct connection:
  - Use port 6543 (pooler) instead of 5432 (direct)

### Error: "Authentication failed"

- Verify JWT_SECRET and JWT_REFRESH_SECRET are set
- Check Authorization header format: `Bearer <token>`
- Token might be expired (regenerate with refresh token endpoint)

### Error: "User already exists"

- Use different email for signup test
- Or delete user from Supabase dashboard

### API returns "Not found"

- Check request URL spelling
- Verify HTTP method (GET, POST, etc.)
- Check Authorization header if endpoint requires it

### Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check database connection
psql -h db.your-project.supabase.co -U postgres -d postgres -c "SELECT NOW();"

# View Supabase logs (from Supabase dashboard)
# Go to Logs > Realtime API Logs
```

## What Happens on Signup

Automatically created:
1. ✅ User account with hashed password
2. ✅ 10 default expense categories (Food, Transport, etc.)
3. ✅ 6 default income categories (Salary, Freelance, etc.)
4. ✅ 1 default "Cash" account with 0 balance
5. ✅ JWT access and refresh tokens

## Next Steps

After local testing is successful:

1. ✅ Verify all endpoints work
2. ✅ Test with multiple transactions
3. ✅ Check dashboard reports
4. ✅ Test token refresh
5. ✅ Deploy to Vercel (see MIGRATION_GUIDE.md)

## Performance Tips

- Close other apps to free up memory
- Use connection pooling (port 6543) not direct connection
- Keep API calls simple during testing
- Monitor Supabase metrics in dashboard

## Reference

- [Supabase Documentation](https://supabase.com/docs)
- [API_SETUP.md](./API_SETUP.md) - Complete API reference
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Vercel deployment
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
