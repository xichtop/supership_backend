const express = require('express');
const router = express.Router();
const DeliveryController = require('../app/controllers/DeliveryController');
const verifyToken = require('../middleware/verifyToken');

// store 

router.use('/add', DeliveryController.addItem);

router.use('/getbystore/:storeId/:status', verifyToken, DeliveryController.getByStoreandStatus);

router.use('/getbystore/:storeId', DeliveryController.getByStore);

router.use('/getbyid/:deliveryId', verifyToken, DeliveryController.getById);

router.use('/checkbyidcancel/:deliveryId', verifyToken, DeliveryController.checkByIdStoreCancel);

router.use('/getbyidshipper/:deliveryId', verifyToken, DeliveryController.getByIdShipper);

router.use('/update', verifyToken, DeliveryController.updateStatus);

router.use('/statistic', verifyToken, DeliveryController.statistic);

// shipper 
router.use('/getfastship/:staffId', verifyToken, DeliveryController.getFastShip);

router.use('/getstandardshiporder/:staffId', verifyToken, DeliveryController.getStandardShipOrder);

router.use('/getstandardshipdeliver/:staffId', verifyToken, DeliveryController.getStandardShipDeliver);

router.use('/getstandardshipback/:staffId', verifyToken, DeliveryController.getStandardShipBack);

router.use('/', verifyToken, DeliveryController.index);



module.exports = router;