import React, { useState } from "react";

const schema = {
  comercios: {
    color: "#F59E0B",
    icon: "🏢",
    group: "Multi-Tenant",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "nombre", type: "VARCHAR(100)" },
      { name: "rut", type: "VARCHAR(20) · UNIQUE" },
      { name: "direccion", type: "TEXT" },
      { name: "telefono", type: "VARCHAR(20)" },
      { name: "email", type: "VARCHAR(100)" },
      { name: "logo_url", type: "TEXT" },
      { name: "plan_tipo", type: "ENUM(básico, pro, enterprise)" },
      { name: "activo", type: "BOOLEAN" },
      { name: "creado_en", type: "TIMESTAMP" },
    ],
  },
  sucursales: {
    color: "#F59E0B",
    icon: "📍",
    group: "Multi-Tenant",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "comercio_id", type: "FK → comercios", fk: true },
      { name: "nombre", type: "VARCHAR(100)" },
      { name: "direccion", type: "TEXT" },
      { name: "telefono", type: "VARCHAR(20)" },
      { name: "activo", type: "BOOLEAN" },
      { name: "creado_en", type: "TIMESTAMP" },
    ],
  },
  mesas: {
    color: "#10B981",
    icon: "🪑",
    group: "Operación",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "sucursal_id", type: "FK → sucursales", fk: true },
      { name: "numero", type: "INTEGER" },
      { name: "capacidad", type: "INTEGER" },
      { name: "estado", type: "ENUM(disponible, ocupada, reservada)" },
      { name: "qr_codigo", type: "TEXT · UNIQUE" },
      { name: "activa", type: "BOOLEAN" },
    ],
  },
  dispositivos_fisicos: {
    color: "#10B981",
    icon: "🔘",
    group: "Operación",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "mesa_id", type: "FK → mesas", fk: true },
      { name: "codigo_dispositivo", type: "VARCHAR(50) · UNIQUE" },
      { name: "ultimo_ping", type: "TIMESTAMP" },
      { name: "activo", type: "BOOLEAN" },
    ],
  },
  categorias_menu: {
    color: "#8B5CF6",
    icon: "📋",
    group: "Menú",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "comercio_id", type: "FK → comercios", fk: true },
      { name: "nombre", type: "VARCHAR(100)" },
      { name: "descripcion", type: "TEXT" },
      { name: "orden", type: "INTEGER" },
      { name: "activa", type: "BOOLEAN" },
    ],
  },
  items_menu: {
    color: "#8B5CF6",
    icon: "🍽️",
    group: "Menú",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "categoria_id", type: "FK → categorias_menu", fk: true },
      { name: "comercio_id", type: "FK → comercios", fk: true },
      { name: "nombre", type: "VARCHAR(150)" },
      { name: "descripcion", type: "TEXT" },
      { name: "precio", type: "DECIMAL(10,2)" },
      { name: "imagen_url", type: "TEXT" },
      { name: "disponible", type: "BOOLEAN" },
      { name: "tiempo_preparacion_min", type: "INTEGER" },
    ],
  },
  sesiones_mesa: {
    color: "#3B82F6",
    icon: "⏱️",
    group: "Pedidos",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "mesa_id", type: "FK → mesas", fk: true },
      { name: "iniciada_en", type: "TIMESTAMP" },
      { name: "cerrada_en", type: "TIMESTAMP · NULL" },
      { name: "estado", type: "ENUM(activa, cerrada)" },
    ],
  },
  pedidos: {
    color: "#3B82F6",
    icon: "📝",
    group: "Pedidos",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "sesion_id", type: "FK → sesiones_mesa", fk: true },
      { name: "mesa_id", type: "FK → mesas", fk: true },
      { name: "identificador_cliente", type: "VARCHAR(50)" },
      { name: "estado", type: "ENUM(pendiente, preparando, listo, entregado, pagado)" },
      { name: "metodo_pago", type: "ENUM(online, efectivo, pendiente)" },
      { name: "total", type: "DECIMAL(10,2)" },
      { name: "creado_en", type: "TIMESTAMP" },
      { name: "actualizado_en", type: "TIMESTAMP" },
    ],
  },
  items_pedido: {
    color: "#3B82F6",
    icon: "🛒",
    group: "Pedidos",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "pedido_id", type: "FK → pedidos", fk: true },
      { name: "item_menu_id", type: "FK → items_menu", fk: true },
      { name: "cantidad", type: "INTEGER" },
      { name: "precio_unitario", type: "DECIMAL(10,2)" },
      { name: "notas", type: "TEXT · NULL" },
      { name: "estado", type: "ENUM(pendiente, preparando, listo, entregado)" },
    ],
  },
  pagos: {
    color: "#EF4444",
    icon: "💳",
    group: "Pagos",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "pedido_id", type: "FK → pedidos", fk: true },
      { name: "monto", type: "DECIMAL(10,2)" },
      { name: "metodo", type: "ENUM(online, efectivo)" },
      { name: "estado", type: "ENUM(pendiente, completado, fallido)" },
      { name: "id_transaccion", type: "VARCHAR(100) · NULL" },
      { name: "creado_en", type: "TIMESTAMP" },
    ],
  },
  empleados: {
    color: "#06B6D4",
    icon: "👤",
    group: "Personal",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "sucursal_id", type: "FK → sucursales", fk: true },
      { name: "rol_id", type: "FK → roles", fk: true },
      { name: "nombre", type: "VARCHAR(100)" },
      { name: "email", type: "VARCHAR(100) · UNIQUE" },
      { name: "password_hash", type: "TEXT" },
      { name: "activo", type: "BOOLEAN" },
      { name: "creado_en", type: "TIMESTAMP" },
    ],
  },
  roles: {
    color: "#06B6D4",
    icon: "🎭",
    group: "Personal",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "nombre", type: "ENUM(admin, garzon, cocina, bartender)" },
      { name: "descripcion", type: "TEXT" },
    ],
  },
  notificaciones: {
    color: "#F97316",
    icon: "🔔",
    group: "Notificaciones",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "sucursal_id", type: "FK → sucursales", fk: true },
      { name: "mesa_id", type: "FK → mesas", fk: true },
      { name: "tipo", type: "ENUM(ayuda, pedido_listo, pago_pendiente)" },
      { name: "mensaje", type: "TEXT" },
      { name: "leida", type: "BOOLEAN" },
      { name: "creada_en", type: "TIMESTAMP" },
    ],
  },
  analytics_pedidos: {
    color: "#EC4899",
    icon: "📊",
    group: "IA / Analytics",
    fields: [
      { name: "id", type: "PK · UUID", pk: true },
      { name: "comercio_id", type: "FK → comercios", fk: true },
      { name: "item_id", type: "FK → items_menu", fk: true },
      { name: "fecha", type: "DATE" },
      { name: "hora", type: "INTEGER (0-23)" },
      { name: "cantidad_vendida", type: "INTEGER" },
      { name: "ingresos", type: "DECIMAL(10,2)" },
      { name: "dia_semana", type: "INTEGER (0-6)" },
    ],
  },
};

const groups = {
  "Multi-Tenant": "#F59E0B",
  "Operación": "#10B981",
  "Menú": "#8B5CF6",
  "Pedidos": "#3B82F6",
  "Pagos": "#EF4444",
  "Personal": "#06B6D4",
  "Notificaciones": "#F97316",
  "IA / Analytics": "#EC4899",
};

export default function DatabaseSchema() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Todos");

  const filteredTables = Object.entries(schema).filter(
    ([, table]) => filter === "Todos" || table.group === filter
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      color: "#E2E8F0",
      padding: "2rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .table-card {
          background: #111118;
          border: 1px solid #1E1E2E;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .table-card:hover {
          border-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .table-card.active {
          box-shadow: 0 0 0 2px var(--accent);
          border-color: var(--accent);
        }
        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 1rem;
          border-bottom: 1px solid #1A1A2E;
          font-size: 0.75rem;
          transition: background 0.15s;
        }
        .field-row:hover { background: #1A1A2A; }
        .field-row:last-child { border-bottom: none; }
        .filter-btn {
          padding: 0.4rem 1rem;
          border-radius: 999px;
          border: 1px solid #2A2A3E;
          background: transparent;
          color: #888;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.72rem;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-btn:hover { border-color: #555; color: #ccc; }
        .filter-btn.active { color: #0A0A0F; border-color: transparent; }
        .badge {
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Mesa Auto-Responsable · Tesis ICI
          </p>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Modelo de Base de Datos
          </h1>
          <p style={{ color: "#4A5568", fontSize: "0.85rem", marginTop: "0.75rem" }}>
            {Object.keys(schema).length} tablas · PostgreSQL · Arquitectura Multi-Tenant
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {Object.entries(groups).map(([group, color]) => (
            <div key={group} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "#111118", border: "1px solid #1E1E2E",
              borderRadius: "8px", padding: "0.5rem 0.85rem",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "0.72rem", color: "#888" }}>{group}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {["Todos", ...Object.keys(groups)].map((g) => (
            <button
              key={g}
              className={`filter-btn ${filter === g ? "active" : ""}`}
              style={filter === g ? { background: groups[g] || "#E2E8F0" } : {}}
              onClick={() => setFilter(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}>
          {filteredTables.map(([tableName, table]) => (
            <div
              key={tableName}
              className={`table-card ${selected === tableName ? "active" : ""}`}
              style={{ "--accent": table.color }}
              onClick={() => setSelected(selected === tableName ? null : tableName)}
            >
              {/* Table Header */}
              <div style={{
                padding: "0.85rem 1rem",
                background: `${table.color}12`,
                borderBottom: `2px solid ${table.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{table.icon}</span>
                  <div>
                    <div style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: table.color,
                      letterSpacing: "0.05em",
                    }}>
                      {tableName}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#555", marginTop: "1px" }}>
                      {table.group}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.65rem",
                  color: "#555",
                  background: "#1A1A2E",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                }}>
                  {table.fields.length} campos
                </span>
              </div>

              {/* Fields */}
              <div>
                {table.fields.map((field, i) => (
                  <div key={i} className="field-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {field.pk && (
                        <span className="badge" style={{ background: "#F59E0B22", color: "#F59E0B" }}>PK</span>
                      )}
                      {field.fk && (
                        <span className="badge" style={{ background: "#3B82F622", color: "#3B82F6" }}>FK</span>
                      )}
                      {!field.pk && !field.fk && (
                        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#333", display: "inline-block", marginLeft: "2px" }} />
                      )}
                      <span style={{ color: field.pk ? "#F8FAFC" : field.fk ? "#93C5FD" : "#94A3B8" }}>
                        {field.name}
                      </span>
                    </div>
                    <span style={{ color: "#3A3A5C", fontSize: "0.68rem", textAlign: "right", maxWidth: "55%" }}>
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Relationships Summary */}
        <div style={{
          marginTop: "2.5rem",
          background: "#111118",
          border: "1px solid #1E1E2E",
          borderRadius: "12px",
          padding: "1.5rem",
        }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#E2E8F0",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            🔗 Relaciones Principales
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {[
              { from: "comercios", to: "sucursales", rel: "1 → N", desc: "Un comercio tiene varias sucursales" },
              { from: "sucursales", to: "mesas", rel: "1 → N", desc: "Una sucursal tiene varias mesas" },
              { from: "mesas", to: "sesiones_mesa", rel: "1 → N", desc: "Una mesa tiene múltiples sesiones en el tiempo" },
              { from: "sesiones_mesa", to: "pedidos", rel: "1 → N", desc: "En una sesión pueden haber múltiples pedidos (por persona)" },
              { from: "pedidos", to: "items_pedido", rel: "1 → N", desc: "Un pedido contiene múltiples items" },
              { from: "items_pedido", to: "items_menu", rel: "N → 1", desc: "Cada item del pedido referencia el menú" },
              { from: "pedidos", to: "pagos", rel: "1 → 1", desc: "Cada pedido tiene su registro de pago" },
              { from: "mesas", to: "dispositivos_fisicos", rel: "1 → 1", desc: "Cada mesa tiene su botón IoT" },
              { from: "comercios", to: "analytics_pedidos", rel: "1 → N", desc: "Datos históricos para el módulo IA" },
            ].map((rel, i) => (
              <div key={i} style={{
                background: "#0D0D15",
                border: "1px solid #1A1A2E",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <code style={{ color: "#F59E0B", fontSize: "0.72rem" }}>{rel.from}</code>
                  <span style={{ color: "#10B981", fontSize: "0.72rem", fontWeight: 600 }}>{rel.rel}</span>
                  <code style={{ color: "#F59E0B", fontSize: "0.72rem" }}>{rel.to}</code>
                </div>
                <p style={{ color: "#4A5568", fontSize: "0.7rem", margin: 0 }}>{rel.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#2A2A3E", fontSize: "0.7rem", marginTop: "2rem" }}>
          Mesa Auto-Responsable · Modelo v1.0 · PostgreSQL
        </p>
      </div>
    </div>
  );
}
