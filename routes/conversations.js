const express = require('express');
const { getMyConversations } = require('../controllers/conversations');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/', verify, getMyConversations);

module.exports = router;
