import api from "./api";

const obtener = async (comercioId) => {
  const data = await api.get(`/admin/garzones/${comercioId}`);
  return data.garzones || [];
};

const crear = async (garzon) => {
  const data = await api.post("/admin/garzones", garzon);
  return data.garzon;
};

const actualizar = async (garzonId, garzon) => {
  const data = await api.put(`/admin/garzones/${garzonId}`, garzon);
  return data.garzon;
};

const eliminar = async (garzonId) => api.delete(`/admin/garzones/${garzonId}`);

const asignarMesa = async (mesaId, garzonId) => {
  const data = await api.post("/admin/asignaciones/mesa", { mesaId, garzonId });
  return data.asignacion;
};

const desasignarMesa = async (mesaId) => api.delete(`/admin/asignaciones/mesa/${mesaId}`);

export const garzonesService = { obtener, crear, actualizar, eliminar, asignarMesa, desasignarMesa };
