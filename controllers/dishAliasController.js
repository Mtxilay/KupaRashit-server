const Dish = require('../models/Dish');
const CashRegisterAlias = require('../models/CashRegisterAlias');

// POST /api/cashregister/import
exports.importCashRegisterData = async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Expected 'items' to be an array" });
  }

  const response = [];

  for (const item of items) {
    const aliasName = item.name?.trim();
    const quantity = item.quantity ?? 1;
    const price = item.price ?? 0;

    if (!aliasName) {
      response.push({ status: 'skipped', reason: 'Missing name', item });
      continue;
    }

    // Try to find alias
    let alias = await CashRegisterAlias.findOne({ alias: aliasName, userId });

    // If alias doesn't exist, create an empty one and skip this item
    if (!alias) {
      alias = new CashRegisterAlias({ alias: aliasName, userId });
      await alias.save();

      response.push({
        status: 'unmapped',
        message: `Alias '${aliasName}' not mapped. Created alias for manual mapping.`,
        item
      });
      continue;
    }

    // If alias exists but not mapped yet
    if (!alias.dishId) {
      response.push({
        status: 'unmapped',
        message: `Alias '${aliasName}' exists but not linked to dish.`,
        item
      });
      continue;
    }

    // Find the dish
    const dish = await Dish.findOne({ _id: alias.dishId, userId });
    if (!dish) {
      response.push({
        status: 'error',
        message: `Dish not found for alias '${aliasName}'`,
        item
      });
      continue;
    }

    // Update salesData and optionally price
    dish.salesData.push({ quantity });
    if (price && price !== dish.price) {
      dish.price = price; // Optional logic
    }

    await dish.save();

    response.push({
      status: 'success',
      message: `Updated dish '${dish.name}'`,
      dishId: dish._id,
      quantity,
      price
    });
  }

  return res.json({ results: response });
};
