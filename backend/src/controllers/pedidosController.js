const pool = require("../config/db");

// POST /api/pedidos
const crearPedido = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { mesa_numero, items, metodo_pago, nota, correo } = req.body;

    await client.query("BEGIN");

    // 1 — Buscar la mesa por número y obtener su UUID y sucursal
    const mesaResult = await client.query(
      `SELECT m.id, m.sucursal_id
       FROM mesas m
       JOIN sucursales s ON m.sucursal_id = s.id
       WHERE m.numero = $1 AND m.activa = true
       LIMIT 1`,
      [mesa_numero]
    );

    if (mesaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false, mensaje: "Mesa no encontrada" });
    }

    const mesa = mesaResult.rows[0];

    // 2 — Crear o reutilizar sesión activa de la mesa
    let sesionId;
    const sesionExistente = await client.query(
      `SELECT id FROM sesiones_mesa
       WHERE mesa_id = $1 AND estado = 'activa'
       LIMIT 1`,
      [mesa.id]
    );

    if (sesionExistente.rows.length > 0) {
      sesionId = sesionExistente.rows[0].id;
    } else {
      const nuevaSesion = await client.query(
        `INSERT INTO sesiones_mesa (mesa_id, estado)
         VALUES ($1, 'activa') RETURNING id`,
        [mesa.id]
      );
      sesionId = nuevaSesion.rows[0].id;
    }

    // 3 — Crear el pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (mesa_id, sesion_id, metodo_pago, estado, total)
       VALUES ($1, $2, $3, 'pendiente', 0)
       RETURNING id`,
      [mesa.id, sesionId, metodo_pago]
    );
    const pedidoId = pedidoResult.rows[0].id;

    // 4 — Insertar items y calcular total
    let total = 0;
    const itemsDetalle = [];

    for (const item of items) {
      const itemResult = await client.query(
        `SELECT id, nombre, precio FROM items_menu WHERE id = $1`,
        [item.item_id]
      );

      if (itemResult.rows.length === 0) continue;

      const { precio, nombre } = itemResult.rows[0];
      const subtotal = parseFloat(precio) * item.cantidad;
      total += subtotal;

      await client.query(
        `INSERT INTO items_pedido (pedido_id, item_menu_id, cantidad, precio_unitario, notas)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedidoId, item.item_id, item.cantidad, precio, nota || null]
      );

      itemsDetalle.push({ nombre, cantidad: item.cantidad, precio });
    }

    // 5 — Actualizar total del pedido
    await client.query(
      `UPDATE pedidos SET total = $1 WHERE id = $2`,
      [total, pedidoId]
    );

    await client.query("COMMIT");

    // 6 — Emitir evento Socket.io a la cocina en tiempo real
    const io = req.app.get("io");
    io.emit("nuevo_pedido", {
      pedidoId,
      mesaNumero: mesa_numero,
      items:      itemsDetalle,
      metodoPago: metodo_pago,
      total,
      correo,
    });

    res.status(201).json({ ok: true, pedidoId, total, correo });

  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/pedidos/mesa/:mesaId
const getPedidosMesa = async (req, res, next) => {
  try {
    const { mesaId } = req.params;

    const result = await pool.query(
      `SELECT p.id, p.estado, p.metodo_pago, p.total, p.creado_en,
              json_agg(json_build_object(
                'item_id',         ip.item_menu_id,
                'nombre',          im.nombre,
                'cantidad',        ip.cantidad,
                'precio_unitario', ip.precio_unitario,
                'estado',          ip.estado
              )) AS items
       FROM pedidos p
       JOIN items_pedido ip ON ip.pedido_id = p.id
       JOIN items_menu   im ON im.id = ip.item_menu_id
       WHERE p.mesa_id = $1
         AND p.estado NOT IN ('pagado')
       GROUP BY p.id
       ORDER BY p.creado_en DESC`,
      [mesaId]
    );

    res.json({ ok: true, pedidos: result.rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/pedidos/:id/estado
const actualizarEstado = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { estado } = req.body;

    const ESTADOS_VALIDOS = ["pendiente", "preparando", "listo", "entregado", "pagado"];
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: "Estado no válido" });
    }

    const result = await pool.query(
      `UPDATE pedidos SET estado = $1, actualizado_en = NOW()
       WHERE id = $2 RETURNING id, estado, mesa_id`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: "Pedido no encontrado" });
    }

    const io = req.app.get("io");
    io.emit("pedido_actualizado", result.rows[0]);

    res.json({ ok: true, pedido: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getPedidosActivos = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.estado, p.metodo_pago, p.total,
              p.creado_en, m.numero AS mesa_numero,
              json_agg(json_build_object(
                'nombre',   im.nombre,
                'cantidad', ip.cantidad
              )) AS items
       FROM pedidos p
       JOIN mesas m        ON m.id = p.mesa_id
       JOIN items_pedido ip ON ip.pedido_id = p.id
       JOIN items_menu   im ON im.id = ip.item_menu_id
       WHERE p.estado NOT IN ('entregado','pagado')
       GROUP BY p.id, m.numero
       ORDER BY p.creado_en ASC`
    );
    res.json({ ok: true, pedidos: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { crearPedido, getPedidosMesa, actualizarEstado, getPedidosActivos };
