import Testimonial from '../models/Testimonial.js';

// @desc    Submit a new testimonial (Public Route)
// @route   POST /api/testimonials
export const createTestimonial = async (req, res, next) => {
    try {
        const { userId, clientName, clientEmail, clientCompany, type, content, rating, clientAvatar } = req.body;

        if (!userId || !clientName || !clientEmail || !content || !rating) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (Testimonial.db.readyState !== 1) {
            return res.status(201).json({
                success: true,
                message: 'Mock Testimonial Submitted (Database offline)',
                testimonial: { _id: "mock_test_123", userId, clientName, content, rating, isApproved: false }
            });
        }

        // Real Production Logic
        const testimonial = await Testimonial.create({
            userId,
            clientName,
            clientEmail,
            clientCompany,
            type,
            content,
            rating,
            clientAvatar
        });

        res.status(201).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all testimonials for a specific user dashboard (Protected)
// @route   GET /api/testimonials
export const getUserTestimonials = async (req, res, next) => {
    try {
        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (Testimonial.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                message: 'Mock Data Returned (Database offline)',
                data: [
                    { _id: "1", clientName: "Alice Smith", content: "Amazing platform!", rating: 5, isApproved: true },
                    { _id: "2", clientName: "Bob Jones", content: "Good service, but needs work.", rating: 3, isApproved: false }
                ]
            });
        }

        // Real Production Logic: Get testimonials belonging ONLY to the logged-in user
        const testimonials = await Testimonial.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            data: testimonials
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

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (Testimonial.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                data: [{ _id: "1", clientName: "Alice Smith", content: "Amazing platform!", rating: 5, isApproved: true }]
            });
        }

        // Real Production Logic: Pull only approved testimonials for the widget embedding
        const testimonials = await Testimonial.find({ userId, isApproved: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject or Toggle approval status of a testimonial (Protected)
// @route   PATCH /api/testimonials/:id/approve
export const toggleApproval = async (req, res, next) => {
    try {
        const { id } = req.params;

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (Testimonial.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                message: `Mock Status Toggled for ID: ${id} (Database offline)`
            });
        }

        // Real Production Logic
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        // Security Check: Verify this testimonial belongs to the requesting user
        if (testimonial.userId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to modify this testimonial');
        }

        // Toggle status
        testimonial.isApproved = !testimonial.isApproved;
        await testimonial.save();

        res.status(200).json({
            success: true,
            data: testimonial
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

        // ⚠️ DATABASE TEMPORARY BYPASS LOGIC
        if (Testimonial.db.readyState !== 1) {
            return res.status(200).json({
                success: true,
                message: `Mock Testimonial ${id} Deleted (Database offline)`
            });
        }

        // Real Production Logic
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        // Security Check
        if (testimonial.userId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this testimonial');
        }

        await testimonial.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Testimonial removed successfully'
        });
    } catch (error) {
        next(error);
    }
};