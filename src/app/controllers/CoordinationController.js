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

    // Cửa hàng láy danh sách chi tiết quá trình đơn hàng
    async getById(req, res) {
        var query = `select coor.DeliveryId, coor.StaffId1, Staffs.FullName as FullName1, Staffs.Phone as Phone1, 
		            coor.StaffId2, s2.FullName as FullName2, s2.Phone as Phone2,  
		            coor.StaffId3, s3.FullName as FullName3, s3.Phone as Phone3, 
		            coor.StaffId4, s4.FullName as FullName4, s4.Phone as Phone4, 
		            coor.Status, Deliveries.Status as StatusMain, Deliveries.ShipType, Return_Deliveries.Status as StatusBack,
		            Return_Deliveries.StaffId1 as StaffId5, s5.FullName as FullName5, s5.Phone as Phone5, 
		            Return_Deliveries.StaffId2 as StaffId6, s6.FullName as FullName6, s6.Phone as Phone6, 
		            Return_Deliveries.StaffId3 as StaffId7, s7.FullName as FullName7, s7.Phone as Phone7
                    from (select Top 1 * from Coordinations where DeliveryId = '${req.params.deliveryid}') coor
                    Left Join Return_Deliveries On Coor.DeliveryId = Return_Deliveries.DeliveryId
					Left Join Staffs On Staffs.StaffId = coor.StaffId1
					Left Join Staffs as s2 On s2.StaffId = coor.StaffId2
					Left Join Staffs as s3 On s3.StaffId = coor.StaffId3
					Left Join Staffs as s4 On s4.StaffId = coor.StaffId4
					Left Join Staffs as s5 On s5.StaffId = Return_Deliveries.StaffId1
					Left Join Staffs as s6 On s6.StaffId = Return_Deliveries.StaffId2
					Left Join Staffs as s7 On s7.StaffId = Return_Deliveries.StaffId3
                    Left Join Deliveries on coor.DeliveryId = Deliveries.DeliveryId`;
        var coor;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            coor = result.recordsets[0][0];
        } catch (err) {

        }

        if (coor.ShipType === 'Giao hàng nhanh') {
            if (coor.StatusMain === 'Delivering') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang giao hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`
                ]
                res.send(temp);
            } else if (coor.StatusMain === 'Delivered') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang giao hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã giao hàng'
                ]
                res.send(temp);
            } else if (coor.StatusMain === 'Returning') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang giao hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã giao hàng',
                    'Không nhận hàng',
                    `Đang trả hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`
                ]
                res.send(temp);
            } else if (coor.StatusMain === 'Returned') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang giao hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã giao hàng',
                    'Không nhận hàng',
                    `Đang trả hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã trả hàng'
                ]
                res.send(temp);
            }
        } else {
            if (coor.StatusMain === 'Delivering') {
                if (coor.Status === 'Da tiep nhan') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`
                    ]
                    res.send(temp);
                } else if (coor.Status === 'Dang ve kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho'
                    ]
                    res.send(temp);
                } else if (coor.Status === 'Da ve kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`
                    ]
                    res.send(temp);
                } else if (coor.Status === 'Dang roi kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho'
                    ]
                    res.send(temp);
                } else if (coor.Status === 'Da roi kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                        `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`
                    ]
                    res.send(temp);
                }
            } else if (coor.StatusMain === 'Delivered') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã lấy hàng',
                    'Đang về kho',
                    `Đã về kho\nNhân viên: ${coor.FullName3}`,
                    'Đang rời kho',
                    `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                    `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                    'Đã giao hàng'
                ]
                res.send(temp);
            } else if (coor.StatusMain === 'Returning') {
                if (coor.StatusBack === 'Dang ve kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                        `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        'Không nhận hàng',
                        `Đang về kho\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                    ]
                    res.send(temp);
                } else if (coor.StatusBack === 'Da ve kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                        `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        'Không nhận hàng',
                        `Đang về kho\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        `Đã về kho\nNhân viên: ${coor.FullName6}`
                    ]
                    res.send(temp);
                } else if (coor.StatusBack === 'Dang roi kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                        `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        'Không nhận hàng',
                        `Đang về kho\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        `Đã về kho\nNhân viên: ${coor.FullName6}`,
                        'Đang rời kho'
                    ]
                    res.send(temp);
                } else if (coor.StatusBack === 'Da roi kho') {
                    let temp = [
                        'Chờ tiếp nhận',
                        'Đã tiếp nhận',
                        `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                        'Đã lấy hàng',
                        'Đang về kho',
                        `Đã về kho\nNhân viên: ${coor.FullName3}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                        `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        'Không nhận hàng',
                        `Đang về kho\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                        `Đã về kho\nNhân viên: ${coor.FullName6}`,
                        'Đang rời kho',
                        `Đã rời kho\nNhân viên: ${coor.FullName7}`,
                        `Đang trả hàng\nShipper: ${coor.FullName5}\nSĐT: ${coor.Phone5}`,
                    ]
                    res.send(temp);
                }

            } else if (coor.StatusMain === 'Returned') {
                let temp = [
                    'Chờ tiếp nhận',
                    'Đã tiếp nhận',
                    `Đang lấy hàng\nShipper: ${coor.FullName1}\nSĐT: ${coor.Phone1}`,
                    'Đã lấy hàng',
                    'Đang về kho',
                    `Đã về kho\nNhân viên: ${coor.FullName3}`,
                    'Đang rời kho',
                    `Đã rời kho\nNhân viên: ${coor.FullName4}`,
                    `Đang giao hàng\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                    'Không nhận hàng',
                    `Đang về kho\nShipper: ${coor.FullName2}\nSĐT: ${coor.Phone2}`,
                    `Đã về kho\nNhân viên: ${coor.FullName6}`,
                    'Đang rời kho',
                    `Đã rời kho\nNhân viên: ${coor.FullName7}`,
                    `Đang trả hàng\nShipper: ${coor.FullName5}\nSĐT: ${coor.Phone5}`,
                    'Đã trả hàng'
                ]
                res.send(temp);
            }
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

        var listQuery = [];
        listQuery.push(deliveryQuery);
        listQuery.push(coordinationQuery);
        listQuery.push(paymentQuery);
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
            listQuery.push(coordinationQuery);
        } else if (Status === 'Deliver') {
            deliveryQuery = `Update Deliveries Set Status = 'Delivered' Where DeliveryId = '${DeliveryId}'`;
            coordinationQuery = `Update Coordinations Set Status = 'Da giao hang' Where StaffId2 = '${StaffId}' and DeliveryId = '${DeliveryId}'`;
            var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments
            listQuery.push(deliveryQuery);
            listQuery.push(coordinationQuery);
            listQuery.push(paymentQuery);
        } else {
            deliveryQuery = `Update Deliveries Set Status = 'Returned' Where DeliveryId = '${DeliveryId}'`;
            coordinationQuery = `Update Coordinations Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;
            returnQuery = `Update Return_Deliveries Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;
            var paymentQuery = `Insert Into Payments(DeliveryId) Values('${DeliveryId}')`; //payments
            listQuery.push(deliveryQuery);
            listQuery.push(coordinationQuery);
            listQuery.push(returnQuery);
            listQuery.push(paymentQuery);
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