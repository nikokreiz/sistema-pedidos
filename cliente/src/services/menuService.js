import api from "./api";
import { getEmoji } from "../constants/emojiMap";

const getMenu = async (comercioId) => {
  const data = await api.get(`/menu/${comercioId}`);
  return {
    categorias: data.categorias,
    items: data.items.map((item) => ({
      ...item,
      precio: parseFloat(item.precio),
      imagen: getEmoji(item.imagen_url),
    })),
  };
};

export const menuService = { getMenu };