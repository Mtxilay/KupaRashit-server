const Review = require('../models/Review');
const mongoose = require('mongoose');

// Public: Create a new review 
exports.createReview = async (req, res) => {
  const userId=req.user.userId;
  try {
    const { dishId, rating, comment} = req.body;

    // Validate presence of required fields
   if (!dishId || rating === undefined || !userId) {
  return res.status(400).json({ message: 'dishId, rating, and userId are required' });
}

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({ message: 'Invalid dishId format' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    // Create and save the review
    const review = new Review({ dishId, rating, comment, userId });
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error creating review', error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId });  // secure version
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};


// Private: Get all reviews for a specific dish (requires auth)
exports.getReviewsByDish = async (req, res) => {
  const { dishId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    return res.status(400).json({ message: 'Invalid dish ID format' });
  }

  try {
    const reviews = await Review.find({ dishId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews for dish', error: err.message });
  }
};

// Private: Delete a review (requires auth)
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }

  try {
    const deleted = await Review.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Review not found or not yours' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};
