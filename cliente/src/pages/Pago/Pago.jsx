import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Pago.module.css";
import { ITEMS_MENU } from "../../constants/menu";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

// ─── Subcomponente: resumen compacto del pedido ───────────────────────────────
function ResumenCompacto({ pedido, total }) {
  const items = Object.entries(pedido)
    .map(([id, cantidad]) => {
      const item = ITEMS_MENU.find((i) => i.id === id);
      return item ? { ...item, cantidad } : null;
    })
    .filter(Boolean);

  return (
    <div className={styles.seccion}>
      <div className={styles.seccionHeader}>Resumen</div>

      {items.map((item) => (
        <div key={item.id} className={styles.resumenItem}>
          <span className={styles.resumenItemNombre}>
            <span className={styles.resumenItemCant}>x{item.cantidad}</span>
            {item.nombre}
          </span>
          <span className={styles.resumenItemPrecio}>
            {formatPrecio(item.precio * item.cantidad)}
          </span>
        </div>
      ))}

      <div className={styles.totalDestacado}>
        <span className={styles.totalDestacadoLabel}>Total a pagar</span>
        <span className={styles.totalDestacadoValor}>{formatPrecio(total)}</span>
      </div>
    </div>
  );
}

// ─── Subcomponente: formulario de pago online ─────────────────────────────────
function FormularioPagoOnline({ total, onConfirmar, procesando }) {
  const [subMetodo, setSubMetodo]   = useState("debito");
  const [numeroTarjeta, setNumero]  = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv]               = useState("");
  const [nombre, setNombre]         = useState("");

  const SUB_METODOS = [
    { id: "debito",   label: "Débito" },
    { id: "credito",  label: "Crédito" },
    { id: "webpay",   label: "Webpay" },
  ];

  const handlePagar = () => {
    // Aquí irá la integración real con Transbank / Webpay
    onConfirmar({ subMetodo, numeroTarjeta });
  };

  return (
    <div className={styles.seccion}>
      <div className={styles.seccionHeader}>Datos de pago</div>
      <div className={styles.pagoOnlineWrap}>

        {/* Selector de sub-método */}
        <div className={styles.metodosPago}>
          {SUB_METODOS.map((m) => (
            <button
              key={m.id}
              className={`${styles.metodoPagoChip} ${subMetodo === m.id ? styles.metodoPagoChipActivo : ""}`}
              onClick={() => setSubMetodo(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Número de tarjeta */}
        <div className={styles.inputGrupo}>
          <label className={styles.inputLabel}>Número de tarjeta</label>
          <input
            className={styles.input}
            type="text"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            value={numeroTarjeta}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 16);
              setNumero(val.replace(/(.{4})/g, "$1 ").trim());
            }}
          />
        </div>

        {/* Nombre */}
        <div className={styles.inputGrupo}>
          <label className={styles.inputLabel}>Nombre en la tarjeta</label>
          <input
            className={styles.input}
            type="text"
            placeholder="NOMBRE APELLIDO"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.toUpperCase())}
          />
        </div>

        {/* Expiración y CVV */}
        <div className={styles.inputRow}>
          <div className={styles.inputGrupo}>
            <label className={styles.inputLabel}>Expiración</label>
            <input
              className={styles.input}
              type="text"
              placeholder="MM/AA"
              maxLength={5}
              value={expiracion}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExpiracion(val.length > 2 ? val.slice(0, 2) + "/" + val.slice(2) : val);
              }}
            />
          </div>
          <div className={styles.inputGrupo}>
            <label className={styles.inputLabel}>CVV</label>
            <input
              className={styles.input}
              type="text"
              placeholder="123"
              maxLength={3}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            />
          </div>
        </div>

        {/* Botón pagar */}
        <button
          className={styles.btnConfirmar}
          onClick={handlePagar}
          disabled={procesando || !numeroTarjeta || !nombre || !expiracion || !cvv}
        >
          {procesando
            ? <><div className={styles.spinner} /> Procesando...</>
            : <>Pagar {formatPrecio(total)} →</>
          }
        </button>

      </div>
    </div>
  );
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────
function PantallaExito({ metodoPago, mesaId, total, navigate }) {
  const MENSAJES = {
    online:   { icono: "✅", titulo: "¡Pago exitoso!", desc: "Tu pago fue procesado correctamente. ¡Disfruta tu pedido!" },
    efectivo: { icono: "💵", titulo: "¡Pedido confirmado!", desc: "Un garzón pasará pronto a cobrarte en efectivo." },
    garzon:   { icono: "🙋", titulo: "¡En camino!", desc: "Un garzón se dirigirá a tu mesa en breve para atenderte." },
  };

  const msg = MENSAJES[metodoPago] || MENSAJES.online;

  return (
    <div className={`${styles.exitoPage} fade-up`}>
      <div className={styles.exitoCard}>
        <div className={`${styles.exitoIcono} check-pop`}>{msg.icono}</div>
        <h2 className={styles.exitoTitulo}>{msg.titulo}</h2>
        <p className={styles.exitoDesc}>{msg.desc}</p>

        <div className={styles.exitoDetalle}>
          <div className={styles.exitoDetalleRow}>
            <span className={styles.exitoDetalleLabel}>Mesa</span>
            <span className={styles.exitoDetalleValor}>#{mesaId}</span>
          </div>
          <div className={styles.exitoDetalleRow}>
            <span className={styles.exitoDetalleLabel}>Método de pago</span>
            <span className={styles.exitoDetalleValor}>
              {{ online: "Online", efectivo: "Efectivo", garzon: "Asistencia" }[metodoPago]}
            </span>
          </div>
          {metodoPago === "online" && (
            <div className={styles.exitoDetalleRow}>
              <span className={styles.exitoDetalleLabel}>Total pagado</span>
              <span className={styles.exitoDetalleTotal}>{formatPrecio(total)}</span>
            </div>
          )}
        </div>

        <p className={styles.exitoNota}>
          Puedes seguir pidiendo desde el menú si lo deseas.{"\n"}
          ¡Gracias por tu preferencia! 🍹
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Pago() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    pedido     = {},
    mesaId     = "?",
    metodoPago = "online",
    nota       = "",
    total      = 0,
  } = location.state || {};

  const [procesando, setProcesando] = useState(false);
  const [exitoso, setExitoso]       = useState(false);

  const confirmarPedido = () => {
    setProcesando(true);
    // Aquí irá la llamada real al backend para registrar el pedido
    setTimeout(() => {
      setProcesando(false);
      setExitoso(true);
    }, 2000);
  };

  // ── Pantalla éxito ──────────────────────────────────────────────────────────
  if (exitoso) {
    return (
      <PantallaExito
        metodoPago={metodoPago}
        mesaId={mesaId}
        total={total}
        navigate={navigate}
      />
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1 className={styles.headerTitulo}>Confirmar pedido</h1>
        <span className={styles.headerMesa}>Mesa #{mesaId}</span>
      </div>

      <div className={styles.contenido}>

        {/* ── Resumen compacto ── */}
        <ResumenCompacto pedido={pedido} total={total} />

        {/* ── Vista según método de pago ── */}

        {/* ONLINE: formulario de tarjeta */}
        {metodoPago === "online" && (
          <FormularioPagoOnline
            total={total}
            onConfirmar={confirmarPedido}
            procesando={procesando}
          />
        )}

        {/* EFECTIVO: confirmación simple */}
        {metodoPago === "efectivo" && (
          <div className={styles.seccion}>
            <div className={styles.estadoWrap}>
              <div className={styles.estadoIcono}>💵</div>
              <h2 className={styles.estadoTitulo}>Pago en efectivo</h2>
              <p className={styles.estadoDesc}>
                Al confirmar tu pedido, un garzón pasará a cobrarte a la mesa.
                Ten listo <strong>{formatPrecio(total)}</strong>.
              </p>
              <span className={`${styles.estadoBadge} ${styles.badgeEfectivo}`}>
                Total: {formatPrecio(total)}
              </span>
              <button
                className={styles.btnConfirmar}
                onClick={confirmarPedido}
                disabled={procesando}
              >
                {procesando
                  ? <><div className={styles.spinner} /> Enviando pedido...</>
                  : "Confirmar pedido →"
                }
              </button>
            </div>
          </div>
        )}

        {/* GARZÓN: solicitud de ayuda */}
        {metodoPago === "garzon" && (
          <div className={styles.seccion}>
            <div className={styles.estadoWrap}>
              <div className={styles.estadoIcono}>🙋</div>
              <h2 className={styles.estadoTitulo}>Solicitar garzón</h2>
              <p className={styles.estadoDesc}>
                Un garzón se acercará a tu mesa para tomar tu pedido
                y resolver cualquier consulta que tengas.
              </p>
              <span className={`${styles.estadoBadge} ${styles.badgeGarzon}`}>
                Mesa #{mesaId} · Asistencia solicitada
              </span>
              <button
                className={styles.btnConfirmar}
                onClick={confirmarPedido}
                disabled={procesando}
              >
                {procesando
                  ? <><div className={styles.spinner} /> Enviando solicitud...</>
                  : "Llamar garzón →"
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
