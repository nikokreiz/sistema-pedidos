const pool = require("../config/db");

const getMesas = async (req, res, next) => {
  try {
    const { sucursalId } = req.params;

    const result = await pool.query(
      `SELECT id, numero, capacidad, estado, qr_codigo
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

module.exports = { getMesas, verificarMesa, verificarMesaPorQR };