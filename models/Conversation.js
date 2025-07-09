const mongoose = require('mongoose');
const messageSchema = require('./Message');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be session ID or dummy user for now
    required: true,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
