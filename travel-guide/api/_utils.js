import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const rootDir = process.cwd();

// Initialize Firebase
const serviceAccount = (() => {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        const keyPath = path.join(rootDir, 'travel-guide-key.json');
        if (fs.existsSync(keyPath)) {
            return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        }
        return null;
    } catch (err) {
        return null;
    }
})();

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const loadFramework = (file) => {
    try {
        const p = path.join(rootDir, file);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    } catch (e) { return ''; }
};

export const getCachedData = (dir, country) => {
    const safeName = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const p = path.join(rootDir, 'data', dir, `${safeName}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};

export { admin, serviceAccount, rootDir };
