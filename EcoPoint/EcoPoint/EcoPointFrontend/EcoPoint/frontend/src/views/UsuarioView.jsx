import { useEffect, useState } from "react";
import "./UsuarioView.css";

function UsuarioView({ usuario, logout }) {
  const [premios, setPremios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [puntos, setPuntos] = useState(usuario.puntos);

  // Cargar premios disponibles
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
  <div className="usuario-container fade-in">
    <header className="dashboard-header">
      <div>
        <h2> 👤 Panel de Usuario</h2>
        <p className="subtitle">
          Bienvenido, <strong>{usuario.nombre}</strong>
        </p>
      </div>

      <button className="logout-btn" onClick={logout}>
        Cerrar sesión
      </button>
    </header>

    <section className="stats">
      <div className="stat-card">
        <span className="stat-label"> ⭐ Puntos</span>
        <span className="stat-value">{puntos}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label"> ♻️ Reciclajes</span>
        <span className="stat-value">{usuario.historial.length}</span>
      </div>
    </section>

    <section className="section card">
      <h3> 📜 Historial de reciclaje</h3>

      {usuario.historial.length === 0 ? (
        <p className="empty">No hay registros</p>
      ) : (
        <ul className="lista slide-up">
          {usuario.historial.map((h, index) => (
            <li key={index} className="list-item">
              <span>{h.material}</span>
              <span>{h.peso} kg</span>
              <span className="pts">{h.puntos} pts</span>
            </li>
          ))}
        </ul>
      )}
    </section>

    <section className="section card">
      <h3> 🎁 Premios disponibles</h3>

      {premios.length === 0 ? (
        <p className="empty">No hay premios</p>
      ) : (
        <ul className="lista slide-up">
          {premios.map(p => (
            <li key={p._id} className="list-item">
              <span>{p.nombre}</span>
                {p.imagen && (
                  <img
                    src={`http://localhost:5000${p.imagen}`}
                    alt={p.nombre}
                    className="premio-img"
                  />
              )}
              <span className="pts">{p.puntosRequeridos} pts</span>
              <button
                className="btn-canjar"
                disabled={puntos < p.puntosRequeridos}
                onClick={() =>
                  canjearPremio(p._id, p.puntosRequeridos)
                }
              >
                {puntos < p.puntosRequeridos ? "Puntos insuficientes" : "Canjear"}
              </button>
            </li>
          ))}
          
        </ul>
      )}
    </section>

    {mensaje && <p className="message">{mensaje}</p>}
  </div>
);


}

export default UsuarioView;
