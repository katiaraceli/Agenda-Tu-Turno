import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router();

router.post("/crear", async (req, res) => {

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client
  });

  const evento = {
    summary: "Turno médico",
    description: "Consulta paciente",
    start: {
      dateTime: new Date(Date.now() + 3600000).toISOString()
    },
    end: {
      dateTime: new Date(Date.now() + 7200000).toISOString()
    }
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: evento
    });

    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando evento" });
  }
});

export default router;