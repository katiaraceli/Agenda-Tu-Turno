import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 

const router = express.Router();

// GET: Disponibilidad (Para que Flatpickr pinte los grises)
router.get("/disponibilidad", async (req, res) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: "startTime"
        });
        const ocupados = response.data.items.map(event => event.start.dateTime || event.start.date);
        res.json(ocupados);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener disponibilidad" });
    }
});

// POST: Agendar (Con Metadata para gestión futura)
router.post("/agendar", async (req, res) => {
    const { summary, start, email, nombreCompleto } = req.body;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const fechaInicio = new Date(start);
    const fechaFin = new Date(fechaInicio.getTime() + 3600000); 

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: `${summary} - ${nombreCompleto}`, 
                description: `Cliente: ${nombreCompleto}\nEmail: ${email}`,
                start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                extendedProperties: {
                    private: { clienteEmail: email } // 🔍 Metadata invisible
                }
            },
        });

        enviarNotificaciones(email, nombreCompleto, summary, start, response.data.htmlLink)
            .catch(e => console.error("Error mail:", e.message));

        res.json({ success: true, eventId: response.data.id });
    } catch (error) {
        res.status(500).json({ error: "Error al agendar" });
    }
});

export default router;