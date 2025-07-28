const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const auth = require('../middleware/authMiddleware');


router.get('/',auth, dishController.getAllDishes);
router.get('/:id',auth, dishController.getDishById);
router.post('/',auth, dishController.createDish);
router.put('/:id',auth, dishController.updateDish);
router.delete('/:id',auth, dishController.deleteDish);
router.put('/hard/:id', auth, dishController.hardUpdateDish);


module.exports = router;
