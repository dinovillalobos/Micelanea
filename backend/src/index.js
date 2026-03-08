const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const ventaRoutes = require('./routes/ventas');
const reporteRoutes = require('./routes/reportes');
const descuentoRoutes = require('./routes/descuentos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/descuentos', descuentoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Micelanea API running' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
