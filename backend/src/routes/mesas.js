const express = require("express");
const router  = express.Router();
const mesasController = require("../controllers/mesasController");

router.get("/:sucursalId",            mesasController.getMesas);
router.get("/verificar/:qrCodigo",    mesasController.verificarMesa);
router.get("/qr/:qrCode",             mesasController.verificarMesaPorQR);
router.get("/sucursal/:sucursalId", mesasController.obtenerMesasPorSucursal);
router.post("/", mesasController.crearMesa);
router.put("/:mesaId", mesasController.actualizarMesa);
router.delete("/:mesaId", mesasController.eliminarMesa);

module.exports = router;