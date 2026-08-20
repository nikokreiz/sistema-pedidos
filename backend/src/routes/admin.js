const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/login", adminController.loginAdmin);
router.get("/horarios/:comercioId", adminController.getHorarios);
router.put("/horarios/:comercioId/:diaSemana", adminController.actualizarHorario);

module.exports = router;