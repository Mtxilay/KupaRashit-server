const axios = require('axios');
const Dish = require('../models/Dish');
const Ingredient = require('../models/Ingredient');

// Helper: Convert TheMealDB ingredients to your format
function parseMealDbIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (name && name.trim()) {
      const match = measure?.match(/^([\d/.]+)?\s*(.*)$/) || [];
      const quantity = match[1] ? parseFloat(match[1]) : 1;
      const unit = match[2]?.trim() || 'unit';

      ingredients.push({
        ingredientName: name.trim(),
        quantity: isNaN(quantity) ? 1 : quantity,
        unit,
        price: 0, // default price (editable later)
        imageUrl: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name.trim())}.png`
      });
    }
  }

  return ingredients;
}

// SEARCH: GET /api/mealdb/search?name=pasta
exports.searchMealsByName = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing ?name query parameter' });

  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
    const meals = response.data.meals;

    if (!meals) return res.status(404).json({ error: 'No meals found' });

    const preview = meals.map(meal => ({
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      image: meal.strMealThumb
    }));

    res.json(preview);
  } catch (err) {
    console.error("Error fetching meals:", err);
    res.status(500).json({ error: 'Failed to fetch meals from TheMealDB' });
  }
};

// IMPORT: POST /api/mealdb/import/:id
exports.importMealById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const meal = response.data.meals?.[0];
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    const rawIngredients = parseMealDbIngredients(meal);
    const userId = req.user.userId;

    const dishIngredients = [];

    for (const ing of rawIngredients) {
      let ingredientDoc = await Ingredient.findOne({ name: ing.ingredientName, userId });

      if (!ingredientDoc) {
        ingredientDoc = await Ingredient.create({
          name: ing.ingredientName,
          unit: ing.unit,
          price: ing.price,
          userId,
          imageUrl: ing.imageUrl
        });
      }

      dishIngredients.push({
        _id: ingredientDoc._id, // ✅ Reference by _id
        quantity: ing.quantity
      });
    }

    const newDish = new Dish({
      name: meal.strMeal,
      image: meal.strMealThumb,
      ingredients: dishIngredients, // ✅ Correct format
      suggestedPrice: 0,
      price: Math.floor(Math.random() * 50) + 20,
      salesData: [],
      userId,
      category: 'Main Course',
    });

    const savedDish = await newDish.save();
    res.status(201).json({ message: 'Dish imported', dish: savedDish });

  } catch (err) {
    console.error("Error importing meal:", err);
    res.status(500).json({ error: 'Failed to import dish', details: err.message });
  }
};

