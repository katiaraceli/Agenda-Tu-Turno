import express from "express";
import { getAuthUrl, getTokens } from "../services/googleService.js";

const router = express.Router();

// 1. Redirige a Google
router.get("/", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// 2. Callback de Google
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokens = await getTokens(code);

  console.log("🔐 Tokens:", tokens);

  res.send("Login exitoso, ya podés cerrar esta ventana");
});

export default router;