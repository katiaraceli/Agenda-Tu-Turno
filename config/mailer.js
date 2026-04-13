import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Siempre true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000, // Subimos a 30 segundos
  greetingTimeout: 30000,
  socketTimeout: 30000,
  dnsTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com' // Esto ayuda a que el certificado coincida
  }
});
// Verificación de conexión para estar seguros al arrancar
transporter.verify()
    .then(() => console.log('✅ Gmail vinculado y listo para enviar'))
    .catch((err) => console.error('❌ Error en mailer.js:', err.message));