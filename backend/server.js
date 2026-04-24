const http    = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app    = require("./src/app");
const PORT   = process.env.PORT || 3000;

// ── Servidor HTTP base ─────────────────────────────────────
// Usamos http.createServer en vez de app.listen directo
// para poder adjuntarle Socket.io más adelante
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────
// Por ahora solo inicializa la conexión base
// La lógica de tiempo real se irá agregando por módulo
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Hacemos io accesible desde los controladores
app.set("io", io);

// ── Arrancar servidor ──────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
