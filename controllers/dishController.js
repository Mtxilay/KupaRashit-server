const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const { computeDishStatistics } = require('../utils/statisticsEngine');

// Helper: whitelist fields allowed for update
const pickFields = (obj, fields) => {
  return fields.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
};

// GET /api/dishes
exports.getAllDishes = async (req, res) => {
  const userId = req.user.userId;
  try {
    const dishes = await Dish.find({ userId });
    res.json(dishes);
  } catch (err) {
    console.error("Error getting dishes:", err);
    res.status(500).json({ message: 'Server error while fetching dishes' });
  }
};

// GET /api/dishes/:id
exports.getDishById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  try {
    const dish = await Dish.findOne({ _id: id, userId });
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    res.json(dish);
  } catch (err) {
    console.error("Error getting dish by ID:", err);
    res.status(500).json({ message: 'Server error while retrieving dish' });
  }
};

// POST /api/dishes
exports.createDish = async (req, res) => {
  const userId = req.user.userId;
  const { name, price, ingredients } = req.body;

  // Basic validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Dish name is required and must be a non-empty string' });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'Price must be a non-negative number' });
  }

  // Duplicate check
  const existingDish = await Dish.findOne({ name: name.trim(), userId });
  if (existingDish) {
    return res.status(400).json({ message: 'Dish with this name already exists' });
  }

  // Optional: validate ingredients
  if (ingredients && !Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'Ingredients must be an array' });
  }

  if (ingredients) {
    for (const ing of ingredients) {
      if (
        !ing.ingredientName ||
        typeof ing.ingredientName !== 'string' ||
        typeof ing.quantity !== 'number' ||
        ing.quantity <= 0 ||
        !ing.unit ||
        typeof ing.unit !== 'string' ||
        typeof ing.price !== 'number' ||
        ing.price <= 0
      ) {
        return res.status(400).json({ message: 'One or more ingredients are invalid' });
      }
    }
  }

  try {
    const dish = new Dish({ ...req.body, userId });
    await dish.save();

    const stats = await computeDishStatistics(dish._id);
    dish.suggestedPrice = stats.suggestedPrice;
    const savedDish = await dish.save();

    res.status(201).json(savedDish);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.updateDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  const { name, price, ingredients } = req.body;

  // Optional field validations (only if present)
  if (name !== undefined && typeof name !== 'string' || name.length<1) {
    return res.status(400).json({ message: 'If provided, name must be a not empty string' });
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ message: 'If provided, price must be a positive number' });
  }

  if (ingredients !== undefined) {
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients must be an array' });
    }

    const invalid = ingredients.some(ing =>
      typeof ing !== 'object' ||
      typeof ing.ingredientName !== 'string' ||
      typeof ing.unit !== 'string' ||
      typeof ing.quantity !== 'number' || ing.quantity <= 0 ||
      typeof ing.price !== 'number' || ing.price <= 0
    );

    if (invalid) {
      return res.status(400).json({ message: 'One or more ingredients are invalid' });
    }
  }

  try {
    const updates = pickFields(req.body, ['name', 'price', 'ingredients', 'operationalCost', 'ingredientCost']);
    const updated = await Dish.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const stats = await computeDishStatistics(id);
    updated.suggestedPrice = stats.suggestedPrice;
    const finalDish = await updated.save();

    res.json(finalDish);
  } catch (err) {
    console.error("Error updating dish:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating dish' });
  }
};


// DELETE /api/dishes/:id
exports.deleteDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  try {
    const deleted = await Dish.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    console.error("Error deleting dish:", err);
    res.status(500).json({ message: 'Server error while deleting dish' });
  }
};
