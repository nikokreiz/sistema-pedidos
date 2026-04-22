import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Menu.module.css";
import ItemCard from "../../components/ui/ItemCard/ItemCard";
import { COMERCIO } from "../../constants/comercio";
import { CATEGORIAS, ITEMS_MENU } from "../../constants/menu";

// Formatea precio en pesos chilenos
const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function Menu() {
  const { mesaId } = useParams();
  const navigate   = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0].id);
  const [pedido, setPedido] = useState({}); // { item_id: cantidad }

  // ── Items filtrados por categoría activa ────────────────────────────────────
  const itemsFiltrados = useMemo(
    () => ITEMS_MENU.filter((i) => i.categoria_id === categoriaActiva),
    [categoriaActiva]
  );

  // ── Manejo del pedido ───────────────────────────────────────────────────────
  const agregarItem = (item) => {
    setPedido((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const quitarItem = (item) => {
    setPedido((prev) => {
      const nueva = { ...prev };
      if (nueva[item.id] <= 1) delete nueva[item.id];
      else nueva[item.id] -= 1;
      return nueva;
    });
  };

  // ── Totales del carrito ─────────────────────────────────────────────────────
  const totalItems = Object.values(pedido).reduce((a, b) => a + b, 0);
  const totalPrecio = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const item = ITEMS_MENU.find((i) => i.id === id);
    return acc + (item ? item.precio * cant : 0);
  }, 0);

  const irAlResumen = () => {
    // Pasamos el pedido y el número de mesa al resumen vía state de navegación
    navigate("/resumen", { state: { pedido, mesaId } });
  };

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

        {/* ── Tabs de categorías ── */}
        <div className={styles.tabs}>
          {CATEGORIAS.map((cat) => (
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
          {CATEGORIAS.find((c) => c.id === categoriaActiva)?.nombre}
        </h2>

        {itemsFiltrados.length > 0 ? (
          <div className={styles.itemsLista}>
            {itemsFiltrados.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
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
