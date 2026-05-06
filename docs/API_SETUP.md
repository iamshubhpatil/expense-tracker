# Vercel Serverless APIs - Setup and Configuration

This directory contains serverless API endpoints that replace the Express backend for Vercel deployment. The APIs are organized into modular handlers and use Supabase PostgreSQL for data persistence.

## Directory Structure

```
api/
├── handlers/
│   ├── auth.js           # Authentication: signup, login, profile management
│   ├── accounts.js       # Account CRUD operations
│   ├── expenses.js       # Expense management
│   ├── income.js         # Income management
│   ├── categories.js     # Expense and income categories
│   ├── budgets.js        # Budget management
│   ├── transfers.js      # Account transfers
│   ├── reports.js        # Dashboard and reporting
│   └── admin.js          # Admin operations
├── lib/
│   ├── database.js       # PostgreSQL connection pool
│   ├── auth.js           # JWT token management
│   ├── middleware.js     # Authentication middleware
│   ├── errors.js         # Error handling
│   └── response.js       # Response helpers
├── router.js             # Main API router
└── index.cjs             # Vercel serverless function entry point
```

## Environment Variables

Create a `.env.local` file in the `frontend-vue` directory with the following variables:

```
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
# Or use individual variables:
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Port (for local testing)
PORT=3000
NODE_ENV=production
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Authentication (Protected)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Accounts (Protected)
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id/balance` - Get account balance

### Expenses (Protected)
- `GET /api/expenses` - Get expenses (with pagination and filters)
- `GET /api/expenses/summary` - Get expense summary by category
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income (Protected)
- `GET /api/income` - Get income entries
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Categories (Protected)
- `GET /api/expense-categories` - Get expense categories
- `POST /api/expense-categories` - Create expense category
- `PUT /api/expense-categories/:id` - Update expense category
- `DELETE /api/expense-categories/:id` - Delete expense category
- `GET /api/income-categories` - Get income categories
- `POST /api/income-categories` - Create income category
- `PUT /api/income-categories/:id` - Update income category
- `DELETE /api/income-categories/:id` - Delete income category

### Budgets (Protected)
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Transfers (Protected)
- `GET /api/transfers` - Get transfers
- `POST /api/transfers` - Create transfer
- `PUT /api/transfers/:id` - Update transfer
- `DELETE /api/transfers/:id` - Delete transfer

### Reports (Protected)
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/monthly` - Get monthly report
- `GET /api/reports/yearly` - Get yearly report

### Admin (Protected - Admin Only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `GET /api/admin/expenses` - Get all expenses (with user filter)
- `DELETE /api/admin/expenses/:expenseId` - Delete expense

### Health Check
- `GET /api/health` - API health status

## Local Testing

To test the APIs locally with Supabase:

```bash
cd frontend-vue

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Test with local API calls
curl -X GET http://localhost:3000/api/health

# For development, you can run the frontend and it will use the API
npm run dev
```

## Vercel Deployment

The APIs are configured to run as Vercel serverless functions:

1. **Build Command**: Creates the necessary dependencies
2. **Functions**: Maps `/api/*` routes to `api/index.cjs`
3. **Environment Variables**: Set in Vercel project settings

### vercel.json Configuration

The `vercel.json` file in `frontend-vue` directory configures:
- API routes mapping to serverless functions
- Static file serving (CSS, JS, images)
- SPA fallback to index.html

### Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend-vue directory
cd frontend-vue
vercel

# Set environment variables in Vercel dashboard
```

## Migration from Express Backend

The serverless API implementation replaces the Express backend with the following advantages:

1. **No separate backend deployment**: APIs run as serverless functions
2. **Scalability**: Automatic scaling based on traffic
3. **Cost-effective**: Pay only for function execution time
4. **Simplified deployment**: Single Vercel deployment for frontend + APIs
5. **Same functionality**: All backend features maintained

### Key Changes

- ✅ JWT-based authentication (unchanged)
- ✅ PostgreSQL/Supabase database (unchanged)
- ✅ All CRUD operations (preserved)
- ✅ Data validation and error handling (improved)
- ✅ Pagination and filtering (maintained)
- ✅ Account balance calculations (preserved)
- ✅ Admin operations (available)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL or SUPABASE_DB_URL is set correctly
- Check that the database is accessible from Vercel
- Ensure all required tables are created (use migrations)

### Authentication Errors
- Ensure JWT_SECRET is set and consistent
- Verify tokens are being passed in Authorization header
- Check token expiration settings

### API Response Errors
- Check browser console for detailed error messages
- Use `curl` to test endpoints directly
- Check Vercel function logs for server-side errors

## Performance Optimization

1. **Connection Pooling**: Database connections are pooled to avoid exhaustion
2. **Timeouts**: Vercel serverless functions have execution limits
3. **Cold Starts**: Initial requests may take longer (optimize by keeping functions warm)
4. **Query Optimization**: Database queries are indexed for performance

## Security Considerations

1. **JWT Secret**: Use strong, random secrets
2. **CORS**: Configure appropriate CORS origins
3. **Rate Limiting**: Consider implementing rate limiting for auth endpoints
4. **Input Validation**: All inputs are validated before database operations
5. **SQL Injection**: Using parameterized queries prevents SQL injection
6. **Password Hashing**: Passwords are hashed with bcrypt

## Future Enhancements

- [ ] Import functionality (CSV/Excel upload)
- [ ] Email notifications
- [ ] Budget alerts
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Data export functionality
