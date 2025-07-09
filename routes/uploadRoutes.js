// const express = require('express');
// const multer = require('multer');
// const router = express.Router();
// const { handleUpload } = require('../controllers/uploadController');

// console.log("✅ uploadRoutes.js loaded"); // ✅ Log that the file loads

// // Setup Multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("📁 Storing to /uploads"); // ✅ Log destination hit
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     console.log("📝 Saving file:", file.originalname); // ✅ Log filename
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage });

// router.post('/', upload.single('file'), (req, res, next) => {
//   console.log("📥 File received in route"); // ✅ Route accessed
//   next();
// }, handleUpload);

// module.exports = router;


const express = require('express');
const multer = require('multer');
const router = express.Router();
const { handleUpload } = require('../controllers/uploadController');
const CompanyDoc = require('../models/CompanyDoc');

console.log("✅ uploadRoutes.js loaded");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 Storing to /uploads");
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log("📝 Saving file:", file.originalname);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// 📥 Route: Upload File (PDF/TXT)
router.post('/', upload.single('file'), (req, res, next) => {
  console.log("📥 File received in route");
  next();
}, handleUpload);

// 🔍 Route: Check if user has uploaded any documents
router.get('/user/:userId', async (req, res) => {
  try {
    const count = await CompanyDoc.countDocuments({ userId: req.params.userId });
    res.json({ hasDocs: count > 0 });
  } catch (err) {
    console.error('❌ Doc check error:', err);
    res.status(500).json({ error: 'Could not check user documents' });
  }
});

module.exports = router;
