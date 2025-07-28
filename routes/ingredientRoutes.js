const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', authenticate, ingredientController.getAllIngredients);
router.post('/', authenticate, ingredientController.createIngredient);
router.delete('/:id', authenticate, ingredientController.deleteIngredient);
router.get('/:id', authenticate, ingredientController.getIngredientById);
router.put('/:id', authenticate, ingredientController.updateIngredientById);

module.exports = router;
