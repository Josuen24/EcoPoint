import { useEffect, useState } from "react";
import "./UsuarioView.css";

function UsuarioView({ usuario, logout }) {
  const [premios, setPremios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [puntos, setPuntos] = useState(usuario.puntos);

  // Cargar premios
  useEffect(() => {
    fetch("http://localhost:5000/api/premios")
      .then(res => res.json())
      .then(data => setPremios(data));
  }, []);

  const canjearPremio = (premioId, puntosRequeridos) => {
    if (puntos < puntosRequeridos) {
      setMensaje("No tienes puntos suficientes");
      return;
    }

    fetch("http://localhost:5000/api/premios/canjear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cedula: usuario.cedula,
        premioId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message && data.puntosRestantes === undefined) {
          setMensaje(data.message);
        } else {
          setPuntos(data.puntosRestantes);
          setMensaje("Premio canjeado correctamente");
        }
      })
      .catch(() => {
        setMensaje("Error al conectar con el servidor");
      });
  };

  return (
    <div>
      <h2>Panel Usuario</h2>

      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Puntos:</strong> {puntos}</p>

      <hr />

      <h3>Historial de reciclaje</h3>

      {usuario.historial.length === 0 ? (
        <p>No hay registros</p>
      ) : (
        <ul>
          {usuario.historial.map((h, index) => (
            <li key={index}>
              {h.material} – {h.peso} kg – {h.puntos} pts
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Premios disponibles</h3>

      {premios.length === 0 ? (
        <p>No hay premios</p>
      ) : (
        <ul>
          {premios.map(p => (
            <li key={p._id}>
              {p.nombre} – {p.puntosRequeridos} pts
              {" "}
              <button
                onClick={() => canjearPremio(p._id, p.puntosRequeridos)}
              >
                Canjear
              </button>
            </li>
          ))}
        </ul>
      )}

      {mensaje && <p>{mensaje}</p>}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default UsuarioView;
