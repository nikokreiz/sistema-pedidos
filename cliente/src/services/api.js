import axios from "axios";

// Instancia base de axios
// Todas las llamadas al backend pasan por aquí
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de respuesta — manejo centralizado de errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const mensaje =
      error.response?.data?.mensaje ||
      error.message ||
      "Error de conexión con el servidor";
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
