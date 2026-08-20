import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./QRLanding.module.css";
import { COMERCIO } from "../../constants/comercio";
import { mesaService } from "../../services/mesaService";

const STEPS = {
  BIENVENIDA: "bienvenida",
  INGRESAR:   "ingresar",
  EXITO:      "exito",
};

export default function QRLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep]         = useState(STEPS.BIENVENIDA);
  const [mesa, setMesa]         = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  // Detecta si vino del QR
  useEffect(() => {
    const mesaQR = searchParams.get("mesa");
    if (mesaQR) {
      buscarMesaPorQR(mesaQR);
    }
  }, [searchParams]);

  const buscarMesaPorQR = async (qrCode) => {
    setCargando(true);
    try {
      const mesaData = await mesaService.verificarMesaPorQR(qrCode);
      
      setStep(STEPS.EXITO);
      setTimeout(() => {
        navigate(`/menu/${mesaData.numero}`, {
          state: {
            mesaId:     mesaData.id,
            mesaNumero: mesaData.numero,
            comercioId: mesaData.comercio_id,
          },
        });
      }, 1500);
    } catch (err) {
      setError("Codigo QR invalido o mesa no encontrada.");
      setCargando(false);
    }
  };

  const handleConfirmar = async () => {
    const num = parseInt(mesa);
    if (!mesa || isNaN(num)) {
      setError("Por favor ingresa un numero de mesa valido.");
      return;
    }

    setError("");
    setCargando(true);

    try {
      const qrCodigo = `QR-MESA-${String(num).padStart(3, "0")}`;
      const mesaData = await mesaService.verificarMesa(qrCodigo);

      setStep(STEPS.EXITO);

      setTimeout(() => {
        navigate(`/menu/${mesaData.numero}`, {
          state: {
            mesaId:     mesaData.id,
            mesaNumero: mesaData.numero,
            comercioId: mesaData.comercio_id,
          },
        });
      }, 1500);

    } catch (err) {
      setError(`La mesa ${num} no existe en este local.`);
    } finally {
      setCargando(false);
    }
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

  return (
    <div className={styles.page}>
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />

      <div className={styles.card}>

        {step === STEPS.EXITO && (
          <div className={`${styles.exitoWrap} fade-up check-pop`}>
            <div className={styles.checkCircle}>OK</div>
            <h2 className={styles.exitoTitulo}>Listo!</h2>
            <p className={styles.exitoDesc}>
              Mesa <strong>{mesa}</strong> verificada. Cargando el menu...
            </p>
            <div className={styles.spinnerCentrado}>
              <div className={styles.spinnerPrimary} />
            </div>
          </div>
        )}

        {step === STEPS.BIENVENIDA && (
          <div className="fade-up">
            <div className={styles.logoWrap}>
              <div className={styles.logo}>{COMERCIO.logo}</div>
              <h1 className={styles.nombre}>{COMERCIO.nombre}</h1>
              <p className={styles.slogan}>{COMERCIO.slogan}</p>
            </div>

            <div className={styles.tagsWrap}>
              <span className={styles.tagInfo}>Abierto ahora</span>
              <span className={styles.tagInfo}>Mesa QR</span>
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Para comenzar</span>
              <div className={styles.dividerLine} />
            </div>

            <p className={styles.descripcion}>
              Ingresa el numero de tu mesa para ver el menu y realizar
              pedidos directamente desde tu celular.
            </p>

            <button
              className={styles.btnPrimary}
              onClick={() => setStep(STEPS.INGRESAR)}
            >
              Ingresar numero de mesa
            </button>

            <p className={styles.nota}>
              No tienes celular? Presiona el boton de la mesa
            </p>
          </div>
        )}

        {step === STEPS.INGRESAR && (
          <div className="fade-up">
            <button className={styles.volverBtn} onClick={handleVolver}>
              Volver
            </button>

            <h2 className={styles.titulo}>En que mesa estas?</h2>
            <p className={styles.subtitulo}>
              Escribelo o seleccionalo del mapa de mesas.
            </p>

            <input
              className={styles.inputMesa}
              type="number"
              placeholder="Numero de mesa"
              value={mesa}
              onChange={(e) => { setMesa(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmar()}
              autoFocus
            />

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.mesasLabel}>Mesas disponibles</p>
            <div className={styles.mesaGrid}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
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
                  <>Confirmar mesa {mesa && `#${mesa}`}</>
                )}
              </button>
            </div>

            <p className={styles.nota}>
              El numero de mesa esta en la etiqueta QR sobre tu mesa.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}