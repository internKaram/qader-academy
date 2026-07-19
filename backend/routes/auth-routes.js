const express = require('express');
const { register, login, logout, resetPassword } = require('../controllers/auth-controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', resetPassword);

module.exports = router;
