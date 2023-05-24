const express = require('express');
const { verify } = require('../utils/verify');
const { follow, unfollow } = require('../controllers/follow');

const router = express.Router();

router.post('/follow', verify, follow);
router.post('/unfollow', verify, unfollow);
module.exports = router;
