import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Las 16 letras de Google
  }
});

// Verificación de conexión para estar seguros al arrancar
transporter.verify()
    .then(() => console.log('✅ Gmail vinculado y listo para enviar'))
    .catch((err) => console.error('❌ Error en mailer.js:', err.message));