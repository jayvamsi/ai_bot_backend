const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // 'user' or 'bot'
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = messageSchema;
