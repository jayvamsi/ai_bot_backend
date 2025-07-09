const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');

// POST: send user message → get LLM response
router.post('/send', sendMessage);

// GET: fetch past messages
router.get('/history/:userId', getChatHistory);

router.get('/faq/:userId', async (req, res) => {
  const { userId } = req.params;
  const faq = await require('../models/FAQDoc').findOne({ userId });
  res.json(faq);
});


module.exports = router;
