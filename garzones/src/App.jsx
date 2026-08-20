import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

function App() {
  const [garzon, setGarzon]     = useState(null);
  const [conectado, setConectado] = useState(false);
  const [socket, setSocket]     = useState(null);

  // Restaura sesión desde localStorage
  useEffect(() => {
    const garzonGuardado = localStorage.getItem("garzon");
    if (garzonGuardado) {
      setGarzon(JSON.parse(garzonGuardado));
    }
  }, []);

  // Conexión Socket.io
  
  useEffect(() => {
    if (!garzon) return;

    const newSocket = io(SOCKET_URL);

    newSocket.on("connect", () => {
      console.log("Garzon conectado a tiempo real");
      setConectado(true);
    });

    newSocket.on("disconnect", () => {
      setConectado(false);
    });

    // Escucha cuando un pedido está listo
    newSocket.on("pedido_actualizado", (data) => {
      console.log("Pedido actualizado:", data);
      // Aquí se dispara cuando cocina cambia estado
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [garzon]);

  const handleLogin = (garzonData) => {
    setGarzon(garzonData);
    localStorage.setItem("garzon", JSON.stringify(garzonData));
  };

  const handleLogout = () => {
    setGarzon(null);
    localStorage.removeItem("garzon");
  };

  return garzon ? (
    <Dashboard garzon={garzon} socket={socket} conectado={conectado} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;
