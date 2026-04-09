import express from "express";
import cors from "cors";
import { env as config } from "./config/env.js";
import { cargarTokenSiExiste } from "./services/googleService.js"; //  Importá esto

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors());
app.use(express.json()); 

//  Cargar el token apenas arranca
cargarTokenSiExiste(); 

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);


// Usamos el puerto que nos da Render o el 3001 si estamos en casa
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});