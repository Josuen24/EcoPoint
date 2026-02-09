const express = require("express");
const router = express.Router();
const Premio = require("../models/Premio");
const User = require("../models/User");
const uploadPremio = require("../middlewares/uploadPremio");
const { registrarAuditoria } = require("../database-auditoria");


// Crear premio (admin)
// Crear premio (admin) CON IMAGEN
router.post(
  "/crear",
  uploadPremio.single("imagen"),
  async (req, res) => {
    try {
      const { nombre, descripcion, puntosRequeridos, stock } = req.body;

      if (!nombre || !puntosRequeridos) {
        return res.status(400).json({ message: "Datos incompletos" });
      }

      const premio = new Premio({
        nombre,
        descripcion,
        puntosRequeridos,
        stock,
        imagen: req.file
          ? `/uploads/premios/${req.file.filename}`
          : null
      });

      await premio.save();

      // Registrar creación de premio en auditoría
      await registrarAuditoria({
        id_usuario: "admin",
        nombre_usuario: "Administrador",
        operacion: "INSERT",
        tabla_afectada: "premios",
        registro_id: premio._id,
        descripcion: `Nuevo premio creado: ${nombre}`,
        datos_nuevos: { nombre, descripcion, puntosRequeridos, stock }
      });

      res.status(201).json({
        message: "Premio creado correctamente",
        premio
      });
    } catch (error) {
      res.status(500).json({ message: "Error del servidor", error });
    }
  }
);

// Listar premios activos
router.get("/", async (req, res) => {
  const premios = await Premio.find({ activo: true });
  res.json(premios);
});

// Canjear premio (usuario)
router.post("/canjear", async (req, res) => {
  try {
    const { cedula, premioId } = req.body;

    if (!cedula || !premioId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const usuario = await User.findOne({ cedula });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const premio = await Premio.findById(premioId);
    if (!premio || !premio.activo) {
      return res.status(404).json({ message: "Premio no disponible" });
    }

    if (usuario.puntos < premio.puntosRequeridos) {
      return res.status(400).json({ message: "Puntos insuficientes" });
    }

    if (premio.stock <= 0) {
      return res.status(400).json({ message: "Premio sin stock" });
    }

    // Restar puntos
    usuario.puntos -= premio.puntosRequeridos;

    // Guardar premio reclamado
    usuario.premiosReclamados.push({
      premio: premio._id
    });

    // Reducir stock
    premio.stock -= 1;

    await usuario.save();
    await premio.save();

    // Registrar canje de premio en auditoría
    await registrarAuditoria({
      id_usuario: cedula,
      nombre_usuario: usuario.nombre,
      operacion: "UPDATE",
      tabla_afectada: "users",
      registro_id: cedula,
      descripcion: `Premio canjeado: ${premio.nombre}`,
      datos_nuevos: { 
        premio: premio.nombre, 
        puntosRequeridos: premio.puntosRequeridos,
        puntosRestantes: usuario.puntos 
      }
    });

    res.json({
      message: "Premio canjeado correctamente",
      puntosRestantes: usuario.puntos
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

// Editar premio
router.put("/:id", async (req, res) => {
  const premio = await Premio.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(premio);
});

// Eliminar premio
router.delete("/:id", async (req, res) => {
  await Premio.findByIdAndDelete(req.params.id);
  res.json({ message: "Premio eliminado" });
});

module.exports = router;

/*
const express = require("express");
const router = express.Router();
const Premio = require("../models/Premio");
const User = require("../models/User");

// Crear premio (admin)
router.post("/crear", async (req, res) => {
  try {
    const { nombre, descripcion, puntosRequeridos, stock } = req.body;

    if (!nombre || !puntosRequeridos) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const premio = new Premio({
      nombre,
      descripcion,
      puntosRequeridos,
      stock
    });

    await premio.save();

    res.status(201).json({
      message: "Premio creado correctamente",
      premio
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

// Listar premios activos
router.get("/", async (req, res) => {
  const premios = await Premio.find({ activo: true });
  res.json(premios);
});

module.exports = router;

router.post("/canjear", async (req, res) => {
  try {
    const { cedula, premioId } = req.body;

    if (!cedula || !premioId) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const usuario = await User.findOne({ cedula });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const premio = await Premio.findById(premioId);
    if (!premio || !premio.activo) {
      return res.status(404).json({ message: "Premio no disponible" });
    }

    if (usuario.puntos < premio.puntosRequeridos) {
      return res.status(400).json({ message: "Puntos insuficientes" });
    }

    if (premio.stock <= 0) {
      return res.status(400).json({ message: "Premio sin stock" });
    }

    // Restar puntos
    usuario.puntos -= premio.puntosRequeridos;

    // Guardar premio reclamado
    usuario.premiosReclamados.push({
      premio: premio._id
    });


    // Reducir stock
    premio.stock -= 1;

    await usuario.save();
    await premio.save();

    res.json({
      message: "Premio canjeado correctamente",
      puntosRestantes: usuario.puntos
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

// Editar premio
router.put("/:id", async (req, res) => {
  const premio = await Premio.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(premio);
});

// Eliminar premio
router.delete("/:id", async (req, res) => {
  await Premio.findByIdAndDelete(req.params.id);
  res.json({ message: "Premio eliminado" });
});
*/