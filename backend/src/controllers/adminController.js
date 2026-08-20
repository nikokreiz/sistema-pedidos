const pool = require("../config/db");

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: "Email y password requeridos" });
    }

    const result = await pool.query(
      `SELECT id, nombre, email, comercio_id, rol FROM admins
       WHERE email = $1 AND password_hash = $2 AND activo = true
       LIMIT 1`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales incorrectas" });
    }

    const admin = result.rows[0];

    res.json({
      ok: true,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        comercioId: admin.comercio_id,
        rol: admin.rol,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getHorarios = async (req, res, next) => {
  try {
    const { comercioId } = req.params;

    const result = await pool.query(
      `SELECT dia_semana, hora_apertura, hora_cierre, abierto
       FROM horarios_comercio
       WHERE comercio_id = $1
       ORDER BY dia_semana ASC`,
      [comercioId]
    );

    res.json({ ok: true, horarios: result.rows });
  } catch (err) {
    next(err);
  }
};

const actualizarHorario = async (req, res, next) => {
  try {
    const { comercioId, diaSemana } = req.params;
    const { horaApertura, horaCierre, abierto } = req.body;

    const result = await pool.query(
      `UPDATE horarios_comercio
       SET hora_apertura = $1, hora_cierre = $2, abierto = $3
       WHERE comercio_id = $4 AND dia_semana = $5
       RETURNING *`,
      [horaApertura, horaCierre, abierto, comercioId, diaSemana]
    );

    res.json({ ok: true, horario: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginAdmin, getHorarios, actualizarHorario };