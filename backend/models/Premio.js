const mongoose = require("mongoose");

const premioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true
    },
    descripcion: {
      type: String
    },
    puntosRequeridos: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    activo: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Premio", premioSchema);
