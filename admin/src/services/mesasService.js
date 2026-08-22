import api from "./api";

const obtenerMesas = async (sucursalId) => {
  const data = await api.get(`/mesas/sucursal/${sucursalId}`);
  return data.mesas;
};

const crearMesa = async (sucursalId, numero, capacidad) => {
  const data = await api.post("/mesas", {
    sucursalId,
    numero: parseInt(numero),
    capacidad: parseInt(capacidad),
  });
  return data.mesa;
};

const actualizarMesa = async (mesaId, numero, capacidad, activa) => {
  const data = await api.put(`/mesas/${mesaId}`, {
    numero: parseInt(numero),
    capacidad: parseInt(capacidad),
    activa,
  });
  return data.mesa;
};

const eliminarMesa = async (mesaId) => {
  const data = await api.delete(`/mesas/${mesaId}`);
  return data;
};

export const mesasService = { obtenerMesas, crearMesa, actualizarMesa, eliminarMesa };