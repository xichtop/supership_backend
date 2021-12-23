const express = require('express');
const router = express.Router();
const WareController = require('../app/controllers/WareController');
const verifyToken = require('../middleware/verifyToken');

//lấy danh sách đã xác nhận 
router.use('/getallmain/', verifyToken, WareController.getAllMain);

//láy danh sách chờ xác nhận
router.use('/getall', verifyToken, WareController.getAll);

//láy danh sách trả hàng chờ xác nhận
router.use('/getallreturn', verifyToken, WareController.getAllReturn);

//xác nhận đơn hàng
router.use('/update', verifyToken, WareController.update);

//xác nhận đơn trả hàng
router.use('/updatereturn', verifyToken, WareController.updateReturn);

//lấy danh sách nhà kho
router.use('/', verifyToken, WareController.get);

module.exports = router;