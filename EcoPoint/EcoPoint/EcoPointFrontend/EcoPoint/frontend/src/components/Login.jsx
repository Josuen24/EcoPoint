import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onRegister }) {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const manejarLogin = () => {
    if (!cedula || !password) {
      setError("Ingresa cédula y contraseña");
      return;
    }

    fetch("http://localhost:5050/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cedula, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setError(data.message);
        } else {
          localStorage.setItem("usuario", JSON.stringify(data));
          onLogin(data);
        }
      })
      .catch(() => {
        setError("Error al conectar con el servidor");
      });
  };

  return (
  <div className="auth-bg">
    <div className="card login-card animate-card">
      <h2 className="title">Login EcoPoint</h2>

      <label>Cédula</label>
      <input
        type="text"
        placeholder="Ingresa tu cédula"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <label>Contraseña</label>
      <input
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={manejarLogin} className="btn-main">
        Ingresar
      </button>

      <button onClick={onRegister} className="btn-secondary">
        Crear cuenta
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  </div>
);

}

export default Login;

