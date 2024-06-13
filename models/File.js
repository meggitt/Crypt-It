const mongoose = require('mongoose');

// Define the schema for the file model
const fileSchema = new mongoose.Schema({
  // Reference to the user who uploaded the file
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Name of the file
  fileName: {
    type: String,
    required: true
  },
  // Encrypted content of the file
  content: {
    type: String,
    required: true
  },
  // Initialization vector used for encryption
  iv: {
    type: String,
    required: true
  },
  // List of email addresses with whom the file is shared
  sharedWithEmails: [{
    type: String
  }],
  // Timestamp when the file was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model from the schema
const File = mongoose.model('File', fileSchema);

// Export the model for use in other parts of the application
module.exports = File;
