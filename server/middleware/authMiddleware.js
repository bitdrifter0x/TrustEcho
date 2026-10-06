import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// FIX 4 (wrong status codes): errors carry their own HTTP status. The global error
// handler in server.js reads `err.statusCode`, so a bad token now returns 401, not 500.
const httpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Require an "Authorization: Bearer <token>" header.
    // The space after "Bearer" is intentional, so "BearerXYZ" is not accepted.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(httpError('Not authorized, no token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    // FIX 2 (fallback secret): removed `|| 'fallback_secret'`. If JWT_SECRET is missing,
    // refuse every request instead of checking tokens against a secret that is public on GitHub.
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return next(httpError('Server configuration error', 500));
    }

    // Only the token check is inside try/catch, so a database problem later on is not
    // wrongly reported as "token failed".
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return next(httpError('Not authorized, token failed', 401));
    }

    // FIX 1 (mock-user bypass): removed. The user is always loaded from the real database.
    const user = await User.findById(decoded.id).select('-password');

    // FIX 3 (deleted user): a valid token for a user who no longer exists gets a clean 401,
    // instead of letting req.user be null and crashing the controllers later.
    if (!user) {
        return next(httpError('Not authorized, user no longer exists', 401));
    }

    req.user = user;
    next();
};