const pool = require("../config/db");

const loginGarzon = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: "Email y password requeridos" });
    }

    const result = await pool.query(
      `SELECT id, nombre, email, sucursal_id FROM garzones
       WHERE email = $1 AND password_hash = $2 AND activo = true
       LIMIT 1`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: "Email o password incorrecto" });
    }

    const garzon = result.rows[0];

    res.json({
      ok: true,
      garzon: {
        id: garzon.id,
        nombre: garzon.nombre,
        email: garzon.email,
        sucursalId: garzon.sucursal_id,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginGarzon };