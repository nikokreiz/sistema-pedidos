const pool = require("../config/db");

// GET /api/mesas/:sucursalId
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

// GET /api/mesas/verificar/:qrCodigo
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

module.exports = { getMesas, verificarMesa };
