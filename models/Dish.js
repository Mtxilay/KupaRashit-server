const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  ingredientName: String,
  quantity: Number,
  unit: String,
  price: Number
});

const SalesDataSchema = new mongoose.Schema({
  quantity: Number,
  saleDate: { type: Date, default: Date.now }
});

const DishSchema = new mongoose.Schema({
  name: String,
  price: Number,  // chosen by manager
  suggestedPrice: Number, // calculated by server
  ingredients: [IngredientSchema],
  salesData: [SalesDataSchema],
  image: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

});


module.exports = mongoose.model('Dish', DishSchema);
