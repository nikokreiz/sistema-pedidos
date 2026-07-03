import styles from "./Notificacion.module.css";

export default function Notificacion({ titulo, mensaje, tipo = "exito" }) {
  return (
    <div className={`${styles.notif} ${styles[tipo]} slide-in`}>
      <div className={styles.contenido}>
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.mensaje}>{mensaje}</p>
      </div>
    </div>
  );
}
