const express = require('express');
const {
	login,
	register,
	logout,
	changePassword,
} = require('../controllers/auth');
const { verify } = require('../utils/verify');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/changePassword', verify, changePassword);

module.exports = router;
