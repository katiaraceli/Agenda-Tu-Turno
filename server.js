import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { env as config } from './config/env.js';
import { cargarTokenSiExiste } from './services/googleService.js';
import './config/mailer.js';

import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://miturno-gamma.vercel.app', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Cargamos el token
cargarTokenSiExiste();

// 2. ACTIVAMOS LAS RUTAS (Fundamental para evitar el 404)
app.use('/auth', authRoutes);
app.use('/calendar', calendarRoutes);

// 3. CONFIGURACIÓN DEL PUERTO Y ENCENDIDO (Solo una vez)
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});