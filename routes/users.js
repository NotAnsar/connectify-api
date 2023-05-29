const express = require('express');
const {
	getProfile,
	updateUser,
	deleteMe,
	getMe,
	getSuggestedUsers,
	getFriends,
} = require('../controllers/users');
const { verify } = require('../utils/verify');
const { getPosts } = require('../controllers/posts');

const router = express.Router();

router.get('/profile/:userid', verify, getProfile);
router.get('/suggested', verify, getSuggestedUsers);
router.get('/friends', verify, getFriends);
router.get('/me', verify, getMe);
router.patch('/', verify, updateUser);
router.delete('/', verify, deleteMe);

module.exports = router;
