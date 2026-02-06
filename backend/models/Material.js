const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true
    },
    puntosPorKg: {
      type: Number,
      required: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
