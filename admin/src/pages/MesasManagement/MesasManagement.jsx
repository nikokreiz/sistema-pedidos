import { useState, useEffect } from "react";
import styles from "../Dashboard/Dashboard.module.css";
import { mesasService } from "../../services/mesasService";
import { qrService } from "../../services/qrService";

export default function MesasManagement({ admin }) {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrando, setMostrando] = useState(null);
  const [formNuevo, setFormNuevo] = useState({
    numero: "",
    capacidad: "",
  });

  useEffect(() => {
    cargarMesas();
  }, [admin.comercioId]);

  const cargarMesas = async () => {
    setCargando(true);
    try {
      const sucursalId = "a1b2c3d4-0000-0000-0000-000000000002";
      const data = await mesasService.obtenerMesas(sucursalId);
      setMesas(data);
    } catch (err) {
      console.error("Error cargando mesas:", err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearMesa = async (e) => {
    e.preventDefault();
    if (!formNuevo.numero || !formNuevo.capacidad) {
      alert("Número y capacidad requeridos");
      return;
    }

    // Validar que no exista mesa con ese número
    if (mesas.some((m) => m.numero === parseInt(formNuevo.numero))) {
      alert(`Ya existe una mesa número ${formNuevo.numero}`);
      return;
    }

    try {
      const sucursalId = "a1b2c3d4-0000-0000-0000-000000000002";
      await mesasService.crearMesa(sucursalId, formNuevo.numero, formNuevo.capacidad);
      setFormNuevo({ numero: "", capacidad: "" });
      cargarMesas();
      alert("Mesa creada correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleActualizarMesa = async (mesaId) => {
    try {
      await mesasService.actualizarMesa(
        mesaId,
        editando.numero,
        editando.capacidad,
        editando.activa
      );
      setEditando(null);
      cargarMesas();
      alert("Mesa actualizada correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEliminarMesa = async (mesaId) => {
    if (!confirm("¿Eliminar esta mesa?")) return;

    try {
      await mesasService.eliminarMesa(mesaId);
      cargarMesas();
      alert("Mesa eliminada");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDescargarQR = async (mesa) => {
    try {
      await qrService.descargarQR(mesa.numero, mesa.qr_codigo_unico);
    } catch (err) {
      alert("Error descargando QR: " + err.message);
    }
  };

  const handleMostrarQR = async (mesa) => {
    try {
      const qrDataUrl = await qrService.generarQR(mesa.numero, mesa.qr_codigo_unico);
      setMostrando({ ...mesa, qrDataUrl });
    } catch (err) {
      alert("Error generando QR: " + err.message);
    }
  };

  if (cargando) return <div className={styles.seccion}>Cargando mesas...</div>;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Gestión de Mesas</h2>

      {mostrando && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setMostrando(null)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              padding: "2rem",
              borderRadius: "var(--radius-lg)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", color: "var(--color-text)" }}>
              QR Mesa #{mostrando.numero}
            </h3>
            <img src={mostrando.qrDataUrl} alt="QR" style={{ marginBottom: "1rem" }} />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => handleDescargarQR(mostrando)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-success)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                ⬇ Descargar
              </button>
              <button
                onClick={() => setMostrando(null)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.card} style={{ marginBottom: "2rem" }}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitulo}>Mesas Actuales</span>
        </div>

        <div className={styles.cardContent}>
          {mesas.length > 0 ? (
            <div style={{ marginBottom: "1.5rem" }}>
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  style={{
                    padding: "1rem",
                    background: "var(--color-surface-2)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--color-text)" }}>
                      Mesa #{mesa.numero}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      Capacidad: {mesa.capacidad} personas
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                      QR: {mesa.qr_codigo_unico}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleMostrarQR(mesa)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--color-warning)",
                        color: "#000",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      📱 QR
                    </button>
                    <button
                      onClick={() => setEditando(mesa)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--color-primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      ✏ Editar
                    </button>
                    <button
                      onClick={() => handleEliminarMesa(mesa.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--color-error)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>Sin mesas</p>
          )}

          {editando ? (
            <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-sm)" }}>
              <h4 style={{ marginBottom: "1rem" }}>Editando: Mesa #{editando.numero}</h4>
              <div className={styles.inputGrupo}>
                <label className={styles.label}>Número</label>
                <input
                  className={styles.input}
                  type="number"
                  value={editando.numero}
                  onChange={(e) => setEditando({ ...editando, numero: e.target.value })}
                />
              </div>
              <div className={styles.inputGrupo}>
                <label className={styles.label}>Capacidad</label>
                <input
                  className={styles.input}
                  type="number"
                  value={editando.capacidad}
                  onChange={(e) => setEditando({ ...editando, capacidad: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  onClick={() => handleActualizarMesa(editando.id)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background: "var(--color-success)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  ✓ Guardar
                </button>
                <button
                  onClick={() => setEditando(null)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          ) : null}

          <hr style={{ margin: "1rem 0", borderColor: "var(--color-border)" }} />

          <form
            onSubmit={handleCrearMesa}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Nueva mesa</h4>
            <input
              className={styles.input}
              type="number"
              placeholder="Número de mesa"
              value={formNuevo.numero}
              onChange={(e) => setFormNuevo({ ...formNuevo, numero: e.target.value })}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Capacidad (personas)"
              value={formNuevo.capacidad}
              onChange={(e) => setFormNuevo({ ...formNuevo, capacidad: e.target.value })}
            />
            <button
              type="submit"
              style={{
                padding: "0.6rem 1.2rem",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                alignSelf: "flex-start",
              }}
            >
              + Agregar mesa
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}