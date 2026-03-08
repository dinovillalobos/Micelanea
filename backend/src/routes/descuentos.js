const express = require('express');
const router = express.Router();
const descuentoController = require('../controllers/descuentoController');

router.get('/', descuentoController.getDescuentos);
router.post('/aplicar', descuentoController.aplicarDescuento);

module.exports = router;
