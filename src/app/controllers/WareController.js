var sql = require("mssql");
var async = require('async');
var config = require("../config/config");
const jwt = require('jsonwebtoken');
var md5 = require('md5');

class WareController {

    async getAll(req, res) {
        var query = '';
        query = `Select Deliveries.*, Coor.Status as StatusDetail, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                from ( 
                    Select DeliveryId, Status from Coordinations 
                    where Status = 'Dang ve kho' Or  Status = 'Dang roi kho' ) Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Left Join Provinces 
                on Deliveries.ProvinceCode = Provinces.ProvinceCode
                Left Join Districts 
                on Deliveries.DistrictCode = Districts.DistrictCode
                Left Join Wards 
                on Deliveries.WardCode = Wards.WardCode
                Order By DeliveryId DESC`;

        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            res.json(result1.recordsets[0]);
        } catch (err) {
            console.log(err);
        }
    }

    async getAllMain(req, res) {
        const { StaffId, Status } = req.body;
        var query = '';
        if (Status === 'Nhap kho') {
            query = `Select Deliveries.*, Coor.Status as StatusDetail , Wards.WardName, Districts.DistrictName, Provinces.ProvinceName
                from ( 
                Select DeliveryId, Status from Coordinations 
                where StaffId3 = '${StaffId}')  Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Left Join Provinces 
                on Deliveries.ProvinceCode = Provinces.ProvinceCode
                Left Join Districts 
                on Deliveries.DistrictCode = Districts.DistrictCode
                Left Join Wards 
                on Deliveries.WardCode = Wards.WardCode
                Order By DeliveryId DESC`;
        } else {
            query = `Select Deliveries.*, Coor.Status as StatusDetail , Wards.WardName, Districts.DistrictName, Provinces.ProvinceName
            from ( 
                Select DeliveryId, Status from Coordinations 
                where StaffId4 = '${StaffId}') Coor
                Left Join Deliveries On Coor.DeliveryId = Deliveries.DeliveryId
                Left Join Provinces 
                on Deliveries.ProvinceCode = Provinces.ProvinceCode
                Left Join Districts 
                on Deliveries.DistrictCode = Districts.DistrictCode
                Left Join Wards 
                on Deliveries.WardCode = Wards.WardCode
                Order By DeliveryId DESC`;
        }

        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            res.json(result1.recordsets[0]);
        } catch (err) {
            console.log(err);
        }
    }

    async update(req, res) {
        const { DeliveryId, StaffId, Status } = req.body;
        console.log(req.body)
        var query = '';
        if (Status === 'Nhap kho') {
            query = `Update Coordinations 
                     Set StaffId3 = '${StaffId}', WareHouseDate = getDate(), Status = 'Da ve kho'
                     Where DeliveryId = '${DeliveryId}'`;
        } else {
            query = `Update Coordinations 
                     Set StaffId4 = '${StaffId}', WareHouseDate2 = getDate(), Status = 'Da roi kho'
                     Where DeliveryId = '${DeliveryId}'`;
        }

        var status = 0;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            status = result;
            console.log(result)
        } catch (err) {
            console.log(err);
        }
        if (status != 0) {
            res.send({ successful: true, message: 'Xác nhận đơn hàng thành công!', status: status });
        }
        else {
            res.send({ successful: false, message: 'Xác nhận đơn hàng thất bại!', status: status });
        }
    }

}

module.exports = new WareController();