import { useState, useEffect } from "react";
import styles from "../Dashboard/Dashboard.module.css";
import { menuService } from "../../services/menuService";

const leerArchivoComoDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (file.size > 7 * 1024 * 1024) {
      reject(new Error("La imagen no puede superar los 7 MB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

export default function MenuManagement({ admin }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formNuevo, setFormNuevo] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagenUrl: "",
  });
  const [formCategoria, setFormCategoria] = useState({ nombre: "" });

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

  const resetFormNuevo = () => {
    setFormNuevo({ nombre: "", descripcion: "", precio: "", imagenUrl: "" });
  };

  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) {
      alert("El nombre de la categoría es requerido");
      return;
    }

    try {
      await menuService.crearCategoria(admin.comercioId, formCategoria.nombre);
      setFormCategoria({ nombre: "" });
      await cargarMenu();
      alert("Categoría creada correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleArchivoSeleccionado = async (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await leerArchivoComoDataUrl(file);
      setter((prev) => ({ ...prev, imagenUrl: url }));
    } catch (err) {
      alert(err.message);
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
      resetFormNuevo();
      await cargarMenu();
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
        editando.activo !== false
      );
      setEditando(null);
      await cargarMenu();
      alert("Item actualizado correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEliminarItem = async (itemId) => {
    if (!confirm("¿Eliminar este item?")) return;

    try {
      await menuService.eliminarItem(itemId);
      await cargarMenu();
      alert("Item eliminado");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (cargando) return <div className={styles.seccion}>Cargando menú...</div>;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Gestión de Menú</h2>

      <form
        onSubmit={handleCrearCategoria}
        className={`${styles.card} ${styles.categoriaForm}`}
      >
        <div className={styles.cardHeader}>
          <span className={styles.cardTitulo}>Nueva categoría</span>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.categoriaCampos}>
            <div className={styles.inputGrupo}>
            <label className={styles.label}>Nombre</label>
            <input
              className={styles.input}
              placeholder="Ej.: Tragos o Picoteo"
              value={formCategoria.nombre}
              onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
            />
            </div>
            <button
              type="submit"
              className={styles.btnCategoria}
            >
              + Agregar categoría
            </button>
          </div>
        </div>
      </form>

      {categorias.map((cat) => (
        <div key={cat.id} className={styles.card} style={{ marginBottom: "2rem" }}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitulo}>{cat.nombre}</span>
          </div>

          <div className={styles.cardContent}>
            {cat.items && cat.items.length > 0 ? (
              <div style={{ marginBottom: "1.5rem" }}>
                {cat.items.filter((i) => i).map((item) => (
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
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, display: "grid", placeItems: "center", background: "#f3f4f6", borderRadius: 8 }}>
                          🍽️
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--color-text)" }}>{item.nombre}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                          ${item.precio} — {item.descripcion}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setEditando({ ...item, categoria_id: cat.id })}
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
                        type="button"
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

                {editando.imagen_url && (
                  <img
                    src={editando.imagen_url}
                    alt={editando.nombre}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, marginBottom: 12 }}
                  />
                )}

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
                    value={editando.descripcion || ""}
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
                <div className={styles.inputGrupo}>
                  <label className={styles.label}>Imagen del producto</label>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => handleArchivoSeleccionado(e, setEditando)}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <button
                    type="button"
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
                    type="button"
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

              {formNuevo.imagenUrl && (
                <img
                  src={formNuevo.imagenUrl}
                  alt="Vista previa"
                  style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10 }}
                />
              )}

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
              <div className={styles.inputGrupo}>
                <label className={styles.label}>Imagen del producto</label>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={(e) => handleArchivoSeleccionado(e, setFormNuevo)}
                />
              </div>
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