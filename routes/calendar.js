import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 

const router = express.Router();

// --- 1. DISPONIBILIDAD (NUEVO) ---
router.get("/disponibilidad", async (req, res) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            timeZone: "America/Argentina/Buenos_Aires"
        });
        // Enviamos solo el array de fechas ocupadas
        const ocupados = response.data.items.map(event => event.start.dateTime || event.start.date);
        res.json(ocupados);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener disponibilidad" });
    }
});

// --- 2. AGENDAR (MODIFICADO CON METADATA) ---
router.post("/agendar", async (req, res) => {
    const { summary, start, email, nombreCompleto } = req.body;
    if (!start || !email || !nombreCompleto) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const fechaInicio = new Date(start);
    const fechaFin = new Date(fechaInicio.getTime() + 3600000); 

    try {
        let motivoLimpio = (summary || "Consulta").replace(/Turno: /gi, "").split("(")[0].trim();

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: `${motivoLimpio} - ${nombreCompleto}`, 
                description: `Cliente: ${nombreCompleto}\nEmail: ${email}`,
                start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                // 🔑 CLAVE PRO: Guardamos el email de forma privada para buscarlo luego
                extendedProperties: {
                    private: { clienteEmail: email }
                }
            },
        });

        enviarNotificaciones(email, nombreCompleto, motivoLimpio, start, response.data.htmlLink)
            .catch(e => console.error("❌ Error mail:", e.message));

        res.json({ success: true, eventId: response.data.id }); // Mandamos el ID al front
    } catch (error) {
        res.status(500).json({ error: "Error al agendar" });
    }
});

// --- 3. BUSCAR POR EMAIL (NUEVO) ---
router.get("/mis-turnos", async (req, res) => {
    const { email } = req.query;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            // 🔎 Filtramos solo los eventos que tengan este email guardado
            privateExtendedProperty: `clienteEmail=${email}`,
            timeMin: new Date().toISOString(), // Solo turnos futuros
            singleEvents: true
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar turnos" });
    }
});

// --- 4. CANCELAR (NUEVO) ---
router.delete("/cancelar/:id", async (req, res) => {
    const { id } = req.params;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    try {
        await calendar.events.delete({ calendarId: "primary", eventId: id });
        res.json({ success: true, message: "Turno eliminado y horario liberado" });
    } catch (error) {
        res.status(500).json({ error: "No se pudo cancelar el turno" });
    }
});

// --- 5. REPROGRAMAR (NUEVO - PATCH) ---
router.patch("/reprogramar/:id", async (req, res) => {
    const { id } = req.params;
    const { nuevaFecha } = req.body;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    const fechaInicio = new Date(nuevaFecha);
    const fechaFin = new Date(fechaInicio.getTime() + 3600000);

    try {
        await calendar.events.patch({
            calendarId: "primary",
            eventId: id,
            resource: {
                start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
                end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" }
            }
        });
        res.json({ success: true, message: "Turno reprogramado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al reprogramar" });
    }
});

export default router;