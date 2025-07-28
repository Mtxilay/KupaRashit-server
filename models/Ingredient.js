const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true }, // grams, ml, etc.
  price: { type: Number, required: true }, // cost per unit
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String }
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
