const express = require('express');
const { getProfile } = require('../controllers/users');
const { verify } = require('../utils/verify');

const router = express.Router();

router.get('/profile/:userid', verify, getProfile);

module.exports = router;
