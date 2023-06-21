const express = require('express');
const {
	getMyConversations,
	newConversations,
	deleteConversation,
} = require('../controllers/conversations');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/', verify, getMyConversations);
router.post('/', verify, newConversations);
router.delete('/:id', verify, deleteConversation);

module.exports = router;
