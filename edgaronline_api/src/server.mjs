import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/config.mjs';

// Import routes
import authRoutes from './routes/auth.mjs';
import cikRoutes from './routes/cik.mjs';
import issuerRoutes from './routes/issuers.mjs';
import filingRoutes from './routes/filings.mjs';
import validationRoutes from './routes/validation.mjs';
import exhibitRoutes from './routes/exhibits.mjs';
import submissionRoutes from './routes/submission.mjs';
import utilityRoutes from './routes/utils.mjs';

// Import middleware
import { errorHandler } from './middleware/errorHandler.mjs';

const app = express();

// Trust proxy (if behind nginx/load balancer)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS - allow frontend (flexible for development)
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://54.175.98.68:3000', // EC2 public IP
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (config.env === 'development') {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cik', cikRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/filings', filingRoutes);
app.use('/api/validate', validationRoutes);
app.use('/api/exhibits', exhibitRoutes);
app.use('/api/submit', submissionRoutes);
app.use('/api/submissions', submissionRoutes); // For history
app.use('/api/utils', utilityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   EDGAR Online API Server             ║
║   Environment: ${config.env.padEnd(24)}║
║   Port: ${PORT.toString().padEnd(30)}║
║   Frontend: ${config.frontendUrl.padEnd(24)}║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;


