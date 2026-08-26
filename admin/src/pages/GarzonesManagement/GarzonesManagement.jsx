import { useEffect, useState } from "react";
import styles from "../Dashboard/Dashboard.module.css";
import { garzonesService } from "../../services/garzonesService";
import { mesasService } from "../../services/mesasService";

const SUCURSAL_ID = "a1b2c3d4-0000-0000-0000-000000000002";

const FORM_INICIAL = { nombre: "", email: "", password: "" };

export default function GarzonesManagement({ admin }) {
  const [garzones, setGarzones] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [garzonesData, mesasData] = await Promise.all([
        garzonesService.obtener(admin.comercioId),
        mesasService.obtenerMesas(SUCURSAL_ID),
      ]);
      setGarzones(garzonesData);
      setMesas(mesasData);
    } catch (err) {
      alert("Error cargando garzones: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [admin.comercioId]);

  const cambiarForm = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }));

  const guardarGarzon = async (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || (!editando && !form.password)) {
      alert("Completa nombre, email y contraseña para crear un garzón");
      return;
    }

    try {
      if (editando) {
        await garzonesService.actualizar(editando.id, form);
      } else {
        await garzonesService.crear({ ...form, sucursalId: SUCURSAL_ID });
      }
      setForm(FORM_INICIAL);
      setEditando(null);
      await cargarDatos();
    } catch (err) {
      alert("Error guardando garzón: " + err.message);
    }
  };

  const editarGarzon = (garzon) => {
    setEditando(garzon);
    setForm({ nombre: garzon.nombre, email: garzon.email, password: "" });
  };

  const eliminarGarzon = async (garzonId) => {
    if (!confirm("¿Desactivar este garzón?")) return;
    try {
      await garzonesService.eliminar(garzonId);
      await cargarDatos();
    } catch (err) {
      alert("Error desactivando garzón: " + err.message);
    }
  };

  const asignarMesa = async (mesaId, garzonId) => {
    try {
      if (garzonId) await garzonesService.asignarMesa(mesaId, garzonId);
      else await garzonesService.desasignarMesa(mesaId);
      await cargarDatos();
    } catch (err) {
      alert("Error asignando mesa: " + err.message);
    }
  };

  if (cargando) return <div className={styles.seccion}>Cargando garzones...</div>;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Gestión de Garzones</h2>

      <form onSubmit={guardarGarzon} className={styles.card} style={{ maxWidth: "760px", marginBottom: "1.5rem" }}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitulo}>{editando ? "Editar garzón" : "Nuevo garzón"}</span>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.inputGrupo}>
            <label className={styles.label}>Nombre</label>
            <input className={styles.input} value={form.nombre} onChange={(e) => cambiarForm("nombre", e.target.value)} />
          </div>
          <div className={styles.inputGrupo}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={form.email} onChange={(e) => cambiarForm("email", e.target.value)} />
          </div>
          <div className={styles.inputGrupo}>
            <label className={styles.label}>{editando ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
            <input className={styles.input} type="password" value={form.password} onChange={(e) => cambiarForm("password", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className={styles.btnGuardar} type="submit">{editando ? "Guardar cambios" : "Crear garzón"}</button>
            {editando && <button type="button" className={styles.btnGuardar} onClick={() => { setEditando(null); setForm(FORM_INICIAL); }}>Cancelar</button>}
          </div>
        </div>
      </form>

      <div className={styles.card} style={{ maxWidth: "1000px" }}>
        <div className={styles.cardHeader}><span className={styles.cardTitulo}>Garzones y mesas asignadas</span></div>
        <div className={styles.cardContent}>
          {garzones.map((garzon) => (
            <div key={garzon.id} style={{ padding: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{garzon.nombre}</strong>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{garzon.email}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{garzon.activo ? "Activo" : "Inactivo"}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={styles.btnGuardar} type="button" onClick={() => editarGarzon(garzon)}>Editar</button>
                  {garzon.activo && <button className={styles.btnGuardar} type="button" onClick={() => eliminarGarzon(garzon.id)}>Desactivar</button>}
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <label className={styles.label}>Asignar una mesa</label>
                <select className={styles.select} value="" onChange={(e) => e.target.value && asignarMesa(e.target.value, garzon.id)}>
                  <option value="">Seleccionar mesa...</option>
                  {mesas.filter((mesa) => mesa.activa !== false).map((mesa) => (
                    <option key={mesa.id} value={mesa.id}>Mesa #{mesa.numero}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: "0.6rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                Mesas: {garzon.mesas?.length ? garzon.mesas.map((mesa) => `#${mesa.numero}`).join(", ") : "Sin asignar"}
              </div>
            </div>
          ))}
          {garzones.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>No hay garzones registrados.</p>}
        </div>
      </div>
    </div>
  );
}
