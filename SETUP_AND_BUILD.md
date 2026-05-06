# Quick Start: Local Testing & Build

## 🚀 Quick Steps (5 minutes)

### Step 1: Update .env with Supabase Credentials

**Get your Supabase credentials:**

1. Go to your Supabase project dashboard
2. Click **Settings > API**
   - Copy `Project URL` → paste as `VITE_SUPABASE_URL`
   - Copy `anon public` key → paste as `VITE_SUPABASE_ANON_KEY`
3. Click **Settings > Database > Connection String**
   - Select **Node.js**
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Copy the full string → paste as `DATABASE_URL`

**Updated .env file looks like:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (long string)
DATABASE_URL=postgresql://postgres:yourpassword@db.your-project.supabase.co:6543/postgres?schema=public
JWT_SECRET=your-secret-key-at-least-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-at-least-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
PORT=3000
```

### Step 2: Clean Up Unnecessary Files

The `backend` directory inside `frontend-vue` is no longer needed (we have serverless APIs instead):

```bash
cd frontend-vue

# Remove the old backend directory
rm -rf backend

# Done! You still have the main backend/ at root level for reference
```

### Step 3: Install Dependencies & Start Testing

```bash
# Make sure you're in frontend-vue directory
cd frontend-vue

# Install all dependencies (includes pg, bcryptjs, jwt, uuid for APIs)
npm install

# Start development server (runs Vue + Serverless APIs)
npm run dev
```

You should see:
```
➜  Local:   http://localhost:3000/
```

### Step 4: Test in Browser & API

**In your browser:**
- Open `http://localhost:3000`
- Click "Sign Up"
- Create test account
- You should see the dashboard with categories and empty transactions

**In terminal (test API directly):**
```bash
# Health check
curl http://localhost:3000/api/health

# Signup (replace test@example.com with any email)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Response will have accessToken - copy it for next commands

# Get profile (replace TOKEN)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Get accounts (should see default "Cash" account)
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer TOKEN"
```

## 📁 Project Structure After Changes

```
frontend-vue/
├── api/                    # ✨ NEW - Serverless functions
│   ├── handlers/           # Auth, accounts, expenses, etc.
│   ├── lib/                # Shared utilities (db, auth, jwt)
│   ├── router.js           # Main API router
│   └── index.cjs           # Vercel entry point
├── src/                    # Vue frontend
│   ├── views/              # Pages
│   ├── components/         # Vue components
│   ├── lib/                # api.js (uses /api routes)
│   └── stores/             # Pinia state management
├── .env                    # Environment (updated)
├── .env.example            # Template (updated)
├── package.json            # Build script simplified
├── vercel.json             # Serverless config (updated)
├── API_SETUP.md            # Full API reference
├── QUICK_START_API.md      # Quick API reference
├── LOCAL_TESTING.md        # Detailed testing guide
└── (removed) backend/      # ❌ DELETED - no longer needed

Root directory still has:
backend/                    # Original backend for schema reference
```

## ✅ What Was Changed

| Item | Before | After |
|------|--------|-------|
| Backend | Express.js separate | Serverless functions in api/ |
| Build Script | `build && cd backend && npm install` | `build` |
| Backend Directory | frontend-vue/backend | Removed (not needed) |
| .env | Incomplete | Complete with all vars |
| API Routes | http://backend:3000 | http://localhost:3000/api |
| Deployment | 2 deployments | 1 Vercel deployment |

## 🔧 Build for Production

```bash
# In frontend-vue directory
npm run build

# This creates dist/ folder with:
# - Compiled Vue app
# - Static assets
# - Ready to deploy to Vercel
```

## 🌍 Deploy to Vercel

When ready to go live:

```bash
# Install Vercel CLI (if not done)
npm install -g vercel

# Deploy
cd frontend-vue
vercel

# Set environment variables in Vercel dashboard
# (same vars from .env file)
```

See `MIGRATION_GUIDE.md` for detailed deployment steps.

## 🧪 Testing Checklist

After starting `npm run dev`, verify:

- [ ] Browser opens to http://localhost:3000
- [ ] Signup works - creates user with test@example.com
- [ ] Dashboard loads after signup
- [ ] 10 expense categories visible (Food, Transport, etc.)
- [ ] 1 default "Cash" account created
- [ ] Can create new transaction
- [ ] Can view accounts list
- [ ] API health check works: `curl http://localhost:3000/api/health`

## ❓ Quick Troubleshooting

**"Cannot find module 'pg'"**
```bash
npm install pg --save
```

**"Database connection timeout"**
- Check DATABASE_URL in .env
- Use connection pooler (port 6543, not 5432)
- Verify password is correct

**"Port 3000 already in use"**
```bash
# Kill existing process
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

**"Signup says email already exists"**
- Use a different email for testing
- Or check/delete previous test users in Supabase

## 📚 Documentation Files

- **LOCAL_TESTING.md** - Detailed testing guide with curl examples
- **API_SETUP.md** - Complete API endpoint reference
- **QUICK_START_API.md** - API quick reference
- **MIGRATION_GUIDE.md** - Vercel deployment guide

## 🎯 Next Steps

1. ✅ Update .env with Supabase credentials
2. ✅ Remove backend directory
3. ✅ Run `npm install` and `npm run dev`
4. ✅ Test in browser and with curl commands
5. ✅ Build with `npm run build`
6. ✅ Deploy to Vercel

All set! 🚀
