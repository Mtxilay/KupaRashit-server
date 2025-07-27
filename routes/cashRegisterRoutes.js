// routes/cashRegisterRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { importCashRegisterData } = require('../controllers/cashRegisterController');
const { getAliases } = require('../controllers/cashRegisterController');
const { deleteAlias } = require('../controllers/cashRegisterController');
const { addAlias } = require('../controllers/cashRegisterController');

router.post('/import', auth, importCashRegisterData);
router.post('/aliases', auth, addAlias);
router.get('/aliases', auth, getAliases);
router.delete('/aliases/:id', auth, deleteAlias);


module.exports = router;
