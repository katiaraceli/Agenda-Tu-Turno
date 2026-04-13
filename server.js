import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Config
import { env as config } from "./config/env.js";

// Servicios
import { cargarTokenSiExiste } from "./services/googleService.js";
import "./config/mailer.js";

// Rutas
import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

// __dirname (necesario en ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 1. Crear app (SIEMPRE primero)
const app = express();

// ✅ 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ 3. Inicializaciones
cargarTokenSiExiste();

// ✅ 4. Rutas
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

// ✅ 5. Servidor
// ... (tus rutas arriba)

const PORT = process.env.PORT || 10000; // Render usa el 10000 por defecto

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo y escuchando en el puerto ${PORT}`);
});