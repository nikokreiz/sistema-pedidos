const express = require("express");
const router  = express.Router();
const menuController = require("../controllers/menuController");

// GET /api/menu/:comercioId  → obtiene categorías e items del menú
router.get("/:comercioId", menuController.getMenu);

module.exports = router;
