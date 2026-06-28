const express    = require("express");
const cors       = require("cors");
require("dotenv").config();

const errorHandler = require("./middlewares/errorHandler");

// ── Rutas ──────────────────────────────────────────────────
const menuRoutes    = require("./routes/menu");
const mesasRoutes   = require("./routes/mesas");
const pedidosRoutes = require("./routes/pedidos");

const app = express();

// ── Middlewares globales ───────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
}));
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API Sistema Pedidos funcionando 🚀" });
});

// ── Rutas de la API ────────────────────────────────────────
app.use("/api/menu",    menuRoutes);
app.use("/api/mesas",   mesasRoutes);
app.use("/api/pedidos", pedidosRoutes);

// ── Manejo de rutas no encontradas ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" });
});

// ── Manejo global de errores ───────────────────────────────
app.use(errorHandler);

module.exports = app;
