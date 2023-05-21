const express = require('express');
const { likePost, dislikePost } = require('../controllers/likes');

const router = express.Router();

router.post('/like', likePost);
router.post('/dislike', dislikePost);

module.exports = router;
