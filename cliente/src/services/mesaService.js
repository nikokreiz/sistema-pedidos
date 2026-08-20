import api from "./api";

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

export const mesaService = { verificarMesa, verificarMesaPorQR, getMesas, verificarLocalAbierto };