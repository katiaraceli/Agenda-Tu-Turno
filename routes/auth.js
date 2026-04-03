import express from "express";
import { getAuthUrl, getTokens, setTokens } from "../services/googleService.js";

const router = express.Router();

// 1. Redirige a Google para pedir permiso
router.get("/", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// 2. Callback de Google (Cuando volvés con el código)
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code; // El código que te da Google
    const tokens = await getTokens(code); // Intercambiamos código por llaves
    
    setTokens(tokens); // 👈 ¡ACÁ ESTÁ EL SECRETO! Activa el permiso.
    
    console.log("🔐 Permisos de Google activados correctamente");
    res.send("¡Login exitoso! Ya podés cerrar esta pestaña y agendar tu turno.");
  } catch (error) {
    console.error("❌ Error en el login:", error);
    res.status(500).send("Error al identificarse con Google");
  }
});

export default router;