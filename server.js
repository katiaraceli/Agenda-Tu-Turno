import express from "express";
import cors from "cors";
import { config } from "./config/env.js";

import authRoutes from "./routes/auth.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

app.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
});