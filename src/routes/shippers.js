const express = require('express');
const router = express.Router();
const ShipperController = require('../app/controllers/ShipperController');
const verifyToken = require('../middleware/verifyToken');

router.use('/login', ShipperController.login);

// router.use('/check/:username', ShipperController.check);

// router.use('/additem', ShipperController.addItem);

router.use('/', ShipperController.index);

module.exports = router;