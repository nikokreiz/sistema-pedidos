import React, { useState } from "react";

const layers = [
  {
    id: "clients",
    label: "CAPA DE CLIENTES",
    color: "#10B981",
    nodes: [
      {
        id: "web_cliente",
        icon: "📱",
        title: "Web App Cliente",
        subtitle: "React.js · PWA",
        desc: "Acceso vía QR. Muestra menú, permite pedir y pagar.",
        tags: ["QR Scan", "Menú", "Pedido", "Pago Online"],
        color: "#10B981",
      },
      {
        id: "app_garzon",
        icon: "🧑‍🍳",
        title: "App Garzones",
        subtitle: "React Native",
        desc: "Alertas en tiempo real, pedidos listos y mesas con pago pendiente.",
        tags: ["Alertas Push", "Pedidos listos", "Pagos pendientes"],
        color: "#10B981",
      },
      {
        id: "pantalla_cocina",
        icon: "🖥️",
        title: "Pantalla Cocina/Barra",
        subtitle: "React.js · Pantalla fija",
        desc: "Muestra pedidos por mesa en tiempo real. Permite marcar pedidos listos.",
        tags: ["Vista por mesa", "Marcar listo", "Cola de pedidos"],
        color: "#10B981",
      },
      {
        id: "boton_iot",
        icon: "🔘",
        title: "Botón Físico IoT",
        subtitle: "ESP32 / Raspberry Pi",
        desc: "Botón en la mesa para clientes sin smartphone. Envía alerta directa.",
        tags: ["IoT", "Sin app", "Alerta directa"],
        color: "#10B981",
      },
    ],
  },
  {
    id: "gateway",
    label: "API GATEWAY",
    color: "#F59E0B",
    single: {
      icon: "⚡",
      title: "API Gateway",
      subtitle: "FastAPI · Python",
      desc: "Punto de entrada único. Maneja autenticación JWT, enrutamiento, rate limiting y validación de requests para todos los clientes.",
      tags: ["JWT Auth", "Rate Limiting", "Routing", "Validación", "CORS"],
      color: "#F59E0B",
    },
  },
  {
    id: "services",
    label: "SERVICIOS BACKEND",
    color: "#8B5CF6",
    nodes: [
      {
        id: "svc_pedidos",
        icon: "📝",
        title: "Servicio de Pedidos",
        subtitle: "FastAPI · Python",
        desc: "Gestión del ciclo completo de pedidos. Crea, actualiza y rastrea cada pedido.",
        tags: ["CRUD Pedidos", "Estados", "Sesiones mesa"],
        color: "#8B5CF6",
      },
      {
        id: "svc_menu",
        icon: "🍽️",
        title: "Servicio de Menú",
        subtitle: "FastAPI · Python",
        desc: "Gestión de categorías e items del menú. Multi-comercio.",
        tags: ["Categorías", "Items", "Disponibilidad"],
        color: "#8B5CF6",
      },
      {
        id: "svc_realtime",
        icon: "⚡",
        title: "Servicio Tiempo Real",
        subtitle: "WebSockets · FastAPI",
        desc: "Canal bidireccional. Sincroniza pedidos entre cliente, cocina y garzones en milisegundos.",
        tags: ["WebSockets", "Broadcast", "Rooms por sucursal"],
        color: "#F97316",
      },
      {
        id: "svc_notif",
        icon: "🔔",
        title: "Servicio Notificaciones",
        subtitle: "Firebase Cloud Messaging",
        desc: "Push notifications a la app del garzon. Alertas del botón IoT y pedidos listos.",
        tags: ["Push Notif", "FCM", "IoT Bridge"],
        color: "#EF4444",
      },
      {
        id: "svc_pagos",
        icon: "💳",
        title: "Servicio de Pagos",
        subtitle: "Integración Transbank / Flow",
        desc: "Procesa pagos online. Registra efectivo. Gestiona estados de pago.",
        tags: ["Transbank", "Flow", "Efectivo", "Webhooks"],
        color: "#8B5CF6",
      },
      {
        id: "svc_ia",
        icon: "🤖",
        title: "Servicio IA",
        subtitle: "Python · scikit-learn",
        desc: "Motor de recomendaciones y predicción de demanda. Se alimenta del historial de pedidos.",
        tags: ["Recomendador", "Predicción", "Historial"],
        color: "#EC4899",
      },
    ],
  },
  {
    id: "data",
    label: "CAPA DE DATOS",
    color: "#3B82F6",
    nodes: [
      {
        id: "postgresql",
        icon: "🗄️",
        title: "PostgreSQL",
        subtitle: "Base de datos principal",
        desc: "Almacena toda la data relacional: comercios, mesas, pedidos, empleados y analytics.",
        tags: ["Multi-tenant", "ACID", "Relacional"],
        color: "#3B82F6",
      },
      {
        id: "firebase",
        icon: "🔥",
        title: "Firebase RTDB",
        subtitle: "Estado en tiempo real",
        desc: "Estado activo de mesas y pedidos en curso. Sincronización instantánea entre dispositivos.",
        tags: ["Estado activo", "Sync", "Latencia baja"],
        color: "#F59E0B",
      },
      {
        id: "redis",
        icon: "⚡",
        title: "Redis",
        subtitle: "Caché y sesiones",
        desc: "Caché del menú activo, sesiones JWT y cola de mensajes para notificaciones.",
        tags: ["Caché", "Sesiones", "Cola mensajes"],
        color: "#EF4444",
      },
    ],
  },
];

const flows = [
  { id: 1, color: "#10B981", label: "Cliente hace pedido", steps: ["📱 Cliente escanea QR", "⚡ API Gateway valida", "📝 Servicio Pedidos crea order", "⚡ WebSocket notifica cocina", "🖥️ Pantalla cocina actualiza", "🍽️ Cocina prepara", "🔔 Push al garzon", "🧑‍🍳 Garzon lleva pedido"] },
  { id: 2, color: "#F97316", label: "Botón físico IoT", steps: ["🔘 Cliente presiona botón", "⚡ MQTT → API Gateway", "🔔 Servicio notificaciones", "📲 Push a app garzones", "🧑‍🍳 Garzon acude a mesa"] },
  { id: 3, color: "#EC4899", label: "Motor IA recomienda", steps: ["📱 Cliente abre menú", "🤖 Servicio IA consulta historial", "📊 Algoritmo procesa patrones", "💡 Retorna top 3 recomendados", "📱 Cliente ve sugerencias"] },
];

export default function Arquitectura() {
  const [activeFlow, setActiveFlow] = useState(null);
  const [activeNode, setActiveNode] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07070E",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      color: "#E2E8F0",
      padding: "2rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        .node-card {
          background: #0E0E1A;
          border: 1px solid #1E1E30;
          border-radius: 10px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .node-card:hover {
          border-color: var(--c);
          transform: translateY(-2px);
          box-shadow: 0 0 20px var(--c)22;
        }
        .node-card.active {
          border-color: var(--c);
          box-shadow: 0 0 24px var(--c)33;
          background: #12121E;
        }
        .tag {
          display: inline-block;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-size: 0.62rem;
          margin: 0.15rem;
          border: 1px solid;
        }
        .layer-wrap {
          background: #0A0A14;
          border: 1px solid #14142A;
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .layer-label {
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          font-weight: 500;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .flow-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #1E1E30;
          background: transparent;
          color: #888;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.72rem;
          transition: all 0.15s;
        }
        .flow-btn:hover { border-color: #444; color: #ccc; }
        .flow-btn.active { color: #07070E; border-color: transparent; }
        .arrow-down {
          text-align: center;
          color: #1E1E30;
          font-size: 1.5rem;
          margin: -0.25rem 0;
          line-height: 1;
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "#444", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 0.5rem" }}>
            Mesa Auto-Responsable · Arquitectura del Sistema
          </p>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #F8FAFC 0%, #64748B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            Arquitectura del Sistema
          </h1>
          <p style={{ color: "#3A3A5A", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            4 capas · 12 servicios · Multi-tenant · Tiempo real
          </p>
        </div>

        {/* Flow selector */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "#444", fontSize: "0.7rem", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>
            VER FLUJOS DE DATOS →
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {flows.map(f => (
              <button
                key={f.id}
                className={`flow-btn ${activeFlow === f.id ? "active" : ""}`}
                style={activeFlow === f.id ? { background: f.color } : {}}
                onClick={() => setActiveFlow(activeFlow === f.id ? null : f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activeFlow && (() => {
            const flow = flows.find(f => f.id === activeFlow);
            return (
              <div style={{
                marginTop: "1rem",
                background: "#0E0E1A",
                border: `1px solid ${flow.color}44`,
                borderRadius: "10px",
                padding: "1rem 1.25rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {flow.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        background: `${flow.color}18`,
                        border: `1px solid ${flow.color}44`,
                        borderRadius: "6px",
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.72rem",
                        color: flow.color,
                        whiteSpace: "nowrap",
                      }}>{step}</span>
                      {i < flow.steps.length - 1 && (
                        <span style={{ color: "#2A2A3A", fontSize: "0.9rem" }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Architecture layers */}
        {layers.map((layer, li) => (
          <div key={layer.id}>
            <div className="layer-wrap">
              <div className="layer-label" style={{ color: layer.color }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: layer.color }} />
                {layer.label}
              </div>

              {layer.single ? (
                <div
                  className={`node-card ${activeNode === layer.single.id ? "active" : ""}`}
                  style={{ "--c": layer.single.color }}
                  onClick={() => setActiveNode(activeNode === layer.single.id ? null : layer.single.id)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{layer.single.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ color: layer.single.color, fontWeight: 500, fontSize: "0.9rem" }}>
                          {layer.single.title}
                        </span>
                        <span style={{ color: "#333", fontSize: "0.72rem" }}>·</span>
                        <span style={{ color: "#444", fontSize: "0.72rem" }}>{layer.single.subtitle}</span>
                      </div>
                      <p style={{ color: "#4A5568", fontSize: "0.75rem", margin: "0.35rem 0 0.5rem" }}>
                        {layer.single.desc}
                      </p>
                      <div>
                        {layer.single.tags.map((tag, i) => (
                          <span key={i} className="tag" style={{
                            background: `${layer.single.color}12`,
                            borderColor: `${layer.single.color}33`,
                            color: layer.single.color,
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "0.85rem",
                }}>
                  {layer.nodes.map(node => (
                    <div
                      key={node.id}
                      className={`node-card ${activeNode === node.id ? "active" : ""}`}
                      style={{ "--c": node.color }}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>{node.icon}</span>
                        <div>
                          <div style={{ color: node.color, fontSize: "0.8rem", fontWeight: 500 }}>{node.title}</div>
                          <div style={{ color: "#333", fontSize: "0.65rem" }}>{node.subtitle}</div>
                        </div>
                      </div>
                      <p style={{ color: "#4A5568", fontSize: "0.72rem", margin: "0 0 0.5rem" }}>{node.desc}</p>
                      <div>
                        {node.tags.map((tag, i) => (
                          <span key={i} className="tag" style={{
                            background: `${node.color}12`,
                            borderColor: `${node.color}33`,
                            color: node.color,
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {li < layers.length - 1 && (
              <div className="arrow-down">↕</div>
            )}
          </div>
        ))}

        {/* Tech summary */}
        <div style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "0.85rem",
        }}>
          {[
            { layer: "Frontend", techs: "React.js · React Native · PWA", color: "#10B981" },
            { layer: "Backend", techs: "Python · FastAPI · WebSockets", color: "#8B5CF6" },
            { layer: "Base de Datos", techs: "PostgreSQL · Firebase · Redis", color: "#3B82F6" },
            { layer: "IA", techs: "scikit-learn · Python · Analytics", color: "#EC4899" },
            { layer: "IoT", techs: "ESP32 · MQTT · REST Bridge", color: "#F97316" },
            { layer: "Pagos", techs: "Transbank · Flow · Webhooks", color: "#F59E0B" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#0E0E1A",
              border: `1px solid ${item.color}22`,
              borderRadius: "8px",
              padding: "0.85rem",
            }}>
              <div style={{ color: item.color, fontSize: "0.7rem", marginBottom: "0.3rem", letterSpacing: "0.05em" }}>
                {item.layer.toUpperCase()}
              </div>
              <div style={{ color: "#555", fontSize: "0.72rem" }}>{item.techs}</div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "#1A1A2E", fontSize: "0.7rem", marginTop: "2rem" }}>
          Mesa Auto-Responsable · Arquitectura v1.0
        </p>
      </div>
    </div>
  );
}
