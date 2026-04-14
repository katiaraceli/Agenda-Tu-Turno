import { Resend } from 'resend';

// No te olvides de agregar RESEND_API_KEY en las variables de entorno de Render
const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarNotificaciones = async (emailCliente, nombreCliente, servicio, fecha, linkCalendar) => {
    const clienteMail = (emailCliente || "").trim();

    // Formateo de fecha para que el usuario la entienda fácil
    const opciones = { 
        weekday: 'long', day: 'numeric', month: 'long', 
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' 
    };
    const fechaLinda = new Date(fecha).toLocaleDateString('es-AR', opciones);

    // En Resend, el envío es una sola promesa limpia
    return resend.emails.send({
        from: 'Agenda de Turnos <onboarding@resend.dev>', // Dejalo así hasta validar dominio
        to: clienteMail, 
        subject: `Turno confirmado - ${servicio}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #D4AF37; border-radius: 12px; padding: 25px; color: #333; margin: 0 auto;">
                <h2 style="color: #D4AF37; text-align: center; margin-top: 0;">¡Turno Confirmado!</h2>
                
                <div style="background-color: #fcf9f0; padding: 20px; border-radius: 8px; border-left: 5px solid #D4AF37; margin: 20px 0;">
                    <p style="margin: 10px 0;"><strong>🛠️ Servicio:</strong> ${servicio}</p>
                    <p style="margin: 10px 0;"><strong>👤 Cliente:</strong> ${nombreCliente || "No especificado"}</p>
                    <p style="margin: 10px 0;"><strong>⏰ Cuándo:</strong> ${fechaLinda} hs</p>
                </div>

                ${linkCalendar ? `
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${linkCalendar}" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Google Calendar</a>
                </div>` : ''}

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 0.8rem; color: #888; text-align: center;">Este es un aviso automático de tu sistema de turnos.</p>
            </div>
        `
    });
};