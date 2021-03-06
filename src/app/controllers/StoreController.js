var sql = require("mssql");
var async = require('async');
var config = require("../config/config");
const jwt = require('jsonwebtoken');
var md5 = require('md5');

class StoreController {
    // [GET] /new

    //admin get all strores
    async index(req, res) {
        var query = `Select Stores.*, Banks.BankBranch, Banks.BankName, Wards.WardName, Districts.DistrictName, Provinces.ProvinceName, Identities.Fullname, Identities.BirthDay, Identities.Sex, Identities.GetDate
                     from Stores
                     Left Join Banks 
                     on Stores.AccountBank = Banks.AccountBank
                     Left Join Identities 
                     on Stores.IdentityId = Identities.IdentityId
                     Left Join Provinces 
                     on Stores.ProvinceCode = Provinces.ProvinceCode
                     Left Join Districts 
                     on Stores.DistrictCode = Districts.DistrictCode
                     Left Join Wards 
                     on Stores.WardCode = Wards.WardCode`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
            console.error(err);
        }
    }

    async getSizes(req, res) {
        var query = `Select * from GoodSizes`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
            console.error(err);
        }
    }

    async getWeights(req, res) {
        var query = `Select * from GoodWeights`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {
            console.error(err);
        }
    }

    async check(req, res) {
        var query = `select * from Accounts where Username = '${req.params.username}'`;
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
        const { newStatus, StoreId } = req.body;
        const query = `Update Stores Set Status = '${newStatus}' Where StoreId = '${StoreId}'`;
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
            res.send({ successful: true, message: 'C???p nh???t c???a h??ng th??nh c??ng!', status: status });
        }
        else {
            res.send({ successful: false, message: 'C???p nh???t c???a h??ng th???t b???i!', status: status });
        }
    }

    async login(req, res) {
        var { username, password } = req.body;
        console.log(username, password);
        // const newPass = md5(password);
        var query = `select * from Accounts where Username = '${username}' and Password = '${password}' and Role = 'Store'`;
        var query2 = `select * from Stores where Username = '${username}' and Status != 'Off'`;
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
            res.json({ successful: false, message: 'T??i kho???n ho???c M???t kh???u kh??ng ????ng!' });
        }
        else {
            if (resultData2.length === 0) {
                res.json({ successful: false, message: 'T??i kho???n c???a b???n ???? b??? kh??a!' });
            }
            else {
                const store = resultData2[0];
                const accessToken = jwt.sign({ Username: username }, "flashship")
                res.json({
                    successful: true,
                    message: '????ng nh???p th??nh c??ng!',
                    accessToken, store
                })
            }
        }
    }

    async addItem(req, res) {
        const { store, bank, identity } = req.body;
        var queryTop = `select top(1) StoreId from Stores order by StoreId DESC`;
        var StoreId = '';
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(queryTop)
            StoreId = result.recordsets[0][0].StoreId;
            sql.close();
        } catch (err) {
        }
        var index = parseInt(StoreId.slice(2)) + 1;
        var newStoreId = '';
        if (index < 10) {
            newStoreId = `CH00${index}`
        } else if (index < 99) {
            newStoreId = `CH0${index}`
        } else {
            newStoreId = `CH${index}`
        }

        // ktra tr??ng cccd
        var queryAccount = `select * from Identities where IdentityId = '${identity.IdentityId}'`;
        var identitytemp = [];
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(queryAccount)
            identitytemp = result.recordsets[0];
            sql.close();
        } catch (err) {
        }

        // ktra tr??ng bank
        var queryBank = `select * from Banks where AccountBank = '${bank.AccountBank}'`;
        var banktemp = [];
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(queryBank)
            banktemp = result.recordsets[0];
            sql.close();
        } catch (err) {
        }


        var accountQuery = `Insert into Accounts(Username, Password, Role) Values('${store.Username}', '${store.Password}', 'Store')`;
        var bankQuery = `INSERT INTO Banks(AccountBank, FullName, BankName, BankBranch)
                         Values('${bank.AccountBank}', N'${bank.Fullname}', N'${bank.BankName}', '${bank.BankBranch}')`
        var identityQuery = `Insert into Identities (IdentityId, Fullname, BirthDay, Sex, Address, GetDate)
                             Values('${identity.IdentityId}', N'${identity.Fullname}', '${identity.Birthday}', '${identity.Sex}', N'${identity.Address}', '${identity.GetDate}')`;
        var storeQuery = `Insert into Stores (StoreId, Email, Username, StoreName, Phone, AccountBank, ProvinceCode, DistrictCode, WardCode, AddressDetail, Picture, Status, IdentityId)
                          VALUES('${newStoreId}', '${store.Email}', '${store.Username}', N'${store.StoreName}', '${store.Phone}', '${bank.AccountBank}', '${store.ProvinceCode}', '${store.DistrictCode}','${store.WardCode}', 
                          N'${store.AddressDetail}', '${store.Picture}', 'Vertified', '${identity.IdentityId}')`;

        var listQuery = [];
        listQuery.push(accountQuery);
        if (banktemp.length === 0) {
            listQuery.push(bankQuery);
        }
        if (identitytemp.length === 0) {
            listQuery.push(identityQuery);
        }
        listQuery.push(storeQuery);
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
                        res.json({ successful: false, message: "???? x???y ra l???i!" });
                        console.log(err)
                    } else {
                        console.log('success!')
                        // const subject = 'T???o t??i kho???n th??nh c??ng!';
                        // const body = "????n h??ng c???a b???n ???? ???????c ti???p nh???n.";
                        // SendMail(email, subject, body);
                        res.json({ successful: true, message: "Th??nh c??ng!" });
                        transaction.commit()
                    }
                })
            })
        })

    }
}

module.exports = new StoreController();