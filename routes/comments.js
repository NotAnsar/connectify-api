const express = require('express');
const { getComments, addComments } = require('../controllers/comments');

const router = express.Router();

router.get('/:postId', getComments);
router.post('/', addComments);

module.exports = router;
