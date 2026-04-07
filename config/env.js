import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || 3001,
    // ✅ NO PONGAS LAS CLAVES ACÁ, USÁ process.env
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
};