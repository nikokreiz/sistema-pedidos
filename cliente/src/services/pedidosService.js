import api from "./api";

// Crea un nuevo pedido en el backend
// Recibe el estado del pedido desde Pago.jsx
const crearPedido = async ({ mesaNumero, items, pedido, metodoPago, nota, correo }) => {
  // Transforma el objeto { item_id: cantidad } en array para el backend
  const itemsArray = Object.entries(pedido).map(([id, cantidad]) => ({
    item_id:  id,
    cantidad,
  }));

  const data = await api.post("/pedidos", {
    mesa_numero: mesaNumero,
    items:       itemsArray,
    metodo_pago: metodoPago,
    nota:        nota || "",
    correo:      correo || "",
  });

  return data;
};

export const pedidosService = { crearPedido };
