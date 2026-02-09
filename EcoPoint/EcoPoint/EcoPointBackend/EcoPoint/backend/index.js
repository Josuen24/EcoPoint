const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

// Importar módulo de auditoría
const { setupAuditoriaRoutes } = require("./database-auditoria");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Ruta de prueba
app.get("/", (req, res) => {
  res.send("EcoPoint API funcionando");
});

const userRoutes = require("./routes/user.routes");
app.use("/api/usuarios", userRoutes);

const materialRoutes = require("./routes/material.routes");
app.use("/api/materiales", materialRoutes);

const reciclajeRoutes = require("./routes/reciclaje.routes");
app.use("/api/reciclaje", reciclajeRoutes);

const premioRoutes = require("./routes/premio.routes");
app.use("/api/premios", premioRoutes);

// Configurar rutas de auditoría
setupAuditoriaRoutes(app);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((error) => console.log(error));

// Servidor
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});