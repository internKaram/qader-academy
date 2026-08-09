const express = require('express');
const {
  register,
  login,
  logout,
  resetPassword,
  confirmPasswordReset,
} = require('../controllers/auth-controller');
const { loginLimiter, resetPasswordLimiter } = require('../middlewares/rate-limit-middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

// Step 1 — request a password-reset email
router.post('/reset-password', resetPasswordLimiter, resetPassword);

// Step 2 — consume the reset token and set a new password
router.post('/confirm-reset', resetPasswordLimiter, confirmPasswordReset);

module.exports = router;
