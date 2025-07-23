const express = require('express');
const router = express.Router();
const {
  searchMealsByName,
  importMealById
} = require('../controllers/mealDbController');

router.get('/search', searchMealsByName);
router.post('/import/:id', importMealById);

module.exports = router;
