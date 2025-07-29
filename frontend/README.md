# WhatToCarry Frontend

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the frontend directory with the following variables:

```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:4000

# Supabase Configuration (for future use if needed)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## Authentication

The frontend now uses the backend API for authentication instead of Supabase. 

### Test Users

After running the database seed, you can use these test accounts:

- **Admin User**: `admin@whattocarry.com` / `admin123`
- **Demo User**: `user@example.com` / `user123`

### Features

- ✅ Login/Logout functionality
- ✅ User registration
- ✅ JWT token management
- ✅ Protected routes
- ✅ User profile management

## Development Notes

- Email verification is temporarily bypassed for development
- All API calls go through the backend at `http://localhost:4000`
- Authentication tokens are stored in localStorage
- The backend must be running for authentication to work
