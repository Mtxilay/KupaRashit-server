const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: String,
  dishes: [
    {
      dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
      quantity: Number
    }
  ],
  totalAmount: Number,
  paymentStatus: {
  type: String,
  enum: ['pending', 'paid', 'failed'],
  default: 'pending',
},
paymentIntentId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
