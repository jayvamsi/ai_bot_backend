const mongoose = require('mongoose');

const faqDocSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  faqs: [
    {
      question: String,
      answer: String,
    },
  ],
});

module.exports = mongoose.model('FAQDoc', faqDocSchema);