const express = require('express');
const {
	getProfile,
	updateProfilePic,
	updateUser,
} = require('../controllers/users');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/profile/:userid', verify, getProfile);
router.patch('/', verify, updateUser);
// router.update('/photo', verify, getProfile);

module.exports = router;
