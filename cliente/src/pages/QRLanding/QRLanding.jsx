import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import styles from "./QRLanding.module.css";
import { COMERCIO } from "../../constants/comercio";
import { mesaService } from "../../services/mesaService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
const SUCURSAL_ID = "a1b2c3d4-0000-0000-0000-000000000002";

const STEPS = {
  BIENVENIDA: "bienvenida",
  INGRESAR:   "ingresar",
  EXITO:      "exito",
};

export default function QRLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(STEPS.BIENVENIDA);
  const [mesa, setMesa] = useState("");
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Escucha cambios de mesas en tiempo real
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Conectado a Socket.io");
    });

    socket.on("mesa_creada", (data) => {
      console.log("Nueva mesa creada:", data);
      if (data.activa !== false) {
        setMesasDisponibles((mesasActuales) => [...mesasActuales, data].sort((a, b) => a.numero - b.numero));
      }
    });

    socket.on("mesa_actualizada", (data) => {
      console.log("Mesa actualizada:", data);
      setMesasDisponibles((mesasActuales) => {
        const mesasActualizadas = mesasActuales
          .map((mesaActual) => mesaActual.id === data.id ? { ...mesaActual, ...data } : mesaActual)
          .filter((mesaActual) => mesaActual.activa !== false);
        return mesasActualizadas.sort((a, b) => a.numero - b.numero);
      });
    });

    socket.on("mesa_eliminada", (data) => {
      console.log("Mesa eliminada:", data);
      setMesasDisponibles((mesasActuales) => mesasActuales.filter((mesaActual) => mesaActual.id !== data.mesaId));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const mesas = await mesaService.getMesas(SUCURSAL_ID);
        setMesasDisponibles(mesas.filter((mesaDisponible) => mesaDisponible.activa !== false));
      } catch (err) {
        console.error("Error cargando mesas disponibles:", err.message);
      }
    };

    cargarMesas();
  }, []);

  const buscarMesaPorQR = async (qrCode) => {
    setCargando(true);
    try {
      const mesaData = await mesaService.verificarMesaPorQR(qrCode);
      
      // Verifica si el local está abierto
      const estadoLocal = await mesaService.verificarLocalAbierto(mesaData.comercio_id);
      
      if (!estadoLocal.abierto) {
        setError(`Local cerrado. Abierto de ${estadoLocal.hora_apertura} a ${estadoLocal.hora_cierre}`);
        setCargando(false);
        return;
      }
      
      setStep(STEPS.EXITO);
      setTimeout(() => {
        navigate(`/menu/${mesaData.numero}`, {
          state: {
            mesaId:     mesaData.id,
            mesaNumero: mesaData.numero,
            comercioId: mesaData.comercio_id,
            garzonNombre: mesaData.garzon_nombre,
          },
        });
      }, 1500);
    } catch {
      setError("Codigo QR invalido o mesa no encontrada.");
      setCargando(false);
    }
  };

  // Detecta si vino del QR
  useEffect(() => {
    const mesaQR = searchParams.get("mesa");
    if (mesaQR) {
      buscarMesaPorQR(mesaQR);
    }
  }, [searchParams]);

  const handleConfirmar = async () => {
    const num = parseInt(mesa);
    if (!mesa || isNaN(num)) {
      setError("Por favor ingresa un numero de mesa valido.");
      return;
    }

    setError("");
    setCargando(true);

    try {
      let mesaData;
      
      try {
        // La asignación manual conoce el número, no el UUID del QR.
        mesaData = await mesaService.verificarMesaPorNumero(num);
      } catch {
        try {
          const qrCodigo = `QR-MESA-${String(num).padStart(3, "0")}`;
          mesaData = await mesaService.verificarMesa(qrCodigo);
        } catch {
          const qrCodeUnico = `mesa-${num}`;
          mesaData = await mesaService.verificarMesaPorQR(qrCodeUnico);
        }
      }

      // Verifica si el local está abierto
      const estadoLocal = await mesaService.verificarLocalAbierto(mesaData.comercio_id);
      
      if (!estadoLocal.abierto) {
        setError(`Local cerrado. Abierto de ${estadoLocal.hora_apertura} a ${estadoLocal.hora_cierre}`);
        setCargando(false);
        return;
      }

      setStep(STEPS.EXITO);

      setTimeout(() => {
        navigate(`/menu/${mesaData.numero}`, {
          state: {
            mesaId:     mesaData.id,
            mesaNumero: mesaData.numero,
            comercioId: mesaData.comercio_id,
            garzonNombre: mesaData.garzon_nombre,
          },
        });
      }, 1500);

    } catch {
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
              {mesasDisponibles.map((mesaDisponible) => (
                <button
                  key={mesaDisponible.id}
                  className={`${styles.mesaChip} ${parseInt(mesa) === mesaDisponible.numero ? styles.mesaChipSelected : ""}`}
                  onClick={() => handleSeleccionarMesa(mesaDisponible.numero)}
                >
                  {mesaDisponible.numero}
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