const express = require('express');
const {
	likePost,
	dislikePost,
	getLikesByPost,
} = require('../controllers/likes');
const { verify } = require('../utils/verify');

const router = express.Router();

router.post('/like', verify, likePost);
router.post('/dislike', verify, dislikePost);
router.get('/:post_id', verify, getLikesByPost);

module.exports = router;
