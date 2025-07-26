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

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Dish data is required' });
  }

  try {
    const dish = new Dish({ ...req.body, userId });
    await dish.save();

    const stats = await computeDishStatistics(dish._id);
    dish.suggestedPrice = stats.suggestedPrice;
    const savedDish = await dish.save();

    res.status(201).json(savedDish);
  } catch (err) {
    console.error("Error creating dish:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating dish' });
  }
};

// PUT /api/dishes/:id
exports.updateDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  try {
    const updates = pickFields(req.body, ['name', 'ingredients', 'operationalCost', 'ingredientCost']);
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
