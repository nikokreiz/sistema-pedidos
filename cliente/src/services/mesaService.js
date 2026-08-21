import api from "./api";
import { getEmoji } from "../constants/emojiMap";

const getMenu = async (comercioId) => {
  const data = await api.get(`/menu/${comercioId}`);
  
  // Transforma la respuesta para que sea compatible
  const items = [];
  data.categorias.forEach((cat) => {
    if (cat.items && cat.items.length > 0) {
      cat.items.forEach((item) => {
        if (item && item.id) {
          const imagenUrl = item.imagen_url || "";
          items.push({
            ...item,
            categoria_id: item.categoria_id || cat.id,
            precio: parseFloat(item.precio),
            imagen_url: imagenUrl,
            imagen: imagenUrl || getEmoji(item.imagen_url),
          });
        }
      });
    }
  });

  return {
    categorias: data.categorias,
    items,
  };
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

export const mesaService = { 
  getMenu, 
  verificarMesa,
  verificarMesaPorQR, 
  getMesas,
  verificarLocalAbierto
};