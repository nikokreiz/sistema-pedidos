import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import MesaCard from "../../components/ui/MesaCard/MesaCard";
import Notificacion from "../../components/Notificacion/Notificacion";
import api from "../../services/api";

const ALERTA_SOLICITUD_KEY = "solicitud_garzon_pendiente";

export default function Dashboard({ garzon, socket, conectado, onLogout }) {
  const [mesas, setMesas]           = useState([]);
  const [notificacion, setNotificacion] = useState(() => {
    const alertaGuardada = sessionStorage.getItem(ALERTA_SOLICITUD_KEY);
    return alertaGuardada ? JSON.parse(alertaGuardada) : null;
  });
  const [cargando, setCargando]     = useState(true);

  // Cargar mesas asignadas del garzon
  useEffect(() => {
    cargarMesas();
  }, [garzon.id]);

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

        setTimeout(() => setNotificacion(null), 5000);
      }
    });

    return () => socket.off("pedido_listo");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const recibirSolicitud = (data) => {
      if (String(data.garzonId) !== String(garzon.id)) return;
      const alerta = {
        id: Date.now(),
        titulo: `Mesa ${data.mesaNumero}`,
        mensaje: "El cliente solicita atención.",
        tipo: "exito",
        persistente: true,
      };
      sessionStorage.setItem(ALERTA_SOLICITUD_KEY, JSON.stringify(alerta));
      setNotificacion(alerta);
    };

    socket.on("solicitud_garzon", recibirSolicitud);
    return () => socket.off("solicitud_garzon", recibirSolicitud);
  }, [socket, garzon.id]);

  // Escuchar actualizaciones de pedidos
  useEffect(() => {
    if (!socket) return;

    socket.on("pedido_actualizado", async (data) => {
      console.log("Recargando mesas por actualización:", data);
      cargarMesas();
    });

    return () => socket.off("pedido_actualizado");
  }, [socket]);

  // Escuchar cambios en mesas
  useEffect(() => {
    if (!socket) return;

    socket.on("mesa_creada", (data) => {
      console.log("Nueva mesa creada:", data);
      cargarMesas();
    });

    socket.on("mesa_actualizada", (data) => {
      console.log("Mesa actualizada:", data);
      cargarMesas();
    });

    socket.on("mesa_eliminada", (data) => {
      console.log("Mesa eliminada:", data);
      cargarMesas();
    });

    return () => {
      socket.off("mesa_creada");
      socket.off("mesa_actualizada");
      socket.off("mesa_eliminada");
    };
  }, [socket]);

  const handleEntregado = (pedidoId) => {
    setMesas((prev) =>
      prev.map((m) =>
        m.pedido_id === pedidoId ? { ...m, estado: "limpia" } : m
      )
    );
  };

  const handleEstadoMesa = (mesaId, estado) => {
    setMesas((prev) => prev.map((mesa) =>
      mesa.id === mesaId ? { ...mesa, estado, estado_mesa: estado } : mesa
    ));
  };

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
              garzonId={garzon.id}
              onEntregado={handleEntregado}
              onEstadoMesa={handleEstadoMesa}
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
          persistente={notificacion.persistente}
          onResolver={() => {
            sessionStorage.removeItem(ALERTA_SOLICITUD_KEY);
            setNotificacion(null);
          }}
        />
      )}

    </div>
  );
}