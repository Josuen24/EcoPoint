# 🌱 EcoPoint - Sistema de Reciclaje con Puntos y Recompensas

EcoPoint es una aplicación web completa que incentiva el reciclaje mediante un sistema de puntos y recompensas. El sistema permite registrar reciclaje, asignar puntos y canjear premios según distintos roles de usuario, con un sistema de auditoría profesional.

## 🚀 Stack Tecnológico Completo

### Frontend (React + Vite)
- **React 19.2.0** - Framework principal
- **Vite 7.2.4** - Build tool y desarrollo rápido
- **JavaScript ES6+** - Lenguaje principal
- **CSS3** - Estilos personalizados
- **Componentes modulares** - Arquitectura escalable

### Backend (Node.js + Express)
- **Node.js** - Entorno de ejecución
- **Express 5.2.1** - Framework web
- **MongoDB + Mongoose 9.1.2** - Base de datos principal
- **PostgreSQL + pg 8.18.0** - Base de datos de auditoría
- **bcryptjs 3.0.3** - Encriptación de contraseñas
- **cors 2.8.5** - Comunicación entre dominios
- **dotenv 17.2.3** - Variables de entorno
- **multer 2.0.2** - Manejo de archivos (imágenes de premios)
- **nodemon 3.1.11** - Desarrollo con recarga automática

## 👥 Sistema de Roles

### 🧑‍💼 Usuario
- Visualiza sus puntos acumulados
- Consulta historial de reciclaje
- Canjea premios disponibles
- Ve su información personal

### 🚛 Recolector
- Registra reciclaje de usuarios
- Asigna puntos automáticamente
- Consulta materiales disponibles
- Gestiona operaciones de reciclaje

### 👨‍💼 Administrador
- Gestiona materiales reciclables (crear/eliminar)
- Administra premios (crear/eliminar con imágenes)
- Cambia roles de usuarios
- Accede a panel completo de auditoría
- Visualiza estadísticas del sistema

## 📊 Sistema de Auditoría

**Base de datos PostgreSQL separada** para registro completo de actividades:
- ✅ Registro de usuarios nuevos
- ✅ Inicios de sesión
- ✅ Cambios de roles
- ✅ Operaciones de reciclaje
- ✅ Canjes de premios
- ✅ Estadísticas generales del sistema

## 📁 Estructura Completa del Proyecto

```
EcoPoint/
├── EcoPointBackend/
│   ├── index.js                 # Servidor principal
│   ├── package.json             # Dependencias backend
│   ├── .env                    # Variables de entorno
│   ├── database-auditoria.js   # Sistema de auditoría PostgreSQL
│   ├── models/                  # Modelos MongoDB
│   │   ├── User.js            # Modelo de usuarios
│   │   ├── Material.js         # Modelo de materiales
│   │   └── Premio.js          # Modelo de premios
│   ├── routes/                  # Rutas API
│   │   ├── user.routes.js      # Gestión de usuarios
│   │   ├── material.routes.js  # Gestión de materiales
│   │   ├── reciclaje.routes.js # Registro de reciclaje
│   │   └── premio.routes.js   # Gestión de premios
│   └── uploads/               # Imágenes de premios
└── EcoPointFrontend/
    ├── package.json             # Dependencias frontend
    ├── index.html              # Template principal
    ├── vite.config.js          # Configuración Vite
    ├── src/
    │   ├── main.jsx           # Punto de entrada
    │   ├── App.jsx            # Componente principal
    │   ├── components/         # Componentes reutilizables
    │   │   ├── Login.jsx       # Formulario de login
    │   │   └── Register.jsx    # Formulario de registro
    │   └── views/            # Vistas principales
    │       ├── UsuarioView.jsx   # Panel usuario
    │       ├── RecolectorView.jsx # Panel recolector
    │       └── AdminView.jsx    # Panel administrador
    └── public/                # Archivos estáticos
```

## ⚙️ Configuración Requerida

### 1. Variables de Entorno (.env)
Crear archivo en `EcoPointBackend/.env`:
```env
PORT=5050
MONGO_URI=mongodb://localhost:27017/ecopoint
JWT_SECRET=ecopoint123
```

### 2. Base de Datos PostgreSQL
Crear base de datos y tablas:
```sql
-- Crear base de datos
CREATE DATABASE ecopoint_auditoria;

-- Conectarse a la base de datos
\c ecopoint_auditoria;

-- Crear tabla de auditoría
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    id_usuario VARCHAR(255),
    nombre_usuario VARCHAR(255),
    accion VARCHAR(100),
    tabla_afectada VARCHAR(100),
    datos_antiguos JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear vistas para consultas
CREATE VIEW vw_actividad_usuarios AS
SELECT 
    id_usuario,
    nombre_usuario,
    COUNT(*) as total_operaciones,
    COUNT(CASE WHEN accion = 'INSERT' THEN 1 END) as inserciones,
    COUNT(CASE WHEN accion = 'UPDATE' THEN 1 END) as actualizaciones,
    MAX(fecha) as ultima_actividad
FROM auditoria 
GROUP BY id_usuario, nombre_usuario;

CREATE VIEW vw_auditoria_reciclaje AS
SELECT 
    nombre_usuario,
    datos_nuevos->>'material' as material,
    (datos_nuevos->>'peso')::numeric as peso,
    (datos_nuevos->>'puntos')::numeric as puntos,
    fecha
FROM auditoria 
WHERE tabla_afectada = 'reciclaje' AND accion = 'INSERT';

CREATE VIEW vw_auditoria_premios AS
SELECT 
    nombre_usuario,
    datos_nuevos->>'premio' as premio,
    (datos_nuevos->>'puntos_requeridos')::numeric as puntos_requeridos,
    fecha
FROM auditoria 
WHERE tabla_afectada = 'premios' AND accion = 'INSERT';

-- Crear usuario para la aplicación
CREATE USER ecopoint_app WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE ecopoint_auditoria TO ecopoint_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecopoint_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecopoint_app;
```

### 3. MongoDB
MongoDB se configura automáticamente al iniciar la aplicación. Las colecciones se crean dinámicamente:
- `users` - Usuarios del sistema
- `materials` - Materiales reciclables
- `premios` - Premios disponibles

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- MongoDB 6.0+
- PostgreSQL 14+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd EcoPoint/EcoPoint
```

2. **Instalar Backend**
```bash
cd EcoPointBackend
npm install
```

3. **Instalar Frontend**
```bash
cd ../EcoPointFrontend
npm install
```

4. **Configurar Base de Datos**
- Iniciar MongoDB: `mongod`
- Configurar PostgreSQL (ver sección anterior)
- Crear archivo `.env` en el backend

5. **Ejecutar Aplicación**

**Terminal 1 - Backend:**
```bash
cd EcoPointBackend
npm run dev
```
*Servidor iniciará en http://localhost:5050*

**Terminal 2 - Frontend:**
```bash
cd EcoPointFrontend
npm run dev
```
*Aplicación disponible en http://localhost:5173*

## 🌐 Endpoints de la API

### Usuarios
- `POST /api/usuarios/crear` - Crear usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `PUT /api/usuarios/cambiar-rol` - Cambiar rol (admin)

### Materiales
- `GET /api/materiales` - Listar materiales
- `POST /api/materiales/crear` - Crear material (admin)
- `DELETE /api/materiales/:id` - Eliminar material (admin)

### Reciclaje
- `POST /api/reciclaje/registrar` - Registrar reciclaje

### Premios
- `GET /api/premios` - Listar premios
- `POST /api/premios/crear` - Crear premio (admin)
- `POST /api/premios/canjear` - Canjear premio
- `DELETE /api/premios/:id` - Eliminar premio (admin)

### Auditoría (solo admin)
- `GET /api/auditoria/estadisticas` - Estadísticas generales
- `GET /api/auditoria/actividad-usuarios` - Actividad por usuario
- `GET /api/auditoria/reciclaje` - Auditoría de reciclaje
- `GET /api/auditoria/premios` - Auditoría de premios

## 🔐 Características de Seguridad

- ✅ Encriptación de contraseñas con bcryptjs
- ✅ Tokens JWT para autenticación
- ✅ Sistema de auditoría completo
- ✅ Validación de datos de entrada
- ✅ Protección CORS configurada
- ✅ Manejo seguro de archivos

## 🎨 Características de UI/UX

- ✅ Diseño responsive para todos los dispositivos
- ✅ Interfaz moderna con gradientes y animaciones
- ✅ Panel de administración profesional
- ✅ Sistema de auditoría visualmente claro
- ✅ Feedback visual en todas las operaciones
- ✅ Navegación intuitiva por roles

## 🐛 Solución de Problemas Comunes

### No cargan los Datos en algún view
Verificar que los puertos en `"Nombre de la view".jsx` sean 5050 y no 5000.

### Conexión a base de datos
- MongoDB: Debe estar corriendo en `localhost:27017`
- PostgreSQL: Base `ecopoint_auditoria` debe existir
- Usuario `ecopoint_app` debe tener permisos

## 👤 Autores

**Desarrollo de Software - Proyecto Académico**
- Jeremy Arévalo
- Ahinoa Andino  
- Josue Nicolalde

## 🤝 Contribuciones

1. Fork del proyecto
2. Crear rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

**🌱 EcoPoint - Transformando el reciclaje en una experiencia digital**
