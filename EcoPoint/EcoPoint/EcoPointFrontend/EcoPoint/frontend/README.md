# 🌱 EcoPoint

EcoPoint es una aplicación web que incentiva el reciclaje mediante un sistema de puntos y recompensas. El sistema permite registrar reciclaje, asignar puntos y canjear premios según distintos roles de usuario.

## 🚀 Tecnologías

Frontend:

- React (Vite)
- JavaScript
- CSS

Backend:

- Node.js

- Express

- MongoDB

- Mongoose

- bcryptjs

- cors

- dotenv

- nodemon (desarrollo)

## 👥 Roles

- Usuario: visualiza puntos y canjea premios
- Recolector: registra reciclaje y asigna puntos
- Administrador: gestiona materiales, premios y roles

## 📁 Estructura

backend/
├── index.js
├── package.json
├── models/
│ ├── User.js
│ ├── Material.js
│ └── Premio.js
└── routes/
├── user.routes.js
├── material.routes.js
├── reciclaje.routes.js
└── premio.routes.js

frontend/
├── src/
│ ├── App.jsx
│ ├── main.jsx
│ ├── components/
│ │ ├── Login.jsx / .css
│ │ └── Register.jsx / .css
│ └── views/
│ ├── UsuarioView.jsx / .css
│ ├── RecolectorView.jsx / .css
│ └── AdminView.jsx / .css

## ▶️ Ejecución (Localhost)

Backend:
cd backend
npm install
npm run dev

Frontend:
cd frontend
npm install
npm run dev

## 🗄️ Base de Datos

- MongoDB en entorno local
- Colecciones creadas automáticamente

## ✅ Estado

Proyecto funcional y estable, listo para entrega académica.

## 👤 Autor

Jeremy Arévalo  
Proyecto académico – Desarrollo de Software
