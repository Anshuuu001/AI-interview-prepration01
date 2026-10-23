const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/sandboxController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
const isExplicitTestMode = !isProduction && process.env.NODE_ENV === 'test';

// Rate limiting: 30 compilation/execution requests per 15 minutes per IP/session
const sandboxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isExplicitTestMode ? 1000 : 30,
  message: { error: 'Execution rate limit exceeded. Please wait a few minutes before running more code.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route to execute user code in isolated sandbox (requires authenticated session)
router.post('/run', authMiddleware, sandboxLimiter, runCode);

module.exports = router;
