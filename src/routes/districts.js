const express = require('express');
const router = express.Router();
const DistrictController = require('../app/controllers/DistrictController');
const verifyToken = require('../middleware/verifyToken');

router.use('/getByProvince/:provinceid', DistrictController.getByProvince);

router.use('/', DistrictController.index);

module.exports = router;