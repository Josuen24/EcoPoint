const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    cedula: {
      type: String,
      required: true,
      unique: true
    },
    nombre: {
      type: String,
      required: true
    },
    puntos: {
      type: Number,
      default: 0
    },
    rol: {
      type: String,
      enum: ["usuario", "recolector", "admin"],
      default: "usuario"
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
    },
    historial: [
      {
        material: String,
        peso: Number,
        puntos: Number,
        fecha: {
          type: Date,
          default: Date.now
        }
      }
    ],
    premiosReclamados: [
      {
        premio: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Premio"
        },
        fecha: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
