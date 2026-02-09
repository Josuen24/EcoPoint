import { useEffect, useState } from "react";
import "./AdminView.css";

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
  const [imagen, setImagen] = useState(null);


  // Roles
  const [cedulaRol, setCedulaRol] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("usuario");

  // Auditoría (SOLO ADMIN)
  const [estadisticas, setEstadisticas] = useState(null);
  const [actividadUsuarios, setActividadUsuarios] = useState([]);
  const [auditoriaReciclaje, setAuditoriaReciclaje] = useState([]);
  const [auditoriaPremios, setAuditoriaPremios] = useState([]);

  const [mensaje, setMensaje] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    // Cargar materiales y premios existentes
    fetch("http://localhost:5050/api/materiales")
      .then(res => res.json())
      .then(data => setMateriales(data));

    fetch("http://localhost:5050/api/premios")
      .then(res => res.json())
      .then(data => setPremios(data));

    // Cargar datos de auditoría (solo si es admin)
    if (usuario.rol === 'admin') {
      cargarDatosAuditoria();
    }
  }, []);

  // AUDITORÍA (SOLO ADMIN)

  const cargarDatosAuditoria = () => {
    // Configurar headers para autenticación
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': JSON.stringify(usuario)
    };

    // Cargar estadísticas generales
    fetch("http://localhost:5050/api/auditoria/estadisticas", { headers })
      .then(res => {
        if (res.status === 403) {
          throw new Error('Acceso denegado');
        }
        return res.json();
      })
      .then(data => setEstadisticas(data))
      .catch(() => console.log('No se pudieron cargar estadísticas'));

    // Cargar actividad de usuarios
    fetch("http://localhost:5050/api/auditoria/actividad-usuarios", { headers })
      .then(res => res.json())
      .then(data => setActividadUsuarios(data))
      .catch(() => console.log('No se pudo cargar actividad'));

    // Cargar auditoría de reciclaje
    fetch("http://localhost:5050/api/auditoria/reciclaje", { headers })
      .then(res => res.json())
      .then(data => setAuditoriaReciclaje(data))
      .catch(() => console.log('No se pudo cargar auditoría de reciclaje'));

    // Cargar auditoría de premios
    fetch("http://localhost:5050/api/auditoria/premios", { headers })
      .then(res => res.json())
      .then(data => setAuditoriaPremios(data))
      .catch(() => console.log('No se pudo cargar auditoría de premios'));
  };

  // MATERIALES 

  const crearMaterial = () => {
    if (!nombreMaterial || !puntosPorKg) {
      setMensaje("Completa los datos del material");
      return;
    }

    fetch("http://localhost:5050/api/materiales/crear", {
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

    fetch(`http://localhost:5050/api/materiales/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        setMateriales(materiales.filter(m => m._id !== id));
        setMensaje(data.message);
      });
  };

  // PREMIOS 

  const crearPremio = () => {
  const formData = new FormData();

  formData.append("nombre", nombrePremio);
  formData.append("descripcion", descripcion);
  formData.append("puntosRequeridos", puntosRequeridos);
  formData.append("stock", stock);

  if (imagen) {
    formData.append("imagen", imagen);
  }

  fetch("http://localhost:5050/api/premios/crear", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      setMensaje(data.message || "Premio creado correctamente");
    })
    .catch(() => {
      setMensaje("Error al crear premio");
    });
};


  const eliminarPremio = (id) => {
    if (!window.confirm("¿Eliminar este premio?")) return;

    fetch(`http://localhost:5050/api/premios/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setPremios(premios.filter(p => p._id !== id));
        setMensaje("Premio eliminado");
      });
  };

  //  ROLES 

  const cambiarRol = () => {
    if (!cedulaRol) {
      setMensaje("Ingresa la cédula del usuario");
      return;
    }

    fetch("http://localhost:5050/api/usuarios/cambiar-rol", {
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
        // Recargar datos de auditoría para ver el cambio
        if (usuario.rol === 'admin') {
          cargarDatosAuditoria();
        }
      })
      .catch(error => {
        setMensaje("Error al cambiar rol");
        console.error("Error:", error);
      });
  };

  

  return (
    <div className="admin-wrapper">
      <div className="usuario-container fade-in">

        <header className="dashboard-header">
          <div>
            <h2>🛠️ Panel Administrador</h2>
            <p className="subtitle">
              Administrador: <strong>{usuario.nombre}</strong>
            </p>
          </div>

          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </header>

          <div className="admin-containers-grid">
          <section className="section card">
            <h3>👥 Asignar rol a usuario</h3>

            <div className="form-row">
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

              <button className="btn-canjar" onClick={cambiarRol}>
                Actualizar rol
              </button>
            </div>
          </section>

          <section className="section card">
            <h3>♻️ Materiales reciclables</h3>

            <div className="form-row">
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

              <button className="btn-canjar" onClick={crearMaterial}>
                Crear material
              </button>
            </div>

            <ul className="lista slide-up">
              {materiales.map(mat => (
                <li key={mat._id} className="list-item">
                  <span>{mat.nombre}</span>
                  <span className="pts">{mat.puntosPorKg} pts/kg</span>
                  <button
                    className="btn-delete"
                    onClick={() => eliminarMaterial(mat._id)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="section card">
            <h3>🎁 Registrar premio</h3>

    <div className="form-grid">
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

   
      <input
        type="file"
        accept="image/*"
        onChange={e => setImagen(e.target.files[0])}
      />

      <button className="btn-canjar" onClick={crearPremio}>
        Crear premio
      </button>
    </div>


          {mensaje && <p className="message">{mensaje}</p>}

          <h3>📦 Premios registrados</h3>

          <ul className="lista slide-up">
            {premios.map(p => (
              <li key={p._id} className="list-item">
                <span>{p.nombre}</span>
                <span className="pts">{p.puntosRequeridos} pts</span>
                <span>stock: {p.stock}</span>
                {p.imagen && (
                <img
                  src={`http://localhost:5050${p.imagen}`}
                  alt={p.nombre}
                  className="premio-img"
                />
              )}

                <button
                  className="btn-delete"
                  onClick={() => eliminarPremio(p._id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>
        </div>

        {/* SECCIÓN DE AUDITORÍA - SOLO ADMIN */}
        {usuario.rol === 'admin' && (
          <section className="section card auditoria-main-section">
            <h3>🔍 Auditoría del Sistema</h3>
            
            <div className="auditoria-grid-container">
              {/* Estadísticas Generales */}
              <div className="auditoria-subsection">
                <h4>📊 Estadísticas Generales</h4>
                {estadisticas ? (
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-label">Total Operaciones</span>
                      <span className="stat-value">{estadisticas.total_operaciones || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Operaciones/Día</span>
                      <span className="stat-value">{estadisticas.operaciones_por_dia || 0}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Usuario Más Activo</span>
                      <span className="stat-value">{estadisticas.usuario_mas_activo || 'N/A'}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Tabla Más Afectada</span>
                      <span className="stat-value">{estadisticas.tabla_mas_afectada || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="empty">Cargando estadísticas...</p>
                )}
              </div>

              {/* Actividad de Usuarios */}
              <div className="auditoria-subsection">
                <h4>👥 Actividad de Usuarios</h4>
                {actividadUsuarios.length > 0 ? (
                  <div className="table-container">
                    <table className="auditoria-table actividad-usuarios-table">
                      <thead>
                        <tr>
                          <th className="text-left">Usuario</th>
                          <th className="text-center">Total Ops</th>
                          <th className="text-center">Inserciones</th>
                          <th className="text-center">Actualizaciones</th>
                          <th className="text-center">Última Actividad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actividadUsuarios.slice(0, 5).map((user, index) => (
                          <tr key={index} className="table-row-hover">
                            <td className="text-left">
                              <span className="usuario-nombre">{user.nombre_usuario || user.id_usuario}</span>
                            </td>
                            <td className="text-center">
                              <span className="badge badge-primary">{user.total_operaciones}</span>
                            </td>
                            <td className="text-center">
                              <span className="badge badge-success">{user.inserciones}</span>
                            </td>
                            <td className="text-center">
                              <span className="badge badge-info">{user.actualizaciones}</span>
                            </td>
                            <td className="text-center">
                              <span className="fecha-ultima">{new Date(user.ultima_actividad).toLocaleDateString()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">No hay actividad registrada</p>
                )}
              </div>

              {/* Auditoría de Reciclaje */}
              <div className="auditoria-subsection">
                <h4>♻️ Auditoría de Reciclaje</h4>
                {auditoriaReciclaje.length > 0 ? (
                  <div className="table-container">
                    <table className="auditoria-table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Material</th>
                          <th>Peso</th>
                          <th>Puntos</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditoriaReciclaje.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre_usuario}</td>
                            <td>{item.material}</td>
                            <td>{item.peso}kg</td>
                            <td>{item.puntos}</td>
                            <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">No hay reciclaje registrado</p>
                )}
              </div>

              {/* Auditoría de Premios */}
              <div className="auditoria-subsection">
                <h4>🎁 Auditoría de Premios</h4>
                {auditoriaPremios.length > 0 ? (
                  <div className="table-container">
                    <table className="auditoria-table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Premio</th>
                          <th>Puntos</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditoriaPremios.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre_usuario}</td>
                            <td>{item.premio}</td>
                            <td>{item.puntos_requeridos}</td>
                            <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty">No hay premios registrados</p>
                )}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );

}

export default AdminView;
