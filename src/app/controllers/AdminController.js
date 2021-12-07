var sql = require("mssql");
var config = require("../config/config");


class AdminController {
    // [GET] /new
    async statistic(req, res) {

        const { FirstDate, LastDate } = req.body;

        var query1 = `select Count(*) as Count from Deliveries Where Status = 'Delivered' 
                    and OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'`;
        var query2 = `select Count(*) as Count from Deliveries Where Status = 'Returned'
                    and OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'`;
        var query3 = `select Sum(FeeShip) as FeeShip from Deliveries Where ( Status = 'Delivered' Or Status = 'Returned')
                    and OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'`;
        var query4 = `select Sum(COD) as COD from Deliveries Where Status = 'Delivered'
                    and OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'`;
        var query5 = `select Status, Count(*) as Quantity from Deliveries 
                    Where OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'
                    Group By Status`;
        var query6 = `select OrderDate, Sum(FeeShip) as Fee, sum(COD) as COD from Deliveries 
                    Where OrderDate <= '${LastDate}' and OrderDate >= '${FirstDate}'
                    Group By OrderDate`;
        var delivery, returned, fee, cod, deliveries, fees = {};
        try {
            let pool = await sql.connect(config)
            let result1 = await pool.request()
                .query(query1)
            let result2 = await pool.request()
                .query(query2)
            let result3 = await pool.request()
                .query(query3)
            let result4 = await pool.request()
                .query(query4)
            let result5 = await pool.request()
                .query(query5)
            let result6 = await pool.request()
                .query(query6)
            delivery = result1.recordsets[0];
            returned = result2.recordsets[0];
            fee = result3.recordsets[0];
            cod = result4.recordsets[0];
            deliveries = result5.recordsets[0];
            fees = result6.recordsets[0];
        } catch (err) {

        }
        const temp = [];

        for (let i = 0; i < fees.length; i++) {
            let dem = 0;
            for (let j = i; j < fees.length; j++) {
                if (fees[i].OrderDate.toString().slice(4, 10) === fees[j].OrderDate.toString().slice(4, 10)) {
                    dem++;
                }
            }

            if (dem === 1) {
                temp.push(fees[i].OrderDate.toString().slice(4, 10));
            }
        }


        const temp1 = [];
        temp.forEach( item => {
            let cod = 0;
            let feeship = 0;
            fees.forEach( fee => {
                if (fee.OrderDate.toString().slice(4, 10) === item) {
                    cod += parseInt(fee.COD);
                    feeship += parseInt(fee.Fee);
                }
            })
            temp1.push({
                OrderDate: item,
                COD: cod,
                Fee: feeship,
            });
        })

        res.json({
            delivery: delivery[0].Count,
            returned: returned[0].Count,
            fee: fee[0].FeeShip,
            cod: cod[0].COD,
            deliveries: deliveries,
            fees: temp1
        })
    }

}

module.exports = new AdminController();