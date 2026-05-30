import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

// Función para traer horarios ocupados
export const obtenerDisponibilidad = async (req, res) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const ocupados = response.data.items.map(event => event.start.dateTime || event.start.date);
        res.json(ocupados);
    } catch (error) {
        console.error("❌ Error en disponibilidad:", error);
        res.status(500).json({ error: "No se pudo obtener la agenda" });
    }
};

// Función para buscar turnos por email (la que faltaba para cancelar)
export const obtenerTurnosPorEmail = async (req, res) => {
    const { email } = req.query;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (!email) return res.status(400).json({ error: "Email requerido" });

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            q: email, // Google busca el texto en el evento
            singleEvents: true,
        });

        // Filtramos para asegurar que el email esté en la descripción o resumen
        const turnos = response.data.items.filter(event => 
            (event.description && event.description.includes(email)) || 
            (event.summary && event.summary.includes(email))
        );

        res.json(turnos);
    } catch (error) {
        console.error("❌ Error al buscar turnos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Función para agendar
export const agendarTurno = async (req, res) => {
    const { summary, email, start, nombreCompleto } = req.body;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
        summary: `${summary} - ${nombreCompleto}`,
        description: `Cliente: ${nombreCompleto}\nEmail: ${email}`,
        start: { dateTime: start, timeZone: 'America/Argentina/Buenos_Aires' },
        end: { 
            dateTime: new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString(), 
            timeZone: 'America/Argentina/Buenos_Aires' 
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error al agendar:", error);
        res.status(500).json({ error: "No se pudo agendar el turno" });
    }
};

// Función para cancelar
export const cancelarTurno = async (req, res) => {
    const { id } = req.params;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: id,
        });
        res.json({ message: "Turno eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error al cancelar:", error);
        res.status(500).json({ error: "No se pudo cancelar el turno" });
    }
};