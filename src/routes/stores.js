const express = require('express');
const router = express.Router();
const storeController = require('../app/controllers/StoreController');
const verifyToken = require('../middleware/verifyToken');

router.use('/login', storeController.login);

router.use('/', storeController.index);

module.exports = router;