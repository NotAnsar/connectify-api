const express = require('express');
const {
	getComments,
	addComments,
	deleteComments,
} = require('../controllers/comments');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/:postId', verify, getComments);
router.post('/', verify, addComments);
router.delete('/:id', verify, deleteComments);

module.exports = router;
