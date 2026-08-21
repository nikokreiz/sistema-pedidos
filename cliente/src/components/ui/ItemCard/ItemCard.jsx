import styles from "./ItemCard.module.css";

// Formatea precio en pesos chilenos
const formatPrecio = (precio) =>
  precio.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function ItemCard({ item, cantidad, onAgregar, onRemover }) {
  const agregado = cantidad > 0;
  const disponible = item.activo !== false;

  return (
    <div className={`
      ${styles.card}
      ${agregado ? styles.cardAgregado : ""}
      ${!disponible ? styles.cardNoDisponible : ""}
    `}>

      {/* Imagen / Emoji */}
      <div className={styles.imagen}>{item.imagen}</div>

      {/* Contenido */}
      <div className={styles.contenido}>
        <p className={styles.nombre}>{item.nombre}</p>
        <p className={styles.descripcion}>{item.descripcion || "Sin descripción"}</p>
        <div className={styles.footer}>
          <span className={styles.precio}>{formatPrecio(item.precio)}</span>
        </div>
      </div>

      {/* Badge no disponible */}
      {!disponible && (
        <span className={styles.badgeNoDisponible}>Agotado</span>
      )}

      {/* Controles de cantidad */}
      {disponible && (
        agregado ? (
          <div className={styles.contador}>
            <button className={styles.btnCantidad} onClick={() => onRemover(item)}>−</button>
            <span className={styles.cantidad}>{cantidad}</span>
            <button className={styles.btnCantidad} onClick={() => onAgregar(item)}>+</button>
          </div>
        ) : (
          <button className={styles.btnAgregar} onClick={() => onAgregar(item)}>+</button>
        )
      )}
    </div>
  );
}