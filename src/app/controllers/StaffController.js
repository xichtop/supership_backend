var sql = require("mssql");
var async = require('async');
var config = require("../config/config");
const jwt = require('jsonwebtoken');

class StaffController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Staffs`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async login(req, res) {
        var { username, password } = req.body;
        console.log(username, password);
        // const newPass = md5(password);
        var query = `select * from Accounts where Username = '${username}' and Password = '${password}' and Role = 'Manager'`;
        var query2 = `select * from Staffs where Username = '${username}' and Status != 'Locked'`;
        var resultData1, resultData2 = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            let result2 = await pool.request()
                .query(query2)
            resultData1 = result1.recordsets[0]
            resultData2 = result2.recordsets[0]
        } catch (err) {

        }
        console.log(resultData1, resultData2)
        if (resultData1.length === 0) {
            res.json({ successful: false, message: 'Tài khoản hoặc Mật khẩu không đúng!' });
        }
        else {
            if (resultData2.length === 0) {
                res.json({ successful: false, message: 'Tài khoản của bạn đã bị khóa!' });
            }
            else {
                const staff = resultData2[0];
                const accessToken = jwt.sign({ Username: username }, "flashship")
                res.json({
                    successful: true,
                    message: 'Đăng nhập thành công!',
                    accessToken, staff
                })
            }
        }
    }

    async wareLogin(req, res) {
        var { username, password } = req.body;
        console.log(username, password);
        // const newPass = md5(password);
        var query = `select * from Accounts where Username = '${username}' and Password = '${password}' and Role = 'Ware'`;
        var query2 = `select * from Staffs where Username = '${username}' and Status != 'Locked'`;
        var resultData1, resultData2 = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query)
            let result2 = await pool.request()
                .query(query2)
            resultData1 = result1.recordsets[0]
            resultData2 = result2.recordsets[0]
        } catch (err) {

        }
        console.log(resultData1, resultData2)
        if (resultData1.length === 0) {
            res.json({ successful: false, message: 'Tài khoản hoặc Mật khẩu không đúng!' });
        }
        else {
            if (resultData2.length === 0) {
                res.json({ successful: false, message: 'Tài khoản của bạn đã bị khóa!' });
            }
            else {
                const staff = resultData2[0];
                const accessToken = jwt.sign({ Username: username }, "flashship")
                res.json({
                    successful: true,
                    message: 'Đăng nhập thành công!',
                    accessToken, staff
                })
            }
        }
    }
}

module.exports = new StaffController();