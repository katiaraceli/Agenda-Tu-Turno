import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// 1. CONFIRMACIÓN DE TURNO
// ==========================================
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
}; // 

// ==========================================
// 2. CANCELACIÓN DE TURNO (A ambos)
// ==========================================
export const enviarMailCancelacion = async (emailCliente, nombreCliente, fechaTurno, motivo = "No especificado") => {
    const CORREO_ADMIN = 'racelikatia@gmail.com'; // Tu correo de administrador

    try {
        await resend.emails.send({
            from: 'Turnos <onboarding@resend.dev>',
            to: [emailCliente, CORREO_ADMIN], // Envío en paralelo
            subject: '❌ Turno Cancelado',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #cc0000; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #cc0000;">Aviso de Cancelación</h1>
                    <p>El turno correspondiente a <strong>${nombreCliente}</strong> ha sido cancelado.</p>
                    
                    <div style="background: #fff5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><strong>Detalles del turno anulado:</strong></p>
                        <p>🗓️ <strong>Fecha y Hora:</strong> ${new Date(fechaTurno).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>
                        <p>👤 <strong>Cliente:</strong> ${nombreCliente} (${emailCliente})</p>
                        <p>📝 <strong>Motivo/Servicio:</strong> ${motivo}</p>
                    </div>
                    
                    <p style="font-size: 12px; color: #666;">Este es un correo automático enviado tanto al cliente como al administrador del sistema.</p>
                </div>
            `
        });
        console.log(`Email de cancelación enviado correctamente a ${emailCliente} y al Admin.`);
    } catch (error) {
        console.error("❌ Error enviando email de cancelación:", error);
    }
}; 