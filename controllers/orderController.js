const Order = require('../models/Order');

// Public: Place an order (no auth required)
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Private: Get all orders (requires auth)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).populate('dishes.dishId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Private: Get order by ID (requires auth)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('dishes.dishId');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Private: Delete an order (requires auth)
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order canceled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
