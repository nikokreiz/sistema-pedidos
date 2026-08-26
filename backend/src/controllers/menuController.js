const pool = require("../config/db");
const crypto = require("crypto");

const getMenu = async (req, res, next) => {
  try {
    const { comercioId } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.nombre, c.icono,
              COALESCE(
                json_agg(json_build_object(
                  'id',          im.id,
                  'categoria_id', c.id,
                  'nombre',      im.nombre,
                  'descripcion', im.descripcion,
                  'precio',      im.precio,
                  'imagen_url',  im.imagen_url,
                  'activo',      im.activo
                ) ORDER BY im.nombre) FILTER (WHERE im.id IS NOT NULL),
                '[]'::json
              ) AS items
       FROM categorias_menu c
       LEFT JOIN items_menu im ON im.categoria_id = c.id AND im.activo = true
       WHERE c.comercio_id = $1
       GROUP BY c.id, c.nombre, c.icono
       ORDER BY c.nombre ASC`,
      [comercioId]
    );

    res.json({ ok: true, categorias: result.rows });
  } catch (err) {
    next(err);
  }
};

const crearCategoria = async (req, res, next) => {
  try {
    const { comercioId, nombre, icono } = req.body;

    if (!comercioId || !nombre || !nombre.trim()) {
      return res.status(400).json({ ok: false, mensaje: "Comercio y nombre de categoría requeridos" });
    }

    const categoriaExistente = await pool.query(
      `SELECT id FROM categorias_menu
       WHERE comercio_id = $1 AND LOWER(nombre) = LOWER($2)
       LIMIT 1`,
      [comercioId, nombre.trim()]
    );

    if (categoriaExistente.rows.length > 0) {
      return res.status(400).json({ ok: false, mensaje: "Ya existe una categoría con ese nombre" });
    }

    const ultimaCategoria = await pool.query(
      `SELECT COALESCE(MAX(orden), 0) AS ultimo_orden
       FROM categorias_menu
       WHERE comercio_id = $1`,
      [comercioId]
    );
    const orden = Number(ultimaCategoria.rows[0].ultimo_orden) + 1;

    const result = await pool.query(
      `INSERT INTO categorias_menu (id, comercio_id, nombre, icono, orden)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, comercio_id, nombre, icono, orden`,
      [crypto.randomUUID(), comercioId, nombre.trim(), icono?.trim() || "", orden]
    );

    res.status(201).json({ ok: true, categoria: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const crearItem = async (req, res, next) => {
  try {
    const { categoriaId, nombre, descripcion, precio, imagenUrl } = req.body;

    if (!categoriaId || !nombre || !precio) {
      return res.status(400).json({ ok: false, mensaje: "Faltan campos requeridos" });
    }

    const result = await pool.query(
      `INSERT INTO items_menu (categoria_id, nombre, descripcion, precio, imagen_url, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nombre, descripcion, precio, imagen_url, activo`,
      [categoriaId, nombre, descripcion, precio, imagenUrl || ""]
    );

    res.status(201).json({ ok: true, item: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const actualizarItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { nombre, descripcion, precio, imagenUrl, activo } = req.body;

    const result = await pool.query(
      `UPDATE items_menu
       SET nombre = $1, descripcion = $2, precio = $3, imagen_url = $4, activo = $5
       WHERE id = $6
       RETURNING id, nombre, descripcion, precio, imagen_url, activo`,
      [nombre, descripcion, precio, imagenUrl || "", activo, itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Item no encontrado" });
    }

    res.json({ ok: true, item: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const eliminarItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(
      `DELETE FROM items_menu WHERE id = $1 RETURNING id`,
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Item no encontrado" });
    }

    res.json({ ok: true, mensaje: "Item eliminado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu, crearCategoria, crearItem, actualizarItem, eliminarItem };