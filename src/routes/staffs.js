const express = require('express');
const router = express.Router();
const StaffController = require('../app/controllers/StaffController');
const verifyToken = require('../middleware/verifyToken');

router.use('/', StaffController.index);

module.exports = router;