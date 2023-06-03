const express = require('express');
const { verify } = require('../utils/verify');
const { follow, unfollow, searchFriend } = require('../controllers/follow');

const router = express.Router();

router.get('/:followed_id', verify, follow);
router.post('/search', verify, searchFriend);

module.exports = router;
