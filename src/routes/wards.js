const express = require('express');
const router = express.Router();
const WardController = require('../app/controllers/WardController');
const verifyToken = require('../middleware/verifyToken');

router.use('/getByDistrict/:districtid', WardController.getByDistrict);

router.use('/', WardController.index);

module.exports = router;