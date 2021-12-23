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
    var query5 = 'select * from Configs where StartDate <= getDate() and EndDate IS NULL';
    var query6 = 'select * from GoodSizes where StartDate <= getDate() and EndDate IS NULL';
    var query7 = 'select * from GoodWeights where StartDate <= getDate() and EndDate IS NULL';

    var Store = {};
    var Ward = {};
    var District = {};
    var Province = {};
    var configs = [];
    var sizes = [];
    var weights = [];
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request().query(query)
        let result2 = await pool.request().query(query2)
        let result3 = await pool.request().query(query3)
        let result4 = await pool.request().query(query4)
        let result5 = await pool.request().query(query5)
        let result6 = await pool.request().query(query6)
        let result7 = await pool.request().query(query7)
        Store = result1.recordsets[0][0];
        Ward = result2.recordsets[0][0];
        District = result3.recordsets[0][0];
        Province = result4.recordsets[0][0];
        configs = result5.recordsets[0];
        sizes = result6.recordsets[0];
        weights = result7.recordsets[0];
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
    if (distance <= configs[1].ConfigId) {
        feeDistance += configs[1].Money;
    } else if (distance <= configs[2].ConfigId) {
        feeDistance += configs[2].Money;
    } else if (distance <= configs[3].ConfigId) {
        feeDistance += configs[3].Money;
    } else {
        feeDistance += configs[4].Money;
    }

    var feeSize = 10;
    const size = sizes.find(item => parseInt(item.Id) === parseInt(Reciever.GoodSize));
    if (size !== undefined) {
        feeSize = size.Money;
    }

    var feeWeight = 10;
    const weight = weights.find(item => parseInt(item.Id) === parseInt(Reciever.GoodWeight));
    if (weight !== undefined) {
        feeWeight = weight.Money;
    }

    var feeShip = 0;
    if (Reciever.ShipType === 'Giao hàng nhanh') {
        feeShip = feeShip + feeDistance + feeSize + feeWeight + configs[0].Money;
    } else {
        feeShip = feeShip + feeDistance + feeSize + feeWeight;
    }
    return feeShip * 1000;

}

module.exports = getFeeShip;