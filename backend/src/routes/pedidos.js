const express = require("express");
const router  = express.Router();
const pedidosController = require("../controllers/pedidosController");

// POST /api/pedidos              → crea un nuevo pedido
// GET  /api/pedidos/mesa/:mesaId → obtiene pedidos activos de una mesa
// PUT  /api/pedidos/:id/estado   → actualiza el estado de un pedido
router.post("/",                    pedidosController.crearPedido);
router.get("/mesa/:mesaId",         pedidosController.getPedidosMesa);
router.put("/:id/estado",           pedidosController.actualizarEstado);

module.exports = router;
