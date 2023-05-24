const express = require('express');
const { verify } = require('../utils/verify');
const { uploadFile, upload } = require('../controllers/upload');

const router = express.Router();

router.post('/', verify, upload.single('file'), uploadFile);

module.exports = router;
