const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Material = require("../models/Material");

// Registrar reciclaje
router.post("/registrar", async (req, res) => {
  try {
    const { cedula, materialId, peso } = req.body;

    if (!cedula || !materialId || !peso) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Buscar usuario
    const usuario = await User.findOne({ cedula });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar material
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    // Calcular puntos
    const puntosGanados = peso * material.puntosPorKg;

    // Actualizar usuario
    usuario.puntos += puntosGanados;
    usuario.historial.push({
      material: material.nombre,
      peso,
      puntos: puntosGanados
    });

    await usuario.save();

    res.json({
      message: "Reciclaje registrado correctamente",
      puntosGanados,
      puntosTotales: usuario.puntos
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

module.exports = router;
