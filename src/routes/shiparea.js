const express = require('express');
const router = express.Router();
const ShipAreaController = require('../app/controllers/ShipAreaController');
const verifyToken = require('../middleware/verifyToken');

router.use('/getbystaff/:staffId', verifyToken, ShipAreaController.getByStaff);

router.use('/removeitem/', verifyToken, ShipAreaController.removeItem);

router.use('/additem/', verifyToken, ShipAreaController.addItem);

router.use('/', ShipAreaController.index);

module.exports = router;