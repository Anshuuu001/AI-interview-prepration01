const express = require('express');
const router = express.Router();
const { askGemini } = require('../controllers/geminiController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
const isExplicitTestMode = !isProduction && process.env.NODE_ENV === 'test';

// Rate limiting: 60 AI generation requests per 15 minutes per IP/session
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isExplicitTestMode ? 1000 : 60,
  message: { error: 'AI request limit reached for this session. Please wait a few minutes before asking more questions.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route to handle AI requests (requires authenticated session)
router.post('/ask', authMiddleware, aiLimiter, askGemini);

module.exports = router;
