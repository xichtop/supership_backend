const storesRouter = require('./stores');
const staffsRouter = require('./staffs');
const deliveriesRouter = require('./deliveries');
const provincesRouter = require('./provinces');
const districtsRouter = require('./districts');
const wardsRouter = require('./wards');
const paymentsRouter = require('./payments');

function route(app) {
    app.use('/stores/', storesRouter);
    app.use('/staffs/', staffsRouter);
    app.use('/deliveries/', deliveriesRouter);
    app.use('/wards/', wardsRouter);
    app.use('/districts/', districtsRouter);
    app.use('/provinces/', provincesRouter);
    app.use('/payments/', paymentsRouter);
}

module.exports = route;