const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/login", adminController.loginAdmin);
router.get("/horarios/:comercioId", adminController.getHorarios);
router.put("/horarios/:comercioId/:diaSemana", adminController.actualizarHorario);
router.get("/verificar-abierto/:comercioId", adminController.verificarLocalAbierto);
router.get("/estadisticas/:comercioId", adminController.getEstadisticasHoy);
router.get("/garzones/:comercioId", adminController.getGarzones);
router.post("/garzones", adminController.crearGarzon);
router.put("/garzones/:garzonId", adminController.actualizarGarzon);
router.delete("/garzones/:garzonId", adminController.eliminarGarzon);
router.post("/asignaciones/mesa", adminController.asignarMesaAGarzon);
router.delete("/asignaciones/mesa/:mesaId", adminController.desasignarMesa);

module.exports = router;