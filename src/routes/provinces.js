const express = require('express');
const router = express.Router();
const ProvinceController = require('../app/controllers/ProvinceController');
const verifyToken = require('../middleware/verifyToken');

router.use('/', ProvinceController.index);

module.exports = router;