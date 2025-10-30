# EDGAR Online Filing System - Backend API

Express.js REST API for SEC ownership filing system with authentication, validation, and EDGAR submission capabilities.

## Features

- ✅ JWT-based authentication
- ✅ CIK/CCC validation
- ✅ Draft filing management
- ✅ XML schema validation
- ✅ File upload handling
- ✅ EDGAR submission integration
- ✅ Integration with existing POC utilities

## Tech Stack

- **Express 4** - Web framework
- **MySQL2** - Database client
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **AWS SDK** - S3 integration
- **Helmet** - Security headers
- **Rate limiting** - DDoS protection

## Project Structure

```
edgaronline_api/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── auth.mjs      # Authentication endpoints
│   │   ├── cik.mjs       # CIK validation/lookup
│   │   ├── filings.mjs   # Filing draft CRUD
│   │   ├── validation.mjs # XML validation
│   │   ├── exhibits.mjs  # File upload
│   │   ├── submission.mjs # EDGAR submission
│   │   ├── issuers.mjs   # Issuer lookup
│   │   └── utils.mjs     # Utility endpoints
│   ├── middleware/       # Express middleware
│   │   ├── auth.mjs      # JWT verification
│   │   └── errorHandler.mjs # Error handling
│   ├── controllers/      # Business logic (TODO)
│   ├── services/         # Service layer (TODO)
│   └── server.mjs        # Main application
├── config/
│   └── config.mjs        # Configuration
├── migrations/           # Database migrations
│   ├── 001_create_users_and_filings.sql
│   └── run.mjs
└── package.json
```

## Installation

### Prerequisites

- Node.js 18+
- MariaDB/MySQL
- AWS credentials (for S3 access)
- Access to existing POC utilities at `../server/`

### Setup

1. **Install dependencies:**

```bash
cd /home/ec2-user/poc/code/edgaronline_api
npm install
```

2. **Create environment file:**

Create `.env` in project root:

```env
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=poc
DB_USER=poc_user
DB_PASSWORD=poc_pwd

# JWT
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
JWT_EXPIRY=8h

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=test.publicdata.guru

# EDGAR
EDGAR_TEST_URL=https://efts.sec.gov/test
EDGAR_LIVE_URL=https://efts.sec.gov

# Security
BCRYPT_ROUNDS=10
```

3. **Run database migrations:**

```bash
npm run migrate
```

This will create the following tables:
- `users` - User accounts
- `filing_drafts` - Draft filings
- `reporters_cache` - Cached reporter info
- `validation_logs` - Validation history
- `edgar_submissions` - Submission tracking
- `exhibit_files` - Uploaded files
- `user_sessions` - Active sessions
- `audit_log` - Audit trail

4. **Start the server:**

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### CIK Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cik/validate/:cik` | Validate CIK format | Yes |
| GET | `/api/cik/info/:cik` | Get reporter info | Yes |
| POST | `/api/cik/verify` | Verify CIK/CCC pair | Yes |

### Filing Drafts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/filings/drafts` | List user's drafts | Yes |
| GET | `/api/filings/drafts/:id` | Get draft details | Yes |
| POST | `/api/filings/drafts` | Create new draft | Yes |
| PUT | `/api/filings/drafts/:id` | Update draft | Yes |
| DELETE | `/api/filings/drafts/:id` | Delete draft | Yes |
| GET | `/api/filings/drafts/:id/xml` | Get XML preview | Yes |

### Validation

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/validate/schema` | XSD schema validation | Yes |
| POST | `/api/validate/business` | Business rules check | Yes |
| POST | `/api/validate/full` | Full validation | Yes |

### Exhibits

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/exhibits/:filingId/upload` | Upload file | Yes |
| GET | `/api/exhibits/:filingId` | List exhibits | Yes |
| DELETE | `/api/exhibits/:id` | Delete exhibit | Yes |

### Submission

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/submit/:filingId` | Submit to EDGAR | Yes + CCC |
| GET | `/api/submit/:filingId/status` | Check status | Yes |
| GET | `/api/submissions/history` | Submission history | Yes |

### Utilities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/utils/transaction-codes` | Get transaction codes | No |
| GET | `/api/utils/state-codes` | Get state codes | No |
| GET | `/api/utils/form-templates/:type` | Get form template | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server returns JWT token
3. Client includes token in `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```

Token expires after 8 hours (configurable via `JWT_EXPIRY`).

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing protection
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Auth Rate Limiting** - 5 login attempts per 15 minutes
- **Password Hashing** - bcrypt with 10 rounds
- **CCC Encryption** - AES encryption for stored CCCs
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content Security Policy headers

## Integration with Existing POC Utilities

The API integrates with existing utilities from `/server/`:

- `common.mjs` - S3 operations, database queries, formatting
- `config.mjs` - Shared configuration
- `xsdLookup.json` - XSD validation schemas

Example usage:

```javascript
import { formatCIK, validateXML, s3WriteString } from '../../../server/common.mjs';

// Format CIK with leading zeros
const formattedCIK = formatCIK(1234567);

// Validate XML against XSD
const result = await validateXML(xmlSource, xsdSources);
```

## Database Schema

### users
```sql
id, email, password_hash, name, cik, ccc_encrypted, 
created_at, updated_at, last_login, is_active
```

### filing_drafts
```sql
id, user_id, form_type, draft_name, xml_content, json_data,
created_at, updated_at
```

### edgar_submissions
```sql
id, filing_draft_id, user_id, accession_number, form_type,
status, is_live, edgar_response, submitted_at, updated_at
```

## Error Handling

All errors return JSON with this structure:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // (development only)
}
```

Common error codes:
- `MISSING_FIELDS` - Required fields missing
- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - JWT expired
- `INVALID_TOKEN` - JWT invalid
- `NOT_AUTHORIZED` - No permission
- `CCC_REQUIRED` - CCC needed for operation
- `VALIDATION_ERROR` - Data validation failed

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Import in `src/server.mjs`
3. Register route: `app.use('/api/your-route', yourRoutes)`

### Adding Middleware

Apply to specific routes or globally:

```javascript
// Specific route
router.get('/protected', authenticateToken, handler);

// Global
app.use(middleware);
```

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up database backups
- [ ] Configure AWS credentials
- [ ] Review rate limits
- [ ] Enable audit logging
- [ ] Set up monitoring

### Environment Variables for Production

All sensitive values should come from environment variables, never hardcoded.

## Next Steps

Priority implementation tasks:

1. **XML Generation** - Build XML from JSON form data
2. **XSD Validation** - Integrate existing `validateXML` utility
3. **Business Rules** - Implement ownership form validation rules
4. **EDGAR Submission** - Complete submission flow
5. **File Upload** - S3 upload for exhibits
6. **Reporter Lookup** - Integrate with SEC API
7. **Audit Logging** - Log all critical actions

## Scripts

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Links

- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [EDGAR Technical Specs](https://www.sec.gov/edgar/filer-information/current-edgar-filer-manual)


