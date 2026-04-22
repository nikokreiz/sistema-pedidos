import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./QRLanding.module.css";
import { COMERCIO, MESAS_DISPONIBLES } from "../../constants/comercio";

// ─── Steps del flujo ─────────────────────────────────────────────────────────
const STEPS = {
  BIENVENIDA: "bienvenida",
  INGRESAR:   "ingresar",
  EXITO:      "exito",
};

export default function QRLanding() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(STEPS.BIENVENIDA);
  const [mesa, setMesa]       = useState("");
  const [error, setError]     = useState("");
  const [cargando, setCargando] = useState(false);

  // ── Validación y envío ──────────────────────────────────────────────────────
  const handleConfirmar = () => {
    const num = parseInt(mesa);

    if (!mesa || isNaN(num)) {
      setError("Por favor ingresa un número de mesa válido.");
      return;
    }
    if (!MESAS_DISPONIBLES.includes(num)) {
      setError(`La mesa ${num} no existe en este local.`);
      return;
    }

    setError("");
    setCargando(true);

    // Simula llamada a la API — se reemplazará por llamada real al backend
    setTimeout(() => {
      setCargando(false);
      setStep(STEPS.EXITO);

      // Redirige al menú pasando el número de mesa como parámetro de ruta
      setTimeout(() => navigate(`/menu/${num}`), 1500);
    }, 1500);
  };

  const handleSeleccionarMesa = (num) => {
    setMesa(String(num));
    setError("");
  };

  const handleVolver = () => {
    setStep(STEPS.BIENVENIDA);
    setMesa("");
    setError("");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />

      <div className={styles.card}>

        {/* ── Step: Éxito ── */}
        {step === STEPS.EXITO && (
          <div className={`${styles.exitoWrap} fade-up check-pop`}>
            <div className={styles.checkCircle}>✓</div>
            <h2 className={styles.exitoTitulo}>¡Listo!</h2>
            <p className={styles.exitoDesc}>
              Mesa <strong>{mesa}</strong> verificada. Cargando el menú...
            </p>
            <div className={styles.spinnerCentrado}>
              <div className={styles.spinnerPrimary} />
            </div>
          </div>
        )}

        {/* ── Step: Bienvenida ── */}
        {step === STEPS.BIENVENIDA && (
          <div className="fade-up">
            <div className={styles.logoWrap}>
              <div className={styles.logo}>{COMERCIO.logo}</div>
              <h1 className={styles.nombre}>{COMERCIO.nombre}</h1>
              <p className={styles.slogan}>{COMERCIO.slogan}</p>
            </div>

            <div className={styles.tagsWrap}>
              <span className={styles.tagInfo}>🕐 Abierto ahora</span>
              <span className={styles.tagInfo}>📍 Mesa QR</span>
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Para comenzar</span>
              <div className={styles.dividerLine} />
            </div>

            <p className={styles.descripcion}>
              Ingresa el número de tu mesa para ver el menú y realizar
              pedidos directamente desde tu celular.
            </p>

            <button
              className={styles.btnPrimary}
              onClick={() => setStep(STEPS.INGRESAR)}
            >
              Ingresar número de mesa →
            </button>

            <p className={styles.nota}>
              ¿No tienes celular? Presiona el botón de la mesa 🔘
            </p>
          </div>
        )}

        {/* ── Step: Ingresar mesa ── */}
        {step === STEPS.INGRESAR && (
          <div className="fade-up">
            <button className={styles.volverBtn} onClick={handleVolver}>
              ← Volver
            </button>

            <h2 className={styles.titulo}>¿En qué mesa estás?</h2>
            <p className={styles.subtitulo}>
              Escríbelo o selecciónalo del mapa de mesas.
            </p>

            <input
              className={styles.inputMesa}
              type="number"
              placeholder="Nº de mesa"
              value={mesa}
              onChange={(e) => { setMesa(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmar()}
              autoFocus
            />

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.mesasLabel}>Mesas disponibles</p>
            <div className={styles.mesaGrid}>
              {MESAS_DISPONIBLES.map((n) => (
                <button
                  key={n}
                  className={`${styles.mesaChip} ${parseInt(mesa) === n ? styles.mesaChipSelected : ""}`}
                  onClick={() => handleSeleccionarMesa(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className={styles.btnGroup}>
              <button
                className={styles.btnPrimary}
                onClick={handleConfirmar}
                disabled={cargando || !mesa}
              >
                {cargando ? (
                  <><div className={styles.spinner} /> Verificando...</>
                ) : (
                  <>Confirmar mesa {mesa && `#${mesa}`} →</>
                )}
              </button>
            </div>

            <p className={styles.nota}>
              El número de mesa está en la etiqueta QR sobre tu mesa.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
