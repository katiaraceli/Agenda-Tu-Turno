import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { cargarTokenSiExiste } from "./services/googleService.js"; // 👈 Importá esto

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors());
app.use(express.json()); 

// 🚀 ¡PASO CLAVE!: Cargar el token apenas arranca
cargarTokenSiExiste(); 

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

app.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
});