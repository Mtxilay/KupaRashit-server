const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');


// POST - Create review
router.post('/',auth, reviewController.createReview);

// GET - All reviews for a specific dish
router.get('/dish/:dishId',auth, reviewController.getReviewsByDish);

//GET all reviews 
router.get('/',auth, reviewController.getReviews);

// DELETE - Remove a review by its ID
router.delete('/:id',auth, reviewController.deleteReview);

module.exports = router;
