import React, { useState } from "react";
import Arquitectura from "./arquitectura_sistema.jsx";
import DatabaseSchema from "./modelo_base_datos.jsx";

export default function App() {
  const [vista, setVista] = useState("arquitectura");

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          gap: "0.75rem",
          padding: "0.9rem 1rem",
          background: "#07070E",
          borderBottom: "1px solid #1E1E30",
        }}
      >
        <button
          onClick={() => setVista("arquitectura")}
          style={{
            background: vista === "arquitectura" ? "#10B981" : "transparent",
            color: vista === "arquitectura" ? "#07070E" : "#A0AEC0",
            border: "1px solid #1E1E30",
            borderRadius: "8px",
            padding: "0.45rem 0.8rem",
            cursor: "pointer",
          }}
        >
          Arquitectura
        </button>

        <button
          onClick={() => setVista("bd")}
          style={{
            background: vista === "bd" ? "#F59E0B" : "transparent",
            color: vista === "bd" ? "#07070E" : "#A0AEC0",
            border: "1px solid #1E1E30",
            borderRadius: "8px",
            padding: "0.45rem 0.8rem",
            cursor: "pointer",
          }}
        >
          Modelo BD
        </button>
      </header>

      {vista === "arquitectura" ? <Arquitectura /> : <DatabaseSchema />}
    </>
  );
}
