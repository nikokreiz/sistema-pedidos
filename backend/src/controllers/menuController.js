const pool = require("../config/db");

// GET /api/menu/:comercioId
const getMenu = async (req, res, next) => {
  try {
    const { comercioId } = req.params;

    // Obtiene categorías activas del comercio
    const categoriasResult = await pool.query(
      `SELECT id, nombre, orden
       FROM categorias_menu
       WHERE comercio_id = $1 AND activa = true
       ORDER BY orden ASC`,
      [comercioId]
    );

    // Obtiene items activos del comercio
    const itemsResult = await pool.query(
      `SELECT id, categoria_id, nombre, descripcion,
              precio, imagen_url, disponible, tiempo_preparacion_min
       FROM items_menu
       WHERE comercio_id = $1
       ORDER BY nombre ASC`,
      [comercioId]
    );

    res.json({
      ok:         true,
      categorias: categoriasResult.rows,
      items:      itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu };
