# Personal Expense Tracker - Vercel + Supabase Setup

This is a fresh setup of the Personal Expense Tracker using Vercel for deployment and Supabase for database and authentication.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Note down the Project URL and API Keys (anon public and service role).

### 2. Set up Database Schema

In the Supabase SQL Editor, run the migration script from `backend/migrations/00_consolidated.sql`.

**Important:** Enable Row Level Security (RLS) on all tables and add policies to ensure users can only access their own data. Without RLS, your data is not secure!

Example RLS setup (add to SQL Editor after running the schema):

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Add policies (example for expenses - repeat for all tables)
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);
```

### 3. Environment Variables

**For local development (.env file):**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Vercel deployment:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (keep secret!)

### 4. Deploy to Vercel

1. **Create a GitHub repository** and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vue.js
     - Root Directory: `frontend-vue`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables in Vercel dashboard
   - Click "Deploy"

### 5. API Routes Implemented

The following API routes have been created as Vercel serverless functions:

- `/api/expenses.js` - GET, POST for expenses
- `/api/incomes.js` - GET, POST for incomes
- `/api/accounts.js` - GET, POST for accounts
- `/api/transfers.js` - GET, POST for transfers
- `/api/budgets.js` - GET, POST for budgets
- `/api/categories/expense.js` - GET, POST for expense categories
- `/api/categories/income.js` - GET, POST for income categories

**Note:** Additional routes for reports, admin functions, etc., need to be implemented based on the original backend.

### 6. Test the Application

1. **Local development:**
   ```bash
   cd frontend-vue
   npm run dev
   ```

2. **Access the app** at the Vercel deployment URL after deployment.

## Features

- User authentication via Supabase Auth
- Income and expense tracking
- Category management
- Account management
- Budgets and alerts
- Transfers
- Reports and analytics
- Admin dashboard

## Security Notes

- Always enable RLS on database tables
- Use service role key only in server-side functions
- Keep anon key public but restricted by RLS policies
- Regularly rotate API keys if compromised

- User authentication via Supabase Auth
- Income and expense tracking
- Category management
- Account management
- Budgets and alerts
- Transfers
- Reports and analytics
- Admin dashboard

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```