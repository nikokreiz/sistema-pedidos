import { useState } from "react";
import styles from "./PedidoCard.module.css";
import api from "../../../services/api";

// Calcula tiempo transcurrido desde que llegó el pedido
const tiempoTranscurrido = (fechaStr) => {
  const diff = Math.floor((Date.now() - new Date(fechaStr)) / 1000);
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
};

const ESTADOS = {
  pendiente:  { label: "Pendiente",  badge: styles.badgePendiente,  card: styles.cardPendiente  },
  preparando: { label: "Preparando", badge: styles.badgePreparando, card: styles.cardPreparando },
  listo:      { label: "Listo",      badge: styles.badgeListo,      card: styles.cardListo      },
};

export default function PedidoCard({ pedido, onEstadoCambiado }) {
  const [cargando, setCargando] = useState(false);
  const estado = ESTADOS[pedido.estado] || ESTADOS.pendiente;

  const cambiarEstado = async (nuevoEstado) => {
    setCargando(true);
    try {
      await api.put(`/pedidos/${pedido.id}/estado`, { estado: nuevoEstado });
      onEstadoCambiado(pedido.id, nuevoEstado);
    } catch (err) {
      console.error("Error al cambiar estado:", err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={`${styles.card} ${estado.card}`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.mesaInfo}>
          <span className={styles.mesaNumero}>Mesa {pedido.mesa_numero || "?"}</span>
          <span className={styles.tiempo}>
            {tiempoTranscurrido(pedido.creado_en)}
          </span>
        </div>
        <span className={`${styles.badge} ${estado.badge}`}>
          {estado.label}
        </span>
      </div>

      {/* Items */}
      <div className={styles.items}>
        {pedido.items?.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.itemCantidad}>x{item.cantidad}</span>
            <span className={styles.itemNombre}>{item.nombre}</span>
          </div>
        ))}
      </div>

      {/* Nota de cocina */}
      {pedido.nota && (
        <div className={styles.nota}>Nota: {pedido.nota}</div>
      )}

      {/* Botón de acción */}
      <div className={styles.footer}>
        {pedido.estado === "pendiente" && (
          <button
            className={`${styles.btnAccion} ${styles.btnIniciar}`}
            onClick={() => cambiarEstado("preparando")}
            disabled={cargando}
          >
            {cargando ? <><div className={styles.spinner} /> Actualizando...</> : "Iniciar preparacion"}
          </button>
        )}
        {pedido.estado === "preparando" && (
          <button
            className={`${styles.btnAccion} ${styles.btnListo}`}
            onClick={() => cambiarEstado("listo")}
            disabled={cargando}
          >
            {cargando ? <><div className={styles.spinner} /> Actualizando...</> : "Marcar como listo"}
          </button>
        )}
        {pedido.estado === "listo" && (
          <button className={`${styles.btnAccion} ${styles.btnDeshabilitado}`} disabled>
            Esperando garzon...
          </button>
        )}
      </div>

    </div>
  );
}
