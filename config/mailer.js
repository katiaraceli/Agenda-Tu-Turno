import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarMailConfirmacion = async (email, nombre, fecha) => {
    try {
        await resend.emails.send({
            from: 'Turnos <onboarding@resend.dev>',
            to: email,
            subject: '✅ ¡Turno Confirmado!',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #d4af37; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #d4af37;">¡Hola, ${nombre}!</h1>
                    <p>Tu turno ha sido agendado con éxito para el día:</p>
                    <h2 style="background: #fdfaf0; padding: 10px;">${new Date(fecha).toLocaleString()}</h2>
                    <p>Gracias por confiar en nuestra plataforma.</p>
                </div>
            `
        });
        console.log("Email enviado con éxito a:", email);
    } catch (error) {
        console.error("Error enviando email:", error);
    }
};