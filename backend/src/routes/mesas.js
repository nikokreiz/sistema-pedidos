const express = require("express");
const router  = express.Router();
const mesasController = require("../controllers/mesasController");

// GET  /api/mesas/:sucursalId              → obtiene todas las mesas de una sucursal
// GET  /api/mesas/verificar/:qrCodigo     → verifica que una mesa existe por QR clásico
// GET  /api/mesas/qr/:qrCode              → verifica que una mesa existe por QR único
router.get("/:sucursalId",            mesasController.getMesas);
router.get("/verificar/:qrCodigo",    mesasController.verificarMesa);
router.get("/qr/:qrCode",             mesasController.verificarMesaPorQR);

module.exports = router;