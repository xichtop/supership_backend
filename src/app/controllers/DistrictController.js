var sql = require("mssql");
var config = require("../config/config");

class DistrictController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Districts`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
    
        }
    }

    async getByProvince(req, res) {
        var query = `select Districts.DistrictCode, DistrictName from
                    (select * from ProvinceDistricts where ProvinceDistricts.ProvinceCode = '${req.params.provinceid}') as P
                    left join Districts on P.DistrictCode = Districts.DistrictCode`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
    
        }
    }
}

module.exports = new DistrictController();