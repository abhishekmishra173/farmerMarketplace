const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, index: true },
  description: String,
  price: { type: Number, required: true, min: 0 }, // INR in rupees
  unit: { type: String, default: '500 g' },
  imageUrl: String,
  farmer: { type: Schema.Types.ObjectId, ref: 'Farmer' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = model('Product', productSchema);