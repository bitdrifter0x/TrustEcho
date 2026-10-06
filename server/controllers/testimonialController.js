import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';

// Errors carry their own HTTP status. The global error handler in server.js reads
// `err.statusCode`, so 400/404 are returned correctly instead of always becoming 500.
const httpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// FIX 3 (validation): limits for public input. Change the numbers here if needed.
const MAX_NAME_LENGTH = 50;
const MAX_EMAIL_LENGTH = 100;
const MAX_COMPANY_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;

// FIX 3: strict check for a 24-character hex MongoDB id. A bad id now gives a clean
// 400/404 instead of a 500 CastError.
const isValidId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc    Submit a new testimonial (Public Route)
// @route   POST /api/testimonials
export const createTestimonial = async (req, res, next) => {
    try {
        // FIX 4 (public callers set type/clientAvatar): only the fields the public form
        // really sends are read. `type` and `clientAvatar` are ignored, so the schema defaults apply.
        const { userId, clientName, clientEmail, clientCompany, content, rating } = req.body ?? {};

        if (!userId || !clientName || !clientEmail || !content || !rating) {
            throw httpError('Please fill in all required fields', 400);
        }

        // FIX 3: type and format checks (also blocks NoSQL injection through objects)
        if (
            !isValidId(userId) ||
            typeof clientName !== 'string' ||
            typeof clientEmail !== 'string' ||
            typeof content !== 'string' ||
            (clientCompany !== undefined && typeof clientCompany !== 'string')
        ) {
            throw httpError('Invalid input', 400);
        }

        // FIX 7 (whitespace-only input): a value made only of spaces counts as empty
        if (!clientName.trim() || !clientEmail.trim() || !content.trim()) {
            throw httpError('Please fill in all required fields', 400);
        }

        // FIX 3: rating must be a whole number from 1 to 5
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw httpError('Rating must be a whole number from 1 to 5', 400);
        }

        if (!isValidEmail(clientEmail.trim())) {
            throw httpError('Please provide a valid email address', 400);
        }

        // FIX 3: length limits
        if (
            clientName.trim().length > MAX_NAME_LENGTH ||
            clientEmail.trim().length > MAX_EMAIL_LENGTH ||
            content.trim().length > MAX_CONTENT_LENGTH ||
            (clientCompany !== undefined && clientCompany.trim().length > MAX_COMPANY_LENGTH)
        ) {
            throw httpError('One or more fields are too long', 400);
        }

        // FIX 3: the business must really exist, so random ids can't fill the database
        // with orphan testimonials.
        const ownerExists = await User.exists({ _id: userId });
        if (!ownerExists) {
            throw httpError('This collection link is not valid', 404);
        }

        await Testimonial.create({
            userId,
            clientName,
            clientEmail,
            clientCompany,
            content,
            rating,
        });

        // The public caller only needs to know it worked, so the saved document
        // (which includes ids and email) is no longer sent back.
        res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully',
        });
    } catch (error) {
        // FIX 8 (schema validation errors): if the schema still rejects the data, Mongoose
        // throws a ValidationError. That is the submitter's mistake, so return a 400 with
        // the first clear message instead of a 500.
        if (error.name === 'ValidationError') {
            const firstMessage = Object.values(error.errors)[0].message;
            return next(httpError(firstMessage, 400));
        }
        next(error);
    }
};

// @desc    Get all testimonials for the logged-in user's dashboard (Protected)
// @route   GET /api/testimonials
export const getUserTestimonials = async (req, res, next) => {
    try {
        // Only testimonials belonging to the logged-in user
        const testimonials = await Testimonial.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            data: testimonials,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get ONLY approved testimonials for the embeddable public widget (Public Route)
// @route   GET /api/testimonials/widget/:userId
export const getApprovedTestimonials = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // FIX 3: bad id gives a clean 400 instead of a 500 CastError
        if (!isValidId(userId)) {
            throw httpError('Invalid user id', 400);
        }

        // FIX 2 (privacy leak): only the fields the widget displays are returned.
        // clientEmail, userId, clientAvatar, type and isApproved are no longer sent to the public.
        const testimonials = await Testimonial.find({ userId, isApproved: true })
            .select('clientName clientCompany content rating createdAt')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: testimonials,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/unapprove a testimonial (Protected)
// @route   PATCH /api/testimonials/:id/approve
export const toggleApproval = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            throw httpError('Testimonial not found', 404);
        }

        // FIX 6 (find-then-modify): ONE query that matches the id AND the owner, and flips
        // isApproved inside the database. `updatePipeline: true` is required by Mongoose 9
        // for this kind of update.
        const testimonial = await Testimonial.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            [{ $set: { isApproved: { $not: '$isApproved' } } }],
            { new: true, updatePipeline: true }
        );

        // FIX 5 (wrong status): "not found" and "not yours" return the same 404, so the
        // response doesn't reveal whether someone else's testimonial exists.
        if (!testimonial) {
            throw httpError('Testimonial not found', 404);
        }

        res.status(200).json({
            success: true,
            data: testimonial,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a testimonial (Protected)
// @route   DELETE /api/testimonials/:id
export const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            throw httpError('Testimonial not found', 404);
        }

        // FIX 6: one query that matches the id AND the owner, then deletes
        const testimonial = await Testimonial.findOneAndDelete({ _id: id, userId: req.user._id });

        // FIX 5: same 404 for "not found" and "not yours"
        if (!testimonial) {
            throw httpError('Testimonial not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Testimonial removed successfully',
        });
    } catch (error) {
        next(error);
    }
};