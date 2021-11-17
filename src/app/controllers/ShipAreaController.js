var sql = require("mssql");
var async = require('async');
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
            console.error(err);
        }
    }

    async removeItem(req, res) {
        const { StaffId, DistrictCode} = req.body;
        const query = `Delete From ShipAreas Where StaffId = '${StaffId}' and DistrictCode = '${DistrictCode}'`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            console.log(result);
            if (result.rowsAffected[0] === 1) {
                res.json({ successful: true, message: "Thành công!" });
            } else {
                res.json({ successful: false, message: "Đã xảy ra lỗi!" });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async addItem(req, res) {
        const { StaffId, districts } = req.body;
        console.log(req.body)
        var listQuery = [];
        districts.forEach(district => {
            const query = `Insert Into ShipAreas(StaffId, DistrictCode) Values('${StaffId}', '${district[0]}')`;
            listQuery.push(query);
        })
        
        const pool = new sql.ConnectionPool(config)
        pool.connect(err => {
            if (err) console.log(err)
            const transaction = new sql.Transaction(pool)
            const request = new sql.Request(transaction)
            transaction.begin(err => {
                if (err) return console.log(err)
                async.eachSeries(listQuery, function (query, callback) {
                    request.query(query, (err, result) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback()
                        }
                    })
                }, function (err) {
                    if (err) {
                        transaction.rollback()
                        res.json({ successful: false, message: "Đã xảy ra lỗi!" });
                        console.log(err)
                    } else {
                        console.log('success!')
                        // const subject = 'Tạo tài khoản thành công!';
                        // const body = "Đơn hàng của bạn đã được tiếp nhận.";
                        // SendMail(email, subject, body);
                        res.json({ successful: true, message: "Thành công!" });
                        transaction.commit()
                    }
                })
            })
        })

    }

    
}

module.exports = new ShipAreaController();