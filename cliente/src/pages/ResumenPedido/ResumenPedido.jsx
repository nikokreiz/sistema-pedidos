import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResumenPedido.module.css";
import { ITEMS_MENU } from "../../constants/menu";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

// ─── Métodos de pago ──────────────────────────────────────────────────────────
const METODOS_PAGO = [
  {
    id: "online",
    nombre: "Pago Online",
    desc: "Webpay, débito o crédito. Rápido y seguro.",
    icono: "💳",
    estilo: styles.metodoOnline,
  },
  {
    id: "efectivo",
    nombre: "Pagar en efectivo",
    desc: "Un garzón pasará a cobrarte a la mesa.",
    icono: "💵",
    estilo: styles.metodoEfectivo,
  },
  {
    id: "garzon",
    nombre: "¡Necesito un garzón!",
    desc: "Te enviamos a alguien de inmediato.",
    icono: "🙋",
    estilo: styles.metodoGarzon,
  },
];

export default function ResumenPedido() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { pedido: pedidoInicial = {}, mesaId = "?", items: itemsMenu = [] } = location.state || {};


  const [pedido, setPedido] = useState(pedidoInicial);
  const [nota, setNota]     = useState("");

  // ── Items con detalle ───────────────────────────────────────────────────────
  const itemsConDetalle = Object.entries(pedido)
    .map(([id, cantidad]) => {
      const item = itemsMenu.find((i) => i.id === id);
      return item ? { ...item, cantidad } : null;
    })
    .filter(Boolean);

  // ── Totales ─────────────────────────────────────────────────────────────────
  const totalItems  = itemsConDetalle.reduce((a, i) => a + i.cantidad, 0);
  const subtotal    = itemsConDetalle.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const propina     = Math.round(subtotal * 0.1);
  const total       = subtotal + propina;

  // ── Edición del pedido ──────────────────────────────────────────────────────
  const aumentar = (id) => {
    setPedido((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const disminuir = (id) => {
    setPedido((prev) => {
      const nueva = { ...prev };
      if (nueva[id] <= 1) delete nueva[id];
      else nueva[id] -= 1;
      return nueva;
    });
  };

  // ── Confirmar pedido ────────────────────────────────────────────────────────
  const confirmarPedido = (metodoPago) => {
  navigate("/pago", {
    state: { pedido, mesaId, metodoPago, nota, total, items: itemsMenu },
  });
};

  // ── Carrito vacío ───────────────────────────────────────────────────────────
  if (itemsConDetalle.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.btnVolver} onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <h1 className={styles.headerTitulo}>Tu pedido</h1>
        </div>
        <div className={styles.vacio}>
          <div className={styles.vacioIcon}>🛒</div>
          <h2 className={styles.vacioTitulo}>Tu pedido está vacío</h2>
          <p className={styles.vacioDesc}>
            Vuelve al menú y agrega lo que quieras consumir.
          </p>
          <button
            className={styles.btnVolverMenu}
            onClick={() => navigate(`/menu/${mesaId}`)}
          >
            ← Volver al menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1 className={styles.headerTitulo}>Tu pedido</h1>
        <span className={styles.headerMesa}>Mesa #{mesaId}</span>
      </div>

      <div className={styles.contenido}>

        {/* ── Sección: Items del pedido ── */}
        <div className={styles.seccion}>
          <div className={styles.seccionHeader}>
            {totalItems} {totalItems === 1 ? "item" : "items"} seleccionados
          </div>

          {itemsConDetalle.map((item) => (
            <div key={item.id} className={styles.itemFila}>

              {/* Emoji */}
              <div className={styles.itemEmoji}>{item.imagen}</div>

              {/* Info */}
              <div className={styles.itemInfo}>
                <p className={styles.itemNombre}>{item.nombre}</p>
                <p className={styles.itemPrecioUnit}>
                  {formatPrecio(item.precio)} c/u
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className={styles.itemControles}>
                <button
                  className={`${styles.btnCantidad} ${item.cantidad === 1 ? styles.btnCantidadEliminar : ""}`}
                  onClick={() => disminuir(item.id)}
                  title={item.cantidad === 1 ? "Eliminar" : "Quitar uno"}
                >
                  {item.cantidad === 1 ? "🗑" : "−"}
                </button>
                <span className={styles.itemCantidad}>{item.cantidad}</span>
                <button
                  className={styles.btnCantidad}
                  onClick={() => aumentar(item.id)}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <span className={styles.itemSubtotal}>
                {formatPrecio(item.precio * item.cantidad)}
              </span>
            </div>
          ))}

          {/* Totales */}
          <div className={styles.totalesWrap}>
            <div className={styles.totalFila}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalValor}>{formatPrecio(subtotal)}</span>
            </div>
            <div className={styles.totalFila}>
              <span className={styles.totalLabel}>Propina sugerida (10%)</span>
              <span className={styles.totalValor}>{formatPrecio(propina)}</span>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalFila}>
              <span className={styles.totalFinal}>Total</span>
              <span className={styles.totalFinalValor}>{formatPrecio(total)}</span>
            </div>
          </div>
        </div>

        {/* ── Sección: Nota opcional ── */}
        <div className={styles.seccion}>
          <div className={styles.seccionHeader}>Nota para la cocina</div>
          <div className={styles.notaWrap}>
            <label className={styles.notaLabel}>
              Opcional · alergias, preferencias, etc.
            </label>
            <textarea
              className={styles.notaInput}
              rows={3}
              placeholder="Ej: sin cebolla, sin gluten, poco picante..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </div>
        </div>

        {/* ── Sección: Método de pago ── */}
        <div className={styles.seccion}>
          <div className={styles.seccionHeader}>¿Cómo quieres pagar?</div>
          <div className={styles.metodosGrid}>
            {METODOS_PAGO.map((metodo) => (
              <button
                key={metodo.id}
                className={`${styles.metodoBtn} ${metodo.estilo}`}
                onClick={() => confirmarPedido(metodo.id)}
              >
                <div className={styles.metodoIconWrap}>{metodo.icono}</div>
                <div className={styles.metodoTexto}>
                  <p className={styles.metodoNombre}>{metodo.nombre}</p>
                  <p className={styles.metodoDesc}>{metodo.desc}</p>
                </div>
                <span className={styles.metodoFlecha}>→</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
