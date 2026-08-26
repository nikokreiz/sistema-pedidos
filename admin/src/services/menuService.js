import api from "./api";

const getMenu = async (comercioId) => {
  const data = await api.get(`/menu/${comercioId}`);
  return data.categorias;
};

const crearCategoria = async (comercioId, nombre, icono) => {
  const data = await api.post("/menu/categorias", { comercioId, nombre, icono });
  return data.categoria;
};

const crearItem = async (categoriaId, nombre, descripcion, precio, imagenUrl) => {
  const data = await api.post("/menu/items", {
    categoriaId,
    nombre,
    descripcion,
    precio: parseFloat(precio),
    imagenUrl,
  });
  return data.item;
};

const actualizarItem = async (itemId, nombre, descripcion, precio, imagenUrl, activo) => {
  const data = await api.put(`/menu/items/${itemId}`, {
    nombre,
    descripcion,
    precio: parseFloat(precio),
    imagenUrl,
    activo,
  });
  return data.item;
};

const eliminarItem = async (itemId) => {
  const data = await api.delete(`/menu/items/${itemId}`);
  return data;
};

export const menuService = { getMenu, crearCategoria, crearItem, actualizarItem, eliminarItem };