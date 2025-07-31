const { computeDishStatistics } = require('../utils/statisticsEngine');
const Dish = require('../models/Dish');
const Review = require('../models/Review');
const Setting = require('../models/Settings');



exports.getDishStatistics = async (req, res) => {
  try {
    const { dishId } = req.params;

    const settings = await Setting.findOne({ userId: req.user._id }) || {};
    console.log("Loaded settings:", settings);

    const stats = await computeDishStatistics(dishId, settings);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error calculating statistics', error: err.message });
  }
};

exports.getTopSellingDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();

    const sorted = dishes
      .map(dish => ({
        _id: dish._id,
        name: dish.name,
        totalSold: dish.salesData.reduce((sum, s) => sum + s.quantity, 0)
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top dishes', error: err.message });
  }
};

exports.getTopRatedDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();

    // Get reviews for all dishes
    const reviews = await Review.find();

    // Map dishId to an array of its ratings
    const ratingMap = {};
    reviews.forEach(({ dishId, rating }) => {
      if (!ratingMap[dishId]) ratingMap[dishId] = [];
      ratingMap[dishId].push(rating);
    });

    const ratedDishes = dishes
      .map(dish => {
        const ratings = ratingMap[dish._id] || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        return {
          _id: dish._id,
          name: dish.name,
          avgRating: avgRating.toFixed(2),
          totalReviews: ratings.length
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    res.json(ratedDishes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top rated dishes', error: err.message });
  }
};


