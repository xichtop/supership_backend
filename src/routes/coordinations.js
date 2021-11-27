const express = require('express');
const router = express.Router();
const CoordinationController = require('../app/controllers/CoordinationController');
const verifyToken = require('../middleware/verifyToken');

router.use('/addfastitem/', verifyToken, CoordinationController.addFastItem);

router.use('/addstandarditem/', verifyToken, CoordinationController.addStandardItem);

router.use('/updatefastitem/', verifyToken, CoordinationController.updateFastItem);

router.use('/updatestandarditem/', verifyToken, CoordinationController.updateStandardItem);

router.use('/getstandardship/:staffId/:status', verifyToken, CoordinationController.getStandardShip);

router.use('/getfastship/:staffId', verifyToken, CoordinationController.getFastShip);

router.use('/', CoordinationController.index);

module.exports = router;