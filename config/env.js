// config/env.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: 3001,
  clientId: "645274224027-bfi5mgiqpqldtcngntnn466gsr3ibtta.apps.googleusercontent.com",
  clientSecret: "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",
  redirectUri: "http://localhost:3001/auth/callback"
};