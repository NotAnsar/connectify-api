const express = require('express');
const { verify } = require('../utils/verify');
const { follow, unfollow } = require('../controllers/follow');

const router = express.Router();

router.get('/:followed_id', verify, follow);
// router.get('/:followed_id/unfollow', verify, unfollow);

module.exports = router;
