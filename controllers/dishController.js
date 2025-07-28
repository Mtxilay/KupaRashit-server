const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const Ingredient = require('../models/Ingredient');
const { computeDishStatistics } = require('../utils/statisticsEngine');

const ALLOWED_CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Drink', 'Side', 'Other'];

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
    const dishes = await Dish.find({ userId }).populate("ingredients");
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
    const dish = await Dish.findOne({ _id: id, userId }).populate('ingredients');
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    res.json(dish);
  } catch (err) {
    console.error("Error getting dish by ID:", err);
    res.status(500).json({ message: 'Server error while retrieving dish' });
  }
};

// GET /api/ingredients/:id
exports.getIngredientById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ingredient ID format' });
  }

  try {
    const ingredient = await Ingredient.findOne({ _id: id, userId });
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (err) {
    console.error('Error getting ingredient:', err);
    res.status(500).json({ message: 'Server error while retrieving ingredient' });
  }
};

// POST /api/dishes
exports.createDish = async (req, res) => {
  const userId = req.user.userId;
  const { name, price, ingredients, description, category } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Dish name is required and must be a non-empty string' });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'Price must be a non-negative number' });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({ message: 'Description must be a string' });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  const existingDish = await Dish.findOne({ name: name.trim(), userId });
  if (existingDish) {
    return res.status(400).json({ message: 'Dish with this name already exists' });
  }

  if (ingredients && !Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'Ingredients must be an array of IDs' });
  }

  if (ingredients) {
    for (const id of ingredients) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ingredient ID in array' });
      }
      const ingredient = await Ingredient.findOne({ _id: id, userId });
      if (!ingredient) {
        return res.status(400).json({ message: `Ingredient with ID ${id} not found or unauthorized` });
      }
    }
  }

  try {
    const dish = new Dish({ name, price, ingredients, description, userId, category });
    await dish.save();

    const stats = await computeDishStatistics(dish._id);
    dish.suggestedPrice = stats.suggestedPrice;
    const savedDish = await dish.save();

    res.status(201).json(savedDish);
  } catch (err) {
    console.error("Error creating dish:", err);
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/dishes/:id
exports.updateDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name, price, ingredients, description, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  // Validation
  if (name !== undefined && (typeof name !== 'string' || name.length < 1)) {
    return res.status(400).json({ message: 'If provided, name must be a non-empty string' });
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ message: 'If provided, price must be a positive number' });
  }

  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'If provided, description must be a string' });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  if (ingredients !== undefined) {
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients must be an array of IDs' });
    }

    for (const id of ingredients) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ingredient ID in array' });
      }
      const ingredient = await Ingredient.findOne({ _id: id, userId });
      if (!ingredient) {
        return res.status(400).json({ message: `Ingredient with ID ${id} not found or unauthorized` });
      }
    }
  }

  try {
    const updates = pickFields(req.body, ['name', 'price', 'ingredients', 'operationalCost', 'ingredientCost', 'description', 'category']);
    const updated = await Dish.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('ingredients');

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
