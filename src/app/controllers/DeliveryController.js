var sql = require("mssql");
var config = require("../config/config");
var getFee = require('../utils/getFeeShip');

class DeliveryController {

    //admin get all deliveries
    async index(req, res) {
        var query = `select Deliveries.*, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                     From Deliveries
                     Left Join Provinces 
                     on Deliveries.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Deliveries.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Deliveries.WardCode = Wards.WardCode
                     Order By DeliveryId DESC`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async getById(req, res) {
        var query = ` Select Deliver.*, Provinces.ProvinceName, Districts.DistrictName, Wards.WardName from
                    ( select Top 1 * from Deliveries where DeliveryId = ${req.params.deliveryId} ) Deliver 
                    Left Join Provinces On Deliver.ProvinceCode = Provinces.ProvinceCode
                    Left Join Districts On Deliver.DistrictCode = Districts.DistrictCode
                    Left Join Wards On Deliver.WardCode = Wards.WardCode`;
        var delivery = {};
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            delivery = result.recordsets[0][0]

        } catch (err) {

        }
        res.json(delivery);
    }

    // Lấy đơn hàng chi tiết dành cho shipper
    async checkByIdStoreCancel(req, res) {
        var query = `select Top 1 * from Deliveries where DeliveryId = ${req.params.deliveryId} `;
        var delivery = {};
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            delivery = result.recordsets[0][0]
        } catch (err) {

        }
        if (delivery.Status === 'Ordered') {
            res.send({ successful: true, message: 'Chưa tiếp nhận!', status: delivery.Status });
        }
        else {
            res.send({ successful: false, message: 'Đã tiếp nhận!', status: delivery.Status });
        }
    }

    // Lấy đơn hàng chi tiết dành cho shipper
    async getByIdShipper(req, res) {

        var query = `Select Temp.*, Provinces.ProvinceName as ProvinceNameStore, Districts.DistrictName as DistrictNameStore, Wards.WardName as WardNameStore
                    from ( Select Delivery.*, Stores.StoreName, Stores.Phone as StorePhone, Stores.AddressDetail as StoreAddress,
                            Stores.ProvinceCode as ProvinceStore, Stores.DistrictCode as DistrictStore, Stores.WardCode as WardStore
                            from ( Select Deliver.*, Provinces.ProvinceName, Districts.DistrictName, Wards.WardName 
                                from ( select Top 1 * from Deliveries where DeliveryId = ${req.params.deliveryId} ) Deliver 
                                    Left Join Provinces On Deliver.ProvinceCode = Provinces.ProvinceCode
                                    Left Join Districts On Deliver.DistrictCode = Districts.DistrictCode
                                    Left Join Wards On Deliver.WardCode = Wards.WardCode ) Delivery
                                Left Join Stores On Stores.StoreId = Delivery.StoreId ) Temp
                    Left Join Provinces On Temp.ProvinceStore = Provinces.ProvinceCode
                    Left Join Districts On Temp.DistrictStore = Districts.DistrictCode
                    Left Join Wards On Temp.WardStore = Wards.WardCode`;

        var delivery = {};
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            delivery = result.recordsets[0][0]
        } catch (err) {

        }
        res.json(delivery);
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
        var query1 = `Select Deliver.*, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                     from ( select * from Deliveries where StoreId = '${req.params.storeId}' and Status = '${req.params.status}' ) Deliver
                     Left Join Provinces 
                     on Deliver.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Deliver.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Deliver.WardCode = Wards.WardCode 
                     Order by Deliver.OrderDate DESC`;
        var deliveries = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            deliveries = result1.recordsets[0];
        } catch (err) {

        }
        res.json(deliveries);
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
        const Reciever = {
            AddressDetail: AddressDetail,
            ProvinceCode: ProvinceCode,
            DistrictCode: DistrictCode,
            WardCode: WardCode,
            GoodSize: GoodSize,
            GoodWeight: GoodWeight,
            ShipType: ShipType,
        }
        const feeship = await getFee(Reciever, StoreId);

        const query = `INSERT INTO Deliveries(StoreId, RecieverPhone, RecieverName, ProvinceCode, DistrictCode, 
                        WardCode, AddressDetail, Picture, COD, ShipType, GoodName, GoodWeight, GoodSize, GoodType, OrderDate, Status, FeeShip)
                        VALUES('${StoreId}', '${RecieverPhone}', N'${RecieverName}', '${ProvinceCode}', '${DistrictCode}', 
                        '${WardCode}', N'${AddressDetail}', '${Picture}', ${COD}, N'${ShipType}', N'${GoodName}', 
                        '${GoodWeight}', '${GoodSize}', N'${GoodType}', getDate(), 'Ordered', ${feeship})`
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

    // Shipper 

    //lấy danh sách các đơn hàng nhanh có trung khu vực của shipper
    async getFastShip(req, res) {
        const staffId = req.params.staffId;
        var query = `select * from Deliveries where Status = 'Ordered' and ShipType = N'Giao hàng nhanh' Order By OrderDate DESC`;
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var query5 = `select DistrictCode from ShipAreas where StaffId = '${staffId}'`;
        var query6 = 'select * from Stores'
        var deliveries, provinces, districts, wards, shipareas, stores = [];
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
            let result5 = await pool.request()
                .query(query5)
            let result6 = await pool.request()
                .query(query6)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
            shipareas = result5.recordsets[0];
            stores = result6.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        const districttemps = [];
        shipareas.forEach(district => {
            districttemps.push(district.DistrictCode);
        })
        function checkDistrict(delivery) {
            return districttemps.includes(delivery.DistrictCode);
        }
        deliveries.filter(checkDistrict);
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

    // lấy danh sách tất cả các đơn hàng tiếu chuẩn đang chờ lấy hàng có trong khu vực đã đăng kí của shipper
    async getStandardShipOrder(req, res) {
        const staffId = req.params.staffId;
        var query = `select * from Deliveries where Status = 'Ordered' and ShipType = N'Giao hàng tiêu chuẩn' Order By OrderDate DESC`;
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var query5 = `select DistrictCode from ShipAreas where StaffId = '${staffId}'`;
        var query6 = 'select * from Stores';
        var deliveries, provinces, districts, wards, shipareas, stores = [];
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
            let result5 = await pool.request()
                .query(query5)
            let result6 = await pool.request()
                .query(query6)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
            shipareas = result5.recordsets[0];
            stores = result6.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        const districttemps = [];
        shipareas.forEach(district => {
            districttemps.push(district.DistrictCode);
        })
        function checkDistrict(delivery) {
            const store = stores.find(item => item.StoreId === delivery.StoreId);
            return districttemps.includes(store.DistrictCode);
        }
        const deliveriesTemp = deliveries.filter(checkDistrict);
        var temp = [];
        if (deliveriesTemp.length === 0) {
            res.json(temp);
        } else {
            deliveriesTemp.map(delivery => {
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

    // lấy danh sách tát cả các đơn hàng đang chờ giao hàng từ kho trong khu vực đã đăng kí của shipper
    async getStandardShipDeliver(req, res) {
        const staffId = req.params.staffId;
        var query = `select * from Deliveries where Status = 'Delivering' and ShipType = N'Giao hàng tiêu chuẩn'`;
        var query2 = `select * from Provinces`;
        var query3 = `select * from Districts`;
        var query4 = `select * from Wards`;
        var query5 = `select DistrictCode from ShipAreas where StaffId = '${staffId}'`;
        var query6 = 'select * from Stores';
        var query7 = `select * from Coordinations where StaffId2 IS NULL and Status = 'da ve kho'`;
        var deliveries, provinces, districts, wards, shipareas, stores, coors = [];
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
            let result5 = await pool.request()
                .query(query5)
            let result6 = await pool.request()
                .query(query6)
            let result7 = await pool.request()
                .query(query7)
            deliveries = result1.recordsets[0];
            provinces = result2.recordsets[0];
            districts = result3.recordsets[0];
            wards = result4.recordsets[0];
            shipareas = result5.recordsets[0];
            stores = result6.recordsets[0];
            coors = result7.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        const districttemps = [];
        shipareas.forEach(district => {
            districttemps.push(district.DistrictCode);
        })
        function checkDistrict(delivery) {
            return districttemps.includes(delivery.DistrictCode);
        }
        const deliveriesTemp1 = deliveries.filter(checkDistrict);
        var temp = [];
        if (deliveriesTemp1.length === 0) {
            res.json(temp);
        } else {
            function checkStatus(delivery) {
                const coor = coors.find(item => item.DeliveryId === delivery.DeliveryId);
                if (coor === undefined) {
                    return false;
                } else {
                    return true;
                }
            }
            const deliveriesTemp2 = deliveriesTemp1.filter(checkStatus);
            if (deliveriesTemp2.length === 0) {
                res.json(temp);
            } else {
                deliveriesTemp2.map(delivery => {
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
    }


    async getStandardShipBack(req, res) {
        const staffId = req.params.staffId;
        var query = `select Deliveries.*, Provinces.ProvinceName, Districts.DistrictName, Wards.WardName from Return_Deliveries 
                    Left Join Deliveries 
                    On Return_Deliveries.DeliveryId = Deliveries.DeliveryId
                    Left Join Provinces 
                    On Provinces.ProvinceCode = Deliveries.ProvinceCode
                    Left Join Districts 
                    On Districts.DistrictCode = Deliveries.DistrictCode
                    Left Join Wards 
                    On Wards.WardCode = Deliveries.WardCode
                    where Return_Deliveries.Status = 'da ve kho'`;
        var query2 = `select DistrictCode from ShipAreas where StaffId = '${staffId}'`;
        var query3 = `select Stores.StoreId, Stores.DistrictCode as StoreDistrictCode, Stores.StoreName, Stores.Phone as StorePhone, Stores.AddressDetail as StoreAddress, 
                    Provinces.ProvinceName as ProvinceNameStore, Districts.DistrictName as DistrictNameStore, Wards.WardName as WardNameStore
                    from Stores
                    Left Join Provinces 
                    On Provinces.ProvinceCode = Stores.ProvinceCode
                    Left Join Districts 
                    On Districts.DistrictCode = Stores.DistrictCode
                    Left Join Wards 
                    On Wards.WardCode = Stores.WardCode`;
        var deliveries, shipareas, stores = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            deliveries = result1.recordsets[0];
            shipareas = result2.recordsets[0];
            stores = result3.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        const districttemps = [];
        shipareas.forEach(district => {
            districttemps.push(district.DistrictCode);
        })
        function checkDistrict(delivery) {
            const store = stores.find(item => item.StoreId === delivery.StoreId);
            return districttemps.includes(store.StoreDistrictCode);
        }
        const deliveriesTemp1 = deliveries.filter(checkDistrict);
        if (deliveriesTemp1.length === 0) {
            res.json([]);
        } else {
            const temp = [];
            deliveriesTemp1.map(delivery => {
                const StoreCurrent = stores.find(store => store.StoreId === delivery.StoreId);
                const item = {
                    ...delivery,
                    ...StoreCurrent
                }
                temp.push(item);
            })
            res.json(temp);
        }
    }

}

module.exports = new DeliveryController();