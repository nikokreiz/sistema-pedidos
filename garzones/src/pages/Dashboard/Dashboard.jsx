import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import MesaCard from "../../components/ui/MesaCard/MesaCard";
import Notificacion from "../../components/Notificacion/Notificacion";
import api from "../../services/api";

export default function Dashboard({ garzon, socket, conectado, onLogout }) {
  const [mesas, setMesas]           = useState([]);
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando]     = useState(true);

  // Cargar mesas asignadas del garzon
  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const data = await api.get(`/garzones/${garzon.id}/mesas`);
        setMesas(data.mesas || []);
      } catch (err) {
        console.error("Error cargando mesas:", err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarMesas();
  }, [garzon.id]);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on("pedido_listo", (data) => {
      if (data.mesa_numero) {
        setNotificacion({
          id: Date.now(),
          titulo: `Mesa ${data.mesa_numero}`,
          mensaje: "Tu pedido esta listo!",
          tipo: "exito",
        });

        // Auto-remove despues de 5 segundos
        setTimeout(() => setNotificacion(null), 5000);
      }
    });

    return () => socket.off("pedido_listo");
  }, [socket]);

  const handleEntregado = (mesaId) => {
    setMesas((prev) =>
      prev.map((m) =>
        m.id === mesaId ? { ...m, estado: "limpia" } : m
      )
    );
  };

// Escuchar cuando cocina marca pedido como listo
useEffect(() => {
  if (!socket) return;

  socket.on("pedido_actualizado", async (data) => {
    console.log("Recargando mesas por actualización:", data);
    // Recarga las mesas
    try {
      const response = await api.get(`/garzones/${garzon.id}/mesas`);
      setMesas(response.mesas || []);
    } catch (err) {
      console.error("Error recargando mesas:", err.message);
    }
  });

  return () => socket.off("pedido_actualizado");
}, [socket, garzon.id]);

  if (cargando) {
    return (
      <div className={styles.page}>
        <div className={styles.vacio}>
          <p>Cargando tus mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.nombre}>Hola, {garzon.nombre}</p>
            <p className={styles.rol}>Garzon</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.conexion}>
            <div className={`${styles.dot} ${conectado ? styles.dotConectado : styles.dotDesconectado}`} />
            <span>{conectado ? "En linea" : "Sin conexion"}</span>
          </div>
          <button className={styles.btnLogout} onClick={onLogout}>
            Salir
          </button>
        </div>
      </div>

      {/* Contenido */}
      {mesas.length === 0 ? (
        <div className={styles.vacio}>
          <div className={styles.vacioIcono}>🪑</div>
          <p>No tienes mesas asignadas en este turno.</p>
        </div>
      ) : (
        <div className={styles.contenido}>
          {mesas.map((mesa) => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              onEntregado={handleEntregado}
            />
          ))}
        </div>
      )}

      {/* Notificaciones */}
      {notificacion && (
        <Notificacion
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
        />
      )}

    </div>
  );
}
