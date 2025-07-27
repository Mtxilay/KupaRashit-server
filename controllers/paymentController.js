const mongoose = require('mongoose');
const Order = require('../models/Order');
const { processPayment } = require('../utils/paymentProcessor');

exports.payForOrder = async (req, res) => {
  const { orderId } = req.params;

  // Validate orderId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const result = await processPayment(order);

    if (result.success && result.charge?.id) {
      order.paymentStatus = 'paid';
      order.paymentIntentId = result.charge.id;
      await order.save();

      return res.json({
        message: 'Payment successful',
        paymentId: result.charge.id,
        orderId: order._id,
      });
    } else {
      return res.status(400).json({
        message: 'Payment failed',
        error: result.error || 'Unknown error',
      });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
