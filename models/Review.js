const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true
  },
  rating: {type: Number,required: true},
  comment: String,
  date: {
    type: Date,
    default: Date.now,
    
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

});

module.exports = mongoose.model('Review', ReviewSchema);
