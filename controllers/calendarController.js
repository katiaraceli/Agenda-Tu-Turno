import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

export const getDisponibilidad = async (req, res) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            // Buscamos desde ahora hasta 30 días adelante
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        // Solo enviamos los inicios de los eventos para bloquearlos en el front
        const ocupados = response.data.items.map(event => event.start.dateTime || event.start.date);
        
        res.json(ocupados);
    } catch (error) {
        console.error("❌ Error en disponibilidad:", error);
        res.status(500).json({ error: "No se pudo obtener la agenda" });
    }
};