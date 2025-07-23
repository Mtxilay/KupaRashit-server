const mongoose = require('mongoose');
const Dish = require('../models/Dish');

// Helper: calculate suggested price
function calculateSuggestedPrice(ingredients) {
  return ingredients.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
}

// Get all dishes
exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dish by ID
exports.getDishById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new dish
exports.createDish = async (req, res) => {
  try {
    const suggestedPrice = calculateSuggestedPrice(req.body.ingredients || []);
    const dish = new Dish({
      ...req.body,
      suggestedPrice // stored but not forced as final price
    });

    const savedDish = await dish.save();
    res.status(201).json(savedDish);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update dish by ID
exports.updateDish = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const suggestedPrice = calculateSuggestedPrice(req.body.ingredients || []);
    const updatedDish = await Dish.findByIdAndUpdate(
      id,
      {
        ...req.body,
        suggestedPrice
      },
      { new: true, runValidators: true }
    );

    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    res.json(updatedDish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete dish by ID
exports.deleteDish = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedDish = await Dish.findByIdAndDelete(id);
    if (!deletedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
