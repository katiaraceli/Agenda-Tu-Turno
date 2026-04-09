import express from "express";
import cors from "cors";
import { env as config } from "./config/env.js";
import { cargarTokenSiExiste } from "./services/googleService.js"; 
import "./services/mailer.js"; // Esto ejecuta la verificación automáticamente

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors());
app.use(express.json()); 

// Cargar el token de Google apenas arranca
cargarTokenSiExiste(); 

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});