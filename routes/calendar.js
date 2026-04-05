import { transporter } from '../config/mailer.js';
import express from "express"; // 
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router(); // 

// ... ("/crear", async (req, res) => { ...
router.post("/crear", async (req, res) => {
  const { summary, start, email } = req.body;
  if (!start) return res.status(400).json({ error: "Falta fecha/hora" });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  // 1. Convertimos el texto de la web a un objeto de fecha real
  const fechaInicio = new Date(start);
  const fechaFin = new Date(fechaInicio.getTime() + 3600000); // +1 hora

  // 2. Margen de seguridad: restamos y sumamos unos milisegundos 
  // para que no choque con turnos que terminen justo al empezar este.
  const timeMinSearch = new Date(fechaInicio.getTime() + 1000).toISOString();
  const timeMaxSearch = new Date(fechaFin.getTime() - 1000).toISOString();

  try {
    // 🔍 3. REVISAR DISPONIBILIDAD (Con zona horaria explícita)
    const checkEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMinSearch,
      timeMax: timeMaxSearch,
      singleEvents: true,
      timeZone: "America/Argentina/Buenos_Aires" // Aseguramos que busque tu zona horaria
    });

    // IMPORTANTE: Si dice "Ocupado", mirá la terminal de VS Code
    if (checkEvents.data.items.length > 0) {
      console.log("⚠️ CHOQUE DETECTADO CON ESTE EVENTO:", checkEvents.data.items[0].summary);
      return res.status(409).json({ error: "El horario ya está ocupado" });
    }

    // ✅ 4. SI ESTÁ LIBRE, PROCEDEMOS
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: summary || "Turno Web",
        description: `Cliente: ${email}`,
        start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
      },
    });

    // ... (Tu código de nodemailer aquí abajo)
    
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error detallado en el servidor:", error);
    res.status(500).json({ error: "Error al procesar el turno" });
  }
});
// Al final de routes/calendar.js
export default router;