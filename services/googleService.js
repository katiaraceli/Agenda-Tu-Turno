import { google } from "googleapis";
import { config } from "../config/env.js";

export const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.redirectUri
);

// Genera URL de login
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"]
  });
}

// Intercambia código por tokens
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

//  ✅
export const setTokens = (tokens) => {
  oauth2Client.setCredentials(tokens);
};