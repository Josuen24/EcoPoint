import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import UsuarioView from "./views/UsuarioView";
import RecolectorView from "./views/RecolectorView";
import AdminView from "./views/AdminView";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const [vista, setVista] = useState("login");
  
  const logout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setVista("login");
  };

  if (!usuario) {
    if (vista === "register") {
      return <Register onBack={() => setVista("login")} />;
    }

    return (
      <Login
        onLogin={(data) => {
          localStorage.setItem("usuario", JSON.stringify(data));
          setUsuario(data);
        }}
        onRegister={() => setVista("register")}
      />
    );
  }

  if (usuario.rol === "usuario") {
  return <UsuarioView usuario={usuario} logout={logout} />;
}

if (usuario.rol === "recolector") {
  return <RecolectorView usuario={usuario} logout={logout} />;
}

if (usuario.rol === "admin") {
  return <AdminView usuario={usuario} logout={logout} />;
}


  return <p>Rol no reconocido</p>;
}

export default App;
