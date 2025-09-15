const Order = require('../models/Order');

exports.createOrderRecord = async (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items required' });
  }

  const amount = items.reduce((sum, it) => sum + (it.price * it.qty), 0); // rupees
  const order = await Order.create({
    items,
    customer,
    amount,
    status: 'created'
  });

  res.status(201).json(order);
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name price');
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
};