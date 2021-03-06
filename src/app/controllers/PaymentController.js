var sql = require("mssql");
var async = require('async');
var config = require("../config/config");

class PaymentController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Payments`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }


    // lấy danh sách tiền COD của cửa hàng 
    async statistic(req, res) {
        const { FirstDate, LastDate, StoreId } = req.body;
        var query1 = `select Deliver.*, Payments.StaffId1 
                      from ( select * from Deliveries 
                             where OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}' and StoreId = '${StoreId}' and Status = 'Delivered'
                            ) Deliver
                      Left Join Payments On Deliver.DeliveryId = Payments.DeliveryId
                      Order By Deliver.OrderDate DESC`;
        var deliveries = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            deliveries = result1.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];
        deliveries.forEach(delivery => {
            if (parseInt(delivery.COD) === 0) {
                temp.push({
                    DeliveryId: delivery.DeliveryId,
                    Phone: delivery.RecieverPhone,
                    OrderDate: delivery.OrderDate,
                    COD: delivery.COD,
                    Status: 'Đã thanh toán'
                })
            } else {
                if (delivery.StaffId1 !== null) {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        Phone: delivery.RecieverPhone,
                        OrderDate: delivery.OrderDate,
                        COD: delivery.COD,
                        Status: 'Đã thanh toán'
                    })
                } else {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        Phone: delivery.RecieverPhone,
                        OrderDate: delivery.OrderDate,
                        COD: delivery.COD,
                        Status: 'Chưa thanh toán'
                    })
                }
            }
        })
        res.json(temp);
    }

    // lấy danh sách tiền COD các đơn giao hàng nhanh của Shipper
    async getShipperPaymentFastList(req, res) {
        const { StaffId } = req.body;
        var query1 =    `Select Deliveries.*, Coor.DeliveryDate, Payments.PayDate1 from (
                        Select DeliveryId, DeliveryDate from Coordinations 
                        where StaffId1 = '${StaffId}' and  WareHouseId IS NULL and Status = 'Da giao hang' ) Coor
                        Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                        Left Join Payments On Coor.DeliveryId = Payments.DeliveryId
                        Order By DeliveryDate DESC`;
        var deliveries = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            deliveries = result1.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];
        deliveries.forEach(delivery => {
            if (parseInt(delivery.COD) === 0) {
                temp.push({
                    DeliveryId: delivery.DeliveryId,
                    OrderDate: delivery.OrderDate,
                    DeliveryDate: delivery.DeliveryDate,
                    COD: delivery.COD,
                    Status: 'Đã thanh toán'
                })
            } else {
                if (delivery.PayDate1 !== null) {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        OrderDate: delivery.OrderDate,
                        DeliveryDate: delivery.DeliveryDate,
                        COD: delivery.COD,
                        Status: 'Đã thanh toán'
                    })
                } else {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        OrderDate: delivery.OrderDate,
                        DeliveryDate: delivery.DeliveryDate,
                        COD: delivery.COD,
                        Status: 'Chưa thanh toán'
                    })
                }
            }
        })
        res.json(temp);
    }

    // lấy danh sách tiền COD các đơn giao hàng TC của Shipper
    async getShipperPaymentStandardList(req, res) {
        const { StaffId } = req.body;
        var query1 = `Select Deliveries.*, Coor.DeliveryDate, Payments.PayDate1 from (
                        Select DeliveryId, DeliveryDate from Coordinations 
                        where StaffId2 = '${StaffId}' and  WareHouseId IS NOT NULL and Status = 'Da giao hang' ) Coor
                        Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                        Left Join Payments On Coor.DeliveryId = Payments.DeliveryId
                        Order By DeliveryDate DESC`;
        var deliveries = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            deliveries = result1.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];
        deliveries.forEach(delivery => {
            if (parseInt(delivery.COD) === 0) {
                temp.push({
                    DeliveryId: delivery.DeliveryId,
                    OrderDate: delivery.OrderDate,
                    DeliveryDate: delivery.DeliveryDate,
                    COD: delivery.COD,
                    Status: 'Đã thanh toán'
                })
            } else {
                if (delivery.PayDate1 !== null) {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        OrderDate: delivery.OrderDate,
                        DeliveryDate: delivery.DeliveryDate,
                        COD: delivery.COD,
                        Status: 'Đã thanh toán'
                    })
                } else {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        OrderDate: delivery.OrderDate,
                        DeliveryDate: delivery.DeliveryDate,
                        COD: delivery.COD,
                        Status: 'Chưa thanh toán'
                    })
                }
            }
        })
        res.json(temp);
    }

    //Shipper thanh toán tiền COD cho hệ thống
    async PayCODShipper(req, res) {
        const { Deliveries } = req.body;
        var listQuery = [];
        Deliveries.forEach(delivery => {
            if (delivery.Status !== ' Đã thanh toán') {
                var query = `Update Payments Set PayDate1 = getDate() Where DeliveryId = '${delivery.DeliveryId}'`;
                listQuery.push(query);
            }
        })
        const pool = new sql.ConnectionPool(config)
        pool.connect(err => {
            if (err) console.log(err)
            const transaction = new sql.Transaction(pool)
            const request = new sql.Request(transaction)
            transaction.begin(err => {
                if (err) return console.log(err)
                async.eachSeries(listQuery, function (query, callback) {
                    request.query(query, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback()
                        }
                    })
                }, function (err) {
                    if (err) {
                        transaction.rollback()
                        res.json({ successful: false, message: "Đã xảy ra lỗi!" });
                        console.log(err)
                    } else {
                        console.log('success!')
                        res.json({ successful: true, message: "Thành công!" });
                        transaction.commit()
                    }
                })
            })
        })
    }


    //Quản lí thanh toán toàn bộ COD cho cửa hàng
    async PayCODManager(req, res) {
        const { Deliveries, StaffId } = req.body;
        var listQuery = [];
        Deliveries.forEach(delivery => {
            if (delivery.Status !== ' Đã thanh toán') {
                var query = `Update Payments Set StaffId1 = '${StaffId}', PayStaffDate1 = getDate() Where DeliveryId = '${delivery.DeliveryId}'`;
                listQuery.push(query);
            }
        })
        const pool = new sql.ConnectionPool(config)
        pool.connect(err => {
            if (err) console.log(err)
            const transaction = new sql.Transaction(pool)
            const request = new sql.Request(transaction)
            transaction.begin(err => {
                if (err) return console.log(err)
                async.eachSeries(listQuery, function (query, callback) {
                    request.query(query, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback()
                        }
                    })
                }, function (err) {
                    if (err) {
                        transaction.rollback()
                        res.json({ successful: false, message: "Đã xảy ra lỗi!" });
                        console.log(err)
                    } else {
                        console.log('success!')
                        res.json({ successful: true, message: "Thành công!" });
                        transaction.commit()
                    }
                })
            })
        })
    }

    //Quản lí thanh toán COD cho cửa hàng theo đơn hàng
    async PayCODManagerByDeliver(req, res) {
        const { DeliveryId, StaffId } = req.body;
        const query = `Update Payments Set StaffId1 = '${StaffId}', PayStaffDate1 = getDate() Where DeliveryId = '${DeliveryId}'`;
        var status = 0;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            status = result;
        } catch (err) {
            console.log(err);
        }
        if (status != 0) {
            res.send({ successful: true, message: 'Cập nhật thanh toán thành công!', status: status });
        }
        else {
            res.send({ successful: false, message: 'Cập nhật thanh toán thất bại!', status: status });
        }
    }

    // lấy danh sách tiền COD của tất cả cửa hàng
    async getAllCOD(req, res) {
        const query1 = `Select Deliveries.*, Stores.StoreName, Payments.StaffId1,
                        Banks.AccountBank, Banks.FullName, Banks.BankName, Banks.BankBranch 
                        from Deliveries
                        Left Join Stores on Stores.StoreId = Deliveries.StoreId
                        Left Join Banks on Stores.AccountBank = Banks.AccountBank
                        Left Join Payments on Deliveries.DeliveryId = Payments.DeliveryId
                        Where Deliveries.Status = 'Delivered'
                        Order By Deliveries.OrderDate DESC`;
        var deliveries = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            deliveries = result1.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];

        for (let i = 0; i < deliveries.length; i++) {
            if (parseInt(deliveries[i].COD) === 0) {
                temp.push({
                    ...deliveries[i],
                    Status: 'Đã thanh toán'
                })
            } else {
                if (deliveries[i].StaffId1 !== null) {
                    temp.push({
                        ...deliveries[i],
                        Status: 'Đã thanh toán'
                    })
                } else {
                    temp.push({
                        ...deliveries[i],
                        Status: 'Chưa thanh toán'
                    })
                }
            }
        }
        res.json(temp);
    }
}

module.exports = new PaymentController();