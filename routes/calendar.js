import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 

const router = express.Router();

// 💡 FEATURE FLAG: Forzamos la desconexión de Google Calendar
const ENABLE_CALENDAR = false;

// GET: Disponibilidad
router.get("/disponibilidad", async (req, res) => {
    // Si está en false, mandamos un array vacío (Modo demo: todo libre) sin tocar Google
    if (!ENABLE_CALENDAR) {
        console.log("ℹ️ [Modo Demo] Disponibilidad: Evitando llamada a Google Calendar.");
        return res.json([]); 
    }

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

// POST: Agendar
router.post("/agendar", async (req, res) => {
    const { summary, start, email, nombreCompleto } = req.body;

    // 🚀 CAMBIO QUIRÚRGICO: Bypass de Google Calendar si está deshabilitado
    if (!ENABLE_CALENDAR) {
        console.log("ℹ️ [Modo Demo] Agendar: Google Calendar deshabilitado. Procesando emails con Resend.");
        try {
            const linkSimulado = "https://miturno-gamma.vercel.app";
            
            // Forzamos el envío de correos vía Resend sin depender de la API de Google
            await enviarNotificaciones(email, nombreCompleto, summary, start, linkSimulado);
            
            return res.json({ success: true, eventId: "demo_mode_no_calendar" });
        } catch (e) {
            console.error("❌ Error en envío de e-mails (Resend):", e.message);
            return res.status(500).json({ error: "Error al procesar las notificaciones por mail." });
        }
    }

    // Código original intacto (No se ejecuta si ENABLE_CALENDAR es false)
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
                    private: { clienteEmail: email }
                }
            },
        });

        await enviarNotificaciones(email, nombreCompleto, summary, start, response.data.htmlLink);
        res.json({ success: true, eventId: response.data.id });
    } catch (error) {
        res.status(500).json({ error: "Error al agendar" });
    }
});

// POST: Cancelar (Bypass directo basado en tu estructura actual)
router.post("/cancelar", async (req, res) => {
    if (!ENABLE_CALENDAR) {
        console.log("ℹ️ [Modo Demo] Cancelar: Google Calendar deshabilitado.");
        return res.json({ success: true, message: "Modo demo: Turno cancelado." });
    }

    const { email } = req.body;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (!email) {
        return res.status(400).json({ error: "El email es requerido" });
    }

    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            privateExtendedProperty: `clienteEmail=${email}`,
            singleEvents: true
        });

        const eventos = response.data.items;
        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ error: "No se encontró ningún turno activo para este correo." });
        }

        const turnoACancelar = eventos[0];
        await calendar.events.delete({
            calendarId: "primary",
            eventId: turnoACancelar.id
        });

        return res.json({ success: true, message: "Turno cancelado correctamente." });
    } catch (error) {
        return res.status(500).json({ error: "Error en el servidor de Google." });
    }
});

export default router;