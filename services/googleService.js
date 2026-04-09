import { google } from "googleapis";
import { env as config } from "../config/env.js";
import fs from "fs"; 
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "token.json");

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || config.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET || config.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || config.GOOGLE_REDIRECT_URI
);

export function cargarTokenSiExiste() {
  // 1. Prioridad: La variable que pegaste en el panel de Render
  if (process.env.GOOGLE_TOKEN) {
    try {
      const token = JSON.parse(process.env.GOOGLE_TOKEN);
      oauth2Client.setCredentials(token);
      console.log("🚀 Token cargado desde las Variables de Render");
      return; 
    } catch (err) {
      console.error("Error al leer GOOGLE_TOKEN de Render:", err);
    }
  }

  // 2. Si no está en Render, busca el archivo local (Tu PC)
  if (fs.existsSync(TOKEN_PATH)) {
    try {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oauth2Client.setCredentials(token);
        console.log("💾 Token cargado desde archivo local (token.json)");
    } catch (err) {
        console.error("Error al leer token.json local:", err);
    }
  } else {
    console.log("🎫 No hay token en ningún lado. Revisá el panel de Render.");
  }
}

export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Guardamos localmente (solo sirve en tu PC, en Render se borrará)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("✅ Token guardado en token.json correctamente");
  
  return tokens;
}

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", 
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    prompt: 'consent' 
  });
}

export const setTokens = (tokens) => {
  oauth2Client.setCredentials(tokens);
};