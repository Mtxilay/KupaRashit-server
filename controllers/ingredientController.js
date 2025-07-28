const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');

// GET /api/ingredients
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ userId: req.user.userId });
    res.json(ingredients);
  } catch (err) {
    console.error("Error fetching ingredients:", err);
    res.status(500).json({ message: "Failed to get ingredients" });
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

// PUT /api/ingredients/:id
exports.updateIngredientById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name, unit, price, imageUrl } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ingredient ID format' });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ message: 'Name must be a non-empty string' });
  }

  if (unit !== undefined && (typeof unit !== 'string' || unit.trim() === '')) {
    return res.status(400).json({ message: 'Unit must be a non-empty string' });
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({ message: 'Price must be a non-negative number' });
  }

  try {
    const updated = await Ingredient.findOneAndUpdate(
      { _id: id, userId },
      { name, unit, price, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating ingredient:', err);
    res.status(500).json({ message: 'Server error while updating ingredient' });
  }
};

// POST /api/ingredients
exports.createIngredient = async (req, res) => {
  const { name, unit, price, imageUrl } = req.body;
  const userId = req.user.userId;

  if (!name || !unit || typeof price !== 'number') {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const newIngredient = new Ingredient({ name, unit, price, imageUrl, userId });
    const saved = await newIngredient.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    res.status(500).json({ message: "Failed to create ingredient" });
  }
};

// DELETE /api/ingredients/:id
exports.deleteIngredient = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const deleted = await Ingredient.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ message: "Ingredient not found" });
    res.json({ message: "Ingredient deleted successfully" });
  } catch (err) {
    console.error("Error deleting ingredient:", err);
    res.status(500).json({ message: "Failed to delete ingredient" });
  }
};
