# 🔧 Fix 404 Error - Registration Guide

## The Problem
You're getting a "Route not found" error when trying to register because:
1. The backend server isn't running
2. The frontend is trying to connect to the wrong URL
3. Database isn't set up

## ✅ Solution Steps

### 1. Set Up Database (PostgreSQL Required)

**Option A: Install PostgreSQL**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the `postgres` user

**Option B: Use Docker (if you have Docker)**
```bash
docker run --name postgres-whattocarry -e POSTGRES_PASSWORD=password -e POSTGRES_DB=whattocarry -p 5432:5432 -d postgres:15
```

### 2. Update Environment Files

**Backend (.env file in backend folder):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/whattocarry
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=4000
```

**Frontend (.env file in frontend folder):**
```env
VITE_BACKEND_URL=http://localhost:4000
```

### 3. Set Up Database Tables

```bash
# In backend folder
cd backend
npm run setup
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Test Registration

1. Go to: `http://localhost:3000/signup`
2. Fill out the form:
   - Username: `testuser`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign Up"

## Expected Results

✅ **Success**: 
- No more 404 errors
- Registration form submits successfully
- Redirects to login page
- Can immediately log in with new credentials

❌ **If still getting errors**:
- Check that both servers are running
- Verify database connection
- Check browser console for specific errors

## Quick Test Commands

```bash
# Check if backend is running
curl http://localhost:4000/auth/register

# Check if frontend is running  
curl http://localhost:3000

# Check database connection
psql -h localhost -U postgres -d whattocarry -c "SELECT 1;"
```

## Common Issues & Fixes

1. **"Connection refused"**: PostgreSQL not running
2. **"Database doesn't exist"**: Run `npm run setup` in backend
3. **"Invalid credentials"**: Check DATABASE_URL in .env
4. **"Port already in use"**: Kill existing processes or change ports

The registration should work after following these steps! 🎉 