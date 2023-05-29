const express = require('express');
const { verify } = require('../utils/verify');
const {
	getPosts,
	getFeedPost,
	getSavedPost,
	getPostsByUser,
	addPost,
	deletePost,
	updatePost,
} = require('../controllers/posts');

const router = express.Router();

router.get('/', verify, getPosts);
router.post('/', verify, addPost);
router.delete('/:id', verify, deletePost);
router.patch('/:id', verify, updatePost);

router.get('/feed', verify, getFeedPost);
router.get('/saved', verify, getSavedPost);
router.get('/:user_id', verify, getPostsByUser);

module.exports = router;
