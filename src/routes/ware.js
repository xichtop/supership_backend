const express = require('express');
const router = express.Router();
const WareController = require('../app/controllers/WareController');
const verifyToken = require('../middleware/verifyToken');

//lấy danh sách đã xác nhận 
router.use('/getallmain/', verifyToken, WareController.getAllMain);

//láy danh sách chờ xác nhận
router.use('/getall', verifyToken, WareController.getAll);

//xác nhận đơn hàng
router.use('/update', verifyToken, WareController.update);

module.exports = router;