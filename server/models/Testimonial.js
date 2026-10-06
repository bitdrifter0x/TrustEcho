import mongoose from 'mongoose';

// Helper validator to ensure a URL string starts with http/https if provided
const isValidUrl = (value) => {
    if (!value) return true; // Optional field, empty is allowed
    return typeof value === 'string' && /^https?:\/\/.+/.test(value);
};

const testimonialSchema = new mongoose.Schema(
    {
        // FIX: Indexed userId for rapid dashboard lookups and widget filtering at scale
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clientName: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true,
            maxlength: [50, 'Client name cannot exceed 50 characters'],
        },
        clientEmail: {
            type: String,
            required: [true, 'Client email is required'],
            trim: true,
            lowercase: true,
            maxlength: [254, 'Email cannot exceed 254 characters'],
        },
        clientCompany: {
            type: String,
            trim: true,
            maxlength: [100, 'Company name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            enum: ['text', 'video'],
            default: 'text',
        },
        content: {
            type: String,
            required: [true, 'Testimonial content cannot be empty'],
            trim: true,
            // FIX: Enforce database-level maximum length matching the controller limit
            maxlength: [1000, 'Testimonial content cannot exceed 1000 characters'],
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a star rating'],
            min: 1,
            max: 5,
        },
        clientAvatar: {
            type: String,
            default: '',
            // FIX: Ensure avatar cannot contain arbitrary text/scripts (XSS protection)
            validate: {
                validator: isValidUrl,
                message: 'Client avatar must be a valid http or https URL',
            },
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;