var sql = require("mssql");
var async = require('async');
var config = require("../config/config");

class ReturnController {

    // Xác nhận không nhận hàng shipper
    async confirmNotRecieve(req, res) {
        const { DeliveryId, Reason, Status } = req.body;
        var listQuery = [];
        var query1 = '';
        if (Status === 'Fast') {
            query1 = `Insert Into Return_Deliveries (DeliveryId, Reason, Status) Values ( '${DeliveryId}', N'${Reason}', 'Dang tra hang')`;
        } else {
            query1 = `Insert Into Return_Deliveries (DeliveryId, Reason, Status, WareHouseId) Values ( '${DeliveryId}', N'${Reason}', 'Dang ve kho', 'NK001')`;
        }
        const query2 = `Update Deliveries Set Status = 'Returning' Where DeliveryId = '${DeliveryId}'`;
        const query3 = `Update Coordinations Set Status = 'Dang tra hang' Where DeliveryId = '${DeliveryId}'`;

        listQuery.push(query1);
        listQuery.push(query2);
        listQuery.push(query3);

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
                        res.json({ successful: true, message: "Thành công!" });
                        transaction.commit()
                    }
                })
            })
        })
    }

    // Shipper xác nhận đã trả hàng
    async confirmReturned(req, res) {
        const { DeliveryId } = req.body;
        var listQuery = [];
        
        const query1 = `Update Deliveries Set Status = 'Returned' Where DeliveryId = '${DeliveryId}'`;
        const query2 = `Update Return_Deliveries Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;
        const query3 = `Update Coordinations Set Status = 'Da tra hang' Where DeliveryId = '${DeliveryId}'`;

        listQuery.push(query1);
        listQuery.push(query2);
        listQuery.push(query3);

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
                        res.json({ successful: true, message: "Thành công!" });
                        transaction.commit()
                    }
                })
            })
        })
    }
}

module.exports = new ReturnController();