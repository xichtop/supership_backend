var sql = require("mssql");
var config = require("../config/config");
var async = require('async');

class FeeShipController {
    // [GET] /new

    // Admin lấy danh sách phí ship của hệ thống
    async getAll(req, res) {
        const query1 = `Select Deliveries.StoreId, Deliveries.OrderDate, Deliveries.ShipType, Deliveries.FeeShip, Coordinations.*, FeeShip_Payments.StaffId, FeeShip_Payments.Money1
                        From Deliveries
                        Left Join Coordinations
                        On Deliveries.DeliveryId = Coordinations.DeliveryId
                        Left Join FeeShip_Payments
                        On Deliveries.DeliveryId = FeeShip_Payments.DeliveryId
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
        var index = 0;
        for (let i = 0; i < deliveries.length; i++) {

            if (deliveries[i].ShipType === 'Giao hàng nhanh') {
                if (deliveries[i].StaffId === null) {
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng nhanh',
                        StaffId: deliveries[i].StaffId1,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 15 / 100,
                        Status: 'Chưa thanh toán'
                    })
                    index++;
                } else {
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng nhanh',
                        StaffId: deliveries[i].StaffId1,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 15 / 100,
                        Status: 'Đã thanh toán'
                    })
                    index++;
                }
            } else {
                if (deliveries[i].StaffId === null) {
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng tiêu chuẩn',
                        StaffId: deliveries[i].StaffId1,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 10 / 100,
                        Status: 'Chưa thanh toán'
                    })
                    index++;
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng tiêu chuẩn',
                        StaffId: deliveries[i].StaffId2,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 10 / 100,
                        Status: 'Chưa thanh toán'
                    })
                    index++;
                } else {
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng tiêu chuẩn',
                        StaffId: deliveries[i].StaffId1,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 10 / 100,
                        Status: 'Đã thanh toán'
                    })
                    index++;
                    temp.push({
                        Index: index,
                        DeliveryId: deliveries[i].DeliveryId,
                        OrderDate: deliveries[i].OrderDate,
                        ShipType: 'Giao hàng tiêu chuẩn',
                        StaffId: deliveries[i].StaffId2,
                        FeeShip: deliveries[i].FeeShip,
                        FeePay: (deliveries[i].FeeShip) * 10 / 100,
                        Status: 'Đã thanh toán'
                    })
                    index++;
                }
            }
        }
        res.json(temp);
    }

    //Quản lí thanh toán Feeship cho shipper theo đơn hàng
    async PayFeeManagerByDeliver(req, res) {
        const { DeliveryId, StaffId, Money } = req.body;
        const query = `Update FeeShip_Payments Set StaffId = '${StaffId}', Money1 = '${Money}', PayDate1 = getDate() Where DeliveryId = '${DeliveryId}'`;
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

    //Quản lí thanh toán toàn bộ phí ship cho shipper
    async PayFeeManager(req, res) {
        const { Deliveries, StaffId } = req.body;
        var listQuery = [];
        Deliveries.forEach(delivery => {
            if (delivery.Status !== ' Đã thanh toán') {
                var Money = 0;
                if (delivery.ShipType === 'Giao hàng nhanh') {
                    Money = delivery.FeeShip * 15 / 100;
                } else {
                    Money = delivery.FeeShip * 20 / 100;
                }
                var query = `Update FeeShip_Payments Set StaffId = '${StaffId}', Money1 = '${Money}', PayDate1 = getDate() Where DeliveryId = '${delivery.DeliveryId}'`;
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


    //Cửa hàng thanh toán phí ship cho hệ thống
    async PayFeeStore(req, res) {
        const { Deliveries, StoreId } = req.body;
        var listQuery = [];
        Deliveries.forEach(delivery => {
            if (delivery.Status !== ' Đã thanh toán') {
                var query = `Update FeeShip_Payments Set StoreId = '${StoreId}', PayDate2 = getDate(), Money2 = '${delivery.Money}' 
                Where DeliveryId = '${delivery.DeliveryId}'`;
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

    //Cửa hàng lấy danh sách phí ship
    async getAllByStore(req, res) {
        const StoreId = req.params.storeId
        const query1 = `Select Deliveries.DeliveryId, Deliveries.StoreId, Deliveries.OrderDate, Deliveries.FeeShip, Coordinations.DeliveryDate2 as ShipDate, FeeShip_Payments.StoreId as StorePay, FeeShip_Payments.Money2
                        From Deliveries
                        Left Join Coordinations
                        On Deliveries.DeliveryId = Coordinations.DeliveryId
                        Left Join FeeShip_Payments
                        On Deliveries.DeliveryId = FeeShip_Payments.DeliveryId
                        Where Deliveries.Status = 'Delivered' and Deliveries.StoreId = '${StoreId}'
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

            if (deliveries[i].StorePay === null) {
                temp.push({
                    DeliveryId: deliveries[i].DeliveryId,
                    OrderDate: deliveries[i].OrderDate,
                    DeliveryDate: deliveries[i].ShipDate,
                    FeeShip: deliveries[i].FeeShip,
                    Status: 'Chưa thanh toán'
                })
            } else {
                temp.push({
                    DeliveryId: deliveries[i].DeliveryId,
                    OrderDate: deliveries[i].OrderDate,
                    DeliveryDate: deliveries[i].ShipDate,
                    FeeShip: deliveries[i].FeeShip,
                    Status: 'Đã thanh toán'
                })
            }
        }
        res.json(temp);
    }

    //Shipper lấy danh sách phí ship
    async getAllByStaff(req, res) {
        
        const {FirstDate, LastDate, StaffId } = req.body;

        const query1 = `Select Deliveries.DeliveryId, Deliveries.StoreId, Deliveries.OrderDate, Coordinations.DeliveryDate2 as ShipDate, FeeShip_Payments.StoreId as StorePay, FeeShip_Payments.Money2
                        From Deliveries
                        Left Join Coordinations
                        On Deliveries.DeliveryId = Coordinations.DeliveryId
                        Left Join FeeShip_Payments
                        On Deliveries.DeliveryId = FeeShip_Payments.DeliveryId
                        Where Deliveries.Status = 'Delivered' and Deliveries.StoreId = '${StoreId}'
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

            if (deliveries[i].StorePay === null) {
                temp.push({
                    DeliveryId: deliveries[i].DeliveryId,
                    OrderDate: deliveries[i].OrderDate,
                    DeliveryDate: deliveries[i].ShipDate,
                    FeeShip: deliveries[i].FeeShip,
                    Status: 'Chưa thanh toán'
                })
            } else {
                temp.push({
                    DeliveryId: deliveries[i].DeliveryId,
                    OrderDate: deliveries[i].OrderDate,
                    DeliveryDate: deliveries[i].ShipDate,
                    FeeShip: deliveries[i].FeeShip,
                    Status: 'Đã thanh toán'
                })
            }
        }
        res.json(temp);
    }
}

module.exports = new FeeShipController();