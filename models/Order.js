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
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
