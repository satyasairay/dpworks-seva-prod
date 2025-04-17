const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  name: String,
  pin: String,
  village: String,
  birthday: String, // Format: DD-MM-YYYY
  zodiac: String,   // both Odia + English
  role: String,     // Field Worker, JK, ADJ, etc.
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false // Change to true if you want to force it later
  },
  onboardingStatus: { type: String, default: 'started' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema, 'users');
