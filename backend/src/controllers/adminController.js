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

const verificarLocalAbierto = async (req, res, next) => {
  try {
    const { comercioId } = req.params;
    
    const ahora = new Date();
    const diaSemana = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1; // 0=Lunes, 6=Domingo
    const horaActual = ahora.toTimeString().split(' ')[0]; // HH:MM:SS

    const result = await pool.query(
      `SELECT abierto, hora_apertura, hora_cierre
       FROM horarios_comercio
       WHERE comercio_id = $1 AND dia_semana = $2`,
      [comercioId, diaSemana]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Horario no configurado" });
    }

    const horario = result.rows[0];
    const abierto = horario.abierto && 
                    horaActual >= horario.hora_apertura && 
                    horaActual < horario.hora_cierre;

    res.json({ 
      ok: true, 
      abierto,
      hora_apertura: horario.hora_apertura,
      hora_cierre: horario.hora_cierre
    });
  } catch (err) {
    next(err);
  }
};

const getEstadisticasHoy = async (req, res, next) => {
  try {
    const { comercioId } = req.params;
    
    // Pedidos de hoy
    const pedidosResult = await pool.query(
      `SELECT COUNT(*) as total_pedidos, COALESCE(SUM(total), 0) as ingresos
       FROM pedidos p
       JOIN mesas m ON p.mesa_id = m.id
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE s.comercio_id = $1 
         AND DATE(p.creado_en) = CURRENT_DATE
         AND p.estado = 'entregado'`,
      [comercioId]
    );

    // Mesas ocupadas ahora
    const mesasResult = await pool.query(
      `SELECT COUNT(DISTINCT m.id) as mesas_ocupadas
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       LEFT JOIN pedidos p ON p.mesa_id = m.id AND p.estado NOT IN ('entregado', 'pagado')
       WHERE s.comercio_id = $1 AND p.id IS NOT NULL`,
      [comercioId]
    );

    const pedidos = pedidosResult.rows[0];
    const mesas = mesasResult.rows[0];

    res.json({
      ok: true,
      totalPedidos: parseInt(pedidos.total_pedidos) || 0,
      ingresos: parseFloat(pedidos.ingresos) || 0,
      mesasOcupadas: parseInt(mesas.mesas_ocupadas) || 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginAdmin, getHorarios, actualizarHorario, verificarLocalAbierto, getEstadisticasHoy };