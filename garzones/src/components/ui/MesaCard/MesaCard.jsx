import { useState } from "react";
import styles from "./MesaCard.module.css";
import api from "../../../services/api";

const ESTADOS = {
  ocupada: { label: "Ocupada", badge: styles.badgeOcupada, card: styles.cardOcupada },
  lista:   { label: "Lista", badge: styles.badgeLista, card: styles.cardLista },
  limpia:  { label: "Limpia", badge: styles.badgeLimpia, card: styles.cardLimpia },
};

export default function MesaCard({ mesa, onEntregado }) {
  const [cargando, setCargando] = useState(false);
  const estado = ESTADOS[mesa.estado] || ESTADOS.ocupada;

  const handleEntregado = async () => {
  setCargando(true);
  try {
    await api.put(`/garzones/${mesa.pedido_id}/entregado`);
    onEntregado(mesa.pedido_id);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    setCargando(false);
  }
};

const handleLlamar = async () => {
  try {
    await api.post(`/garzones/${mesa.id}/auxilio`);
    alert("Auxilio enviado al personal de apoyo!");
  } catch (err) {
    console.error("Error:", err.message);
  }
};

  return (
  <div className={`${styles.card} ${estado.card}`}>

    <div className={styles.header}>
      <span className={styles.numero}>#{mesa.numero}</span>
      <span className={`${styles.badge} ${estado.badge}`}>{estado.label}</span>
    </div>

    {mesa.items && mesa.items.length > 0 && (
      <div className={styles.pedido}>
        <div className={styles.pedidoNumero}>Items a entregar</div>
        {mesa.items.map((item, i) => (
          <div key={i} className={styles.pedidoItem}>
            <span className={styles.pedidoItemNombre}>{item.nombre}</span>
            <span className={styles.pedidoItemCant}>x{item.cantidad}</span>
          </div>
        ))}
      </div>
    )}

    <div className={styles.botones}>
      <button
        className={`${styles.btn} ${styles.btnLlamada}`}
        onClick={handleLlamar}
        disabled={cargando}
      >
        📞 SOS
      </button>
      {mesa.estado === "lista" && (
        <button
          className={`${styles.btn} ${styles.btnEntregado}`}
          onClick={handleEntregado}
          disabled={cargando}
        >
          {cargando
            ? <><div className={styles.spinner} /></>
            : "✓ Entregado"
          }
        </button>
      )}
      {mesa.estado === "limpia" && (
        <button
          className={`${styles.btn} ${styles.btnDeshabilitado}`}
          disabled
        >
          Limpia
        </button>
      )}
    </div>

  </div>
);
}