const express = require('express');
const { unsavePost, savePost } = require('../controllers/postSaved');

const router = express.Router();

router.post('/save', savePost);
router.post('/unsave', unsavePost);

module.exports = router;
