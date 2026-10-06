import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';

// Load environment variables
dotenv.config();

// FIX 6 (missing environment variables): stop at startup with a clear message instead of
// starting normally and then failing on every login or database call.
const requiredEnv = ['JWT_SECRET', 'MONGO_URI'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Initialize Express app
const app = express();

// Connect to MongoDB Database
connectDB();

// FIX 2 (trust proxy): behind Render's proxy every request would look like it comes from
// the proxy's IP, so all visitors would share ONE rate limit. This tells Express how many
// proxy hops to trust when finding the real visitor IP. Default is 1. If the limits still
// look shared after deploying, set TRUST_PROXY=2 or 3 in Render's environment variables.
app.set('trust proxy', Number.parseInt(process.env.TRUST_PROXY, 10) || 1);

// FIX 4 (helmet): adds standard security headers and hides that the server uses Express.
// crossOriginResourcePolicy is set to 'cross-origin' because the widget API is meant to be
// called from other people's websites, and helmet's default would block that.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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

// 3. FIX 3 (login/register brute force): max 10 attempts per 15 minutes per IP.
// Change the two numbers here if you want a different limit.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    limit: 10,
    message: { message: 'Too many login or registration attempts. Please try again in 15 minutes.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// CORS: created once instead of on every request
const publicCors = cors({ origin: '*' });

// FIX 5 (credentials): `credentials: true` is removed. The dashboard sends its token in the
// Authorization header, not in cookies, so this extra permission was never needed.
// Trailing slashes are stripped so CLIENT_URL works with or without one.
const dashboardCors = cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
});

// Middlewares
app.use((req, res, next) => {
    const isPublicWidget = req.path.startsWith('/api/testimonials/widget');
    // Allow both the POST request and its corresponding pre-flight OPTIONS request
    const isPublicSubmit = req.path === '/api/testimonials' && (req.method === 'POST' || req.method === 'OPTIONS');

    // The cors middleware answers OPTIONS pre-flight checks itself, so only real
    // requests ever reach the rate limiters below.
    if (isPublicWidget) {
        return publicCors(req, res, () => widgetLimiter(req, res, next));
    }

    if (isPublicSubmit) {
        return publicCors(req, res, () => submissionLimiter(req, res, next));
    }

    // 🔒 Private Dashboard Actions remain locked to your React Frontend app
    return dashboardCors(req, res, next);
});

// Placed after CORS so the "too many attempts" reply can still be read by the browser
app.use('/api/auth', authLimiter);

// FIX 7 (unused form parser): `express.urlencoded({ extended: true })` is removed. The frontend
// only sends JSON, and that parser could turn form-style input like email[$ne]=x into an object.
app.use(express.json());

// Base / Health-check Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Trust Echo API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/testimonials', testimonialRoutes);

// FIX 8 (route not found): unknown URLs get a JSON 404 through the error handler below,
// instead of Express's default HTML page.
app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.statusCode = 404;
    next(error);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    // Our controllers and middleware set err.statusCode (400, 401, 404...), so those
    // are sent as they are. Anything without a status is an unexpected crash (500).
    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // FIX 1 (leaking error details): real crashes are logged on the server, and visitors
    // only see a generic message, so database details never reach the browser.
    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode < 500 || isDevelopment ? err.message : 'Internal Server Error',
        stack: isDevelopment ? err.stack : undefined,
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
