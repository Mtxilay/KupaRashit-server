const Dish = require('../models/Dish');
const DishAlias = require('../models/DishAlias');
const stringSimilarity = require('string-similarity');

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

     console.log("searching", name);

    // 1. Try alias lookup
    
     console.log("lookign for alias");
    if (alias?.dishId) {
      dish = await Dish.findOne({ _id: alias.dishId, userId });
    }

    // 2. Try exact dish name match
      console.log("looking for exact match");
    if (!dish) {
      dish = await Dish.findOne({ name: aliasName, userId });
    }

// 3. Fuzzy match if not found
console.log(userId);
if (!dish) {
  const userDishes = await Dish.find({ userId });
      console.log(userDishes.length);
  if (userDishes.length > 0) {
    const dishNames = userDishes.map(d => d.name).filter(Boolean);
    const { bestMatch } = stringSimilarity.findBestMatch(aliasName.toLowerCase(), dishNames.map(n => n.toLowerCase()));

    console.log(`Trying to match: "${aliasName}"`);
    console.log(`Best match:`, bestMatch);

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
