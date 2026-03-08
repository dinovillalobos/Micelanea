const db = require('../db');

exports.getDescuentos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM descuentos WHERE activo = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.aplicarDescuento = async (req, res) => {
  try {
    const { codigo } = req.body;
    
    const result = await db.query(
      `SELECT * FROM descuentos 
       WHERE codigo = $1 AND activo = true 
       AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
       AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)`,
      [codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Código de descuento inválido' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
