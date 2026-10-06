import mongoose from 'mongoose';

// FIX 3 (max length): 254 characters is the standard maximum for a valid email address.
const MAX_EMAIL_LENGTH = 254;

// FIX 1 and 2 (email regex): the old pattern had two problems.
//  - It could freeze the server: crafted input made it take longer with every extra
//    character (catastrophic backtracking), and it ran on the public register route.
//  - It rejected real emails such as jane@company.info and jane+news@gmail.com.
// In this pattern the domain parts can't contain dots, so there is only one way to
// match them and the check stays fast even on hostile input.
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

// The length is checked BEFORE the regex, so the regex never runs on a huge value.
const isValidEmail = (value) =>
  typeof value === 'string' && value.length <= MAX_EMAIL_LENGTH && EMAIL_REGEX.test(value);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail,
        message: 'Please add a valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      // FIX 4 (misleading rule): `minlength: 6` was removed. This field stores the bcrypt HASH
      // (always 60 characters), so the rule never checked the real password. The real
      // password length is checked in authController.js before it is hashed.
    },
    companyName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);
export default User;