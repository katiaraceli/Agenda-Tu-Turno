import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 
// 🌟 CORRECCIÓN: El import ahora está arriba del todo como corresponde
import { enviarMailCancelacion } from "../config/mailer.js"; 

const router = express.Router();

// 💡 FEATURE FLAG: Forzamos la desconexión de Google Calendar
const ENABLE_CALENDAR = false;

// ==========================================
// GET: DISPONIBILIDAD
// ==========================================
router.get("/disponibilidad", async (req, res) => {
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

// ==========================================
// POST: AGENDAR
// ==========================================
router.post("/agendar", async (req, res) => {
    const { summary, start, email, nombreCompleto } = req.body;

    if (!ENABLE_CALENDAR) {
        console.log("ℹ️ [Modo Demo] Agendar: Google Calendar deshabilitado. Procesando emails con Resend.");
        try {
            const linkSimulado = "https://miturno-gamma.vercel.app";
            await enviarNotificaciones(email, nombreCompleto, summary, start, linkSimulado);
            return res.json({ success: true, eventId: "demo_mode_no_calendar" });
        } catch (e) {
            console.error("❌ Error en envío de e-mails (Resend):", e.message);
            return res.status(500).json({ error: "Error al procesar las notificaciones por mail." });
        }
    }

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

// ==========================================
// POST: CANCELAR (Versión única corregida con Email)
// ==========================================
router.post("/cancelar", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "El email es requerido" });
    }

    // 🚀 MODO DEMO: Si Google Calendar está deshabilitado
    if (!ENABLE_CALENDAR) {
        console.log(`ℹ️ [Modo Demo] Cancelar: Procesando emails de cancelación con Resend para ${email}.`);
        try {
            const nombreSimulado = "Cliente de Turno";
            const fechaSimulada = new Date(); 
            const motivoSimulado = "Consulta técnica";

            await enviarMailCancelacion(email, nombreSimulado, fechaSimulada, motivoSimulado);
            return res.json({ success: true, message: "Modo demo: Turno cancelado y notificaciones enviadas." });
        } catch (e) {
            console.error("❌ Error en envío de e-mails de cancelación (Resend):", e.message);
            return res.status(500).json({ error: "Error al procesar las notificaciones de cancelación." });
        }
    }

    // MODO PRODUCCIÓN: Con Google Calendar Activo
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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

        const resumenCompleto = turnoACancelar.summary || "";
        const partes = resumenCompleto.split(" - ");
        const motivo = partes[0] || "Consulta";
        const nombreCliente = partes[1] || "Cliente";
        const fechaTurno = turnoACancelar.start.dateTime || turnoACancelar.start.date;

        await calendar.events.delete({
            calendarId: "primary",
            eventId: turnoACancelar.id
        });

        await enviarMailCancelacion(email, nombreCliente, fechaTurno, motivo);

        return res.json({ success: true, message: "Turno cancelado correctamente y notificado por mail." });
    } catch (error) {
        console.error("❌ Error al cancelar:", error);
        return res.status(500).json({ error: "Error en el servidor al procesar la cancelación." });
    }
});

export default router;