import { useState } from "react";
import styles from "./Login.module.css";
import api from "../../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    setCargando(true);

    try {
      const data = await api.post("/auth/login", { email, password });
      onLogin(data.garzon);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.logo}>👨‍💼</div>
          <h1 className={styles.titulo}>Garzones</h1>
          <p className={styles.subtitulo}>La Barra del Puerto</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGrupo}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
              autoFocus
            />
          </div>

          <div className={styles.inputGrupo}>
            <label className={styles.label}>Contrasena</label>
            <input
              className={styles.input}
              type="password"
              placeholder="****"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            />
          </div>

          <button
            className={styles.boton}
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? <><div className={styles.spinner} /> Ingresando...</>
              : "Ingresar"
            }
          </button>
        </form>

        <div className={styles.credenciales}>
          <strong>Credenciales de prueba:</strong>
          Email: juan@labarra.cl<br/>
          Contrasena: 1234
        </div>

        <p className={styles.nota}>
          App para garzones — Tu compañero en el local
        </p>

      </div>
    </div>
  );
}
