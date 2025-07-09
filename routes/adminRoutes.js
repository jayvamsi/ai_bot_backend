const express = require('express');
const router = express.Router();
const CompanyDoc = require('../models/CompanyDoc');
const Conversation = require('../models/Conversation');

router.delete('/wipe', async (req, res) => {
  try {
    await CompanyDoc.deleteMany({});
    await Conversation.deleteMany({});
    res.json({ message: '✅ All data wiped.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

module.exports = router;
