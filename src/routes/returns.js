const express = require('express');
const router = express.Router();
const ReturnController = require('../app/controllers/ReturnController');
const verifyToken = require('../middleware/verifyToken');

router.use('/confirm', verifyToken, ReturnController.confirmNotRecieve);

router.use('/returned', verifyToken, ReturnController.confirmReturned);

module.exports = router;