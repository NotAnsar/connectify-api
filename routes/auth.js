const express = require('express');
const {
	login,
	register,
	logout,
	changePassword,
	sendOTP,
	resetPassword,
} = require('../controllers/auth');
const { verify } = require('../utils/verify');

const router = express.Router();

router.post('/login', login);
router.post('/sendOTP', sendOTP);
router.post('/resetPassword', resetPassword);
router.post('/register', register);
router.post('/logout', logout);
router.post('/changePassword', verify, changePassword);
// router.post('/verify', verifyEmail);

module.exports = router;
