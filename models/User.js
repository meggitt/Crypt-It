// Importing the mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Defining the schema for the User model
const userSchema = new mongoose.Schema({
  // First name of the user
  firstName: {
    type: String,
    required: true
  },
  // Last name of the user
  lastName: {
    type: String,
    required: true
  },
  // Email address of the user, must be unique
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Hashed password of the user
  password: {
    type: String,
    required: true
  },
  // Session ID for the user's current session, if any
  sessionId: {
    type: String,
    default: null
  },
  // IP address of the user's last login
  ipAddress: {
    type: String,
    default: null
  },
  // OTP for password reset, if any
  resetOtp: {
    type: String,
    default: null
  },
  // Expiry date and time for the OTP
  otpExpires: {
    type: Date,
    default: null
  }
});

// Creating the User model from the schema
const User = mongoose.model('User', userSchema);

// Exporting the User model for use in other parts of the application
module.exports = User;
