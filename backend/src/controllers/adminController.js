const pool = require("../config/db");
const crypto = require("crypto");

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

    // Estado manual actual de las mesas
    const mesasResult = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE m.estado = 'ocupada') AS mesas_ocupadas,
              COUNT(*) FILTER (WHERE m.estado = 'disponible') AS mesas_libres
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE s.comercio_id = $1 AND m.activa = true`,
      [comercioId]
    );

    const pedidos = pedidosResult.rows[0];
    const mesas = mesasResult.rows[0];

    res.json({
      ok: true,
      totalPedidos: parseInt(pedidos.total_pedidos) || 0,
      ingresos: parseFloat(pedidos.ingresos) || 0,
      mesasOcupadas: parseInt(mesas.mesas_ocupadas) || 0,
      mesasLibres: parseInt(mesas.mesas_libres) || 0,
    });
  } catch (err) {
    next(err);
  }
};

const getGarzones = async (req, res, next) => {
  try {
    const { comercioId } = req.params;
    const result = await pool.query(
      `SELECT g.id, g.nombre, g.email, g.sucursal_id, g.activo,
              COALESCE(
                json_agg(json_build_object('id', m.id, 'numero', m.numero)
                ORDER BY m.numero) FILTER (WHERE m.id IS NOT NULL),
                '[]'::json
              ) AS mesas
       FROM garzones g
       JOIN sucursales s ON s.id = g.sucursal_id
       LEFT JOIN asignaciones_garzon ag ON ag.garzon_id = g.id AND ag.activo = true
       LEFT JOIN mesas m ON m.id = ag.mesa_id AND m.activa = true
       WHERE s.comercio_id = $1
       GROUP BY g.id
       ORDER BY g.nombre ASC`,
      [comercioId]
    );
    res.json({ ok: true, garzones: result.rows });
  } catch (err) {
    next(err);
  }
};

const crearGarzon = async (req, res, next) => {
  try {
    const { nombre, email, password, sucursalId } = req.body;
    if (!nombre?.trim() || !email?.trim() || !password || !sucursalId) {
      return res.status(400).json({ ok: false, mensaje: "Nombre, email, contraseña y sucursal son requeridos" });
    }

    const existente = await pool.query("SELECT id FROM garzones WHERE LOWER(email) = LOWER($1) LIMIT 1", [email.trim()]);
    if (existente.rows.length > 0) {
      return res.status(400).json({ ok: false, mensaje: "Ya existe un garzón con ese email" });
    }

    const result = await pool.query(
      `INSERT INTO garzones (id, nombre, email, password_hash, sucursal_id, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nombre, email, sucursal_id, activo`,
      [crypto.randomUUID(), nombre.trim(), email.trim(), password, sucursalId]
    );
    res.status(201).json({ ok: true, garzon: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const actualizarGarzon = async (req, res, next) => {
  try {
    const { garzonId } = req.params;
    const { nombre, email, password, activo } = req.body;
    const result = await pool.query(
      `UPDATE garzones
       SET nombre = $1, email = $2, activo = $3,
           password_hash = CASE WHEN NULLIF($4, '') IS NULL THEN password_hash ELSE $4 END
       WHERE id = $5
       RETURNING id, nombre, email, sucursal_id, activo`,
      [nombre?.trim(), email?.trim(), activo !== false, password || "", garzonId]
    );
    if (result.rows.length === 0) return res.status(404).json({ ok: false, mensaje: "Garzón no encontrado" });
    res.json({ ok: true, garzon: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const eliminarGarzon = async (req, res, next) => {
  try {
    const { garzonId } = req.params;
    const result = await pool.query(
      `UPDATE garzones SET activo = false WHERE id = $1 RETURNING id`,
      [garzonId]
    );
    if (result.rows.length === 0) return res.status(404).json({ ok: false, mensaje: "Garzón no encontrado" });
    await pool.query("UPDATE asignaciones_garzon SET activo = false WHERE garzon_id = $1", [garzonId]);
    res.json({ ok: true, mensaje: "Garzón desactivado" });
  } catch (err) {
    next(err);
  }
};

const asignarMesaAGarzon = async (req, res, next) => {
  try {
    const { garzonId, mesaId } = req.body;
    if (!garzonId || !mesaId) return res.status(400).json({ ok: false, mensaje: "Garzón y mesa son requeridos" });

    const validacion = await pool.query(
      `SELECT 1
       FROM garzones g
       JOIN mesas m ON m.sucursal_id = g.sucursal_id
       WHERE g.id = $1 AND m.id = $2 AND g.activo = true AND m.activa = true`,
      [garzonId, mesaId]
    );
    if (validacion.rows.length === 0) return res.status(400).json({ ok: false, mensaje: "Garzón y mesa no pertenecen a la misma sucursal" });

    await pool.query("UPDATE asignaciones_garzon SET activo = false WHERE mesa_id = $1 AND activo = true", [mesaId]);
    const result = await pool.query(
      `INSERT INTO asignaciones_garzon (garzon_id, mesa_id, activo)
       VALUES ($1, $2, true)
       RETURNING garzon_id, mesa_id, activo`,
      [garzonId, mesaId]
    );
    res.json({ ok: true, asignacion: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const desasignarMesa = async (req, res, next) => {
  try {
    const { mesaId } = req.params;
    await pool.query("UPDATE asignaciones_garzon SET activo = false WHERE mesa_id = $1 AND activo = true", [mesaId]);
    res.json({ ok: true, mensaje: "Mesa desasignada" });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginAdmin, getHorarios, actualizarHorario, verificarLocalAbierto, getEstadisticasHoy, getGarzones, crearGarzon, actualizarGarzon, eliminarGarzon, asignarMesaAGarzon, desasignarMesa };