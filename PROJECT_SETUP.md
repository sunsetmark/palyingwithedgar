# EDGAR Online Filing System - Project Setup Guide

Complete guide for setting up the EDGAR Online Filing System with React frontend and Express.js backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     EDGAR Online System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌─────────────────────┐      │
│  │   Frontend       │          │   Backend API       │      │
│  │   (edgaronline)  │◄────────►│   (edgaronline_api) │      │
│  │                  │          │                     │      │
│  │  - React 18      │   HTTP   │  - Express.js       │      │
│  │  - USWDS 3.0     │   REST   │  - JWT Auth         │      │
│  │  - Vite          │   API    │  - MySQL2           │      │
│  └──────────────────┘          └─────────────────────┘      │
│         │                              │                     │
│         │                              │                     │
│         └──────────────────┬───────────┘                     │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │   MariaDB         │                       │
│                  │   (poc database)  │                       │
│                  └───────────────────┘                       │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │   AWS S3          │                       │
│                  │   (File Storage)  │                       │
│                  └───────────────────┘                       │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │   SEC EDGAR       │                       │
│                  │   (Submission)    │                       │
│                  └───────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
/home/ec2-user/poc/code/
├── edgaronline/              # Frontend React application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React Context
│   │   └── assets/         # Styles, images
│   ├── package.json
│   └── README.md
│
├── edgaronline_api/         # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Express middleware
│   │   └── server.mjs      # Main server
│   ├── config/             # Configuration
│   ├── migrations/         # Database migrations
│   ├── package.json
│   └── README.md
│
├── server/                  # Existing POC utilities
│   ├── common.mjs          # Shared utilities
│   ├── config.mjs          # Shared config
│   └── xsdLookup.json      # XSD validation
│
└── PROJECT_SETUP.md         # This file
```

## Quick Start

### 1. Backend Setup

```bash
# Navigate to API directory
cd /home/ec2-user/poc/code/edgaronline_api

# Install dependencies
npm install

# Create .env file (see edgaronline_api/README.md for template)
nano .env

# Run database migrations
npm run migrate

# Start backend server (port 3001)
npm run dev
```

### 2. Frontend Setup

```bash
# Open new terminal
cd /home/ec2-user/poc/code/edgaronline

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start frontend dev server (port 3000)
npm run dev
```

### 3. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Technology Stack

### Frontend (edgaronline)

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.3.1 |
| Vite | Build Tool | 5.4.10 |
| React Router | Navigation | 6.26.0 |
| React Hook Form | Form Management | 7.53.0 |
| USWDS | Design System | 3.8.1 |
| Axios | HTTP Client | 1.7.7 |

### Backend (edgaronline_api)

| Technology | Purpose | Version |
|------------|---------|---------|
| Express | Web Framework | 4.21.1 |
| MySQL2 | Database Client | 3.14.5 |
| JWT | Authentication | 9.0.2 |
| bcryptjs | Password Hashing | 2.4.3 |
| Multer | File Uploads | 1.4.5-lts.1 |
| Helmet | Security | 8.0.0 |
| AWS SDK | S3 Integration | 3.886.0 |

## Design System

The application uses the **US Web Design System (USWDS) 3.0** with SEC.gov branding:

### Color Scheme

| Color | Hex Code | Usage |
|-------|----------|-------|
| SEC Blue (Primary) | `#004990` | Buttons, headers, primary actions |
| SEC Blue (Dark) | `#162e51` | Navigation, footer |
| SEC Blue (Light) | `#0071bc` | Links, hover states |
| SEC Red/Orange | `#d63e04` | Alerts, errors |
| SEC Gold | `#ffbe2e` | Accents, warnings |

### Logo & Branding

The application follows SEC.gov visual identity:
- Official SEC seal (when available)
- "SEC | EDGAR Online" branding
- Professional, government-appropriate design

## Database Setup

The system uses the existing `poc` database with new tables:

```sql
users                 # User accounts
filing_drafts         # Draft filings
reporters_cache       # Cached CIK info
validation_logs       # Validation history
edgar_submissions     # Submission tracking
exhibit_files         # File metadata
user_sessions         # Active sessions
audit_log            # Audit trail
```

Run migrations:
```bash
cd edgaronline_api
npm run migrate
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### CIK/Reporter
- `GET /api/cik/validate/:cik` - Validate CIK
- `GET /api/cik/info/:cik` - Get reporter info
- `POST /api/cik/verify` - Verify CIK/CCC

### Filings
- `GET /api/filings/drafts` - List drafts
- `POST /api/filings/drafts` - Create draft
- `PUT /api/filings/drafts/:id` - Update draft
- `GET /api/filings/drafts/:id/xml` - Get XML

### Validation
- `POST /api/validate/schema` - XSD validation
- `POST /api/validate/business` - Business rules
- `POST /api/validate/full` - Full validation

### Submission
- `POST /api/submit/:filingId` - Submit to EDGAR
- `GET /api/submissions/history` - Submission history

See detailed API documentation in `edgaronline_api/README.md`

## Security Considerations

### Authentication
- JWT tokens with 8-hour expiry
- Secure password hashing (bcrypt, 10 rounds)
- Rate limiting on authentication endpoints

### Data Protection
- CCC values encrypted at rest (AES encryption)
- Parameterized SQL queries (prevent injection)
- HTTPS required in production
- Security headers via Helmet

### Access Control
- JWT required for all protected endpoints
- CCC verification required for submissions
- Resource ownership validation

### Rate Limiting
- 100 requests per 15 minutes (general)
- 5 attempts per 15 minutes (auth endpoints)

## Integration with Existing POC

The new system integrates with existing POC utilities:

```javascript
// From ../server/common.mjs
import {
  formatCIK,           // Format CIK with leading zeros
  validateXML,         // XSD validation
  s3ReadString,        // Read from S3
  s3WriteString,       // Write to S3
  createSgml,          // Generate SGML
  runQuery,            // Execute SQL
} from '../../../server/common.mjs';
```

## Development Workflow

### 1. Frontend Development

```bash
cd edgaronline
npm run dev
```

- Vite hot-reloading for instant updates
- Proxy to backend API at http://localhost:3001
- Access at http://localhost:3000

### 2. Backend Development

```bash
cd edgaronline_api
npm run dev
```

- Nodemon auto-restart on file changes
- Debug logging in development mode
- API at http://localhost:3001

### 3. Testing

```bash
# Backend health check
curl http://localhost:3001/health

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Next Steps - Implementation Priorities

### Phase 1: Core Functionality (Weeks 1-2)
1. ✅ Project structure setup
2. ✅ Authentication system
3. ✅ Database schema
4. 🔄 Complete login/register forms
5. 🔄 Filing draft CRUD operations
6. 🔄 XML generation from form data

### Phase 2: Filing Wizard (Weeks 3-4)
1. Form 3 wizard (initial ownership)
2. Form 4 wizard (changes)
3. Form 5 wizard (annual)
4. Multi-step form navigation
5. Form state persistence

### Phase 3: Validation (Week 5)
1. XSD schema validation
2. Business rule validation
3. Error display and handling
4. XML preview with syntax highlighting

### Phase 4: Submission (Week 6)
1. Exhibit file upload
2. CCC verification
3. EDGAR submission integration
4. Submission status tracking
5. Error handling and retry logic

### Phase 5: Polish & Deploy (Weeks 7-8)
1. UI/UX refinements
2. Comprehensive error handling
3. Loading states and feedback
4. Documentation
5. Production deployment

## Deployment

### Production Checklist

#### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Database connection pooling
- [ ] Enable HTTPS
- [ ] Configure nginx reverse proxy
- [ ] Set up SSL certificates
- [ ] Configure AWS credentials
- [ ] Enable audit logging
- [ ] Set up monitoring (e.g., PM2)

#### Frontend
- [ ] Build production bundle (`npm run build`)
- [ ] Configure nginx to serve static files
- [ ] Set production API URL
- [ ] Enable gzip compression
- [ ] Set cache headers
- [ ] Configure CSP headers
- [ ] Test on target browsers

#### Database
- [ ] Run all migrations
- [ ] Set up automated backups
- [ ] Configure backup retention
- [ ] Test restore procedure
- [ ] Enable slow query logging
- [ ] Optimize indexes

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :3001

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h 127.0.0.1 -u poc_user -p poc

# Check MySQL status
sudo systemctl status mariadb
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support & Documentation

- Frontend README: `edgaronline/README.md`
- Backend README: `edgaronline_api/README.md`
- USWDS Docs: https://designsystem.digital.gov/
- EDGAR Specs: https://www.sec.gov/edgar/filer-information

## License

Proprietary - All rights reserved

## Contributors

- Development Team
- SEC EDGAR Technical Specifications Team

---

**Last Updated:** January 29, 2025
**Version:** 1.0.0


