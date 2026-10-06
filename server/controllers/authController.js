import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// FIX 5 (wrong status codes): errors now carry their own HTTP status.
// The global error handler in server.js reads `err.statusCode`, so 400/401
// are returned correctly instead of always becoming 500.
const httpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Limits used in registerUser (FIX 8). Change the numbers here if you want different limits.
const MAX_NAME_LENGTH = 50;
const MAX_COMPANY_LENGTH = 100;

const generateToken = (id) => {
    // FIX 2 (fallback secret): removed `|| 'fallback_secret'`. If JWT_SECRET is
    // missing, we fail instead of signing tokens with a secret that is public on GitHub.
    // Checked here, not at the top of the file, because dotenv loads after imports run.
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        throw new Error('Server configuration error');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    try {
        // `?? {}` stops a crash when the request has no JSON body
        const { name, email, password, companyName } = req.body ?? {};

        if (!name || !email || !password) {
            throw httpError('Please fill in all required fields', 400);
        }

        // FIX 4 (NoSQL injection): only plain strings are accepted, so an object
        // like {"$ne": null} can never reach the database query.
        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            (companyName !== undefined && typeof companyName !== 'string')
        ) {
            throw httpError('Invalid input', 400);
        }

        // FIX 3 (password length): checked on the REAL password here, because the
        // schema's minlength only ever saw the 60-character hash.
        if (password.length < 6) {
            throw httpError('Password must be at least 6 characters', 400);
        }

        // FIX 7 (max password length): bcrypt silently ignores everything past 72 BYTES,
        // so longer passwords would be cut off. Reject them instead. Bytes, not characters,
        // because emoji and non-English letters take more than 1 byte each.
        if (Buffer.byteLength(password, 'utf8') > 72) {
            throw httpError('Password is too long (maximum 72 bytes)', 400);
        }

        // FIX 8 (name/company length): stops huge values being stored in the database
        if (name.trim().length > MAX_NAME_LENGTH) {
            throw httpError(`Name must be at most ${MAX_NAME_LENGTH} characters`, 400);
        }
        if (companyName !== undefined && companyName.trim().length > MAX_COMPANY_LENGTH) {
            throw httpError(`Company name must be at most ${MAX_COMPANY_LENGTH} characters`, 400);
        }

        // Normalize so "A@x.com" and "a@x.com" count as the same account
        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            throw httpError('User already exists', 400);
        }

        // Passing 10 directly replaces the separate genSalt step (same result)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            companyName,
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                companyName: user.companyName,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        // FIX 6 (duplicate-email race): if two requests register the same email at once,
        // MongoDB's unique index rejects the second with code 11000. Return a clean 400.
        if (error.code === 11000) {
            return next(httpError('User already exists', 400));
        }

        // FIX 6b (schema validation errors): if the schema rejects the data (bad email format,
        // empty name, etc.), Mongoose throws a ValidationError. That is the user's mistake,
        // so return a 400 with the first clear message instead of a 500.
        if (error.name === 'ValidationError') {
            const firstMessage = Object.values(error.errors)[0].message;
            return next(httpError(firstMessage, 400));
        }

        next(error);
    }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            throw httpError('Please provide email and password', 400);
        }

        // FIX 4 (NoSQL injection): strings only
        if (typeof email !== 'string' || typeof password !== 'string') {
            throw httpError('Invalid input', 400);
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(200).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    companyName: user.companyName,
                },
                token: generateToken(user._id),
            });
        }

        // Same message for "no such user" and "wrong password" so attackers can't tell which
        throw httpError('Invalid email or password', 401);
    } catch (error) {
        next(error);
    }
};