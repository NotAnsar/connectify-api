const express = require('express');
const { getComments, addComments } = require('../controllers/comments');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/:postId', verify, getComments);
router.post('/', verify, addComments);

module.exports = router;
