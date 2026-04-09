import { transporter } from "../services/mailer.js";

export const enviarNotificaciones = async (emailCliente, nombreCliente, servicio, fecha, linkCalendar) => {
    const adminMail = (process.env.EMAIL_USER || "").trim();
    const clienteMail = (emailCliente || "").trim();

    const opciones = { 
        weekday: 'long', day: 'numeric', month: 'long', 
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' 
    };
    const fechaLinda = new Date(fecha).toLocaleDateString('es-AR', opciones);

    const mailOptions = {
        from: `"Agenda de Turnos" <${adminMail}>`,
        to: clienteMail, 
        bcc: adminMail,
        // ASUNTO: Limpio, solo motivo
        subject: `Turno confirmado - ${servicio}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #D4AF37; border-radius: 12px; padding: 25px; color: #333; margin: 0 auto;">
                <h2 style="color: #D4AF37; text-align: center; margin-top: 0;">¡Turno Confirmado!</h2>
                
                <div style="background-color: #fcf9f0; padding: 20px; border-radius: 8px; border-left: 5px solid #D4AF37; margin: 20px 0;">
                    <p style="margin: 10px 0;"><strong>🛠️ Servicio:</strong> ${servicio}</p>
                    <p style="margin: 10px 0;"><strong>👤 Cliente:</strong> ${nombreCliente || "No especificado"}</p>
                    <p style="margin: 10px 0;"><strong>📧 Email:</strong> ${clienteMail}</p>
                    <p style="margin: 10px 0;"><strong>⏰ Cuándo:</strong> ${fechaLinda} hs</p>
                </div>

                <p style="text-align: center; font-size: 0.9rem; color: #555;"></p>
                
                ${linkCalendar ? `
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${linkCalendar}" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Google Calendar</a>
                </div>` : ''}

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 0.8rem; color: #888; text-align: center;">Este es un aviso automático.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};