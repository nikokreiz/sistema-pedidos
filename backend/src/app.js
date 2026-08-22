const express    = require("express");
const cors       = require("cors");
require("dotenv").config();

const errorHandler = require("./middlewares/errorHandler");

// ── Rutas ──────────────────────────────────────────────────
const menuRoutes    = require("./routes/menu");
const mesasRoutes   = require("./routes/mesas");
const pedidosRoutes = require("./routes/pedidos");
const authRoutes = require("./routes/auth");
const garzoneRoutes = require("./routes/garzones");
const adminRoutes = require("./routes/admin");


const app = express();

// ── Middlewares globales ───────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// ── Health check ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API Sistema Pedidos funcionando 🚀" });
});

// ── Rutas de la API ────────────────────────────────────────
app.use("/api/menu",    menuRoutes);
app.use("/api/mesas",   mesasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/garzones", garzoneRoutes);
app.use("/api/admin", adminRoutes);

// ── Manejo de rutas no encontradas ─────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: "Ruta no encontrada" });
});

// ── Manejo global de errores ───────────────────────────────
app.use(errorHandler);

module.exports = app;
