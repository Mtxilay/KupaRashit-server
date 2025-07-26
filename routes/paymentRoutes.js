// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { payForOrder } = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');


// New route: POST /api/payments/:orderId
router.post('/:orderId', payForOrder);

module.exports = router;
