// routes/cashRegisterRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { importCashRegisterData } = require('../controllers/cashRegisterController');

router.post('/import', auth, importCashRegisterData);

module.exports = router;
