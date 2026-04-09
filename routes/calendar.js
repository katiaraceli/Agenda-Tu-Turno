import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 

const router = express.Router();

// Cambiá "/crear" por "/agendar"
router.post("/agendar", async (req, res) => {
    // 1. Recibimos los datos del Body
    const { summary, start, email, nombreCompleto } = req.body;
    
    // 2. Validación básica
    if (!start || !email || !nombreCompleto) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const fechaInicio = new Date(start);
    const fechaFin = new Date(fechaInicio.getTime() + 3600000); 

    try {
        // 3. Verificamos disponibilidad 
        const checkEvents = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date(fechaInicio.getTime() + 1000).toISOString(),
            timeMax: new Date(fechaFin.getTime() - 1000).toISOString(),
            singleEvents: true,
            timeZone: "America/Argentina/Buenos_Aires"
        });

        if (checkEvents.data.items.length > 0) {
            return res.status(409).json({ error: "Horario ocupado" });
        }

        // 4. Limpieza del motivo 
        let motivoLimpio = (summary || "Consulta").replace(/Turno: /gi, "").split("(")[0].trim();

        // 5. Grabamos en Google Calendar con el formato: Motivo - Nombre
        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: {
                summary: `${motivoLimpio} - ${nombreCompleto}`, 
                description: `Cliente: ${nombreCompleto}\nEmail: ${email}\nMotivo: ${motivoLimpio}`,
                start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
            },
        });

        // 6. Disparamos la notificación 
        enviarNotificaciones(email, nombreCompleto, motivoLimpio, start, response.data.htmlLink)
            .catch(e => console.error("❌ Error mail:", e.message));

        res.json({ success: true, message: "Turno creado" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

export default router;