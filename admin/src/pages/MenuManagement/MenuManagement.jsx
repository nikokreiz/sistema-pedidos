import { useState, useEffect } from "react";
import styles from "../Dashboard/Dashboard.module.css";
import { menuService } from "../../services/menuService";

export default function MenuManagement({ admin }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formNuevo, setFormNuevo] = useState({
    categoriaId: "",
    nombre: "",
    descripcion: "",
    precio: "",
    imagenUrl: "",
  });

  useEffect(() => {
    cargarMenu();
  }, [admin.comercioId]);

  const cargarMenu = async () => {
    setCargando(true);
    try {
      const data = await menuService.getMenu(admin.comercioId);
      setCategorias(data);
    } catch (err) {
      console.error("Error cargando menú:", err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearItem = async (e, categoriaId) => {
    e.preventDefault();
    if (!formNuevo.nombre || !formNuevo.precio) {
      alert("Nombre y precio requeridos");
      return;
    }

    try {
      await menuService.crearItem(
        categoriaId,
        formNuevo.nombre,
        formNuevo.descripcion,
        formNuevo.precio,
        formNuevo.imagenUrl
      );
      setFormNuevo({ categoriaId: "", nombre: "", descripcion: "", precio: "", imagenUrl: "" });
      cargarMenu();
      alert("Item creado correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleActualizarItem = async (itemId) => {
    try {
      await menuService.actualizarItem(
        itemId,
        editando.nombre,
        editando.descripcion,
        editando.precio,
        editando.imagenUrl,
        editando.activo
      );
      setEditando(null);
      cargarMenu();
      alert("Item actualizado correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEliminarItem = async (itemId) => {
    if (!confirm("¿Eliminar este item?")) return;

    try {
      await menuService.eliminarItem(itemId);
      cargarMenu();
      alert("Item eliminado");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (cargando) return <div className={styles.seccion}>Cargando menú...</div>;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Gestión de Menú</h2>

      {categorias.map((cat) => (
        <div key={cat.id} className={styles.card} style={{ marginBottom: "2rem" }}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitulo}>{cat.nombre}</span>
          </div>

          <div className={styles.cardContent}>
            {cat.items && cat.items.length > 0 ? (
              <div style={{ marginBottom: "1.5rem" }}>
                {cat.items.filter(i => i).map((item) => (
                  <div
                    key={item.id}
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
                        {item.nombre}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        ${item.precio} — {item.descripcion}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => setEditando(item)}
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
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarItem(item.id)}
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
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>Sin items</p>
            )}

            {editando && editando.categoria_id === cat.id ? (
              <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-sm)" }}>
                <h4 style={{ marginBottom: "1rem" }}>Editando: {editando.nombre}</h4>
                <div className={styles.inputGrupo}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    className={styles.input}
                    value={editando.nombre}
                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  />
                </div>
                <div className={styles.inputGrupo}>
                  <label className={styles.label}>Descripción</label>
                  <input
                    className={styles.input}
                    value={editando.descripcion}
                    onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                  />
                </div>
                <div className={styles.inputGrupo}>
                  <label className={styles.label}>Precio</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={editando.precio}
                    onChange={(e) => setEditando({ ...editando, precio: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <button
                    onClick={() => handleActualizarItem(editando.id)}
                    style={{
                      padding: "0.6rem 1.2rem",
                      background: "var(--color-success)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Guardar
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
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}

            <hr style={{ margin: "1rem 0", borderColor: "var(--color-border)" }} />

            <form
              onSubmit={(e) => handleCrearItem(e, cat.id)}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Nuevo item</h4>
              <input
                className={styles.input}
                placeholder="Nombre"
                value={formNuevo.nombre}
                onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Descripción"
                value={formNuevo.descripcion}
                onChange={(e) => setFormNuevo({ ...formNuevo, descripcion: e.target.value })}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Precio"
                value={formNuevo.precio}
                onChange={(e) => setFormNuevo({ ...formNuevo, precio: e.target.value })}
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
                + Agregar item
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}