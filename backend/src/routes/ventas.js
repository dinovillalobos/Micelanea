const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.createVenta);
router.get('/', ventaController.getVentas);
router.get('/hoy', ventaController.getVentasHoy);
router.get('/:id', ventaController.getVenta);
router.put('/:id/cancelar', ventaController.cancelVenta);

module.exports = router;
