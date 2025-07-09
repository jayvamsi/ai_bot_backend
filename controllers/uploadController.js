// const fs = require('fs');
// const path = require('path');
// const pdfParse = require('pdf-parse');
// const CompanyDoc = require('../models/CompanyDoc');

// exports.handleUpload = async (req, res) => {
//   console.log("🚀 handleUpload triggered");
//   console.log("📦 File info:", req.file);
//   console.log("👤 User ID:", req.body.userId);

//   try {
//     const userId = req.body.userId;
//     if (!userId) {
//       return res.status(400).json({ error: 'userId is required' });
//     }

//     const filePath = req.file.path;
//     const ext = path.extname(filePath).toLowerCase();

//     let extractedText = '';

//     if (ext === '.pdf') {
//       const dataBuffer = fs.readFileSync(filePath);
//       const pdfData = await pdfParse(dataBuffer);
//       extractedText = pdfData.text;
//     } else if (ext === '.txt') {
//       extractedText = fs.readFileSync(filePath, 'utf8');
//     } else {
//       return res.status(400).json({ error: 'Unsupported file type' });
//     }

//     // Save parsed content with associated userId
//     await CompanyDoc.create({
//       userId, // 👈 associate document with this user
//       filename: req.file.originalname,
//       content: extractedText,
//     });

//     res.status(200).json({ message: 'File uploaded and processed successfully' });
//   } catch (err) {
//     console.error('❌ Upload error:', err);
//     res.status(500).json({ error: 'File processing failed' });
//   }
// };

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const CompanyDoc = require('../models/CompanyDoc');
const FAQDoc = require('../models/FAQDoc'); // ✅ New model

// Helper to extract Q&A pairs
function extractFAQs(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const faqs = [];

  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].toLowerCase().startsWith('q:') && lines[i + 1].toLowerCase().startsWith('a:')) {
      const question = lines[i].replace(/^q:\s*/i, '').trim();
      const answer = lines[i + 1].replace(/^a:\s*/i, '').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
      i++; // skip answer line
    }
  }

  return faqs;
}


exports.handleUpload = async (req, res) => {
  console.log("🚀 handleUpload triggered");
  console.log("📦 File info:", req.file);
  console.log("👤 User ID:", req.body.userId);

  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();

    let extractedText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Save parsed content with associated userId
    await CompanyDoc.create({
      userId, // 👈 associate document with this user
      filename: req.file.originalname,
      content: extractedText,
    });

    // ✅ Save extracted Q&A pairs
    const faqPairs = extractFAQs(extractedText);
    if (faqPairs.length > 0) {
      await FAQDoc.findOneAndUpdate(
        { userId },
        { $set: { faqs: faqPairs } },
        { upsert: true }
      );
    }

    res.status(200).json({ message: 'File uploaded and processed successfully' });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'File processing failed' });
  }
};