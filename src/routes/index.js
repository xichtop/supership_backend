const storesRouter = require('./stores');
const shipperRouter = require('./shippers');
const staffsRouter = require('./staffs');
const deliveriesRouter = require('./deliveries');
const provincesRouter = require('./provinces');
const districtsRouter = require('./districts');
const wardsRouter = require('./wards');
const paymentsRouter = require('./payments');
const coordinationRouter = require('./coordinations');

function route(app) {
    app.use('/stores/', storesRouter);
    app.use('/shippers/', shipperRouter);
    app.use('/staffs/', staffsRouter);
    app.use('/deliveries/', deliveriesRouter);
    app.use('/wards/', wardsRouter);
    app.use('/districts/', districtsRouter);
    app.use('/provinces/', provincesRouter);
    app.use('/coordinations/', coordinationRouter);
    app.use('/payments/', paymentsRouter);
}

module.exports = route;