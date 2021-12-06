var sql = require("mssql");
var async = require('async');
var config = require("../config/config");

class CoordinationController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Coordinations`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    //Shipper
    // tiếp nhận đơn hàng nhanh bới shipper
    async addFastItem(req, res) {
        const { DeliveryId, StaffId } = req.body;

        var deliveryQuery = `Update Deliveries Set Status = 'Delivering' Where DeliveryId = '${DeliveryId}'`;
        var coordinationQuery = `INSERT INTO Coordinations(DeliveryId, StaffId1, DeliveryDate, Status)
                         Values('${DeliveryId}', '${StaffId}', getDate(), 'Da tiep nhan')`;

        var listQuery = [];
        listQuery.push(deliveryQuery);
        listQuery.push(coordinationQuery);
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

    // tiếp nhận đơn hàng tiêu chuẩn bới shipper
    async addStandardItem(req, res) {
        const { DeliveryId, StaffId, Status } = req.body;
        var deliveryQuery, coordinationQuery = '';
        var listQuery = [];
        if (Status === 'Ordered') {
            deliveryQuery = `Update Deliveries Set Status = 'Delivering' Where DeliveryId = '${DeliveryId}'`;
            coordinationQuery = `INSERT INTO Coordinations(DeliveryId, StaffId1, DeliveryDate, Status, WareHouseId)
                         Values('${DeliveryId}', '${StaffId}', getDate(), 'Da tiep nhan', 'NK001')`;
            listQuery.push(deliveryQuery);
            listQuery.push(coordinationQuery);
        } else if (Status === 'Returning') {
            coordinationQuery = `Update Return_Deliveries SET StaffId3 = '${StaffId}', Status = 'Dang roi kho', DeliveryDate = getDate() 
                         Where DeliveryId = '${DeliveryId}'`;
            listQuery.push(coordinationQuery);
        } else {
            coordinationQuery = `Update Coordinations SET StaffId2 = '${StaffId}', Status = 'Dang roi kho', DeliveryDate2 = getDate() 
                         Where DeliveryId = '${DeliveryId}'`;
            listQuery.push(coordinationQuery);
        }

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


    //chuyển trnajg thái đã giao hàng cho đơn giao hàng nhanh
    async updateFastItem(req, res) {
        const { DeliveryId, StaffId } = req.body;

        var deliveryQuery = `Update Deliveries Set Status = 'Delivered' Where DeliveryId = '${DeliveryId}'`;
        var coordinationQuery = `Update Coordinations 
                                 Set Status = 'Da giao hang', DeliveryDate = getDate() 
                                 Where StaffId1 = '${StaffId}' and DeliveryId = '${DeliveryId}'`;

        var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments

        var feePaymentQuery = `Insert Into FeeShip_Payments(DeliveryId) Values('${DeliveryId}')`; //Feepayments

        var listQuery = [];
        listQuery.push(deliveryQuery);
        listQuery.push(coordinationQuery);
        listQuery.push(paymentQuery);
        listQuery.push(feePaymentQuery);
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

    //chuyển trnajg thái đã giao hàng cho đơn giao hàng tiêu chuẩn
    async updateStandardItem(req, res) {
        const { DeliveryId, StaffId, Status } = req.body;
        var coordinationQuery, deliveryQuery, returnQuery = '';
        var listQuery = [];
        if (Status === 'Order') {
            coordinationQuery = `Update Coordinations Set Status = 'Dang ve kho' Where StaffId1 = '${StaffId}' and DeliveryId = '${DeliveryId}'`;
            var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments
            var feePaymentQuery = `Insert Into FeeShip_Payments(DeliveryId) Values('${DeliveryId}')`; //Feepayments
            listQuery.push(coordinationQuery);
            listQuery.push(paymentQuery);
            listQuery.push(feePaymentQuery);
        } else if (Status === 'Deliver') {
            deliveryQuery = `Update Deliveries Set Status = 'Delivered' Where DeliveryId = '${DeliveryId}'`;
            coordinationQuery = `Update Coordinations Set Status = 'Da giao hang' Where StaffId2 = '${StaffId}' and DeliveryId = '${DeliveryId}'`;
            var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments
            var feePaymentQuery = `Insert Into FeeShip_Payments(DeliveryId) Values('${DeliveryId}')`; //Feepayments
            listQuery.push(deliveryQuery);
            listQuery.push(coordinationQuery);
            listQuery.push(paymentQuery);
            listQuery.push(feePaymentQuery);
        } else {
            deliveryQuery = `Update Deliveries Set Status = 'Returned' Where DeliveryId = '${DeliveryId}'`;
            coordinationQuery = `Update Coordinations Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;
            returnQuery = `Update Return_Deliveries Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;
            var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments
            var feePaymentQuery = `Insert Into FeeShip_Payments(DeliveryId) Values('${DeliveryId}')`; //Feepayments
            listQuery.push(deliveryQuery);
            listQuery.push(coordinationQuery);
            listQuery.push(returnQuery);
            listQuery.push(paymentQuery);
            listQuery.push(feePaymentQuery);
        }
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


    // lấy danh sách các đơn hàng nhanh đã tiếp nhận của shipper 
    async getFastShip(req, res) {
        const staffId = req.params.staffId;
        var query = `Select Deliveries.*, Coor.DeliveryDate from (
                        Select DeliveryId, DeliveryDate from Coordinations 
                        where StaffId1 = '${staffId}' and  WareHouseId IS NULL ) Coor
                    Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                    Order By DeliveryDate DESC`;
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var query6 = 'select * from Stores'
        var deliveries, provinces, districts, wards, stores = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            let result4 = await pool.request()
                .query(query4)
            let result6 = await pool.request()
                .query(query6)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
            stores = result6.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        var temp = [];
        deliveries.map(delivery => {
            const Province = provinces.find(province => province.ProvinceCode === delivery.ProvinceCode);
            const District = districts.find(district => district.DistrictCode === delivery.DistrictCode);
            const Ward = wards.find(ward => ward.WardCode === delivery.WardCode);
            const StoreCurrent = stores.find(store => store.StoreId === delivery.StoreId);
            const ProvinceStore = provinces.find(province => province.ProvinceCode === StoreCurrent.ProvinceCode);
            const DistrictStore = districts.find(district => district.DistrictCode === StoreCurrent.DistrictCode);
            const WardStore = wards.find(ward => ward.WardCode === StoreCurrent.WardCode);
            const item = {
                ...delivery,
                WardName: Ward.WardName,
                ProvinceName: Province.ProvinceName,
                DistrictName: District.DistrictName,
                WardNameStore: WardStore.WardName,
                ProvinceNameStore: ProvinceStore.ProvinceName,
                DistrictNameStore: DistrictStore.DistrictName,
                StoreName: StoreCurrent.StoreName,
                StorePhone: StoreCurrent.Phone,
                StoreAddress: StoreCurrent.AddressDetail,
            }
            temp.push(item);
        })
        res.json(temp);
    }

    // lấy danh sách các đơn hàng tiêu chuẩn đã tiếp nhận của shipper 
    async getStandardShip(req, res) {
        const staffId = req.params.staffId;
        const status = req.params.status;
        var query = '';
        if (status === 'Order') {
            query = `Select Deliveries.*, Coor.DeliveryDate, Coor.Status as StatusDetail from ( 
                Select DeliveryId, DeliveryDate, Status from Coordinations 
                where StaffId1 = '${staffId}' and  WareHouseId IS NOT NULL ) Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Order By DeliveryDate DESC`;
        } else if (status === 'Deliver') {
            query = `Select Deliveries.*, Coor.DeliveryDate2 as DeliveryDate, Coor.Status as StatusDetail from ( 
                Select DeliveryId, DeliveryDate2, Status from Coordinations 
                where StaffId2 = '${staffId}') Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Order By DeliveryDate DESC`;
        } else {
            query = `Select Deliveries.*, Coor.DeliveryDate as DeliveryDate, Coor.Status as StatusDetail from ( 
                Select DeliveryId, DeliveryDate, Status from Return_Deliveries 
                where StaffId3 = '${staffId}') Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Order By DeliveryDate DESC`;
        }
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var query6 = 'select * from Stores'
        var deliveries, provinces, districts, wards, stores = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            let result4 = await pool.request()
                .query(query4)
            let result6 = await pool.request()
                .query(query6)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
            stores = result6.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        var temp = [];
        deliveries.map(delivery => {
            const Province = provinces.find(province => province.ProvinceCode === delivery.ProvinceCode);
            const District = districts.find(district => district.DistrictCode === delivery.DistrictCode);
            const Ward = wards.find(ward => ward.WardCode === delivery.WardCode);
            const StoreCurrent = stores.find(store => store.StoreId === delivery.StoreId);
            const ProvinceStore = provinces.find(province => province.ProvinceCode === StoreCurrent.ProvinceCode);
            const DistrictStore = districts.find(district => district.DistrictCode === StoreCurrent.DistrictCode);
            const WardStore = wards.find(ward => ward.WardCode === StoreCurrent.WardCode);
            const item = {
                ...delivery,
                WardName: Ward.WardName,
                ProvinceName: Province.ProvinceName,
                DistrictName: District.DistrictName,
                WardNameStore: WardStore.WardName,
                ProvinceNameStore: ProvinceStore.ProvinceName,
                DistrictNameStore: DistrictStore.DistrictName,
                StoreName: StoreCurrent.StoreName,
                StorePhone: StoreCurrent.Phone,
                StoreAddress: StoreCurrent.AddressDetail,
            }
            temp.push(item);
        })
        res.json(temp);
    }

}

module.exports = new CoordinationController();