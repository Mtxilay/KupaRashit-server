const Dish = require('../models/Dish');
const Order = require('../models/Order');
// Public: Place an order 

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(req.user.body);
    const { customerName, dishes, comment } = req.body;


    // Basic validation
    if (!customerName || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ message: 'Customer name and at least one dish are required.' });
    }

    // Fetch prices for dishes and verify ownership
    const dishIds = dishes.map(d => d.dishId);
    const foundDishes = await Dish.find({ _id: { $in: dishIds }, userId });

    if (foundDishes.length !== dishIds.length) {
      return res.status(400).json({ message: 'One or more dishes not found or unauthorized.' });
    }

    // Calculate total
    const totalAmount = dishes.reduce((sum, item) => {
      const dish = foundDishes.find(d => d._id.toString() === item.dishId);
      return sum + (dish.price * item.quantity);
    }, 0);

   const order = new Order({ customerName, dishes, totalAmount, userId, comment });
    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
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
