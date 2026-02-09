const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { registrarAuditoria } = require("../database-auditoria");


// Crear usuario
router.post("/crear", async (req, res) => {
  try {
    const { cedula, nombre } = req.body;

    if (!cedula || !nombre) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const existeUsuario = await User.findOne({ cedula });
    if (existeUsuario) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const nuevoUsuario = new User({
      cedula,
      nombre
    });

    await nuevoUsuario.save();

    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
});

// Buscar usuario por cédula (login)
router.post("/buscar", async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({ message: "Cédula requerida" });
    }

    const usuario = await User.findOne({ cedula });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { cedula, nombre, email, password } = req.body;

    if (!cedula || !nombre || !password) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const existe = await User.findOne({ cedula });
    if (existe) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      cedula,
      nombre,
      email,
      password: passwordHash,
      rol: "usuario",
      puntos: 0
    });

    await nuevoUsuario.save();

    // Registrar en auditoría
    await registrarAuditoria({
      id_usuario: cedula,
      nombre_usuario: nombre,
      operacion: "INSERT",
      tabla_afectada: "users",
      registro_id: cedula,
      descripcion: "Nuevo usuario registrado",
      datos_nuevos: { cedula, nombre, email, rol: "usuario" }
    });

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Login con contraseña
router.post("/login", async (req, res) => {
  try {
    const { cedula, password } = req.body;

    const usuario = await User.findOne({ cedula });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Registrar login en auditoría
    await registrarAuditoria({
      id_usuario: cedula,
      nombre_usuario: usuario.nombre,
      operacion: "LOGIN",
      tabla_afectada: "users",
      registro_id: cedula,
      descripcion: "Inicio de sesión",
      ip_address: req.ip
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Cambiar rol (admin)
router.put("/cambiar-rol", async (req, res) => {
  try {
    const { cedula, rol } = req.body;

    const rolesValidos = ["usuario", "recolector", "admin"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    // Obtener usuario ANTES de actualizar para capturar el nombre y rol anterior
    const usuarioAnterior = await User.findOne({ cedula });
    if (!usuarioAnterior) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar rol
    const usuario = await User.findOneAndUpdate(
      { cedula },
      { rol },
      { new: true }
    );

    // Registrar cambio de rol en auditoría
    await registrarAuditoria({
      id_usuario: cedula,
      nombre_usuario: usuarioAnterior.nombre,
      operacion: "UPDATE",
      tabla_afectada: "users",
      registro_id: cedula,
      descripcion: `Cambio de rol a: ${rol}`,
      datos_anteriores: { rol: usuarioAnterior.rol },
      datos_nuevos: { rol: rol }
    });

    res.json({ message: "Rol actualizado", usuario });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
});


module.exports = router;
