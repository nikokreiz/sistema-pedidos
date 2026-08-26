const express = require("express");
const router = express.Router();
const garzoneController = require("../controllers/garzoneController");

router.get("/:garzonId/mesas", garzoneController.getMesasGarzon);
router.post("/:mesaId/auxilio", garzoneController.llamarAuxilio);
router.put("/:pedidoId/entregado", garzoneController.marcarEntregado);

module.exports = router;