const pool = require("../config/db");
const crypto = require("crypto");

const getMesas = async (req, res, next) => {
  try {
    const { sucursalId } = req.params;

    const result = await pool.query(
      `SELECT id, numero, capacidad, estado, qr_codigo_unico
       FROM mesas
       WHERE sucursal_id = $1 AND activa = true
       ORDER BY numero ASC`,
      [sucursalId]
    );

    res.json({ ok: true, mesas: result.rows });
  } catch (err) {
    next(err);
  }
};

const verificarMesa = async (req, res, next) => {
  try {
    const { qrCodigo } = req.params;

    const result = await pool.query(
      `SELECT m.id, m.numero, m.estado, s.comercio_id
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE m.qr_codigo = $1 AND m.activa = true`,
      [qrCodigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    res.json({ ok: true, mesa: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const verificarMesaPorQR = async (req, res, next) => {
  try {
    const { qrCode } = req.params;

    const result = await pool.query(
      `SELECT m.id, m.numero, m.sucursal_id, s.comercio_id
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE m.qr_codigo_unico = $1 AND m.activa = true
       LIMIT 1`,
      [qrCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    res.json({ ok: true, mesa: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const verificarMesaPorNumero = async (req, res, next) => {
  try {
    const { numero } = req.params;

    const result = await pool.query(
      `SELECT m.id, m.numero, m.sucursal_id, s.comercio_id
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE m.numero = $1 AND m.activa = true
       LIMIT 1`,
      [numero]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    res.json({ ok: true, mesa: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const crearMesa = async (req, res, next) => {
  try {
    const { sucursalId, numero, capacidad } = req.body;

    if (!sucursalId || !numero || !capacidad) {
      return res.status(400).json({ ok: false, mensaje: "Faltan campos requeridos" });
    }

    // Validar que no exista mesa con ese número
    const existente = await pool.query(
      `SELECT id FROM mesas WHERE sucursal_id = $1 AND numero = $2`,
      [sucursalId, numero]
    );

    if (existente.rows.length > 0) {
      return res.status(400).json({ ok: false, mensaje: "Ya existe una mesa con ese número" });
    }

    const qrUnico = `mesa-${crypto.randomUUID()}`;

    const result = await pool.query(
      `INSERT INTO mesas (sucursal_id, numero, capacidad, qr_codigo_unico, activa)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, numero, capacidad, qr_codigo_unico, activa, sucursal_id`,
      [sucursalId, numero, capacidad, qrUnico]
    );

    const nuevaMesa = result.rows[0];

    // Emite evento Socket.io
    const io = req.app.get("io");
    io.emit("mesa_creada", {
      id: nuevaMesa.id,
      numero: nuevaMesa.numero,
      capacidad: nuevaMesa.capacidad,
      qr_codigo_unico: nuevaMesa.qr_codigo_unico,
      activa: nuevaMesa.activa,
      sucursal_id: nuevaMesa.sucursal_id,
    });

    res.status(201).json({ ok: true, mesa: nuevaMesa });
  } catch (err) {
    next(err);
  }
};

const actualizarMesa = async (req, res, next) => {
  try {
    const { mesaId } = req.params;
    const { numero, capacidad, activa } = req.body;

    const result = await pool.query(
      `UPDATE mesas
       SET numero = $1, capacidad = $2, activa = $3
       WHERE id = $4
       RETURNING id, numero, capacidad, qr_codigo_unico, activa, sucursal_id`,
      [numero, capacidad, activa, mesaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    const mesaActualizada = result.rows[0];

    // Emite evento Socket.io
    const io = req.app.get("io");
    io.emit("mesa_actualizada", {
      id: mesaActualizada.id,
      numero: mesaActualizada.numero,
      capacidad: mesaActualizada.capacidad,
      qr_codigo_unico: mesaActualizada.qr_codigo_unico,
      activa: mesaActualizada.activa,
    });

    res.json({ ok: true, mesa: mesaActualizada });
  } catch (err) {
    next(err);
  }
};

const eliminarMesa = async (req, res, next) => {
  try {
    const { mesaId } = req.params;

    const result = await pool.query(
      `DELETE FROM mesas WHERE id = $1 RETURNING id`,
      [mesaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    // Emite evento Socket.io
    const io = req.app.get("io");
    io.emit("mesa_eliminada", { mesaId });

    res.json({ ok: true, mensaje: "Mesa eliminada" });
  } catch (err) {
    next(err);
  }
};

const obtenerMesasPorSucursal = async (req, res, next) => {
  try {
    const { sucursalId } = req.params;

    const result = await pool.query(
      `SELECT id, numero, capacidad, qr_codigo_unico, activa, estado
       FROM mesas
       WHERE sucursal_id = $1
       ORDER BY numero ASC`,
      [sucursalId]
    );

    res.json({ ok: true, mesas: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMesas, verificarMesa, verificarMesaPorQR, verificarMesaPorNumero, crearMesa, actualizarMesa, eliminarMesa, obtenerMesasPorSucursal };