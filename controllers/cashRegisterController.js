const Dish = require('../models/Dish');
const DishAlias = require('../models/DishAlias');
const stringSimilarity = require('string-similarity');
const Ingredient = require('../models/Ingredient');

exports.importCashRegisterData = async (req, res) => {
  const { items } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Expected array of items' });
  }

  const results = [];

  for (const { name, quantity = 1, price = 0 } of items) {
    const aliasName = name?.trim();
    if (!aliasName) continue;

    let dish = null;
    let alias = await DishAlias.findOne({ alias: aliasName, userId });

    // 1. Try alias lookup

    if (alias?.dishId) {
      dish = await Dish.findOne({ _id: alias.dishId, userId });
    }

    // 2. Try exact dish name match

if (!dish) {
  dish = await Dish.findOne({ name: aliasName, userId });
  if (dish) {
    alias = await DishAlias.create({ alias: aliasName, dishId: dish._id, userId });
  }
}

// 3. Fuzzy match if not found
console.log(userId);
if (!dish) {
  const userDishes = await Dish.find({ userId });
      console.log(userDishes.length);
  if (userDishes.length > 0) {
    const dishNames = userDishes.map(d => d.name).filter(Boolean);
    const { bestMatch } = stringSimilarity.findBestMatch(aliasName.toLowerCase(), dishNames.map(n => n.toLowerCase()));


    if (bestMatch.rating > 0.4) {
      dish = userDishes.find(d => d.name.toLowerCase() === bestMatch.target);

      if (dish) {
        alias = await DishAlias.create({ alias: aliasName, dishId: dish._id, userId });
      }
    }
  }
}


    // 4. Save or return mismatch

    if (dish) {
        
      dish.salesData.push({ quantity, saleDate: new Date() });
      await dish.save();

      results.push({ alias: aliasName, matched: true, dishId: dish._id });
    } else {
      results.push({ alias: aliasName, matched: false });
    }
  }

  res.json({ results });
};


exports.getAliases = async (req, res) => {
  try {
    const userId = req.user.userId;
    const aliases = await DishAlias.find({ userId }).populate('dishId', 'name');
    res.json(aliases);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch aliases', error: err.message });
  }
};

exports.deleteAlias = async (req, res) => {
  try {
    const userId = req.user.userId;
    const aliasId = req.params.id;

    const deleted = await DishAlias.findOneAndDelete({ _id: aliasId, userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Alias not found or not owned by user' });
    }

    res.json({ message: 'Alias deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete alias', error: err.message });
  }
};

exports.addAlias = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { alias, dishId } = req.body;

    if (!alias || !dishId) {
      return res.status(400).json({ message: 'alias and dishId are required' });
    }

    // Check if dish belongs to this user
    const dish = await Dish.findOne({ _id: dishId, userId });
    if (!dish) {
      return res.status(403).json({ message: 'Dish does not belong to this user' });
    }

    // Check if alias already exists
    const existing = await DishAlias.findOne({ alias, userId });
    if (existing) {
      return res.status(409).json({ message: 'Alias already exists for this user' });
    }

    const newAlias = await DishAlias.create({ alias, dishId, userId });
    res.status(201).json({ message: 'Alias created', alias: newAlias });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create alias', error: err.message });
  }
};


