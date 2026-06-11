import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "./Menu.module.css";
import ItemCard from "../../components/ui/ItemCard/ItemCard";
import { COMERCIO } from "../../constants/comercio";
import { menuService } from "../../services/menuService";
import { getEmoji } from "../../constants/emojiMap"; 

const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function Menu() {
  const { mesaId }   = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  // Datos reales de la mesa que vienen desde QRLanding
  const { comercioId = null } = location.state || {};

  const [categorias, setCategorias]       = useState([]);
  const [items, setItems]                 = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [pedido, setPedido]               = useState({});
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState("");

  // ── Carga el menú real desde el backend ────────────────────────────────────
  useEffect(() => {
    const cargarMenu = async () => {
      try {
        setCargando(true);

        // ID del comercio — viene del state de navegación
        // En desarrollo usamos el ID fijo que insertamos en la BD
        const id = comercioId || "a1b2c3d4-0000-0000-0000-000000000001";
        const data = await menuService.getMenu(id);

        setCategorias(data.categorias);
        setItems(data.items);

        if (data.categorias.length > 0) {
          setCategoriaActiva(data.categorias[0].id);
        }
      } catch (err) {
        setError("No se pudo cargar el menú. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    cargarMenu();
  }, [comercioId]);

  // ── Items filtrados por categoría ───────────────────────────────────────────
  const itemsFiltrados = useMemo(
    () => items.filter((i) => i.categoria_id === categoriaActiva),
    [items, categoriaActiva]
  );

  // ── Manejo del pedido ───────────────────────────────────────────────────────
  const agregarItem = (item) =>
    setPedido((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));

  const quitarItem = (item) =>
    setPedido((prev) => {
      const nueva = { ...prev };
      if (nueva[item.id] <= 1) delete nueva[item.id];
      else nueva[item.id] -= 1;
      return nueva;
    });

  // ── Totales ─────────────────────────────────────────────────────────────────
  const totalItems = Object.values(pedido).reduce((a, b) => a + b, 0);
  const totalPrecio = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const item = items.find((i) => i.id === id);
    return acc + (item ? item.precio * cant : 0);
  }, 0);

  const irAlResumen = () =>
    navigate("/resumen", { state: { pedido, mesaId } });

  // ── Estados de carga y error ────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className={styles.vacio}>
          <div className={styles.vacioIcon}>⏳</div>
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className={styles.vacio}>
          <div className={styles.vacioIcon}>❌</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header sticky ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <span className={styles.headerLogo}>{COMERCIO.logo}</span>
            <div>
              <p className={styles.headerNombre}>{COMERCIO.nombre}</p>
              <p className={styles.headerMesa}>Mesa #{mesaId}</p>
            </div>
          </div>
          <span className={styles.headerBadge}>Abierto</span>
        </div>

        <div className={styles.tabs}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.tab} ${categoriaActiva === cat.id ? styles.tabActivo : ""}`}
              onClick={() => setCategoriaActiva(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista de items ── */}
      <div className={styles.contenido}>
        <h2 className={styles.seccionTitulo}>
          {categorias.find((c) => c.id === categoriaActiva)?.nombre}
        </h2>

        {itemsFiltrados.length > 0 ? (
          <div className={styles.itemsLista}>
            {itemsFiltrados.map((item) => (
              <ItemCard
                key={item.id}
                item={{ ...item, imagen: getEmoji(item.imagen_url) }}
                cantidad={pedido[item.id] || 0}
                onAgregar={agregarItem}
                onQuitar={quitarItem}
              />
            ))}
          </div>
        ) : (
          <div className={styles.vacio}>
            <div className={styles.vacioIcon}>🍽️</div>
            <p>No hay items disponibles en esta categoría.</p>
          </div>
        )}
      </div>

      {/* ── Botón flotante del carrito ── */}
      {totalItems > 0 && (
        <div className={styles.carritoFloat}>
          <button className={styles.carritoBtn} onClick={irAlResumen}>
            <div className={styles.carritoBtnLeft}>
              <span className={styles.carritoBadge}>{totalItems}</span>
              <span>Ver mi pedido</span>
            </div>
            <span className={styles.carritoTotal}>{formatPrecio(totalPrecio)}</span>
          </button>
        </div>
      )}

    </div>
  );
}
