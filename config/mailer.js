import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Puerto 465 usa SSL
  pool: true,   // Mantener la conexión abierta
  maxConnections: 1,
  maxMessages: Infinity,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000, // Le damos 1 minuto entero
  tls: {
    rejectUnauthorized: false
  }
});

// Verificación con manejo de reconexión
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en mailer.js:', error.message);
  } else {
    console.log('✅ Gmail vinculado y listo para enviar');
  }
});