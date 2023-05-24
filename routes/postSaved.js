const express = require('express');
const { unsavePost, savePost } = require('../controllers/postSaved');
const { verify } = require('../utils/verify');

const router = express.Router();

router.post('/save', verify, savePost);
router.post('/unsave', verify, unsavePost);

module.exports = router;
