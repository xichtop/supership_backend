var sql = require("mssql");
var config = require("../config/config");


class AdminController {
    // [GET] /new
    async statistic(req, res) {

        const { FirstDate, LastDate } = req.body;
        var query1 = `select Count(*) as Count from Deliveries Where Status = 'Delivered' 
                    and OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}'`;
        var query2 = `select Count(*) as Count from Deliveries Where Status = 'Returned'
                    and OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}'`;
        var query3 = `select Sum(FeeShip) as FeeShip from Deliveries Where ( Status = 'Delivered' Or Status = 'Returned')
                    and OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}'`;
        var query4 = `select Sum(COD) as COD from Deliveries Where Status = 'Delivered'
                    and OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}'`;
        var query5 = `select Status, Count(*) as Quantity from Deliveries 
                    Where OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}'
                    Group By Status`;
        var query6 = `select OrderDate, FeeShip as Fee, COD, Status from Deliveries 
                    Where OrderDate <= '${LastDate.slice(0, 10)}' and OrderDate >= '${FirstDate.slice(0, 10)}' and ( Status = 'Delivered' Or Status = 'Returned')`;
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
                if (fees[i].OrderDate.toISOString().slice(0, 10) === fees[j].OrderDate.toISOString().slice(0, 10)) {
                    dem++;
                }
            }

            if (dem === 1) {
                temp.push(fees[i].OrderDate.toISOString().slice(0, 10));
            }
        }


        const temp1 = [];
        temp.forEach( item => {
            let cod = 0;
            let feeship = 0;
            fees.forEach( fee => {
                if (fee.OrderDate.toISOString().slice(0, 10) === item) {
                    if (fee.Status === 'Delivered') {
                         cod += parseInt(fee.COD);
                        feeship += parseInt(fee.Fee);
                    } else {
                        feeship += parseInt(fee.Fee);
                    }
                } 
            })
            const splits = item.split('-');
            var date = '';
            for (let i = splits.length - 1; i >= 1; i--) {
                date += splits[i] + '/';
            }
            date += splits[0];
            temp1.push({
                OrderDate: date,
                COD: cod,
                Fee: feeship,
            });
        })

        res.json({
            delivery: delivery[0].Count === 0 ? 0 : delivery[0].Count,
            returned: returned[0].Count  === 0 ? 0 : returned[0].Count,
            fee: fee[0].FeeShip  === null ? 0 : fee[0].FeeShip,
            cod: cod[0].COD  === null ? 0 : cod[0].COD,
            deliveries: deliveries,
            fees: temp1
        })
    }

}

module.exports = new AdminController();