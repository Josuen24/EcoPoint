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

    fetch("http://localhost:5000/api/usuarios/login", {
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
    <div>
      <h2>Login EcoPoint</h2>

      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={manejarLogin}>Ingresar</button>

      <br /><br />

      <button onClick={onRegister}>Crear cuenta</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
