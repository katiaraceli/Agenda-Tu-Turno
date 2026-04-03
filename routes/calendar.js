import { transporter } from '../config/mailer.js';
import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router();

router.post("/crear", async (req, res) => {
  const { summary, start, email } = req.body;
  if (!start) return res.status(400).json({ error: "Falta fecha/hora" });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  const fechaInicio = new Date(start);
  const fechaFin = new Date(fechaInicio.getTime() + 3600000); // 1 hora de duración

  try {
    // 🔍 1. REVISAR DISPONIBILIDAD
    const checkEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: fechaInicio.toISOString(),
      timeMax: fechaFin.toISOString(),
      singleEvents: true,
    });

    if (checkEvents.data.items.length > 0) {
      console.log("📅 Horario ocupado:", start);
      return res.status(409).json({ error: "El horario ya está ocupado" });
    }

    // ✅ 2. AGENDAR EN CALENDAR
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: summary || "Turno Web",
        description: `Cliente: ${email}`,
        start: { dateTime: fechaInicio.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: fechaFin.toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
      },
    });

    // 📧 3. ENVIAR MAIL DE CONFIRMACIÓN
    if (email) {
      await transporter.sendMail({
        from: '"Agenda Tu Turno 📅" <sistema.turnosapp@gmail.com>',
        to: email, 
        subject: "✅ Turno Confirmado",
        html: `
          <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #d4af37;">¡Turno Agendado con éxito!</h2>
            <p><b>Motivo:</b> ${summary || "Turno Web"}</p>
            <p><b>Fecha y Hora:</b> ${new Date(start).toLocaleString()}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Te esperamos en nuestro local.</p>
          </div>
        `
      });
      console.log("📧 Mail de confirmación enviado a:", email);
    }

    res.json({ success: true, link: response.data.htmlLink });

  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    res.status(500).json({ error: "Error al procesar el turno" });
  }
});

export default router;