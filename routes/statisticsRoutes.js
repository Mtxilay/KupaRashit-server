const express = require('express');
const router = express.Router();
const { getDishStatistics } = require('../controllers/statisticsController');
const auth = require('../middleware/authMiddleware');


router.get('/dish/:dishId',auth, getDishStatistics);

module.exports = router;
