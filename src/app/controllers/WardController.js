var sql = require("mssql");
var config = require("../config/config");

class WardController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Wards`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async getByDistrict(req, res) {
        var query = `select Wards.WardCode, Wards.WardName from
                    (select * from DistrictWards where DistrictWards.DistrictCode = '${req.params.districtid}') as P 
                    left join Wards on P.WardCode = Wards.WardCode`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }
}

module.exports = new WardController();