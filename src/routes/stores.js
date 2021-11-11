const express = require('express');
const router = express.Router();
const storeController = require('../app/controllers/StoreController');
const verifyToken = require('../middleware/verifyToken');

router.use('/login', storeController.login);

router.use('/check/:username', storeController.check);

router.use('/additem', storeController.addItem);

router.use('/', storeController.index);

module.exports = router;