import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router();

router.post("/crear", async (req, res) => {
  const { summary, start } = req.body;

  // 1. Validaciones de seguridad (tus favoritas)
  if (!start) return res.status(400).json({ error: "Falta fecha/hora" });

  const fechaInicio = new Date(start);
  if (isNaN(fechaInicio)) return res.status(400).json({ error: "Fecha inválida" });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // 2. Construcción del evento con notificación
  const evento = {
    summary: summary || "Turno Web",
    description: `Turno agendado para: ${summary}. ¡Saludos!`, // Agregué el saludo que pediste
    start: {
      dateTime: fechaInicio.toISOString(),
      timeZone: "America/Argentina/Buenos_Aires",
    },
    end: {
      dateTime: new Date(fechaInicio.getTime() + 3600000).toISOString(),
      timeZone: "America/Argentina/Buenos_Aires",
    },
    // 📧 Esto hace que llegue el mail detallado
    attendees: [{ email: 'sistema.turnosapp@gmail.com' }],
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: evento,
      sendUpdates: 'all', // 🔔 Esto dispara el aviso al Gmail
    });

    // Esto te dará el link real en la terminal para que lo compruebes vos misma
    console.log("---------------------------------");
    console.log("✅ TURNO CREADO EXITOSAMENTE");
    console.log("🔗 LINK:", response.data.htmlLink);
    console.log("---------------------------------");

    res.json({ success: true, link: response.data.htmlLink });

  } catch (error) {
    console.error("❌ Error en Google API:", error);
    res.status(500).json({ error: "Error creando evento", details: error.message });
  }
});

export default router;