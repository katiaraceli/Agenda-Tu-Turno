import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para el puerto 465
  auth: {
    user: 'sistema.turnosapp@gmail.com',
    pass: 'nfwfjngzidgwawtn' 
  }
});

// Verificación de conexión (opcional pero recomendada)
transporter.verify().then(() => {
    console.log('📧 Servidor de correos listo para enviar');
});