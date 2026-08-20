import { useState } from "react";
import styles from "../../../pages/Dashboard/Dashboard.module.css";
import api from "../../../services/api";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export default function Horarios({ admin, horarios, onSave }) {
  const [cargando, setCargando] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState({});

  const handleCambio = (diaSemana, campo, valor) => {
    setHorarioEditando({
      ...horarioEditando,
      [diaSemana]: {
        ...(horarioEditando[diaSemana] || {}),
        [campo]: valor,
      },
    });
  };

  const handleGuardar = async (diaSemana) => {
    setCargando(true);
    try {
      const cambios = horarioEditando[diaSemana];
      if (!cambios) return;

      const horarioActual = horarios.find((h) => h.dia_semana === diaSemana);
      
      await api.put(`/admin/horarios/${admin.comercioId}/${diaSemana}`, {
        horaApertura: cambios.horaApertura || horarioActual.hora_apertura,
        horaCierre: cambios.horaCierre || horarioActual.hora_cierre,
        abierto: cambios.abierto !== undefined ? cambios.abierto : horarioActual.abierto,
      });

      // Actualiza el estado local
      const nuevosHorarios = horarios.map((h) =>
        h.dia_semana === diaSemana
          ? {
              ...h,
              hora_apertura: cambios.horaApertura || h.hora_apertura,
              hora_cierre: cambios.horaCierre || h.hora_cierre,
              abierto: cambios.abierto !== undefined ? cambios.abierto : h.abierto,
            }
          : h
      );
      onSave(nuevosHorarios);

      // Limpia el formulario
      const nuevoEditando = { ...horarioEditando };
      delete nuevoEditando[diaSemana];
      setHorarioEditando(nuevoEditando);

      alert("Horario guardado correctamente");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Configurar Horarios</h2>

      <div className={styles.card}>
        <div className={styles.cardContent}>
          {horarios.map((horario, i) => (
            <div key={i} className={styles.horarioRow}>
              <span className={styles.diaNombre}>{DIAS[horario.dia_semana]}</span>
              <input
                type="time"
                className={styles.horarioInput}
                defaultValue={horario.hora_apertura}
                onChange={(e) => handleCambio(horario.dia_semana, "horaApertura", e.target.value)}
              />
              <input
                type="time"
                className={styles.horarioInput}
                defaultValue={horario.hora_cierre}
                onChange={(e) => handleCambio(horario.dia_semana, "horaCierre", e.target.value)}
              />
              <button
                className={styles.btnGuardarHorario}
                onClick={() => handleGuardar(horario.dia_semana)}
                disabled={cargando}
              >
                Guardar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}