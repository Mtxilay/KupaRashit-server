const express = require('express');
const router = express.Router();
const { importCashRegisterData } = require('../controllers/dishAliasController');
const auth = require('../middleware/authMiddleware');

router.post('/import', auth, importCashRegisterData);

module.exports = router;
