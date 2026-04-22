import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QRLanding from "./pages/QRLanding/QRLanding";
import Menu      from "./pages/Menu/Menu";

// Las siguientes páginas se irán agregando
// import Resumen from "./pages/ResumenPedido/ResumenPedido";
// import Pago    from "./pages/Pago/Pago";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla 1: Landing QR */}
        <Route path="/"             element={<QRLanding />} />

        {/* Pantalla 2: Menú */}
        <Route path="/menu/:mesaId" element={<Menu />} />

        {/* Pantalla 3: Resumen pedido (próximamente) */}
        {/* <Route path="/resumen" element={<Resumen />} /> */}

        {/* Pantalla 4: Pago (próximamente) */}
        {/* <Route path="/pago" element={<Pago />} /> */}

        {/* Ruta fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
