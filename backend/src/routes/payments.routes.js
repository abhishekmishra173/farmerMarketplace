const router = require('express').Router();
const ctrl = require('../controllers/payments.controller');

router.post('/order', ctrl.createRazorpayOrder);
router.post('/verify', ctrl.verifyPayment);
// Webhook must parse raw body to validate signature, handled in app.js
router.post('/webhook', ctrl.webhook);

module.exports = router;