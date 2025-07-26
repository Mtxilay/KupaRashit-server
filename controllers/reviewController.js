const Review = require('../models/Review');

// Public: Create a new review (no auth required)
exports.createReview = async (req, res) => {
  try {
    const review = new Review(req.body);  // Assumes body contains dishId, rating, comment, etc.
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Private: Get all reviews (requires auth)
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Private: Get all reviews for a specific dish (requires auth)
exports.getReviewsByDish = async (req, res) => {
  try {
    const reviews = await Review.find({ dishId: req.params.dishId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Private: Delete a review (requires auth)
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
