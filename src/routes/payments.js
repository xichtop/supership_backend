const express = require('express');
const router = express.Router();
const PaymentController = require('../app/controllers/PaymentController');
const verifyToken = require('../middleware/verifyToken');

router.use('/statistic', verifyToken, PaymentController.statistic);

router.use('/paycodshipper', verifyToken, PaymentController.PayCODShipper);

router.use('/paycodmanager', verifyToken, PaymentController.PayCODManager);

router.use('/paycodmanagerbydelivery', verifyToken, PaymentController.PayCODManagerByDeliver);

router.use('/getallcod', verifyToken, PaymentController.getAllCOD);

router.use('/getfastshipper', verifyToken, PaymentController.getShipperPaymentFastList);

router.use('/getstandardshipper', verifyToken, PaymentController.getShipperPaymentStandardList);

router.use('/', PaymentController.index);

module.exports = router;