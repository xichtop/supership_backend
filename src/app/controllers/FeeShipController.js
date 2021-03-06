var sql = require("mssql");
var config = require("../config/config");
var async = require('async');

class FeeShipController {
    // [GET] /new

    // Admin lấy danh sách phí ship của hệ thống
    async getAll(req, res) {
        const query1 = `Select Deliveries.StoreId, Deliveries.OrderDate, Deliveries.ShipType, Deliveries.FeeShip, 
                        Coordinations.*, Payments.StaffId2 as Admin, Return_Deliveries.StaffId3 as StaffId5
                        From Deliveries
                        Left Join Coordinations
                        On Deliveries.DeliveryId = Coordinations.DeliveryId
                        Left Join Return_Deliveries
                        On Deliveries.DeliveryId = Return_Deliveries.DeliveryId
                        Left Join Payments
                        On Deliveries.DeliveryId = Payments.DeliveryId
                        Where Deliveries.Status = 'Delivered' Or Deliveries.Status = 'Returned'
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
                if (deliveries[i].Admin === null) {
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
                if (deliveries[i].Admin === null) {
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
                    if (deliveries[i].Status === 'Da tra hang') {
                        temp.push({
                            Index: index,
                            DeliveryId: deliveries[i].DeliveryId,
                            OrderDate: deliveries[i].OrderDate,
                            ShipType: 'Giao hàng tiêu chuẩn',
                            StaffId: deliveries[i].StaffId5,
                            FeeShip: deliveries[i].FeeShip,
                            FeePay: (deliveries[i].FeeShip) * 10 / 100,
                            Status: 'Chưa thanh toán'
                        })
                        index++;
                    }
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
                    if (deliveries[i].Status === 'Da tra hang') {
                        temp.push({
                            Index: index,
                            DeliveryId: deliveries[i].DeliveryId,
                            OrderDate: deliveries[i].OrderDate,
                            ShipType: 'Giao hàng tiêu chuẩn',
                            StaffId: deliveries[i].StaffId5,
                            FeeShip: deliveries[i].FeeShip,
                            FeePay: (deliveries[i].FeeShip) * 10 / 100,
                            Status: 'Đã thanh toán'
                        })
                        index++;
                    }
                }
            }
        }
        res.json(temp);
    }

    //Quản lí thanh toán Feeship cho shipper theo đơn hàng
    async PayFeeManagerByDeliver(req, res) {
        const { DeliveryId, StaffId, Money } = req.body;
        const query = `Update Payments Set StaffId2 = '${StaffId}',  PayStaffDate2 = getDate() Where DeliveryId = '${DeliveryId}'`;
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
                var query = `Update Payments Set StaffId2 = '${StaffId}', PayStaffDate2 = getDate() Where DeliveryId = '${delivery.DeliveryId}'`;
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
                var query = `Update Payments Set PayDate2 = getDate()
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
        const query1 = `Select Deliver.*, Coordinations.DeliveryDate as ShipDate, Payments.PayDate2  
                        from ( Select Deliveries.DeliveryId, Deliveries.StoreId, Deliveries.OrderDate, Deliveries.FeeShip
                            From Deliveries
                            Where (Deliveries.Status = 'Delivered' Or Deliveries.Status = 'Returned') and Deliveries.StoreId = '${StoreId}' ) Deliver
                        Left Join Coordinations
                        On Deliver.DeliveryId = Coordinations.DeliveryId
                        Left Join Payments
                        On Deliver.DeliveryId = Payments.DeliveryId
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
        for (let i = 0; i < deliveries.length; i++) {

            if (deliveries[i].PayDate2 === null) {
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

        const { StaffId, LastDate, FirstDate } = req.body;

        const query1 = `select Coor.*, Deliveries.FeeShip, Deliveries.ShipType, Payments.StaffId2 as Admin from 
                        (   Select DeliveryId, DeliveryDate 
                            from Coordinations 
                            Where StaffId1 = '${StaffId}' 
                            and (Status = 'Da giao hang' Or Status = 'Da tra hang')
                            and DeliveryDate <= '${LastDate}' and DeliveryDate >= '${FirstDate}'
                            ) Coor
                        Left Join Deliveries On Deliveries.DeliveryId = Coor.DeliveryId
                        Left Join Payments On Deliveries.DeliveryId = Payments.DeliveryId`;
        const query2 = `select Coor.*, Deliveries.FeeShip, Deliveries.ShipType, Payments.StaffId2 as Admin from 
                        (   Select DeliveryId, DeliveryDate 
                            from Coordinations 
                            Where StaffId2 = '${StaffId}' 
                            and (Status = 'Da giao hang' Or Status = 'Da tra hang')
                            and DeliveryDate <= '${LastDate}' and DeliveryDate >= '${FirstDate}'
                            ) Coor
                        Left Join Deliveries On Deliveries.DeliveryId = Coor.DeliveryId
                        Left Join Payments On Deliveries.DeliveryId = Payments.DeliveryId`;
        const query3 = `select Coor.*, Deliveries.FeeShip, Deliveries.ShipType, Payments.StaffId2 as Admin from 
                        (   Select DeliveryId, DeliveryDate 
                            from Return_Deliveries 
                            Where StaffId3 = '${StaffId}' and Status = 'Da tra hang'
                            and DeliveryDate <= '${LastDate}' and DeliveryDate >= '${FirstDate}'
                            ) Coor
                        Left Join Deliveries On Deliveries.DeliveryId = Coor.DeliveryId
                        Left Join Payments On Deliveries.DeliveryId = Payments.DeliveryId`;
        var deliveries1, deliveries2, deliveries3 = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            deliveries1 = result1.recordsets[0];
            deliveries2 = result2.recordsets[0];
            deliveries3 = result3.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];
        for (let i = 0; i < deliveries1.length; i++) {

            let fee = 0;
            if (deliveries1[i].ShipType === 'Giao hàng nhanh') {
                fee = deliveries1[i].FeeShip * 15 / 100
            } else {
                fee = deliveries1[i].FeeShip * 10 / 100
            }

            if (deliveries1[i].Admin === null) {
                temp.push({
                    DeliveryId: deliveries1[i].DeliveryId,
                    Type: 'Lấy hàng',
                    DeliveryDate: deliveries1[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Chưa thanh toán'
                })
            } else {
                temp.push({
                    DeliveryId: deliveries1[i].DeliveryId,
                    Type: 'Lấy hàng',
                    DeliveryDate: deliveries1[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Đã thanh toán'
                })
            }
        }

        for (let i = 0; i < deliveries2.length; i++) {

            let fee = 0;
            if (deliveries2[i].ShipType === 'Giao hàng nhanh') {
                fee = deliveries2[i].FeeShip * 15 / 100
            } else {
                fee = deliveries2[i].FeeShip * 10 / 100
            }

            if (deliveries2[i].Admin === null) {
                temp.push({
                    DeliveryId: deliveries2[i].DeliveryId,
                    Type: 'Giao hàng',
                    DeliveryDate: deliveries2[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Chưa thanh toán'
                })
            } else {
                temp.push({
                    DeliveryId: deliveries2[i].DeliveryId,
                    Type: 'Giao hàng',
                    DeliveryDate: deliveries2[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Đã thanh toán'
                })
            }
        }

        for (let i = 0; i < deliveries3.length; i++) {

            let fee = 0;
            if (deliveries3[i].ShipType === 'Giao hàng nhanh') {
                fee = deliveries3[i].FeeShip * 15 / 100
            } else {
                fee = deliveries3[i].FeeShip * 10 / 100
            }

            if (deliveries3[i].Admin === null) {
                temp.push({
                    DeliveryId: deliveries3[i].DeliveryId,
                    Type: 'Trả hàng',
                    DeliveryDate: deliveries3[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Chưa thanh toán'
                })
            } else {
                temp.push({
                    DeliveryId: deliveries3[i].DeliveryId,
                    Type: 'Trả hàng',
                    DeliveryDate: deliveries3[i].DeliveryDate,
                    FeeShip: fee,
                    Status: 'Đã thanh toán'
                })
            }
        }
        res.json(temp);
    }


    // admin get config
    async getConfig(req, res) {
        const query1 = 'select * from GoodSizes where StartDate <= getDate() and EndDate IS NULL';
        const query2 = 'Select * from GoodWeights where StartDate <= getDate() and EndDate IS NULL';
        const query3 = 'Select * from Configs where StartDate <= getDate() and EndDate IS NULL';
        var sizes = [];
        var weights = [];
        var distances = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            sizes = result1.recordsets[0];
            weights = result2.recordsets[0];
            distances = result3.recordsets[0];
        } catch (err) {
            console.log(err);
        }

        res.json([
            {
                size1: sizes.find(s => s.GoodSizeId === 'S').Money,
                size2: sizes.find(s => s.GoodSizeId === 'M').Money,
                size3: sizes.find(s => s.GoodSizeId === 'L').Money,
                size4: sizes.find(s => s.GoodSizeId === 'XL').Money,
                weight1: weights.find(s => s.GoodWeightId === 'S').Money,
                weight2: weights.find(s => s.GoodWeightId === 'M').Money,
                weight3: weights.find(s => s.GoodWeightId === 'L').Money,
                weight4: weights.find(s => s.GoodWeightId === 'XL').Money,
                distance1: distances[1].Money,
                distance2: distances[2].Money,
                distance3: distances[3].Money,
                distance4: distances[4].Money,
                type: distances[0].Money,
            },
            {
                date1: sizes[0].StartDate,
                date2: weights[0].StartDate,
                date3: distances[1].StartDate,
                date4: distances[0].StartDate,
            }
        ])
    }

    async updateConfig(req, res) {
        const { sizes, weights, distances, dates, type } = req.body;

        var listQuery = [];

        console.log(dates);

        const temp = ['S', 'M', 'L', 'XL'];
        const sizeDes = ['0 - 30*30*30 Cm', '30*30*30 - 50*50*50 Cm', '50*50*50 - 70*70*70 Cm', 'Lớn hơn 70*70*70 Cm'];
        const temp2 = [5, 10, 25, 100];
        const weightDes = ['Bé hơn 1 Kg', 'Từ 1 đến 3 Kg', 'Từ 3 đến 5 Kg', 'Lớn hơn 5 Kg'];

        const query = `Update Configs Set EndDate = '${dates[3].slice(0,10)}' Where ConfigId = 0 and EndDate IS NULL`;
        const query2 = `Insert Into Configs (ConfigId, Money, StartDate)
                            Values ( 0, ${type}, '${dates[3].slice(0,10)}')`;
        listQuery.push(query)
        listQuery.push(query2)

        sizes.map((size, index) => {
            const query = `Update GoodSizes Set EndDate = '${dates[0].slice(0,10)}' Where GoodSizeId = '${temp[index]}' and EndDate IS NULL`;
            const query2 = `Insert Into GoodSizes (GoodSizeId, Description, Money, StartDate)
                            Values ('${temp[index]}', N'${sizeDes[index]}', ${size}, '${dates[0].slice(0,10)}')`;
            listQuery.push(query)
            listQuery.push(query2)
        })

        weights.map((weight, index) => {
            const query = `Update GoodWeights Set EndDate = '${dates[1].slice(0,10)}' Where GoodWeightId = '${temp[index]}' and EndDate IS NULL`;
            const query2 = `Insert Into GoodWeights (GoodWeightId, Description, Money, StartDate)
                            Values ('${temp[index]}', N'${weightDes[index]}', ${weight}, '${dates[1].slice(0,10)}')`;
            listQuery.push(query)
            listQuery.push(query2)
        })

        distances.map((dis, index) => {
            const query = `Update Configs Set EndDate = '${dates[2].slice(0,10)}' Where ConfigId = ${temp2[index]} and EndDate IS NULL`;
            const query2 = `Insert Into Configs (ConfigId, Money, StartDate)
                            Values ( ${temp2[index]}, ${dis}, '${dates[2].slice(0,10)}')`;
            listQuery.push(query)
            listQuery.push(query2)
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
}

module.exports = new FeeShipController();