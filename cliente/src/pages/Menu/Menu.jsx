import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "./Menu.module.css";
import ItemCard from "../../components/ui/ItemCard/ItemCard";
import { menuService } from "../../services/menuService";

export default function Menu() {
  const { mesaNumero } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { mesaId, comercioId } = location.state || {};

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState({});

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
      console.log("Cargando menú para comercio:", comercioId);
      const data = await menuService.getMenu(comercioId);
      console.log("Datos recibidos:", data);
      
      setItems(data.items || []);
      setError("");
    } catch (err) {
      console.error("Error cargando menú:", err);
      setError("No se pudo cargar el menú. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarAlPedido = (item) => {
  setPedido((prev) => ({
    ...prev,
    [item.id]: (prev[item.id] || 0) + 1,
  }));
};

const handleRemoverDelPedido = (item) => {
  setPedido((prev) => {
    const nueva = { ...prev };
    if (nueva[item.id] > 1) {
      nueva[item.id]--;
    } else {
      delete nueva[item.id];
    }
    return nueva;
  });
};

  const handleIrAlResumen = () => {
    const itemsSeleccionados = Object.entries(pedido)
      .filter(([_, cant]) => cant > 0)
      .map(([itemId, cantidad]) => {
        const item = items.find((i) => i.id === itemId);
        return {
          item_id: itemId,
          nombre: item.nombre,
          cantidad,
          precio: item.precio,
          subtotal: item.precio * cantidad,
        };
      });

    if (itemsSeleccionados.length === 0) {
      alert("Selecciona al menos un item");
      return;
    }

    navigate("/resumen", {
      state: {
        items: itemsSeleccionados,
        mesaId,
        mesaNumero: parseInt(mesaNumero),
        comercioId,
      },
    });
  };

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

      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.titulo}>Menú</p>
          <p className={styles.subtitulo}>Mesa #{mesaNumero}</p>
        </div>
      </div>

      {/* Contenido */}
      {items.length === 0 ? (
        <div className={styles.vacio}>
          <p>No hay items disponibles en este momento</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              cantidad={pedido[item.id] || 0}
              onAgregar={() => handleAgregarAlPedido(item)}
              onRemover={() => handleRemoverDelPedido(item.id)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {items.length > 0 && Object.values(pedido).some((c) => c > 0) && (
        <div className={styles.footer}>
          <button className={styles.btnResumen} onClick={handleIrAlResumen}>
            Ver Resumen ({Object.values(pedido).reduce((a, b) => a + b, 0)} items)
          </button>
        </div>
      )}

    </div>
  );
}