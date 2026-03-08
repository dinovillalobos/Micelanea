const db = require('../db');

exports.getProductos = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM productos WHERE id = $1 AND activo = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getProductoByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await db.query(
      'SELECT * FROM productos WHERE codigo_barra = $1 AND activo = true',
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.createProducto = async (req, res) => {
  try {
    const { codigo_barra, nombre, descripcion, precio, cantidad, categoria } = req.body;

    const existing = await db.query(
      'SELECT id FROM productos WHERE codigo_barra = $1',
      [codigo_barra]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El código de barras ya existe' });
    }

    const result = await db.query(
      `INSERT INTO productos (codigo_barra, nombre, descripcion, precio, cantidad, categoria)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [codigo_barra, nombre, descripcion || null, precio, cantidad || 0, categoria || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, cantidad, categoria, activo } = req.body;

    const result = await db.query(
      `UPDATE productos 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           precio = COALESCE($3, precio),
           cantidad = COALESCE($4, cantidad),
           categoria = COALESCE($5, categoria),
           activo = COALESCE($6, activo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [nombre, descripcion, precio, cantidad, categoria, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE productos SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.searchProductos = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await db.query(
      `SELECT * FROM productos 
       WHERE activo = true 
       AND (nombre ILIKE $1 OR codigo_barra ILIKE $1)
       ORDER BY nombre
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
