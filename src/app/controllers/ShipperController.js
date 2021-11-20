var sql = require("mssql");
var async = require('async');
var config = require("../config/config");
const jwt = require('jsonwebtoken');
var md5 = require('md5');

class ShipperController {
    // [GET] /new

    //admin get all shippers
    async index(req, res) {
        var query = `Select Staffs.*, Banks.BankBranch, Banks.BankName, Identities.Fullname, Identities.BirthDay, Identities.Sex, Identities.GetDate
                     from Staffs
                     Left Join Banks 
                     on Staffs.AccountBank = Banks.AccountBank
                     Left Join Identities 
                     on Staffs.IdentityId = Identities.IdentityId
                     Where Staffs.Role = 'Shipper'`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
            console.error(err);
        }
    }

    //admin update status
    async updateStatus (req, res) {
        const { newStatus, StaffId } = req.body;
        const query = `Update Staffs Set Status = '${newStatus}' Where StaffId = '${StaffId}'`;
        console.log(req.body)
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
            res.send({ successful: true, message: 'Cập nhật nhân viên thành công!', status: status });
        }
        else {
            res.send({ successful: false, message: 'Cập nhật nhân viên thất bại!', status: status });
        }
    }

    // async check(req, res) {
    //     var query = `select * from Accounts where Username = '${req.params.username}'`;
    //     try {
    //         let pool = await sql.connect(config)
    //         let result = await pool.request()
    //             .query(query)
    //         res.json(result.recordsets[0]);
    //     } catch (err) {

    //     }
    // }

    async login(req, res) {
        var { username, password } = req.body;
        console.log(username, password);
        // const newPass = md5(password);
        var query = `select * from Accounts where Username = '${username}' and Password = '${password}' and Role = 'Shipper'`;
        var query2 = `select * from Staffs where Username = '${username}' and Status != 'Off'`;
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
            console.log(err)
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
                const shipper = resultData2[0];
                const accessToken = jwt.sign({ Username: username }, "flashship")
                res.json({
                    successful: true,
                    message: 'Đăng nhập thành công!',
                    accessToken, shipper
                })
            }
        }
    }

    // async addItem(req, res) {
    //     const { store, bank, identity } = req.body;
    //     // console.log('bank', bank);
    //     // console.log('store', store);
    //     // console.log('identity', identity);
    //     var queryTop = `select top(1) StoreId from Stores order by StoreId DESC`;
    //     var StoreId = '';
    //     try {
    //         let pool = await sql.connect(config)
    //         let result = await pool.request()
    //             .query(queryTop)
    //         StoreId = result.recordsets[0][0].StoreId;
    //         sql.close();
    //     } catch (err) {
    //     }
    //     var index = parseInt(StoreId.slice(2)) + 1;
    //     var newStoreId = '';
    //     if (index < 10) {
    //         newStoreId = `CH00${index}`
    //     } else if (index < 99) {
    //         newStoreId = `CH0${index}`
    //     } else {
    //         newStoreId = `CH${index}`
    //     }

    //     // ktra trùng cccd
    //     var queryAccount = `select * from Identities where IdentityId = '${identity.IdentityId}'`;
    //     var identitytemp = [];
    //     try {
    //         let pool = await sql.connect(config)
    //         let result = await pool.request()
    //             .query(queryAccount)
    //         identitytemp = result.recordsets[0];
    //         sql.close();
    //     } catch (err) {
    //     }

    //     // ktra trùng bank
    //     var queryBank = `select * from Banks where AccountBank = '${bank.AccountBank}'`;
    //     var banktemp = [];
    //     try {
    //         let pool = await sql.connect(config)
    //         let result = await pool.request()
    //             .query(queryBank)
    //         banktemp = result.recordsets[0];
    //         sql.close();
    //     } catch (err) {
    //     }


    //     var accountQuery = `Insert into Accounts(Username, Password, Role) Values('${store.Username}', '${store.Password}', 'Store')`;
    //     var bankQuery = `INSERT INTO Banks(AccountBank, FullName, BankName, BankBranch)
    //                      Values('${bank.AccountBank}', N'${bank.Fullname}', N'${bank.BankName}', '${bank.BankBranch}')`
    //     var identityQuery = `Insert into Identities (IdentityId, Fullname, BirthDay, Sex, Address, GetDate)
    //                          Values('${identity.IdentityId}', N'${identity.Fullname}', '${identity.Birthday}', '${identity.Sex}', N'${identity.Address}', '${identity.GetDate}')`;
    //     var storeQuery = `Insert into Stores (StoreId, Email, Username, StoreName, Phone, AccountBank, ProvinceCode, DistrictCode, WardCode, AddressDetail, Picture, Status, IdentityId)
    //                       VALUES('${newStoreId}', '${store.Email}', '${store.Username}', N'${store.StoreName}', '${store.Phone}', '${bank.AccountBank}', '${store.ProvinceCode}', '${store.DistrictCode}','${store.WardCode}', 
    //                       N'${store.AddressDetail}', '${store.Picture}', 'Vertified', '${identity.IdentityId}')`;

    //     var listQuery = [];
    //     listQuery.push(accountQuery);
    //     if (banktemp.length === 0) {
    //         listQuery.push(bankQuery);
    //     }
    //     if (identitytemp.length === 0) {
    //         listQuery.push(identityQuery);
    //     }
    //     listQuery.push(storeQuery);
    //     const pool = new sql.ConnectionPool(config)
    //     pool.connect(err => {
    //         if (err) console.log(err)
    //         const transaction = new sql.Transaction(pool)
    //         const request = new sql.Request(transaction)
    //         transaction.begin(err => {
    //             if (err) return console.log(err)
    //             async.eachSeries(listQuery, function (query, callback) {
    //                 request.query(query, (err, result) => {
    //                     if (err) {
    //                         callback(err)
    //                     } else {
    //                         callback()
    //                     }
    //                 })
    //             }, function (err) {
    //                 if (err) {
    //                     transaction.rollback()
    //                     res.json({ successful: false, message: "Đã xảy ra lỗi!" });
    //                     console.log(err)
    //                 } else {
    //                     console.log('success!')
    //                     // const subject = 'Tạo tài khoản thành công!';
    //                     // const body = "Đơn hàng của bạn đã được tiếp nhận.";
    //                     // SendMail(email, subject, body);
    //                     res.json({ successful: true, message: "Thành công!" });
    //                     transaction.commit()
    //                 }
    //             })
    //         })
    //     })

    // }
}

module.exports = new ShipperController();