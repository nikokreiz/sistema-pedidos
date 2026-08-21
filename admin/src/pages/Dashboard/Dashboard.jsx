import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Horarios from "../../components/ui/Horarios/Horarios";
import api from "../../services/api";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function Dashboard({ admin, onLogout }) {
  const [tabActiva, setTabActiva] = useState("dashboard");
  const [horarios, setHorarios] = useState([]);
  const [stats, setStats] = useState({ totalPedidos: 0, ingresos: 0, mesasOcupadas: 0 });
  const [cargando, setCargando] = useState(false);

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
            </div>
          </div>
        )}

        {tabActiva === "horarios" && (
          <Horarios admin={admin} horarios={horarios} onSave={setHorarios} />
        )}

        {tabActiva === "menu" && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Gestión de Menú</h2>
            <p style={{ color: "var(--color-text-muted)" }}>Próximamente...</p>
          </div>
        )}

        {tabActiva === "mesas" && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Gestión de Mesas</h2>
            <p style={{ color: "var(--color-text-muted)" }}>Próximamente...</p>
          </div>
        )}

        {tabActiva === "garzones" && (
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Gestión de Garzones</h2>
            <p style={{ color: "var(--color-text-muted)" }}>Próximamente...</p>
          </div>
        )}

      </div>

    </div>
  );
}