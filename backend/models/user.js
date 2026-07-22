const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'instructor', // FOR TESTING ONLY otherwise default = student
  },
  avatar: {
    type: String,
  }
}, {
  timestamps: true // This automatically adds and manages createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
