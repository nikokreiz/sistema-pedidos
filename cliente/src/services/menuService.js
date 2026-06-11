import api from "./api";

// Obtiene categorías e items del menú de un comercio
const getMenu = async (comercioId) => {
  const data = await api.get(`/menu/${comercioId}`);
  return {
  categorias: data.categorias,
  items: data.items.map((item) => ({
    ...item,
    precio: parseFloat(item.precio),
  })),
};
};

export const menuService = { getMenu };
