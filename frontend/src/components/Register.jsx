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
    <div>
      <h2>Registro de Usuario</h2>

      <input
        type="text"
        placeholder="Cédula *"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Nombre *"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña *"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={registrarUsuario}>Registrarse</button>
      <button onClick={onBack} style={{ marginLeft: "10px" }}>
        Volver al login
      </button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Register;
