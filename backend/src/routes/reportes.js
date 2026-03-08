const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/ventas', ventaController.getReporteVentas);
router.get('/hoy', ventaController.getVentasHoy);

module.exports = router;
