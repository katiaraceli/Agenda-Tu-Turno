import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para el puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Aquí usará las 16 letras de Render
  },
  tls: {
    rejectUnauthorized: false // Esto evita que Render bloquee la salida del mail
  }
});

// Verificación de conexión para estar seguros al arrancar
transporter.verify()
    .then(() => console.log('✅ Gmail vinculado y listo para enviar'))
    .catch((err) => console.error('❌ Error en mailer.js:', err.message));