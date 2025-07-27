// utils/statisticsEngine.js
const Dish = require('../models/Dish');
const Review = require('../models/Review');

const OPERATIONAL_COST_RATE = 0.2;
const PRICE_MARKUP = 1.4;

async function computeDishStatistics(dishId) {
  const dish = await Dish.findById(dishId);
  if (!dish) throw new Error('Dish not found');

  const reviews = await Review.find({ dishId });

  // Average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  // Average sold per day
  const salesByDate = {};
  for (const sale of dish.salesData) {
    const dateStr = new Date(sale.saleDate).toISOString().split('T')[0];
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + sale.quantity;
  }
  const totalQuantity = Object.values(salesByDate).reduce((a, b) => a + b, 0);
  const avgDailySales = totalQuantity / Object.keys(salesByDate).length || 0;

  // Ingredient cost
  const ingredientCost = dish.ingredients.reduce(
    (sum, ing) => sum + (ing.quantity * ing.price*0.1),
    0
  );

  const operationalCost = ingredientCost * OPERATIONAL_COST_RATE;
const suggestedPrice = ((ingredientCost || 0) + (operationalCost || 0)) * (PRICE_MARKUP || 1.5);


  // Percentage of total sales
  const allDishes = await Dish.find();
  const totalSoldAllDishes = allDishes.reduce((sum, d) =>
    sum + d.salesData.reduce((s, entry) => s + entry.quantity, 0), 0);

  const percentageOfTotalSales =
    totalSoldAllDishes > 0 ? (totalQuantity / totalSoldAllDishes) * 100 : 0;

  // Basic Recommendation
  let recommendation = 'Stable';
  if (avgDailySales > 5 && dish.price < suggestedPrice) {
    recommendation = 'Consider raising price';
  } else if (avgDailySales < 1) {
    recommendation = 'Consider removing from menu';
  }

  return {
    dishId,
    name: dish.name,
    avgDailySales,
    averageRating,
    ingredientCost,
    operationalCost,
    price: dish.price,
    suggestedPrice,
    salesPercentage: percentageOfTotalSales.toFixed(2),
    recommendation
  };
}

module.exports = { computeDishStatistics };
