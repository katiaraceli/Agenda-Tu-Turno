import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Ojo: false para el puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2" // Forzamos una versión de seguridad moderna
  }
});

// Verificación de conexión para estar seguros al arrancar
transporter.verify()
    .then(() => console.log('✅ Gmail vinculado y listo para enviar'))
    .catch((err) => console.error('❌ Error en mailer.js:', err.message));