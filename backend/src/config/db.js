const { Pool } = require("pg");
require("dotenv").config();

// Pool de conexiones a PostgreSQL
// Un pool reutiliza conexiones en vez de abrir una nueva por cada request
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Verifica la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
  } else {
    console.log("✅ Conectado a PostgreSQL correctamente");
    release();
  }
});

module.exports = pool;
