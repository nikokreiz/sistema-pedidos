// Middleware global de manejo de errores
// Captura cualquier error que se pase con next(err) en los controladores

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    ok:      false,
    mensaje: err.message || "Error interno del servidor",
    // Solo mostramos el stack en desarrollo
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
