// const Conversation = require('../models/Conversation');
// const CompanyDoc = require('../models/CompanyDoc');
// const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening'];
// const Fuse = require('fuse.js');
// const FAQDoc = require('../models/FAQDoc');

// exports.sendMessage = async (req, res) => {
//   const { userId, message } = req.body;

//   if (!userId || !message) {
//     return res.status(400).json({ error: 'userId and message are required.' });
//   }

//   try {
//     let conversation = await Conversation.findOne({ userId });
//     if (!conversation) {
//       conversation = new Conversation({ userId, messages: [] });
//     }

//     conversation.messages.push({ sender: 'user', content: message });

//     const docs = await CompanyDoc.find({ userId });
//     let response = '';

//     if (greetings.includes(message.toLowerCase().trim())) {
//       response = 'Hi! How can I help you today?';
//     } else if (!docs || docs.length === 0) {
//       response = 'Hi! I am currently not trained with any company documents. Please check back later.';
//     } else {
//       const headingMatch = message.match(/inside (.+)$/i);
//       const requestedHeading = headingMatch ? headingMatch[1].trim().toLowerCase() : null;

//       for (const doc of docs) {
//         const lines = doc.content.split('\n');

//         if (requestedHeading) {
//           let found = false;
//           let collected = [];

//           for (let i = 0; i < lines.length; i++) {
//             const line = lines[i].trim();

//             if (!found && line.toLowerCase().includes(requestedHeading)) {
//               found = true;
//               continue;
//             }

//             if (found) {
//               if (line === '' || /^[A-Z][a-z]+.*:$/.test(line)) {
//                 break;
//               }
//               collected.push(line);
//             }
//           }

//           if (collected.length > 0) {
//             response = collected.join('\n');
//             break;
//           }
//         } else {
//           const faqDoc = await FAQDoc.findOne({ userId });
//           if (faqDoc && faqDoc.faqs && faqDoc.faqs.length > 0) {
//             const fuse = new Fuse(faqDoc.faqs, {
//               keys: ['question'],
//               threshold: 0.4,
//             });
//             const results = fuse.search(message);
//             if (results.length > 0) {
//               response = results[0].item.answer;
//               break;
//             }
//           }

//           if (!response) {
//             const paragraphs = doc.content.split('\n').filter(p => p.trim().length > 0);
//             for (const para of paragraphs) {
//               const userWords = message.toLowerCase().split(/\s+/);
//               const paraLower = para.toLowerCase();

//               const matched = userWords.some(word => paraLower.includes(word));
//               if (matched) {
//                 response = para;
//                 break;
//               }
//             }
//             if (response) break;
//           }
//         }
//       }

//       if (!response) {
//         response = 'Sorry, I could not find anything relevant in our company information.';
//       }
//     }

//     conversation.messages.push({ sender: 'bot', content: response || '...' });
//     await conversation.save();

//     res.json({ reply: response });
//   } catch (err) {
//     console.error('📛 Error in string matching fallback:', err);
//     res.status(500).json({ error: 'Offline FAQ response failed' });
//   }
// };

// exports.getChatHistory = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const conversation = await Conversation.findOne({ userId });

//     if (!conversation) {
//       return res.status(404).json({ error: 'No conversation found' });
//     }

//     res.json(conversation.messages);
//   } catch (err) {
//     console.error('💥 Error fetching chat history:', err);
//     res.status(500).json({ error: 'Failed to fetch chat history' });
//   }
// };

const Conversation = require('../models/Conversation');
const CompanyDoc = require('../models/CompanyDoc');
const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening'];
const Fuse = require('fuse.js');
const FAQDoc = require('../models/FAQDoc');

exports.sendMessage = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required.' });
  }

  try {
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = new Conversation({ userId, messages: [] });
    }

    conversation.messages.push({ sender: 'user', content: message });

    const docs = await CompanyDoc.find({ userId });
    let response = '';

    if (greetings.includes(message.toLowerCase().trim())) {
      response = 'Hi! How can I help you today?';
    } else if (!docs || docs.length === 0) {
      response = 'Hi! I am currently not trained with any company documents. Please check back later.';
    } else {
      // 🧠 Try FAQDoc fuzzy match first
      const faqDoc = await FAQDoc.findOne({ userId });
      if (faqDoc && faqDoc.faqs && faqDoc.faqs.length > 0) {
        const fuse = new Fuse(faqDoc.faqs, {
          keys: ['question'],
          threshold: 0.4,
        });
        const results = fuse.search(message);
        if (results.length > 0) {
          response = results[0].item.answer;
        }
      }

      // 🧠 STEP 1: Check if user asked for a specific section
      if (!response) {
        const headingMatch = message.match(/inside (.+)$/i);
        const requestedHeading = headingMatch ? headingMatch[1].trim().toLowerCase() : null;

        for (const doc of docs) {
          const lines = doc.content.split('\n');

          if (requestedHeading) {
            let found = false;
            let collected = [];

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!found && line.toLowerCase().includes(requestedHeading)) {
                found = true;
                continue;
              }
              if (found) {
                if (line === '' || /^[A-Z][a-z]+.*:$/.test(line)) {
                  break;
                }
                collected.push(line);
              }
            }

            if (collected.length > 0) {
              response = collected.join('\n');
              break;
            }
          }
        }
      }

      // 🔍 Keyword match fallback
      if (!response) {
        for (const doc of docs) {
          const paragraphs = doc.content.split('\n').filter(p => p.trim().length > 0);
          for (const para of paragraphs) {
            const userWords = message.toLowerCase().split(/\s+/);
            const paraLower = para.toLowerCase();
            const matched = userWords.some(word => paraLower.includes(word));
            if (matched) {
              response = para;
              break;
            }
          }
          if (response) break;
        }
      }

      if (!response) {
        response = 'Sorry, I could not find anything relevant in our company information.';
      }
    }

    conversation.messages.push({ sender: 'bot', content: response || '...' });
    await conversation.save();

    res.json({ reply: response });
  } catch (err) {
    console.error('📛 Error in string matching fallback:', err);
    res.status(500).json({ error: 'Offline FAQ response failed' });
  }
};

exports.getChatHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const conversation = await Conversation.findOne({ userId });

    if (!conversation) {
      return res.status(404).json({ error: 'No conversation found' });
    }

    res.json(conversation.messages);
  } catch (err) {
    console.error('💥 Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
