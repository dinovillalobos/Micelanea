const db = require('../db');

exports.createVenta = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { usuario_id, descuento, metodo_pago, productos } = req.body;
    
    let subtotal = 0;
    const detalles = [];
    
    for (const item of productos) {
      const productResult = await client.query(
        'SELECT precio, cantidad FROM productos WHERE id = $1 AND activo = true',
        [item.producto_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }
      
      const producto = productResult.rows[0];
      const itemSubtotal = item.cantidad * item.precio_unitario;
      subtotal += itemSubtotal;
      
      detalles.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: itemSubtotal,
      });
      
      await client.query(
        'UPDATE productos SET cantidad = cantidad - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );
    }
    
    const total = subtotal - (descuento || 0);
    
    const ventaResult = await client.query(
      `INSERT INTO ventas (usuario_id, total, descuento, metodo_pago)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario_id, total, descuento || 0, metodo_pago || 'efectivo']
    );
    
    const ventaId = ventaResult.rows[0].id;
    
    for (const detalle of detalles) {
      await client.query(
        `INSERT INTO venta_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [ventaId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
      );
    }
    
    await client.query('COMMIT');
    
    const ventaCompleta = await db.query(
      `SELECT v.*, u.nombre as usuario_nombre 
       FROM ventas v 
       JOIN usuarios u ON v.usuario_id = u.id 
       WHERE v.id = $1`,
      [ventaId]
    );
    
    res.status(201).json(ventaCompleta.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message || 'Error en el servidor' });
  } finally {
    client.release();
  }
};

exports.getVentas = async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = `
      SELECT v.*, u.nombre as usuario_nombre 
      FROM ventas v 
      JOIN usuarios u ON v.usuario_id = u.id
    `;
    const params = [];
    
    if (fecha) {
      query += ' WHERE DATE(v.created_at) = $1';
      params.push(fecha);
    }
    
    query += ' ORDER BY v.created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getVenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ventaResult = await db.query(
      `SELECT v.*, u.nombre as usuario_nombre 
       FROM ventas v 
       JOIN usuarios u ON v.usuario_id = u.id 
       WHERE v.id = $1`,
      [id]
    );
    
    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const detallesResult = await db.query(
      `SELECT vd.*, p.nombre as producto_nombre 
       FROM venta_detalles vd 
       JOIN productos p ON vd.producto_id = p.id 
       WHERE vd.venta_id = $1`,
      [id]
    );
    
    res.json({
      ...ventaResult.rows[0],
      detalles: detallesResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.cancelVenta = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    const ventaResult = await client.query(
      'SELECT * FROM ventas WHERE id = $1',
      [id]
    );
    
    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const detallesResult = await client.query(
      'SELECT producto_id, cantidad FROM venta_detalles WHERE venta_id = $1',
      [id]
    );
    
    for (const detalle of detallesResult.rows) {
      await client.query(
        'UPDATE productos SET cantidad = cantidad + $1 WHERE id = $2',
        [detalle.cantidad, detalle.producto_id]
      );
    }
    
    const result = await client.query(
      "UPDATE ventas SET status = 'cancelada' WHERE id = $1 RETURNING *",
      [id]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    client.release();
  }
};

exports.getReporteVentas = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    
    const result = await db.query(
      `SELECT v.*, u.nombre as usuario_nombre 
       FROM ventas v 
       JOIN usuarios u ON v.usuario_id = u.id
       WHERE DATE(v.created_at) BETWEEN $1 AND $2
       AND v.status = 'completada'
       ORDER BY v.created_at DESC`,
      [inicio, fin]
    );
    
    const total_ventas = result.rows.length;
    const total_productos = result.rows.reduce((sum, v) => sum + 1, 0);
    const total_monto = result.rows.reduce((sum, v) => sum + parseFloat(v.total), 0);
    const promedio_venta = total_ventas > 0 ? total_monto / total_ventas : 0;
    
    res.json({
      total_ventas,
      total_productos,
      promedio_venta,
      ventas: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getVentasHoy = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      `SELECT v.*, u.nombre as usuario_nombre 
       FROM ventas v 
       JOIN usuarios u ON v.usuario_id = u.id
       WHERE DATE(v.created_at) = $1
       AND v.status = 'completada'
       ORDER BY v.created_at DESC`,
      [today]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
