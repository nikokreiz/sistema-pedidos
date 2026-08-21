import api from "./api";
import { getEmoji } from "../constants/emojiMap";

const getMenu = async (comercioId) => {
  try {
    const data = await api.get(`/menu/${comercioId}`);
    
    if (!data.categorias || !Array.isArray(data.categorias)) {
      throw new Error("Respuesta inválida del servidor");
    }

    // Transforma la respuesta para que sea compatible
    const items = [];
    data.categorias.forEach((cat) => {
      if (cat.items && Array.isArray(cat.items)) {
        cat.items
          .filter((item) => item && item.id) // Filtra items nulos
          .forEach((item) => {
            items.push({
              id: item.id,
              nombre: item.nombre,
              descripcion: item.descripcion || "",
              precio: parseFloat(item.precio) || 0,
              imagen_url: item.imagen_url,
              imagen: getEmoji(item.imagen_url),
              activo: item.activo !== false,
            });
          });
      }
    });

    console.log("Menu cargado:", { categorias: data.categorias.length, items: items.length });

    return {
      categorias: data.categorias,
      items,
    };
  } catch (err) {
    console.error("Error en getMenu:", err);
    throw err;
  }
};

const verificarMesa = async (qrCodigo) => {
  const data = await api.get(`/mesas/verificar/${qrCodigo}`);
  return data.mesa;
};

const verificarMesaPorQR = async (qrCode) => {
  const data = await api.get(`/mesas/qr/${qrCode}`);
  return data.mesa;
};

const getMesas = async (sucursalId) => {
  const data = await api.get(`/mesas/${sucursalId}`);
  return data.mesas;
};

const verificarLocalAbierto = async (comercioId) => {
  const data = await api.get(`/admin/verificar-abierto/${comercioId}`);
  return data;
};

export const menuService = { 
  getMenu,
  verificarMesa, 
  verificarMesaPorQR, 
  getMesas, 
  verificarLocalAbierto
};