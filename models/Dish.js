const mongoose = require('mongoose');

const SalesDataSchema = new mongoose.Schema({
  quantity: Number,
  saleDate: { type: Date, default: Date.now }
});

const DishSchema = new mongoose.Schema({
  name: String,
  price: Number,  // chosen by manager
  suggestedPrice: Number, // calculated by server
  ingredients: [
  {
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    quantity: Number
  }
],
  salesData: [SalesDataSchema],
  image: String,
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
  type: String,
  enum: ['Appetizer', 'Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Best Seller', 'Starter'],
  required: true
}

});


module.exports = mongoose.model('Dish', DishSchema);
