import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Horarios from "../../components/ui/Horarios/Horarios";
import MenuManagement from "../MenuManagement/MenuManagement";
import api from "../../services/api";
import MesasManagement from "../MesasManagement/MesasManagement";
import GarzonesManagement from "../GarzonesManagement/GarzonesManagement";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function Dashboard({ admin, onLogout }) {
  const [tabActiva, setTabActiva] = useState("dashboard");
  const [horarios, setHorarios] = useState([]);
  const [stats, setStats] = useState({ totalPedidos: 0, ingresos: 0, mesasOcupadas: 0, mesasLibres: 0 });
  const [cargando, setCargando] = useState(false);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const recibirAuxilio = (aviso) => {
      if (aviso.comercioId && aviso.comercioId !== admin.comercioId) return;
      setAvisos((actuales) => [{ ...aviso, id: Date.now() }, ...actuales].slice(0, 5));
    };
    socket.on("auxilio_mesa", recibirAuxilio);
    return () => socket.disconnect();
  }, [admin.comercioId]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    const actualizarEstadisticas = () => cargarEstadisticas();
    socket.on("mesa_estado_actualizado", actualizarEstadisticas);
    return () => socket.disconnect();
  }, [admin.comercioId]);

  // Carga datos al montar el componente
  useEffect(() => {
    cargarHorarios();
    cargarEstadisticas();
  }, [admin.comercioId]);

  const cargarHorarios = async () => {
    setCargando(true);
    try {
      const data = await api.get(`/admin/horarios/${admin.comercioId}`);
      setHorarios(data.horarios || []);
    } catch (err) {
      console.error("Error cargando horarios:", err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await api.get(`/admin/estadisticas/${admin.comercioId}`);
      setStats(data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err.message);
    }
  };

  const formatPrecio = (precio) =>
    precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.titulo}>Panel de Administración</p>
            <p className={styles.subtitulo}>{admin.nombre}</p>
          </div>
        </div>
        <button className={styles.btnLogout} onClick={onLogout}>
          Salir
        </button>
      </div>

      {/* Navegación */}
      <div className={styles.nav}>
        <button
          className={`${styles.navItem} ${tabActiva === "dashboard" ? styles.navItemActivo : ""}`}
          onClick={() => setTabActiva("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navItem} ${tabActiva === "menu" ? styles.navItemActivo : ""}`}
          onClick={() => setTabActiva("menu")}
        >
          Menú
        </button>
        <button
          className={`${styles.navItem} ${tabActiva === "mesas" ? styles.navItemActivo : ""}`}
          onClick={() => setTabActiva("mesas")}
        >
          Mesas
        </button>
        <button
          className={`${styles.navItem} ${tabActiva === "horarios" ? styles.navItemActivo : ""}`}
          onClick={() => setTabActiva("horarios")}
        >
          Horarios
        </button>
        <button
          className={`${styles.navItem} ${tabActiva === "garzones" ? styles.navItemActivo : ""}`}
          onClick={() => setTabActiva("garzones")}
        >
          Garzones
        </button>
      </div>

      {/* Contenido */}
      <div className={styles.contenido}>
        {avisos.length > 0 && (
          <div className={styles.card} style={{ maxWidth: "760px", margin: "0 auto 1.5rem", borderLeft: "4px solid var(--color-warning)" }}>
            <div className={styles.cardHeader}><span className={styles.cardTitulo}>Avisos de atención</span></div>
            <div className={styles.cardContent}>
              {avisos.map((aviso) => (
                <div key={aviso.id} style={{ padding: "0.75rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                      <strong>{aviso.garzonNombre} necesita ayuda en la mesa {aviso.mesaNumero || "?"}</strong>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>SOS recibido</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvisos((actuales) => actuales.filter((actual) => actual.id !== aviso.id))}
                      style={{ padding: "0.45rem 0.7rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--color-text-muted)", cursor: "pointer" }}
                    >
                      Resolver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tabActiva === "dashboard" && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Dashboard</h2>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>Pedidos Hoy</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-primary)" }}>
                  {stats.totalPedidos}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>Ingresos</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-success)" }}>
                  {formatPrecio(stats.ingresos)}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>Mesas Ocupadas</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-warning)" }}>
                  {stats.mesasOcupadas}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>Mesas Libres</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-success)" }}>
                  {stats.mesasLibres}
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "menu" && (
          <MenuManagement admin={admin} />
        )}

        {tabActiva === "horarios" && (
          <Horarios admin={admin} horarios={horarios} onSave={setHorarios} />
        )}

        {tabActiva === "mesas" && (
          <MesasManagement admin={admin} />
        )}

        {tabActiva === "garzones" && (
          <GarzonesManagement admin={admin} />
        )}

      </div>

    </div>
  );
}