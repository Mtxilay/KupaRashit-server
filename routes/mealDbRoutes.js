const express = require('express');
const router = express.Router();
const {
  searchMealsByName,
  importMealById
} = require('../controllers/mealDbController');
const auth = require('../middleware/authMiddleware');


router.get('/search', searchMealsByName);
router.post('/import/:id',auth, importMealById);

module.exports = router;
