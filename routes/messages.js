const express = require('express');
const {
	getConversationMessages,
	sendMessage,
} = require('../controllers/messages');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/:conversation_id', verify, getConversationMessages);
router.post('/send', verify, sendMessage);

module.exports = router;
