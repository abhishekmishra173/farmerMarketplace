const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// For normal JSON routes
app.use(express.json({ limit: '1mb' }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: false
}));

app.use(morgan('dev'));

// Razorpay webhook requires raw body for signature verification
app.use('/api/payments/webhook',
  bodyParser.raw({ type: '*/*' })
);

// Routes (JSON parser for others)
const productsRouter = require('./routes/products.routes');
const ordersRouter = require('./routes/orders.routes');
const paymentsRouter = require('./routes/payments.routes');

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;