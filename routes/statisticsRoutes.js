const express = require('express');
const router = express.Router();
const { getDishStatistics } = require('../controllers/statisticsController');
const { getTopSellingDishes } = require('../controllers/statisticsController');
const { getTopRatedDishes } = require('../controllers/statisticsController');
const auth = require('../middleware/authMiddleware');


router.get('/dish/:dishId',auth, getDishStatistics);
router.get('/top-selling', auth, getTopSellingDishes);
router.get('/top-rated', auth, getTopRatedDishes);



module.exports = router;
