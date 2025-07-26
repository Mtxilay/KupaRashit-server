const express = require('express');
const router = express.Router();
const { getDishStatistics } = require('../controllers/statisticsController');

router.get('/dish/:dishId', getDishStatistics);

module.exports = router;
