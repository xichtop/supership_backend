const express = require('express');
const router = express.Router();
const StaffController = require('../app/controllers/StaffController');
const verifyToken = require('../middleware/verifyToken');

router.use('/ware/login', StaffController.wareLogin);

router.use('/login', StaffController.login);

router.use('/', StaffController.index);

module.exports = router;