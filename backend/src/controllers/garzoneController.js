const pool = require("../config/db");

const getMesasGarzon = async (req, res, next) => {
  try {
    const { garzonId } = req.params;

    const result = await pool.query(
      `SELECT m.id, m.numero,
              CASE 
                WHEN p.estado = 'listo' THEN 'lista'
                WHEN p.id IS NOT NULL THEN 'ocupada'
                ELSE 'disponible'
              END AS estado,
              COALESCE(
                (SELECT json_agg(json_build_object('nombre', im.nombre, 'cantidad', ip.cantidad))
                 FROM pedidos p2
                 LEFT JOIN items_pedido ip ON ip.pedido_id = p2.id
                 LEFT JOIN items_menu im ON im.id = ip.item_menu_id
                 WHERE p2.mesa_id = m.id AND p2.estado NOT IN ('pagado', 'entregado')
                 LIMIT 1),
                '[]'::json
              ) AS items
       FROM mesas m
       LEFT JOIN asignaciones_garzon ag ON ag.mesa_id = m.id AND ag.activo = true
       LEFT JOIN pedidos p ON p.mesa_id = m.id AND p.estado NOT IN ('pagado', 'entregado')
       WHERE ag.garzon_id = $1
       GROUP BY m.id, m.numero, p.id, p.estado`,
      [garzonId]
    );

    res.json({ ok: true, mesas: result.rows });
  } catch (err) {
    next(err);
  }
};

const llamarAuxilio = async (req, res, next) => {
  try {
    const { mesaId } = req.params;

    await pool.query(
      `INSERT INTO notificaciones (mesa_id, tipo, mensaje)
       VALUES ($1, 'auxilio', 'Garzon solicita auxilio en mesa')`,
      [mesaId]
    );

    const io = req.app.get("io");
    io.emit("auxilio_mesa", { mesaId, timestamp: new Date() });

    res.json({ ok: true, mensaje: "Auxilio enviado" });
  } catch (err) {
    next(err);
  }
};

const marcarEntregado = async (req, res, next) => {
  try {
    const { mesaId } = req.params;

    // Busca cualquier pedido activo (no pagado, no entregado)
    const pedidoResult = await pool.query(
      `SELECT p.id FROM pedidos p
       WHERE p.mesa_id = $1 AND p.estado IN ('listo', 'preparando', 'pendiente')
       ORDER BY p.creado_en DESC
       LIMIT 1`,
      [mesaId]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ 
        ok: false, 
        mensaje: "No hay pedido activo en esta mesa" 
      });
    }

    const pedidoId = pedidoResult.rows[0].id;

    // Marca como entregado
    const updateResult = await pool.query(
      `UPDATE pedidos 
       SET estado = 'entregado', actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, estado`,
      [pedidoId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(500).json({ 
        ok: false, 
        mensaje: "Error al actualizar pedido" 
      });
    }

    const io = req.app.get("io");
    io.emit("pedido_entregado", { pedidoId, mesaId });

    res.json({ ok: true, mensaje: "Pedido entregado correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMesasGarzon, llamarAuxilio, marcarEntregado };