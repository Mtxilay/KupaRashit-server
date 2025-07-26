const mongoose = require('mongoose');
const Dish = require('../models/Dish');
const { computeDishStatistics } = require('../utils/statisticsEngine');

// Get all dishes (for this user only)
exports.getAllDishes = async (req, res) => {
  const userId = req.user.userId;
  try {
    const dishes = await Dish.find({ userId });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dish by ID (owned by user)
exports.getDishById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const dish = await Dish.findOne({ _id: id, userId });
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new dish (linked to user)
exports.createDish = async (req, res) => {
  const userId = req.user.userId;

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

// Update dish by ID (only user's)
exports.updateDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updated = await Dish.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const stats = await computeDishStatistics(id);
    const finalDish = await Dish.findByIdAndUpdate(
      id,
      { suggestedPrice: stats.suggestedPrice },
      { new: true }
    );

    res.json(finalDish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete dish by ID (only user's)
exports.deleteDish = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedDish = await Dish.findOneAndDelete({ _id: id, userId });
    if (!deletedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
