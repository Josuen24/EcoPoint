import { useEffect, useState } from "react";

function RecolectorView({ usuario, logout }) {
  const [cedula, setCedula] = useState("");
  const [materiales, setMateriales] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [peso, setPeso] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar materiales
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
    <div>
      <h2>Panel Recolector</h2>
      <p>Recolector: {usuario.nombre}</p>

      <input
        type="text"
        placeholder="Cédula del usuario"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <br /><br />

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

      <br /><br />

      <input
        type="number"
        placeholder="Peso (kg)"
        value={peso}
        onChange={e => setPeso(e.target.value)}
      />

      <br /><br />

      <button onClick={registrarReciclaje}>Registrar reciclaje</button>

      {mensaje && <p>{mensaje}</p>}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default RecolectorView;
