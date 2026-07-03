import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    // Ties the testimonial to a specific user/business dashboard
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
    },
    clientCompany: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'video'],
      default: 'text',
    },
    content: {
      type: String,
      required: [true, 'Testimonial content cannot be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating'],
      min: 1,
      max: 5,
    },
    clientAvatar: {
      type: String, // URL string for profile picture (optional)
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: false, // Dashboard user must approve it before it displays on their widget
    },
  },
  {
    timestamps: true,
  }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;