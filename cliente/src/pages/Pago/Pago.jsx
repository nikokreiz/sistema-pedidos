import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Pago.module.css";
import { pedidosService } from "../../services/pedidosService";

const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

function ResumenCompacto({ pedido, items, total }) {
  const itemsDetalle = Object.entries(pedido)
    .map(([id, cantidad]) => {
      const item = items.find((i) => i.id === id);
      return item ? { ...item, cantidad } : null;
    })
    .filter(Boolean);

  return (
    <div className={styles.seccion}>
      <div className={styles.seccionHeader}>Resumen</div>
      {itemsDetalle.map((item) => (
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

function FormularioPagoOnline({ total, onConfirmar, procesando }) {
  const [subMetodo, setSubMetodo]   = useState("debito");
  const [numeroTarjeta, setNumero]  = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv]               = useState("");
  const [nombre, setNombre]         = useState("");

  const SUB_METODOS = [
    { id: "debito",  label: "Debito" },
    { id: "credito", label: "Credito" },
    { id: "webpay",  label: "Webpay" },
  ];

  return (
    <div className={styles.seccion}>
      <div className={styles.seccionHeader}>Datos de pago</div>
      <div className={styles.pagoOnlineWrap}>
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
        <div className={styles.inputGrupo}>
          <label className={styles.inputLabel}>Numero de tarjeta</label>
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
        <div className={styles.inputRow}>
          <div className={styles.inputGrupo}>
            <label className={styles.inputLabel}>Expiracion</label>
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
        <button
          className={styles.btnConfirmar}
          onClick={onConfirmar}
          disabled={procesando || !numeroTarjeta || !nombre || !expiracion || !cvv}
        >
          {procesando
            ? <><div className={styles.spinner} /> Procesando...</>
            : <>Pagar {formatPrecio(total)} de verdad</>
          }
        </button>
      </div>
    </div>
  );
}

function PantallaExito({ metodoPago, mesaId, total, pedido, items, nota, correo, setCorreo }) {
  const navigate = useNavigate();
  const MENSAJES = {
    online:   { icono: "OK", titulo: "Pago exitoso!",      desc: "Tu pago fue procesado. Disfruta tu pedido!" },
    efectivo: { icono: "$$", titulo: "Pedido confirmado!", desc: "Un garzon pasara pronto a cobrarte en efectivo." },
    garzon:   { icono: "!!", titulo: "En camino!",          desc: "Un garzon se dirigira a tu mesa en breve." },
  };
  const msg = MENSAJES[metodoPago] || MENSAJES.online;

  const itemsDetalle = Object.entries(pedido || {})
    .map(([id, cantidad]) => {
      const item = items.find((i) => i.id === id);
      return item ? { ...item, cantidad } : null;
    })
    .filter(Boolean);

  const construirBoleta = () => {
    const lineas = [];
    lineas.push("=== BOLETA / DETALLE DE PEDIDO ===");
    lineas.push(`Mesa: #${mesaId}`);
    lineas.push(`Método de pago: ${metodoPago}`);
    lineas.push(`Correo: ${correo || "No proporcionado"}`);
    lineas.push(`"Nota: ${nota || "Sin observaciones"}`);
    lineas.push("");
    lineas.push("Items:");
    itemsDetalle.forEach((item) => {
      lineas.push(`- ${item.nombre} x${item.cantidad} = ${formatPrecio(item.precio * item.cantidad)}`);
    });
    lineas.push("");
    lineas.push(`Total: ${formatPrecio(total)}`);
    return lineas.join("\n");
  };

  const descargarBoleta = () => {
    const contenido = construirBoleta();
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boleta-mesa-${mesaId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const enviarPorCorreo = () => {
    if (!correo) return;
    const asunto = encodeURIComponent("Boleta de tu pedido");
    const cuerpo = encodeURIComponent(construirBoleta());
    window.location.href = `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;
  };

  return (
    <div className={`${styles.exitoPage} fade-up`}>
      <div className={styles.exitoCard}>
        <div className={styles.exitoIcono}>{msg.icono}</div>
        <h2 className={styles.exitoTitulo}>{msg.titulo}</h2>
        <p className={styles.exitoDesc}>{msg.desc}</p>
        <div className={styles.exitoDetalle}>
          <div className={styles.exitoDetalleRow}>
            <span className={styles.exitoDetalleLabel}>Mesa</span>
            <span className={styles.exitoDetalleValor}>#{mesaId}</span>
          </div>
          {metodoPago === "online" && (
            <div className={styles.exitoDetalleRow}>
              <span className={styles.exitoDetalleLabel}>Total pagado</span>
              <span className={styles.exitoDetalleTotal}>{formatPrecio(total)}</span>
            </div>
          )}
        </div>

        <div className={styles.boletaBox}>
          <label className={styles.boletaLabel}>Correo para la boleta</label>
          <input
            className={styles.inputCorreo}
            type="email"
            placeholder="tu@email.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <div className={styles.boletaAcciones}>
            <button className={styles.btnBoleta} onClick={descargarBoleta}>
              Descargar boleta
            </button>
            <button className={styles.btnBoletaPrimario} onClick={enviarPorCorreo} disabled={!correo}>
              Enviar por correo
            </button>
          </div>
        </div>

        <p className={styles.exitoNota}>Gracias por tu preferencia!</p>
        <button className={styles.btnInicio} onClick={() => navigate("/", { replace: true })}>
          Volver a la página inicial
        </button>
      </div>
    </div>
  );
}

export default function Pago() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    pedido     = {},
    mesaId     = "?",
    metodoPago = "online",
    nota       = "",
    total      = 0,
    items      = [],
  } = location.state || {};

  const [procesando, setProcesando] = useState(false);
  const [exitoso, setExitoso]       = useState(false);
  const [error, setError]           = useState("");
  const [correo, setCorreo]         = useState("");

  const confirmarPedido = async () => {
    setProcesando(true);
    setError("");

    try {
      await pedidosService.crearPedido({
        mesaNumero: parseInt(mesaId),
        items,
        pedido,
        metodoPago,
        nota,
        correo,
      });
      setExitoso(true);
    } catch (err) {
      setError("No se pudo enviar el pedido. Intenta de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  if (exitoso) {
    return (
      <PantallaExito
        metodoPago={metodoPago}
        mesaId={mesaId}
        total={total}
        pedido={pedido}
        items={items}
        nota={nota}
        correo={correo}
        setCorreo={setCorreo}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.btnVolver} onClick={() => navigate(-1)}>
          Volver
        </button>
        <h1 className={styles.headerTitulo}>Confirmar pedido</h1>
        <span className={styles.headerMesa}>Mesa #{mesaId}</span>
      </div>

      <div className={styles.contenido}>
        <ResumenCompacto pedido={pedido} items={items} total={total} />

        {error && (
          <p style={{ color: "var(--color-error)", textAlign: "center", fontSize: "0.85rem" }}>
            {error}
          </p>
        )}

        {metodoPago === "online" && (
          <FormularioPagoOnline
            total={total}
            onConfirmar={confirmarPedido}
            procesando={procesando}
          />
        )}

        {metodoPago === "efectivo" && (
          <div className={styles.seccion}>
            <div className={styles.estadoWrap}>
              <div className={styles.estadoIcono}>$$</div>
              <h2 className={styles.estadoTitulo}>Pago en efectivo</h2>
              <p className={styles.estadoDesc}>
                Al confirmar, un garzon pasara a cobrarte.
                Ten listo {formatPrecio(total)}.
              </p>
              <button
                className={styles.btnConfirmar}
                onClick={confirmarPedido}
                disabled={procesando}
              >
                {procesando ? "Enviando..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        )}

        {metodoPago === "garzon" && (
          <div className={styles.seccion}>
            <div className={styles.estadoWrap}>
              <div className={styles.estadoIcono}>!!</div>
              <h2 className={styles.estadoTitulo}>Solicitar garzon</h2>
              <p className={styles.estadoDesc}>
                Un garzon se acercara a tu mesa para atenderte.
              </p>
              <button
                className={styles.btnConfirmar}
                onClick={confirmarPedido}
                disabled={procesando}
              >
                {procesando ? "Enviando..." : "Llamar garzon"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
