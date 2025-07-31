const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  operationalCostRate: { type: Number, default: 0.2 },
  priceMarkup: { type: Number, default: 1.4 },
  currency: { type: String, default: "$" },
  autoCalculate: { type: Boolean, default: true }
});

module.exports = mongoose.model("Setting", settingSchema);
