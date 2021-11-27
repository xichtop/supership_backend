var sql = require("mssql");
var config = require("../config/config");
var axios = require("axios");

const getFeeShip = async (DeliveryId, StoreId) => {
    var query = `select Deliveries.*, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                     From Deliveries
                     Left Join Provinces 
                     on Deliveries.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Deliveries.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Deliveries.WardCode = Wards.WardCode
                     Where DeliveryId = '${DeliveryId}'`;
    var query2 = `select Stores.*, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                     From Stores
                     Left Join Provinces 
                     on Stores.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Stores.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Stores.WardCode = Wards.WardCode
                     Where StoreId = '${StoreId}'`;

    var Store = {};
    var Delivery = {};
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request().query(query)
        let result2 = await pool.request().query(query2)
        Delivery = result1.recordsets[0][0];
        Store = result2.recordsets[0][0];
    } catch (err) {

    }

    const addressFirst = `${Delivery.AddressDetail} ${Delivery.WardName} ${Delivery.DistrictName} ${Delivery.ProvinceName}`;
    const addressSecond = `${Store.AddressDetail} ${Store.WardName} ${Store.DistrictName} ${Store.ProvinceName}`;

    const getDistance = async () => {
        const data = {
            addressFirst : addressFirst,
            addressSecond: addressSecond
        }
        try {
            return await axios.post('https://bing-map-api.herokuapp.com/bingmap/distance', data)
        } catch (error) {
            console.error(error)
        }
    }

    const distanceOBJ = await getDistance();
    const distance = distanceOBJ.data.travelDistance;

    var feeDistance = 0;
    if ( distance <= 5) {
        feeDistance += 10;
    } else if (distance <= 10 ) {
        feeDistance += 20;
    } else if (distance <= 25 ) {
        feeDistance += 25;
    } else if (distance <= 100) {
        feeDistance += 30;
    } else {
        feeDistance += 35;
    }

    var feeSize = 0;
    if (Delivery.GoodSize === 'M') {
        feeSize += 5;
    } else if (Delivery.GoodSize === 'L') {
        feeSize += 10;
    } else if (Delivery.GoodSize === 'XL') {
        feeSize += 15;
    }

    var feeWeight = 0;
    if (Delivery.GoodWeight === 'M') {
        feeWeight += 5;
    } else if (Delivery.GoodWeight === 'L') {
        feeWeight += 10;
    } else if (Delivery.GoodWeight === 'XL') {
        feeWeight += 15;
    }

    var feeShip = 0;

    if (Delivery.ShipType === 'Giao hàng nhanh') {
        feeShip = feeShip + feeDistance + feeSize + feeWeight + 10;
    } else {
        feeShip = feeShip + feeDistance + feeSize + feeWeight;
    }
    return feeShip;

}

module.exports = getFeeShip;