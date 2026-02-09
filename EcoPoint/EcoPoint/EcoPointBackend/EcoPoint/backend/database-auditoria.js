// EcoPoint - Conexión a Base de Datos de Auditoría
// PostgreSQL - Archivo independiente

const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: 'ecopoint_app',
  host: 'localhost',
  database: 'ecopoint_auditoria',
  password: 'ecopoint123_2024',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
pool.on('connect', () => {
  console.log('🐘 Conectado a PostgreSQL - Auditoría');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión PostgreSQL:', err);
});

// FUNCIONES DE AUDITORÍA

/**
 * Registrar acción de auditoría
 * @param {Object} datos - Datos de auditoría
 * @param {string} datos.id_usuario - ID del usuario
 * @param {string} datos.nombre_usuario - Nombre del usuario
 * @param {string} datos.operacion - Tipo de operación (INSERT, UPDATE, DELETE)
 * @param {string} datos.tabla_afectada - Tabla afectada
 * @param {string} datos.registro_id - ID del registro afectado
 * @param {string} datos.descripcion - Descripción de la acción
 * @param {Object} datos.datos_anteriores - Datos anteriores (JSON)
 * @param {Object} datos.datos_nuevos - Datos nuevos (JSON)
 */
async function registrarAuditoria(datos) {
  try {
    const query = `
      INSERT INTO auditoria (
        id_usuario, 
        nombre_usuario, 
        operacion, 
        tabla_afectada, 
        registro_id, 
        descripcion,
        datos_anteriores,
        datos_nuevos,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      datos.id_usuario || 'sistema',
      datos.nombre_usuario || 'Sistema',
      datos.operacion,
      datos.tabla_afectada,
      datos.registro_id || null,
      datos.descripcion || '',
      datos.datos_anteriores ? JSON.stringify(datos.datos_anteriores) : null,
      datos.datos_nuevos ? JSON.stringify(datos.datos_nuevos) : null,
      datos.ip_address || null
    ];
    
    console.log('🔍 Ejecutando query:', query); // Debug
    console.log('🔍 Valores:', values); // Debug
    
    await pool.query(query, values);
    console.log(`✅ Auditoría registrada: ${datos.operacion} en ${datos.tabla_afectada}`);
    
  } catch (error) {
    console.error('❌ Error al registrar auditoría:', error);
  }
}

/**
 * Obtener estadísticas de auditoría
 * @param {Date} fecha_inicio - Fecha inicial
 * @param {Date} fecha_fin - Fecha final
 */
async function obtenerEstadisticas(fecha_inicio = null, fecha_fin = null) {
  try {
    const query = 'SELECT * FROM sp_estadisticas_auditoria($1, $2)';
    const values = [fecha_inicio, fecha_fin];
    
    const result = await pool.query(query, values);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return null;
  }
}

/**
 * Obtener actividad de usuarios
 * @param {string} id_usuario - ID del usuario (opcional)
 */
async function obtenerActividadUsuarios(id_usuario = null) {
  try {
    let query = 'SELECT * FROM vw_actividad_usuarios';
    let values = [];
    
    if (id_usuario) {
      query += ' WHERE id_usuario = $1';
      values.push(id_usuario);
    }
    
    query += ' ORDER BY total_operaciones DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
    
  } catch (error) {
    console.error('❌ Error al obtener actividad usuarios:', error);
    return [];
  }
}

/**
 * Obtener auditoría de reciclaje
 * @param {string} id_usuario - ID del usuario (opcional)
 * @param {Date} fecha_inicio - Fecha inicial (opcional)
 * @param {Date} fecha_fin - Fecha final (opcional)
 */
async function obtenerAuditoriaReciclaje(id_usuario = null, fecha_inicio = null, fecha_fin = null) {
  try {
    let query = 'SELECT * FROM vw_auditoria_reciclaje WHERE 1=1';
    let values = [];
    let paramIndex = 1;
    
    if (id_usuario) {
      query += ` AND id_usuario = $${paramIndex++}`;
      values.push(id_usuario);
    }
    
    if (fecha_inicio) {
      query += ` AND fecha >= $${paramIndex++}`;
      values.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ` AND fecha <= $${paramIndex++}`;
      values.push(fecha_fin);
    }
    
    query += ' ORDER BY fecha DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
    
  } catch (error) {
    console.error('❌ Error al obtener auditoría reciclaje:', error);
    return [];
  }
}

/**
 * Obtener auditoría de premios
 * @param {string} id_usuario - ID del usuario (opcional)
 */
async function obtenerAuditoriaPremios(id_usuario = null) {
  try {
    let query = 'SELECT * FROM vw_auditoria_premios';
    let values = [];
    
    if (id_usuario) {
      query += ' WHERE id_usuario = $1';
      values.push(id_usuario);
    }
    
    query += ' ORDER BY fecha DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
    
  } catch (error) {
    console.error('❌ Error al obtener auditoría premios:', error);
    return [];
  }
}

// MIDDLEWARE DE AUDITORÍA PARA EXPRESS

/**
 * Middleware para registrar auditoría automáticamente
 * @param {string} operacion - Tipo de operación
 * @param {string} tabla - Tabla afectada
 */
function middlewareAuditoria(operacion, tabla) {
  return async (req, res, next) => {
    // Guardar el res original
    const originalSend = res.send;
    
    // Sobreescribir res.send para capturar la respuesta
    res.send = function(data) {
      // Solo registrar si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        registrarAuditoria({
          id_usuario: req.usuario?.cedula || 'anonimo',
          nombre_usuario: req.usuario?.nombre || 'Anónimo',
          operacion: operacion,
          tabla_afectada: tabla,
          registro_id: req.params.id || req.body.id || null,
          descripcion: `${operacion} en ${tabla} via API`,
          datos_nuevos: req.body,
          ip_address: req.ip || req.connection.remoteAddress
        });
      }
      
      // Llamar al send original
      originalSend.call(this, data);
    };
    
    next();
  };
}

// ENDPOINTS PARA REPORTES DE AUDITORÍA

function setupAuditoriaRoutes(app) {
  // Middleware para verificar rol de admin
  const verificarAdmin = (req, res, next) => {
    // Obtener usuario del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    try {
      const usuario = JSON.parse(authHeader);
      
      if (!usuario || usuario.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado - Solo administradores' });
      }
      
      // Agregar usuario al request para uso posterior
      req.usuario = usuario;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };

  // Endpoint para estadísticas generales (SOLO ADMIN)
  app.get('/api/auditoria/estadisticas', verificarAdmin, async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      const stats = await obtenerEstadisticas(
        fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin ? new Date(fecha_fin) : null
      );
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  });
  
  // Endpoint para actividad de usuarios (SOLO ADMIN)
  app.get('/api/auditoria/actividad-usuarios', verificarAdmin, async (req, res) => {
    try {
      const { id_usuario } = req.query;
      const actividad = await obtenerActividadUsuarios(id_usuario);
      res.json(actividad);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener actividad' });
    }
  });
  
  // Endpoint para auditoría de reciclaje (SOLO ADMIN)
  app.get('/api/auditoria/reciclaje', verificarAdmin, async (req, res) => {
    try {
      const { id_usuario, fecha_inicio, fecha_fin } = req.query;
      
      const auditoria = await obtenerAuditoriaReciclaje(
        id_usuario,
        fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin ? new Date(fecha_fin) : null
      );
      
      res.json(auditoria);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener auditoría de reciclaje' });
    }
  });
  
  // Endpoint para auditoría de premios (SOLO ADMIN)
  app.get('/api/auditoria/premios', verificarAdmin, async (req, res) => {
    try {
      const { id_usuario } = req.query;
      const auditoria = await obtenerAuditoriaPremios(id_usuario);
      res.json(auditoria);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener auditoría de premios' });
    }
  });
}

// EXPORTAR FUNCIONES

module.exports = {
  pool,
  registrarAuditoria,
  obtenerEstadisticas,
  obtenerActividadUsuarios,
  obtenerAuditoriaReciclaje,
  obtenerAuditoriaPremios,
  middlewareAuditoria,
  setupAuditoriaRoutes
};
