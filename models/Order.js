const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  dishes: [
    {
      dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
      quantity: { type: Number, required: true }
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
    default: Date.now,
  },

  comment: {
  type: String,
  default: ''
},

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


module.exports = mongoose.model('Order', OrderSchema);
