import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env as config } from "./config/env.js";
import { cargarTokenSiExiste } from "./services/googleService.js"; 
import "./services/mailer.js";

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // <--- PASO 1: (la app)

// PASO 2: (configuraciones)
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "."))); //

// PASO 3: Cargamos las direcciones
cargarTokenSiExiste(); 
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

// PASO 4: Arrancamos
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});