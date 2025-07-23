const Order = require('../models/Order');
const { processPayment } = require('../utils/paymentProcessor');

exports.payForOrder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const result = await processPayment(order);

    if (result.success) {
      order.paymentStatus = 'paid';
      order.paymentIntentId = result.charge.id;  // Make sure this is defined!
      await order.save(); // <- this must happen!
      console.log(await Order.findById(orderId));


      return res.json({
        message: 'Payment successful',
        paymentId: result.charge.id,
        orderId: order._id,
      });
    } else {
      return res.status(400).json({ message: 'Payment failed', error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
