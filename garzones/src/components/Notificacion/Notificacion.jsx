import styles from "./Notificacion.module.css";

export default function Notificacion({ titulo, mensaje, tipo = "exito", persistente = false, onResolver }) {
  return (
    <div className={`${styles.notif} ${styles[tipo]} slide-in`}>
      <div className={styles.contenido}>
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.mensaje}>{mensaje}</p>
        {persistente && onResolver && (
          <button type="button" className={styles.btnResolver} onClick={onResolver}>
            Problema resuelto
          </button>
        )}
      </div>
    </div>
  );
}
