const pool = require("../config/db");

// POST /api/pedidos
const crearPedido = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { mesa_id, sesion_id, items, metodo_pago, nota } = req.body;

    // Calculamos el total a partir de los precios reales en BD
    await client.query("BEGIN");

    // 1 — Crear el pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (mesa_id, sesion_id, metodo_pago, estado, total)
       VALUES ($1, $2, $3, 'pendiente', 0)
       RETURNING id`,
      [mesa_id, sesion_id, metodo_pago]
    );
    const pedidoId = pedidoResult.rows[0].id;

    // 2 — Insertar cada item y calcular total
    let total = 0;
    for (const item of items) {
      const itemResult = await client.query(
        `SELECT precio FROM items_menu WHERE id = $1`,
        [item.item_id]
      );
      const precio = itemResult.rows[0].precio;
      const subtotal = precio * item.cantidad;
      total += subtotal;

      await client.query(
        `INSERT INTO items_pedido (pedido_id, item_menu_id, cantidad, precio_unitario, notas)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedidoId, item.item_id, item.cantidad, precio, nota || null]
      );
    }

    // 3 — Actualizar el total del pedido
    await client.query(
      `UPDATE pedidos SET total = $1 WHERE id = $2`,
      [total, pedidoId]
    );

    await client.query("COMMIT");

    // 4 — Emitir evento Socket.io a la cocina en tiempo real
    const io = req.app.get("io");
    io.emit("nuevo_pedido", { pedidoId, mesa_id, total });

    res.status(201).json({ ok: true, pedidoId, total });
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
                'item_id',        ip.item_menu_id,
                'nombre',         im.nombre,
                'cantidad',       ip.cantidad,
                'precio_unitario',ip.precio_unitario,
                'estado',         ip.estado
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

    // Emitir evento en tiempo real a garzones y cliente
    const io = req.app.get("io");
    io.emit("pedido_actualizado", result.rows[0]);

    res.json({ ok: true, pedido: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { crearPedido, getPedidosMesa, actualizarEstado };
