const mongoose = require('mongoose');

const CashRegisterAliasSchema = new mongoose.Schema({
  alias: { type: String, required: true },
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('CashRegisterAlias', CashRegisterAliasSchema);
