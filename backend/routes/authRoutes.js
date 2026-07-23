const express = require('express');
const { register, login, logout, resetPassword } = require('../controllers/auth-controller');
const { loginLimiter, resetPasswordLimiter } = require('../middlewares/rate-limit-middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

module.exports = router;
