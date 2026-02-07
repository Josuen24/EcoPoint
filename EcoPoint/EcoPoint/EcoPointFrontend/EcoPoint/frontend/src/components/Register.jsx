import { useState } from "react";
import "./Register.css";

function Register({ onBack }) {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const registrarUsuario = () => {
    if (!cedula || !nombre || !password) {
      setMensaje("Completa los campos obligatorios");
      return;
    }

    fetch("http://localhost:5000/api/usuarios/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cedula,
        nombre,
        email,
        password
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setMensaje(data.message);
        } else {
          setMensaje("Usuario registrado correctamente");
          setCedula("");
          setNombre("");
          setEmail("");
          setPassword("");
        }
      })
      .catch(() => {
        setMensaje("Error al conectar con el servidor");
      });
  };

  return (
  <div className="auth-bg">
    <div className="card register-card animate-card">
      <h2 className="title">Registro de Usuario</h2>

      <label>Cédula *</label>
      <input
        type="text"
        placeholder="Ingresa tu cédula"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <label>Nombre *</label>
      <input
        type="text"
        placeholder="Ingresa tu nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <label>Email</label>
      <input
        type="email"
        placeholder="Ingresa tu email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label>Contraseña *</label>
      <input
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={registrarUsuario} className="btn-main">
        Registrarse
      </button>

      <button onClick={onBack} className="btn-secondary">
        Volver al login
      </button>

      {mensaje && <p className="message">{mensaje}</p>}
    </div>
  </div>
);

}

export default Register;
