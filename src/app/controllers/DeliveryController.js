var sql = require("mssql");
var config = require("../config/config");

class DeliveryController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Deliveries`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async getById(req, res) {
        var query = `select * from Deliveries where DeliveryId = ${req.params.deliveryId}`;
        var delivery = {};
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            delivery = result.recordsets[0][0]
        } catch (err) {

        }

        var query2 = `select WardName from Wards where WardCode = '${delivery.WardCode}'`;
        var query3 = `select DistrictName from Districts where DistrictCode = '${delivery.DistrictCode}'`;
        var query4 = `select ProvinceName from Provinces where ProvinceCode = '${delivery.ProvinceCode}'`;
        var WardName, DistrictName, ProvinceName = '';
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request().query(query2)
            let result2 = await pool.request().query(query3)
            let result3 = await pool.request().query(query4)
            WardName = result1.recordsets[0][0].WardName;
            DistrictName = result2.recordsets[0][0].DistrictName;
            ProvinceName = result3.recordsets[0][0].ProvinceName;
        } catch (err) {

        }
        const newDelivery = {
            ...delivery,
            WardName
            , DistrictName,
            ProvinceName
        }
        res.json(newDelivery);
    }

    async getByStore(req, res) {
        var query = `select * from Deliveries where StoreId = '${req.params.storeId}'`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async getByStoreandStatus(req, res) {
        var query1 = `select * from Deliveries where StoreId = '${req.params.storeId}' and Status = '${req.params.status}' Order by OrderDate DESC`;
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var deliveries, provinces, districts, wards, temp = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            let result4 = await pool.request()
                .query(query4)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
        } catch (err) {

        }
        deliveries.map(delivery => {
            const Province = provinces.find(province => province.ProvinceCode === delivery.ProvinceCode);
            const District = districts.find(district => district.DistrictCode === delivery.DistrictCode);
            const Ward = wards.find(ward => ward.WardCode === delivery.WardCode);
            const item = {
                ...delivery,
                WardName: Ward.WardName,
                ProvinceName: Province.ProvinceName,
                DistrictName: District.DistrictName,
            }
            temp.push(item);
        })
        res.json(temp);
    }

    async statistic(req, res) {
        const { FirstDate, LastDate, StoreId } = req.body;
        var query = `select Status, COUNT(Status) as Mount
                    From Deliveries where OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}' and StoreId = '${StoreId}' 
                    Group by Status`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            console.log(result);
            res.json(result.recordsets[0]);
        } catch (err) {
            console.log(err);
        }
    }

    async updateStatus(req, res) {
        const { DeliveryId, NewStatus } = req.body;
        const query = `UPDATE Deliveries SET Status = '${NewStatus}' WHERE DeliveryId = ${DeliveryId}`;
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
            res.send({ successful: true, message: 'Cập nhật đơn hàng thành công!', status: status });
        }
        else {
            res.send({ successful: false, message: 'Cập nhật đơn hàng thất bại!', status: status });
        }
    }

    async addItem(req, res) {
        const { StoreId, RecieverPhone, RecieverName, ProvinceCode, DistrictCode, WardCode, AddressDetail, Picture, COD, ShipType, GoodName, GoodWeight, GoodSize, GoodType } = req.body;
        const query = `INSERT INTO Deliveries(StoreId, RecieverPhone, RecieverName, ProvinceCode, DistrictCode, 
                        WardCode, AddressDetail, Picture, COD, ShipType, GoodName, GoodWeight, GoodSize, GoodType, OrderDate, Status)
                        VALUES('${StoreId}', '${RecieverPhone}', N'${RecieverName}', '${ProvinceCode}', '${DistrictCode}', 
                        '${WardCode}', N'${AddressDetail}', '${Picture}', ${COD}, N'${ShipType}', N'${GoodName}', 
                        '${GoodWeight}', '${GoodSize}', N'${GoodType}', getDate(), 'Ordered')`
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
            res.json({ successful: true, message: 'Tạo đơn hàng thành công!', status: status });
            console.log('thành công');
        }
        else {
            res.json({ successful: false, message: 'Tạo đơn hàng thất bại!', status: status });
            console.log('thất bại!!!!!!!!!!');
        }
    }

}

module.exports = new DeliveryController();