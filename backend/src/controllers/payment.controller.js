const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { verifyPaymentSignature } = require('../utils/verifySignature');
const crypto = require('crypto');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order for a backend order
exports.createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // amount in paise for Razorpay
  const options = {
    amount: order.amount * 100,
    currency: 'INR',
    receipt: `rcpt_${order._id}`,
    notes: { local_order_id: String(order._id) }
  };

  const rzpOrder = await rzp.orders.create(options);
  order.razorpay.orderId = rzpOrder.id;
  await order.save();

  res.json({
    key: process.env.RAZORPAY_KEY_ID,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    orderId: rzpOrder.id
  });
};

// Verify payment on client callback
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const ok = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    secret: process.env.RAZORPAY_KEY_SECRET
  });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (!ok) {
    order.status = 'failed';
    await order.save();
    return res.status(400).json({ error: 'Invalid signature' });
  }

  order.status = 'paid';
  order.razorpay.paymentId = razorpay_payment_id;
  order.razorpay.signature = razorpay_signature;
  await order.save();

  res.json({ ok: true });
};

// Webhook for source of truth
exports.webhook = async (req, res) => {
  const signature = req.header('x-razorpay-signature');
  const secret = process.env.WEBHOOK_SECRET;

  const digest = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (digest !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const notes = payload?.payment?.entity?.notes || {};
    const rzpOrderId = payload?.payment?.entity?.order_id;
    const order = await Order.findOne({ 'razorpay.orderId': rzpOrderId });
    if (order) {
      order.status = 'paid';
      order.razorpay.paymentId = payload.payment.entity.id;
      await order.save();
    }
  }

  res.json({ received: true });
};