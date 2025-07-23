const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST - Create review
router.post('/', reviewController.createReview);

// GET - All reviews for a specific dish
router.get('/dish/:dishId', reviewController.getReviewsByDish);

//GET all reviews 
router.get('/', reviewController.getReviews);

// DELETE - Remove a review by its ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
