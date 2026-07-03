import express from 'express';
import { 
    createTestimonial, 
    getUserTestimonials, 
    getApprovedTestimonials, 
    toggleApproval, 
    deleteTestimonial 
} from '../controllers/testimonialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createTestimonial); // Clients submitting their feedback
router.get('/widget/:userId', getApprovedTestimonials); // For displaying cards on websites

// Protected dashboard routes
router.get('/', protect, getUserTestimonials); // Fetch logged-in user's testimonials
router.patch('/:id/approve', protect, toggleApproval); // Approve/unapprove toggle
router.delete('/:id', protect, deleteTestimonial); // Delete review permanently

export default router;