# Serverless API Implementation - Quick Start

This file contains quick instructions for getting the serverless APIs up and running.

## ✅ What's Been Created

### API Handlers
- ✅ `api/handlers/auth.js` - Authentication (signup, login, profile, password)
- ✅ `api/handlers/accounts.js` - Account management (CRUD operations)
- ✅ `api/handlers/expenses.js` - Expense tracking
- ✅ `api/handlers/income.js` - Income tracking
- ✅ `api/handlers/categories.js` - Expense and income categories
- ✅ `api/handlers/budgets.js` - Budget management
- ✅ `api/handlers/transfers.js` - Inter-account transfers
- ✅ `api/handlers/reports.js` - Reporting and analytics
- ✅ `api/handlers/admin.js` - Admin operations

### Shared Libraries
- ✅ `api/lib/database.js` - PostgreSQL connection pool
- ✅ `api/lib/auth.js` - JWT token management
- ✅ `api/lib/middleware.js` - Authentication middleware
- ✅ `api/lib/errors.js` - Error handling
- ✅ `api/lib/response.js` - Response helpers

### Router & Entry Point
- ✅ `api/router.js` - Main API router with all routes
- ✅ `api/index.cjs` - Vercel serverless function entry point

### Configuration
- ✅ `vercel.json` - Updated for serverless deployment
- ✅ `API_SETUP.md` - Complete API documentation
- ✅ `MIGRATION_GUIDE.md` - Migration instructions

## 🚀 Quick Start

### Step 1: Set Environment Variables

Create `.env.local` in `frontend-vue`:
```
DATABASE_URL=postgresql://postgres:password@host:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### Step 2: Install Dependencies

```bash
cd frontend-vue
npm install
```

### Step 3: Test Locally

```bash
# Start development server
npm run dev

# Test API health (in another terminal)
curl http://localhost:3000/api/health

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### Step 4: Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
vercel

# Option 2: Push to GitHub and use Vercel Dashboard
```

Set environment variables in Vercel project settings.

## 📋 API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh JWT
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Accounts
- `GET /api/accounts` - List all
- `POST /api/accounts` - Create
- `GET /api/accounts/:id` - Get one
- `PUT /api/accounts/:id` - Update
- `DELETE /api/accounts/:id` - Delete

### Transactions
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/income` - List income
- `POST /api/income` - Create income
- `GET /api/transfers` - List transfers
- `POST /api/transfers` - Create transfer

### Categories
- `GET /api/expense-categories` - List
- `POST /api/expense-categories` - Create
- `GET /api/income-categories` - List
- `POST /api/income-categories` - Create

### Reports
- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/yearly` - Yearly report

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update role
- `GET /api/admin/expenses` - List all expenses
- `DELETE /api/admin/expenses/:id` - Delete expense

See `API_SETUP.md` for complete documentation.

## 🔧 Key Features

✅ JWT Authentication with refresh tokens
✅ Role-based access control (admin/user)
✅ PostgreSQL with connection pooling
✅ Account balance management
✅ Pagination and filtering
✅ Error handling and validation
✅ Category auto-creation on signup
✅ Soft deletes with is_active flag
✅ Database transaction safety
✅ Admin operations support

## 📊 Technology Stack

- **Frontend**: Vue.js 3, Vite, Pinia
- **APIs**: Node.js Serverless Functions
- **Database**: Supabase PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

## ⚠️ Important Notes

1. **Database URL**: Must point to Supabase PostgreSQL
2. **JWT Secrets**: Generate strong random strings
3. **Environment Variables**: Required in both local and Vercel
4. **Function Timeout**: 30 seconds maximum (usually not reached)
5. **Cold Start**: First request may take 1-2 seconds

## 🐛 Debugging

### Check Function Logs
```bash
vercel logs
```

### Test Endpoint Manually
```bash
curl -X GET http://localhost:3000/api/health
```

### Database Connection
```
psql -h <host> -U postgres -d <database>
\dt  -- List tables
```

## 📚 Documentation Files

- `API_SETUP.md` - Complete API reference
- `MIGRATION_GUIDE.md` - Migration instructions
- `frontend-vue/README_VERCEL.md` - Vercel-specific setup
- `QUICK_START.md` - This file

## 🎯 Next Steps

1. Set environment variables
2. Test locally with `npm run dev`
3. Deploy to Vercel
4. Monitor function performance
5. Set up error alerts

## 💡 Tips

- Use Supabase dashboard to manage database
- Monitor Vercel function metrics
- Keep JWT secrets secure
- Use strong passwords (8-32 chars, upper/lower/special)
- Test with Postman or curl before production

## ❓ FAQ

**Q: How do I use the APIs?**
A: Frontend automatically calls `/api/*` routes. See API_SETUP.md for details.

**Q: Where do I set database URL?**
A: Environment variables in `.env.local` (local) or Vercel dashboard (production).

**Q: Can I use Express backend instead?**
A: Yes, but these serverless APIs are optimized for Vercel.

**Q: How do I monitor performance?**
A: Use Vercel Analytics and Supabase Postgres Dashboard.

**Q: What's the free tier limit?**
A: Vercel: 100GB bandwidth/month. Supabase: Check pricing.

For more questions, see `API_SETUP.md`.
