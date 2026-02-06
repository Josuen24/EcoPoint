import { useEffect, useState } from "react";

function AdminView({ usuario, logout }) {
  // Materiales
  const [nombreMaterial, setNombreMaterial] = useState("");
  const [puntosPorKg, setPuntosPorKg] = useState("");
  const [materiales, setMateriales] = useState([]);

  // Premios
  const [nombrePremio, setNombrePremio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [puntosRequeridos, setPuntosRequeridos] = useState("");
  const [stock, setStock] = useState("");
  const [premios, setPremios] = useState([]);

  // Roles
  const [cedulaRol, setCedulaRol] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("usuario");

  const [mensaje, setMensaje] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    fetch("http://localhost:5000/api/materiales")
      .then(res => res.json())
      .then(data => setMateriales(data));

    fetch("http://localhost:5000/api/premios")
      .then(res => res.json())
      .then(data => setPremios(data));
  }, []);

  // MATERIALES 

  const crearMaterial = () => {
    if (!nombreMaterial || !puntosPorKg) {
      setMensaje("Completa los datos del material");
      return;
    }

    fetch("http://localhost:5000/api/materiales/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreMaterial,
        puntosPorKg: Number(puntosPorKg)
      })
    })
      .then(res => res.json())
      .then(data => {
        setMateriales([...materiales, data.material]);
        setNombreMaterial("");
        setPuntosPorKg("");
        setMensaje("Material creado correctamente");
      });
  };

  const eliminarMaterial = (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este material?")) return;

    fetch(`http://localhost:5000/api/materiales/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        setMateriales(materiales.filter(m => m._id !== id));
        setMensaje(data.message);
      });
  };

  //PREMIOS

  const crearPremio = () => {
    if (!nombrePremio || !puntosRequeridos) {
      setMensaje("Completa los datos del premio");
      return;
    }

    fetch("http://localhost:5000/api/premios/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombrePremio,
        descripcion,
        puntosRequeridos: Number(puntosRequeridos),
        stock: Number(stock)
      })
    })
      .then(res => res.json())
      .then(data => {
        setPremios([...premios, data.premio]);
        setNombrePremio("");
        setDescripcion("");
        setPuntosRequeridos("");
        setStock("");
        setMensaje("Premio creado correctamente");
      })
      .catch(() => {
        setMensaje("Error al crear premio");
      });
  };

  const eliminarPremio = (id) => {
    if (!window.confirm("¿Eliminar este premio?")) return;

    fetch(`http://localhost:5000/api/premios/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setPremios(premios.filter(p => p._id !== id));
        setMensaje("Premio eliminado");
      });
  };

  // ---------------- ROLES ----------------

  const cambiarRol = () => {
    if (!cedulaRol) {
      setMensaje("Ingresa la cédula del usuario");
      return;
    }

    fetch("http://localhost:5000/api/usuarios/cambiar-rol", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cedula: cedulaRol,
        rol: rolSeleccionado
      })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message || "Rol actualizado");
        setCedulaRol("");
      });
  };



  return (
    <div>
      <h2>Panel Administrador</h2>
      <p>Administrador: {usuario.nombre}</p>
      <button onClick={logout}>Cerrar sesión</button>

      <hr />

      <h3>Asignar rol a usuario</h3>
      <input
        type="text"
        placeholder="Cédula del usuario"
        value={cedulaRol}
        onChange={e => setCedulaRol(e.target.value)}
      />
      <select
        value={rolSeleccionado}
        onChange={e => setRolSeleccionado(e.target.value)}
      >
        <option value="usuario">Usuario</option>
        <option value="recolector">Recolector</option>
        <option value="admin">Administrador</option>
      </select>
      <button onClick={cambiarRol}>Actualizar rol</button>

      <hr />

      <h3>Materiales reciclables</h3>
      <input
        type="text"
        placeholder="Nombre del material"
        value={nombreMaterial}
        onChange={e => setNombreMaterial(e.target.value)}
      />
      <input
        type="number"
        placeholder="Puntos por kg"
        value={puntosPorKg}
        onChange={e => setPuntosPorKg(e.target.value)}
      />
      <button onClick={crearMaterial}>Crear material</button>

      <ul>
        {materiales.map(mat => (
          <li key={mat._id}>
            {mat.nombre} – {mat.puntosPorKg} pts/kg
            <button onClick={() => eliminarMaterial(mat._id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Registrar premio</h3>
      <input
        type="text"
        placeholder="Nombre del premio"
        value={nombrePremio}
        onChange={e => setNombrePremio(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
      />
      <input
        type="number"
        placeholder="Puntos requeridos"
        value={puntosRequeridos}
        onChange={e => setPuntosRequeridos(e.target.value)}
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={e => setStock(e.target.value)}
      />
      <button onClick={crearPremio}>Crear premio</button>

      {mensaje && <p>{mensaje}</p>}

      <h3>Premios registrados</h3>
      <ul>
        {premios.map(p => (
          <li key={p._id}>
            {p.nombre} – {p.puntosRequeridos} pts – stock: {p.stock}
            <button onClick={() => eliminarPremio(p._id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminView;
