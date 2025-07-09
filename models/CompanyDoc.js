const mongoose = require('mongoose');

const companyDocSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: String,
  content: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CompanyDoc', companyDocSchema);
