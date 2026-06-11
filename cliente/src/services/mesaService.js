import api from "./api";

// Verifica que una mesa existe por su QR o número
// Retorna los datos del comercio asociado a esa mesa
const verificarMesa = async (qrCodigo) => {
  const data = await api.get(`/mesas/verificar/${qrCodigo}`);
  return data.mesa;
};

const getMesas = async (sucursalId) => {
  const data = await api.get(`/mesas/${sucursalId}`);
  return data.mesas;
};

export const mesaService = { verificarMesa, getMesas };
