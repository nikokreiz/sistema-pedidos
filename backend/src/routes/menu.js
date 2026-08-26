const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.get("/:comercioId", menuController.getMenu);
router.post("/categorias", menuController.crearCategoria);
router.post("/items", menuController.crearItem);
router.put("/items/:itemId", menuController.actualizarItem);
router.delete("/items/:itemId", menuController.eliminarItem);

module.exports = router;