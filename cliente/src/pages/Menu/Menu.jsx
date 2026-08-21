import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "./Menu.module.css";
import ItemCard from "../../components/ui/ItemCard/ItemCard";
import { mesaService } from "../../services/mesaService";

export default function Menu() {
  const { mesaNumero: mesaNumeroParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { mesaId, comercioId } = location.state || {};
  const mesaNumero = Number(mesaNumeroParam ?? location.state?.mesaNumero ?? mesaId ?? 0);

  const [categorias, setCategorias] = useState([]);
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [itemsMenu, setItemsMenu] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState("");

  useEffect(() => {
    if (!comercioId) {
      setError("Comercio no encontrado. Vuelve a escanear el QR.");
      setCargando(false);
      return;
    }
    cargarMenu();
  }, [comercioId]);

  const cargarMenu = async () => {
    try {
      const data = await mesaService.getMenu(comercioId);
      const categoriasMenu = Array.isArray(data?.categorias) ? data.categorias : [];

      const itemsPlanos = [];
      categoriasMenu.forEach((cat) => {
        if (Array.isArray(cat.items)) {
          cat.items.forEach((item) => {
            if (item && item.id) {
              itemsPlanos.push({
                ...item,
                id: item.id,
                categoria_id: item.categoria_id || cat.id,
                nombre: item.nombre,
                descripcion: item.descripcion || "",
                precio: Number(item.precio) || 0,
                imagen: item.imagen || item.imagen_url || "🍽️",
                disponible: item.activo !== false,
                tiempo_preparacion_min: item.tiempo_preparacion_min || 8,
              });
            }
          });
        }
      });

      setCategorias(categoriasMenu);
      setItems(itemsPlanos);
      setCategoriaActiva(categoriasMenu[0]?.id || "");
      setError("");
    } catch (err) {
      setError("No se pudo cargar el menú. Intenta de nuevo.");
      console.error("Error cargando menú:", err);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarAlPedido = (item) => {
    setItemsMenu((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoverDelPedido = (item) => {
    setItemsMenu((prev) => {
      const nueva = { ...prev };
      if (nueva[item.id] > 1) {
        nueva[item.id] -= 1;
      } else {
        delete nueva[item.id];
      }
      return nueva;
    });
  };

  const handleIrAlResumen = () => {
    const totalItemsSeleccionados = Object.values(itemsMenu).reduce((sum, cantidad) => sum + cantidad, 0);

    if (totalItemsSeleccionados === 0) {
      alert("Selecciona al menos un item");
      return;
    }

    navigate("/resumen", {
      state: {
        pedido: itemsMenu,
        items,
        mesaId,
        mesaNumero,
        comercioId,
      },
    });
  };

  const totalItemsEnPedido = Object.values(itemsMenu).reduce((sum, cantidad) => sum + cantidad, 0);
  const totalPedido = items.reduce((sum, item) => {
    const cantidad = itemsMenu[item.id] || 0;
    return sum + cantidad * Number(item.precio || 0);
  }, 0);

  const itemsPorCategoria = categorias.map((categoria) => ({
    ...categoria,
    items: items.filter((item) => (item.categoria_id || item.categoriaId) === categoria.id),
  }));

  if (cargando) {
    return (
      <div className={styles.page}>
        <div className={styles.cargando}>
          <div className={styles.spinner} />
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <div className={styles.headerLogo}>🍽️</div>
            <div>
              <p className={styles.headerNombre}>Menú</p>
              <p className={styles.headerMesa}>Mesa #{mesaNumero || mesaId || "?"}</p>
            </div>
          </div>
          <span className={styles.headerBadge}>{totalItemsEnPedido} en pedido</span>
        </div>

        {categorias.length > 0 && (
          <div className={styles.tabs}>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={`${styles.tab} ${categoriaActiva === categoria.id ? styles.tabActivo : ""}`}
                onClick={() => setCategoriaActiva(categoria.id)}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.contenido}>
        {itemsPorCategoria.length === 0 ? (
          <div className={styles.vacio}>
            <div className={styles.vacioIcon}>🍽️</div>
            <p>No hay items disponibles en este momento</p>
          </div>
        ) : (
          itemsPorCategoria
            .filter((categoria) => !categoriaActiva || categoria.id === categoriaActiva)
            .map((categoria) => (
              <div key={categoria.id}>
                <h2 className={styles.seccionTitulo}>{categoria.nombre}</h2>
                <div className={styles.itemsLista}>
                  {categoria.items.length === 0 ? (
                    <div className={styles.vacio}>No hay artículos en esta categoría.</div>
                  ) : (
                    categoria.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        cantidad={itemsMenu[item.id] || 0}
                        onAgregar={() => handleAgregarAlPedido(item)}
                        onQuitar={() => handleRemoverDelPedido(item)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {totalItemsEnPedido > 0 && (
        <div className={styles.carritoFloat}>
          <button className={styles.carritoBtn} onClick={handleIrAlResumen}>
            <span className={styles.carritoBtnLeft}>
              <span className={styles.carritoBadge}>{totalItemsEnPedido}</span>
              Ver pedido
            </span>
            <span className={styles.carritoTotal}>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(totalPedido)}</span>
          </button>
        </div>
      )}
    </div>
  );
}