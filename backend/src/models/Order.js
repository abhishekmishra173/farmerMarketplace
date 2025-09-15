const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // rupees snapshot
  }],
  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    pincode: String
  },
  amount: { type: Number, required: true }, // rupees total
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String
  }
}, { timestamps: true });

module.exports = model('Order', orderSchema);