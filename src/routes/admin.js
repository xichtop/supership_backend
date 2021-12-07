const express = require('express');
const router = express.Router();
const AdminController = require('../app/controllers/AdminController');
const verifyToken = require('../middleware/verifyToken');

router.use('/statistic', verifyToken, AdminController.statistic);

module.exports = router;