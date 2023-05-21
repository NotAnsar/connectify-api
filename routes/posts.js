const express = require('express');
const {
	getPosts,
	getMyPosts,
	getFeedPost,
	getSavedPost,
} = require('../controllers/posts');

const router = express.Router();

router.get('/', getPosts);
router.get('/me', getMyPosts);
router.get('/feed', getFeedPost);
router.get('/saved', getSavedPost);

module.exports = router;
