const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const dishRoutes = require('./routes/dishRoutes');
app.use('/api/dishes', dishRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

const mealDbRoutes = require('./routes/mealDbRoutes');
app.use('/api/mealdb', mealDbRoutes);

const statisticsRoutes = require('./routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


const cashRegisterRoutes = require('./routes/cashRegisterRoutes');
app.use('/api/cashregister', cashRegisterRoutes);

const ingredientRoutes = require('./routes/ingredientRoutes');
app.use('/api/ingredients', ingredientRoutes);

app.use("/api/settings", require("./routes/settingsRoutes"));



// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'KupaRashit',
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
