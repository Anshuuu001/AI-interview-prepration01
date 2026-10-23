const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  googleLogin, 
  suspendAccount, 
  verifyDeviceCode, 
  unlockAccount, 
  getUsersList, 
  toggleUserRole,
  extendSuspension,
  banUser,
  updateProfile
} = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const rateLimit = require('express-rate-limit');

// Rate limiting for sensitive authentication endpoints
// Security Policy:
// - Production limits must remain strict (30 requests per 15 minutes) under all circumstances.
// - Client headers, queries, or payloads cannot weaken or bypass this limit.
// - NODE_ENV=test is strictly prohibited from relaxing limits if production environment is detected.
const isProduction = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
const isExplicitTestMode = !isProduction && process.env.NODE_ENV === 'test';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isExplicitTestMode ? 1000 : 30,
  message: { error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/verify-device', authLimiter, verifyDeviceCode);
router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleLogin);
router.post('/suspend', authMiddleware, suspendAccount);

// Protected Admin Routes
router.post('/unlock', authMiddleware, adminMiddleware, unlockAccount);
router.get('/users', authMiddleware, adminMiddleware, getUsersList);
router.post('/toggle-role', authMiddleware, adminMiddleware, toggleUserRole);
router.post('/extend-suspension', authMiddleware, adminMiddleware, extendSuspension);
router.post('/ban', authMiddleware, adminMiddleware, banUser);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
