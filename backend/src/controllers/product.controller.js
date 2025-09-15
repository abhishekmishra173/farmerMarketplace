const Product = require('../models/Product');

exports.list = async (req, res) => {
  const { category, q } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (q) filter.name = new RegExp(q, 'i');
  const products = await Product.find(filter).populate('farmer', 'name location');
  res.json(products);
};

exports.seed = async (_req, res) => {
  await Product.deleteMany({});
  const demo = await Product.insertMany([
    { name: 'Heirloom Tomatoes', category: 'Vegetables', price: 89, unit: '500 g' },
    { name: 'Tender Okra', category: 'Vegetables', price: 59, unit: '500 g' },
    { name: 'Ratnagiri Mango', category: 'Fruits', price: 299, unit: '1 kg' }
  ]);
  res.json({ ok: true, count: demo.length });
};