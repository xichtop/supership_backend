const express = require('express');
const router = express.Router();
const ShipAreaController = require('../app/controllers/ShipAreaController');
const verifyToken = require('../middleware/verifyToken');

router.use('/getbystaff/:staffId', verifyToken, ShipAreaController.getByStaff);

router.use('/', ShipAreaController.index);

module.exports = router;