import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router();

router.post("/crear", async (req, res) => {
  // 1. Extraemos los datos reales que vienen del fetch (Frontend)
  const { summary, start } = req.body;

// ✅ VALIDACIÓN PARA EVITAR CRASH
if (!start) {
  return res.status(400).json({ error: "Falta fecha/hora" });
}

const fechaInicio = new Date(start);

if (isNaN(fechaInicio)) {
  return res.status(400).json({ error: "Fecha inválida" });
}

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client
  });

  // 2. Creamos el evento con los datos del usuario
  const evento = {
    summary: summary || "Turno Web", // Usa lo que escribió el usuario
    description: "Agendado automáticamente desde la App de Turnos",
    start: {
  dateTime: fechaInicio.toISOString(),
  timeZone: "America/Argentina/Buenos_Aires",
},
end: {
  dateTime: new Date(fechaInicio.getTime() + 3600000).toISOString(),
  timeZone: "America/Argentina/Buenos_Aires",
}
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: evento
    });

    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error("❌ Error en Google API:", error);
    res.status(500).json({ error: "Error creando evento", details: error.message });
  }
});

export default router;