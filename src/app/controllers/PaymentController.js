var sql = require("mssql");
var config = require("../config/config");

class PaymentController {
    // [GET] /new
    async index(req, res) {
        var query = `select * from Payments`;
        try {
            let pool = await sql.connect(config)
            let result = await pool.request()
                .query(query)
            res.json(result.recordsets[0]);
        } catch (err) {

        }
    }

    async statistic(req, res) {
        const { FirstDate, LastDate, StoreId } = req.body;
        console.log(req.body)
        var query1 = `select * from Deliveries where OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}' and StoreId = '${StoreId}' and Status = 'Delivered'`;
        var query2 = `select * from Payments`;
        var deliveries = [];
        var payments = [];
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            console.log(result1, 'result1');
            let result2 = await pool.request()
                .query(query2)
            deliveries = result1.recordsets[0];
            payments = result2.recordsets[0];
        } catch (err) {
            console.log(err);
        }
        let temp = [];
        console.log(payments);
        console.log(deliveries);
        deliveries.forEach(delivery => {
            if (parseInt(delivery.COD) === 0) {
                temp.push({
                    DeliveryId: delivery.DeliveryId,
                    Phone: delivery.RecieverPhone,
                    OrderDate: delivery.OrderDate,
                    COD: delivery.COD,
                    Status: 'Đã thanh toán'
                })
            } else {
                const index = payments.findIndex(pay => pay.DeliveryId === delivery.DeliveryId);
                console.log(index);
                if (index !== -1 && payments[index].StaffId2 !== '') {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        Phone: delivery.RecieverPhone,
                        OrderDate: delivery.OrderDate,
                        COD: delivery.COD,
                        Status: 'Đã thanh toán'
                    })
                    // temp.push([delivery.DeliveryId, delivery.RecieverPhone, delivery.OrderDate, delivery.COD, 'Đã thanh toán'])
                } else {
                    temp.push({
                        DeliveryId: delivery.DeliveryId,
                        Phone: delivery.RecieverPhone,
                        OrderDate: delivery.OrderDate,
                        COD: delivery.COD,
                        Status: 'Chưa thanh toán'
                    })
                    // temp.push([delivery.DeliveryId, delivery.RecieverPhone, delivery.OrderDate, delivery.COD, 'Chưa thanh toán'])
                }
            }
        })
        res.json(temp);
    }
}

module.exports = new PaymentController();