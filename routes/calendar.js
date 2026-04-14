import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";
import { enviarNotificaciones } from "../services/notificaciones.js"; 

const router = express.Router();

router.post("/agendar", async (req, res) => {
    // 1. Recibimos los datos del Body
    const { summary, start, email, nombreCompleto } = req.body;
    
    // 2. Validación básica de seguridad
    if (!start || !email || !nombreCompleto) {
        return res.status(400).json({ error: "Faltan datos obligatorios (Fecha, Email o Nombre)" });
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const fechaInicio = new Date(start);
    // Definimos el fin del turno (1 hora después)
    const fechaFin = new Date(fechaInicio.getTime() + 3600000); 

    try {
        // 3. Verificamos disponibilidad en el calendario
        const checkEvents = await calendar.events.list({
            calendarId: "primary",
            // Agregamos un pequeño margen de 1 segundo para evitar solapamientos exactos
            timeMin: new Date(fechaInicio.getTime() + 1000).toISOString(),
            timeMax: new Date(fechaFin.getTime() - 1000).toISOString(),
            singleEvents: true,
            timeZone: "America/Argentina/Buenos_Aires"
        });

        if (checkEvents.data.items.length > 0) {
            return res.status(409).json({ error: "El horario ya está ocupado. Por favor, elegí otro." });
        }

        // 4. Limpieza del motivo para que el calendario quede prolijo
        let motivoLimpio = (summary || "Consulta").replace(/Turno: /gi, "").split("(")[0].trim();

        // 5. Grabamos en Google Calendar
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: `${motivoLimpio} - ${nombreCompleto}`, 
                description: `Cliente: ${nombreCompleto}\nEmail: ${email}\nMotivo: ${motivoLimpio}`,
                start: { 
                    dateTime: fechaInicio.toISOString(), 
                    timeZone: "America/Argentina/Buenos_Aires" 
                },
                end: { 
                    dateTime: fechaFin.toISOString(), 
                    timeZone: "America/Argentina/Buenos_Aires" 
                },
            },
        });

        // 6. DISPARO DE NOTIFICACIÓN (Resend)
        // Usamos .catch para que si falla el mail, el usuario igual reciba su confirmación de turno
        enviarNotificaciones(
            email, 
            nombreCompleto, 
            motivoLimpio, 
            start, 
            response.data.htmlLink
        ).catch(e => console.error("❌ Error enviando mail con Resend:", e.message));

        // 7. Respuesta exitosa al Frontend
        return res.status(200).json({ 
            success: true, 
            message: "¡Turno creado con éxito!",
            link: response.data.htmlLink 
        });

    } catch (error) {
        console.error("❌ Error en el proceso de agendado:", error);
        return res.status(500).json({ error: "Error interno del servidor al procesar el turno" });
    }
});

export default router;