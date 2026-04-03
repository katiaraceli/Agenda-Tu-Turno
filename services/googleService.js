import { google } from "googleapis";
import { config } from "../config/env.js";
import fs from "fs"; // 👈 Sistema de archivos
import path from "path";

// Definimos dónde se va a guardar el archivo (en la raíz de tu proyecto)
const TOKEN_PATH = path.join(process.cwd(), "token.json");

export const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.redirectUri
);

// 🔍 FUNCIÓN NUEVA: Lee el archivo al iniciar el servidor
export function cargarTokenSiExiste() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(token);
    console.log("💾 Token cargado desde token.json (Ya no necesitás loguearte)");
  } else {
    console.log("🎫 No hay token guardado. Hacé el login una vez en /auth");
  }
}

// ✍️ MODIFICACIÓN: Ahora guarda el token físicamente
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Guardamos el token en el disco duro
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("✅ Token guardado en token.json correctamente");
  
  return tokens;
}

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // "offline" permite que el token dure para siempre
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    prompt: 'consent' // Esto asegura que nos den el "refresh token"
  });
}

export const setTokens = (tokens) => {
  oauth2Client.setCredentials(tokens);
};