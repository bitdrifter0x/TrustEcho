import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, companyName } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        // If DB isn't connected, return a mock successful registration
        if (User.db.readyState !== 1) {
            return res.status(201).json({
                success: true,
                message: "Mock Registration Successful (Database offline)",
                user: { _id: "mock_id_123", name, email, companyName },
                token: generateToken("mock_id_123")
            });
        }

        // Real Production Logic: Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            companyName
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
        next(error);
    }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (User.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                message: "Mock Login Successful (Database offline)",
                user: { _id: "mock_id_123", name: "Test Admin", email },
                token: generateToken("mock_id_123")
            });
        }

        // Real Production Logic: Find user
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    companyName: user.companyName,
                },
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};