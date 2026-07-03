import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import { rateLimit } from 'express-rate-limit';


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB Database
connectDB();

// 1. Strict limit for adding new reviews (Max 5 submissions per hour per IP)
const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    limit: 5, 
    message: { message: 'Too many testimonials submitted from this device. Please try again later.' },
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
});

// 2. Protective limit for fetching widgets (Max 100 views per minute per IP)
const widgetLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    limit: 100, 
    message: { message: 'Too many requests. Rates restricted.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// Middlewares
app.use((req, res, next) => {
    const isPublicWidget = req.path.startsWith('/api/testimonials/widget');
    // Allow both the POST request and its corresponding pre-flight OPTIONS request
    const isPublicSubmit = req.path === '/api/testimonials' && (req.method === 'POST' || req.method === 'OPTIONS');

    if (isPublicWidget) {
        return cors({ origin: '*' })(req, res, () => {
            // Skip rate limiting for OPTIONS pre-flight checks
            if (req.method === 'OPTIONS') return res.sendStatus(200);
            widgetLimiter(req, res, next);
        });
    }

    if (isPublicSubmit) {
        return cors({ origin: '*' })(req, res, () => {
            // Skip rate limiting for OPTIONS pre-flight checks
            if (req.method === 'OPTIONS') return res.sendStatus(200);
            submissionLimiter(req, res, next);
        });
    }

    // 🔒 Private Dashboard Actions remain locked to your React Frontend app
    return cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
    })(req, res, next);
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Base / Health-check Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Trust Echo API' });
});

// API Routes (To be linked as you build them)
app.use('/api/auth', authRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});