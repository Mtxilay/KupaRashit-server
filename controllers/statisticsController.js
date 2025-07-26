const { computeDishStatistics } = require('../utils/statisticsEngine');

exports.getDishStatistics = async (req, res) => {
  try {
    const { dishId } = req.params;
    const stats = await computeDishStatistics(dishId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error calculating statistics', error: err.message });
  }
};
