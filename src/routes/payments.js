const express = require('express');
const router = express.Router();
const PaymentController = require('../app/controllers/PaymentController');
const verifyToken = require('../middleware/verifyToken');

router.use('/statistic', verifyToken, PaymentController.statistic);

router.use('/', PaymentController.index);

module.exports = router;