const { Schema, model } = require('mongoose');

const farmerSchema = new Schema({
  name: { type: String, required: true },
  location: String,
  categories: [String],
  bio: String,
  avatarUrl: String
}, { timestamps: true });

module.exports = model('Farmer', farmerSchema);