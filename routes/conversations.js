const express = require('express');
const {
	getMyConversations,
	newConversations,
} = require('../controllers/conversations');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/', verify, getMyConversations);
router.post('/', verify, newConversations);

module.exports = router;
