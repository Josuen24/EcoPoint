const express = require("express");
const router = express.Router();
const Material = require("../models/Material");

// Crear material
router.post("/crear", async (req, res) => {
  try {
    const { nombre, puntosPorKg } = req.body;

    if (!nombre || !puntosPorKg) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const existe = await Material.findOne({ nombre });
    if (existe) {
      return res.status(400).json({ message: "El material ya existe" });
    }

    const nuevoMaterial = new Material({
      nombre,
      puntosPorKg
    });

    await nuevoMaterial.save();

    res.status(201).json({
      message: "Material creado correctamente",
      material: nuevoMaterial
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

// Listar materiales
router.get("/", async (req, res) => {
  const materiales = await Material.find({ activo: true });
  res.json(materiales);
});

// Eliminar material (DELETE REAL)
router.delete("/:id", async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    res.json({ message: "Material eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});






module.exports = router;
