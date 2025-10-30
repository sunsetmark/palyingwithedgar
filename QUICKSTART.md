# EDGAR Online - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MariaDB running with `poc` database
- ✅ Database credentials: `poc_user` / `poc_pwd`

## Installation Steps

### 1. Backend Setup (2 minutes)

```bash
# Navigate to API directory
cd /home/ec2-user/poc/code/edgaronline_api

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
JWT_SECRET=change-this-to-a-secure-random-string-in-production
DB_HOST=127.0.0.1
DB_NAME=poc
DB_USER=poc_user
DB_PASSWORD=poc_pwd
EOF

# Run database migrations
npm run migrate

# Start backend (keep this terminal open)
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════╗
║   EDGAR Online API Server             ║
║   Environment: development            ║
║   Port: 3001                          ║
╚═══════════════════════════════════════╝
```

### 2. Frontend Setup (2 minutes)

Open a **new terminal**:

```bash
# Navigate to frontend directory
cd /home/ec2-user/poc/code/edgaronline

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start frontend (keep this terminal open)
npm run dev
```

Expected output:
```
  VITE v5.4.10  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

### 3. Test the Application (1 minute)

Open your browser to: **http://localhost:3000**

#### Test the API:

```bash
# In a new terminal, test the health endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","environment":"development","timestamp":"..."}
```

#### Create a test account:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Expected response includes a JWT token:
# {"message":"User registered successfully","token":"eyJ...","user":{...}}
```

## Next Steps

### For Frontend Development:

1. **Implement Login Form** - Use React Hook Form in `src/pages/Login.jsx`
2. **Build Filing Wizard** - Create multi-step form in `src/pages/FilingWizard.jsx`
3. **Add Components** - Build reusable components in `src/components/`

Key files to work on:
- `edgaronline/src/pages/Login.jsx`
- `edgaronline/src/pages/FilingWizard.jsx`
- `edgaronline/src/components/forms/`

### For Backend Development:

1. **XML Generation** - Implement XML building from form data
2. **XSD Validation** - Integrate `validateXML` from `../server/common.mjs`
3. **EDGAR Submission** - Build submission flow

Key files to work on:
- `edgaronline_api/src/routes/validation.mjs`
- `edgaronline_api/src/routes/submission.mjs`
- `edgaronline_api/src/services/` (create service layer)

## Project Structure Overview

```
edgaronline/              Frontend (React + USWDS)
├── src/
│   ├── pages/           ← Start here for UI
│   ├── components/      ← Reusable components
│   ├── services/        ← API calls (already set up)
│   └── context/         ← State management (Auth ready)

edgaronline_api/         Backend (Express + JWT)
├── src/
│   ├── routes/          ← API endpoints (stubs ready)
│   ├── middleware/      ← Auth ready
│   └── server.mjs       ← Main server (running)
```

## Available Scripts

### Frontend
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm run dev      # Start with auto-reload (port 3001)
npm start        # Start production server
npm run migrate  # Run database migrations
```

## Key Features Already Implemented

### ✅ Backend
- JWT authentication (register, login, logout)
- Password hashing with bcrypt
- CIK validation and formatting
- Draft filing CRUD operations
- Database connection pooling
- Security headers (Helmet)
- Rate limiting
- Error handling

### ✅ Frontend
- React Router setup with protected routes
- Auth Context for state management
- API service layer (Axios)
- SEC.gov themed styling (USWDS)
- Header and Footer components
- Responsive layout

## Common Issues & Solutions

### "Port 3000 already in use"
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### "Cannot connect to database"
```bash
# Check MariaDB is running
sudo systemctl status mariadb

# Test connection
mysql -u poc_user -p poc
# Password: poc_pwd
```

### "Module not found"
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John Doe"}'

# Login (save the token from response)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get user info (use token from login)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Validate CIK
curl http://localhost:3001/api/cik/validate/0001234567 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Documentation

- 📘 **Full Setup Guide:** `PROJECT_SETUP.md`
- 📗 **Frontend Docs:** `edgaronline/README.md`
- 📙 **Backend API Docs:** `edgaronline_api/README.md`
- 🌐 **USWDS Docs:** https://designsystem.digital.gov/

## Need Help?

1. Check the README files for detailed documentation
2. Review existing code for patterns
3. Check console logs for error details
4. Review `PROJECT_SETUP.md` for architecture overview

---

**You're all set!** 🚀

Start building forms in the frontend and implementing the XML generation in the backend.


