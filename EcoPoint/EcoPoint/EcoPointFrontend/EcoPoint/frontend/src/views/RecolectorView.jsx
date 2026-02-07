import { useEffect, useState } from "react";

function RecolectorView({ usuario, logout }) {
  const [cedula, setCedula] = useState("");
  const [materiales, setMateriales] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [peso, setPeso] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar materiales al iniciar
  useEffect(() => {
    fetch("http://localhost:5000/api/materiales")
      .then(res => res.json())
      .then(data => setMateriales(data));
  }, []);

  const registrarReciclaje = () => {
    if (!cedula || !materialId || !peso) {
      setMensaje("Completa todos los campos");
      return;
    }

    fetch("http://localhost:5000/api/reciclaje/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cedula,
        materialId,
        peso: Number(peso)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message && data.puntosGanados === undefined) {
          setMensaje(data.message);
        } else {
          setMensaje(
            `Reciclaje registrado. Puntos ganados: ${data.puntosGanados}`
          );
        }
      })
      .catch(() => {
        setMensaje("Error al conectar con el servidor");
      });
  };

  return (
  <div className="usuario-container fade-in">

    {/* ===== HEADER ===== */}
    <header className="dashboard-header">
      <div>
        <h2>🚛 Panel Recolector</h2>
        <p className="subtitle">
          Recolector: <strong>{usuario.nombre}</strong>
        </p>
      </div>

      <button className="logout-btn" onClick={logout}>
        Cerrar sesión
      </button>
    </header>

    {/* ===== REGISTRO DE RECICLAJE ===== */}
    <section className="section card">
      <h3>♻️ Registrar reciclaje</h3>

      <div className="form-grid">
        <input
          type="text"
          placeholder="Cédula del usuario"
          value={cedula}
          onChange={e => setCedula(e.target.value)}
        />

        <select
          value={materialId}
          onChange={e => setMaterialId(e.target.value)}
        >
          <option value="">Seleccione material</option>
          {materiales.map(mat => (
            <option key={mat._id} value={mat._id}>
              {mat.nombre} ({mat.puntosPorKg} pts/kg)
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Peso (kg)"
          value={peso}
          onChange={e => setPeso(e.target.value)}
        />

        <button className="btn-canjar" onClick={registrarReciclaje}>
          Registrar reciclaje
        </button>
      </div>

      {mensaje && <p className="message">{mensaje}</p>}
    </section>

  </div>
);

}

export default RecolectorView;
