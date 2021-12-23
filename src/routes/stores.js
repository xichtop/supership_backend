const express = require('express');
const router = express.Router();
const storeController = require('../app/controllers/StoreController');
const verifyToken = require('../middleware/verifyToken');

router.use('/login', storeController.login);

router.use('/check/:username', storeController.check);

router.use('/additem', storeController.addItem);

router.use('/updatestatus', verifyToken, storeController.updateStatus);

// Sizes and weights
router.use('/getsizes', verifyToken, storeController.getSizes);

router.use('/getweights', verifyToken, storeController.getWeights);

router.use('/', verifyToken, storeController.index);



module.exports = router;