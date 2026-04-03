import { transporter } from '../config/mailer.js';
import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../services/googleService.js";

const router = express.Router();

router.post("/crear", async (req, res) => {
  // 1. Recibimos los datos (sumamos 'email' que viene de la web rosa)
  const { summary, start, email } = req.body; 

  if (!start) return res.status(400).json({ error: "Falta fecha/hora" });

  const fechaInicio = new Date(start);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const evento = {
    summary: summary || "Turno Web",
    description: `Turno agendado para: ${summary}. ¡Saludos!`,
    start: {
      dateTime: fechaInicio.toISOString(),
      timeZone: "America/Argentina/Buenos_Aires",
    },
    end: {
      dateTime: new Date(fechaInicio.getTime() + 3600000).toISOString(),
      timeZone: "America/Argentina/Buenos_Aires",
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: evento,
    });

    // 📧 Solo intenta mandar el mail si el cliente puso uno
    if (req.body.email) {
      await transporter.sendMail({
        from: '"Agenda Tu Turno 📅" <sistema.turnosapp@gmail.com>',
        to: req.body.email, 
        subject: "✅ Turno Confirmado",
        html: `<p>Tu turno para <b>${summary}</b> fue agendado.</p>`
      });
      console.log("📧 Mail enviado con éxito");
    }

    res.json({ success: true, link: response.data.htmlLink });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error en el proceso" });
  }
});

export default router;