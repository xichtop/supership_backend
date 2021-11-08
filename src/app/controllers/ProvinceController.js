var sql = require("mssql");
var config = require("../config/config");

class ProvinceController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Provinces`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
    
        }
    }
}

module.exports = new ProvinceController();