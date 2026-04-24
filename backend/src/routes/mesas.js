const express = require("express");
const router  = express.Router();
const mesasController = require("../controllers/mesasController");

// GET  /api/mesas/:sucursalId        → obtiene todas las mesas de una sucursal
// GET  /api/mesas/verificar/:qrCodigo → verifica que una mesa existe por QR
router.get("/:sucursalId",            mesasController.getMesas);
router.get("/verificar/:qrCodigo",    mesasController.verificarMesa);

module.exports = router;
