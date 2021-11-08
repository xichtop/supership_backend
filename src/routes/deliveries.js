const express = require('express');
const router = express.Router();
const DeliveryController = require('../app/controllers/DeliveryController');
const verifyToken = require('../middleware/verifyToken');

router.use('/add', verifyToken, DeliveryController.addItem);

router.use('/getbystore/:storeId/:status', verifyToken, DeliveryController.getByStoreandStatus);

router.use('/getbystore/:storeId', DeliveryController.getByStore);

router.use('/getbyid/:deliveryId', verifyToken, DeliveryController.getById);

router.use('/update', verifyToken, DeliveryController.updateStatus);

router.use('/statistic', verifyToken, DeliveryController.statistic);

router.use('/', DeliveryController.index);

module.exports = router;