import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import styles from "./Cocina.module.css";
import PedidoCard from "../../components/ui/PedidoCard/PedidoCard";
import api from "../../services/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export default function Cocina() {
  const [pedidos, setPedidos]       = useState([]);
  const [conectado, setConectado]   = useState(false);
  const [cargando, setCargando]     = useState(true);

  // ── Carga pedidos activos al iniciar ────────────────────────────────────────
  useEffect(() => {
    const cargarPedidosActivos = async () => {
      try {
        const data = await api.get("/pedidos/activos");
        setPedidos(data.pedidos || []);
      } catch (err) {
        console.error("Error cargando pedidos:", err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPedidosActivos();
  }, []);

  // ── Conexión Socket.io — escucha pedidos en tiempo real ────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Conectado al servidor en tiempo real");
      setConectado(true);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor");
      setConectado(false);
    });

    // Nuevo pedido entrante desde el cliente
    socket.on("nuevo_pedido", (data) => {
      const nuevoPedido = {
        id:           data.pedidoId,
        mesa_numero:  data.mesaNumero,
        items:        data.items,
        estado:       "pendiente",
        metodo_pago:  data.metodoPago,
        total:        data.total,
        nota:         data.nota || "",
        creado_en:    new Date().toISOString(),
      };
      setPedidos((prev) => [nuevoPedido, ...prev]);
    });

    // Pedido actualizado (cuando el garzon lo marca como entregado)
    socket.on("pedido_actualizado", (data) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === data.id ? { ...p, estado: data.estado } : p
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  // ── Actualiza el estado de un pedido localmente ─────────────────────────────
  const handleEstadoCambiado = (pedidoId, nuevoEstado) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
      )
    );
  };

  // ── Filtra pedidos por estado ───────────────────────────────────────────────
  const pendientes  = pedidos.filter((p) => p.estado === "pendiente");
  const preparando  = pedidos.filter((p) => p.estado === "preparando");
  const listos      = pedidos.filter((p) => p.estado === "listo");

  if (cargando) {
    return (
      <div className={styles.page}>
        <div className={styles.cargando}>
          <div className={styles.spinnerGrande} />
          <p>Cargando pedidos activos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.titulo}>Pantalla Cocina</p>
            <p className={styles.subtitulo}>La Barra del Puerto</p>
          </div>
        </div>
        <div className={styles.conexion}>
          <div className={`${styles.dot} ${conectado ? styles.dotConectado : styles.dotDesconectado}`} />
          <span className={conectado ? styles.textoConectado : styles.textoDesconectado}>
            {conectado ? "En linea" : "Sin conexion"}
          </span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statPendiente}`}>
          <span className={styles.statNumero}>{pendientes.length}</span>
          <span className={styles.statLabel}>Pendientes</span>
        </div>
        <div className={`${styles.stat} ${styles.statPreparando}`}>
          <span className={styles.statNumero}>{preparando.length}</span>
          <span className={styles.statLabel}>Preparando</span>
        </div>
        <div className={`${styles.stat} ${styles.statListo}`}>
          <span className={styles.statNumero}>{listos.length}</span>
          <span className={styles.statLabel}>Listos</span>
        </div>
      </div>

      {/* ── Columnas ── */}
      {pedidos.length === 0 ? (
        <div className={styles.columnas}>
          <div className={styles.sinPedidos}>
            <div className={styles.sinPedidosIcono}>🍽️</div>
            <h2 className={styles.sinPedidosTitulo}>Sin pedidos activos</h2>
            <p>Los nuevos pedidos apareceran aqui en tiempo real.</p>
          </div>
        </div>
      ) : (
        <div className={styles.columnas}>

          {/* Pendientes */}
          <div className={styles.columna}>
            <div className={styles.columnaHeader}>
              <span className={`${styles.columnaLabel} ${styles.labelPendiente}`}>
                Pendientes
              </span>
              <span className={styles.columnaCount}>{pendientes.length}</span>
            </div>
            {pendientes.length > 0
              ? pendientes.map((p) => (
                  <PedidoCard
                    key={p.id}
                    pedido={p}
                    onEstadoCambiado={handleEstadoCambiado}
                  />
                ))
              : <div className={styles.vacio}>Sin pedidos pendientes</div>
            }
          </div>

          {/* Preparando */}
          <div className={styles.columna}>
            <div className={styles.columnaHeader}>
              <span className={`${styles.columnaLabel} ${styles.labelPreparando}`}>
                Preparando
              </span>
              <span className={styles.columnaCount}>{preparando.length}</span>
            </div>
            {preparando.length > 0
              ? preparando.map((p) => (
                  <PedidoCard
                    key={p.id}
                    pedido={p}
                    onEstadoCambiado={handleEstadoCambiado}
                  />
                ))
              : <div className={styles.vacio}>Nada en preparacion</div>
            }
          </div>

          {/* Listos */}
          <div className={styles.columna}>
            <div className={styles.columnaHeader}>
              <span className={`${styles.columnaLabel} ${styles.labelListo}`}>
                Listos
              </span>
              <span className={styles.columnaCount}>{listos.length}</span>
            </div>
            {listos.length > 0
              ? listos.map((p) => (
                  <PedidoCard
                    key={p.id}
                    pedido={p}
                    onEstadoCambiado={handleEstadoCambiado}
                  />
                ))
              : <div className={styles.vacio}>Sin pedidos listos</div>
            }
          </div>

        </div>
      )}

    </div>
  );
}
