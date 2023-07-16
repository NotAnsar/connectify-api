const express = require('express');

const { verify } = require('../utils/verify');
const {
	getNotification,
	setAllSeen,
	getUnseenNotificationCount,
} = require('../controllers/notification');

const router = express.Router();

module.exports = router;

router.get('/', verify, getNotification);
router.get('/count', verify, getUnseenNotificationCount);
router.patch('/', verify, setAllSeen);
