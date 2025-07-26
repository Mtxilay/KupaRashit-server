const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');


router.post('/', orderController.createOrder);
router.get('/',auth, orderController.getOrders);
router.get('/:id',auth, orderController.getOrderById);
router.delete('/:id',auth, orderController.deleteOrder);

module.exports = router;
