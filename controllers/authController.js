import { oauth2Client } from "../services/googleService.js";
import fs from 'fs/promises';
import path from 'path';

// 1. Genera la URL para que el usuario (tú) haga login en Google
export const getAuthUrl = (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Importante para obtener el refresh_token
        scope: scopes,
        prompt: 'consent' // Fuerza a Google a darte un refresh_token nuevo
    });
    res.redirect(url);
};

// 2. Recibe el código de Google y guarda el token.json
export const callback = async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Guardamos el token en un archivo para que no se pierda al reiniciar
        await fs.writeFile(path.join(process.cwd(), 'token.json'), JSON.stringify(tokens));
        
        res.send("<h1>¡Autenticación exitosa!</h1><p>Ya puedes cerrar esta pestaña y volver a la app.</p>");
    } catch (error) {
        console.error("❌ Error al obtener token:", error);
        res.status(500).send("Error en la autenticación");
    }
};