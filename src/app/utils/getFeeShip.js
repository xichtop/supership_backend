var sql = require("mssql");
var config = require("../config/config");
var axios = require("axios");

const getFeeShip = async (Reciever, StoreId) => {
    var query = `select Stores.*, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName 
                     From Stores
                     Left Join Provinces 
                     on Stores.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Stores.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Stores.WardCode = Wards.WardCode
                     Where StoreId = '${StoreId}'`;
    var query2 = `select * from Wards where WardCode = '${Reciever.WardCode}'`;
    var query3 = `select * from Districts where DistrictCode = '${Reciever.DistrictCode}'`;
    var query4 = `select * from Provinces where ProvinceCode = '${Reciever.ProvinceCode}'`;

    var Store = {};
    var Ward = {};
    var District = {};
    var Province = {};
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request().query(query)
        let result2 = await pool.request().query(query2)
        let result3 = await pool.request().query(query3)
        let result4 = await pool.request().query(query4)
        Store = result1.recordsets[0][0];
        Ward = result2.recordsets[0][0];
        District = result3.recordsets[0][0];
        Province = result4.recordsets[0][0];
    } catch (err) {

    }

    const addressFirst = `${Store.AddressDetail} ${Store.WardName} ${Store.DistrictName} ${Store.ProvinceName}`;
    const addressSecond = `${Reciever.AddressDetail} ${Ward.WardName} ${District.DistrictName} ${Province.ProvinceName}`;

    const getDistance = async () => {
        const data = {
            addressFirst: addressFirst,
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
    if (distance <= 5) {
        feeDistance += 10;
    } else if (distance <= 10) {
        feeDistance += 20;
    } else if (distance <= 25) {
        feeDistance += 25;
    } else if (distance <= 100) {
        feeDistance += 30;
    } else {
        feeDistance += 35;
    }

    var feeSize = 0;
    if (Reciever.GoodSize === 'M') {
        feeSize += 10;
    } else if (Reciever.GoodSize === 'L') {
        feeSize += 15;
    } else if (Reciever.GoodSize === 'XL') {
        feeSize += 20;
    } else if (Reciever.GoodSize === 'S') {
        feeSize += 5;
    }

    var feeWeight = 0;
    if (Reciever.GoodWeight === 'M') {
        feeWeight += 10;
    } else if (Reciever.GoodWeight === 'L') {
        feeWeight += 15;
    } else if (Reciever.GoodWeight === 'XL') {
        feeWeight += 20;
    } else if (Reciever.GoodWeight === 'S') {
        feeWeight += 5;
    }

    var feeShip = 0;

    if (Reciever.ShipType === 'Giao hàng nhanh') {
        feeShip = feeShip + feeDistance + feeSize + feeWeight + 10;
    } else {
        feeShip = feeShip + feeDistance + feeSize + feeWeight;
    }
    return feeShip * 1000;

}

module.exports = getFeeShip;