const express = require('express');
const router = express.Router();
const FeeShipController = require('../app/controllers/FeeShipController');
const verifyToken = require('../middleware/verifyToken');

router.use('/getall', verifyToken, FeeShipController.getAll);

router.use('/getallbystore/:storeId', verifyToken, FeeShipController.getAllByStore);

router.use('/payfeemanager', verifyToken, FeeShipController.PayFeeManager);

router.use('/payfeestore', verifyToken, FeeShipController.PayFeeStore);

router.use('/payfeemanagerbydelivery', verifyToken, FeeShipController.PayFeeManagerByDeliver);

module.exports = router;