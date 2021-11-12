var sql = require("mssql");
var config = require("../config/config");

class ShipAreaController {
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

    async getByStaff(req, res) {
        const staffId = req.params.staffId;
        var query = `select Districts.* from
                    ( select * from ShipAreas where StaffId = '${staffId}' ) Ships
                    left join Districts on Districts.DistrictCode = Ships.DistrictCode`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
    
        }
    }

    
}

module.exports = new ShipAreaController();