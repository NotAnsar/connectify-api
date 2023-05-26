const express = require('express');
const {
	getProfile,
	updateProfilePic,
	updateUser,
	deleteMe,
} = require('../controllers/users');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/profile/:userid', verify, getProfile);
router.patch('/', verify, updateUser);
router.delete('/', verify, deleteMe);
// router.update('/photo', verify, getProfile);

module.exports = router;
