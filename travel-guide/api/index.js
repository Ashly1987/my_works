import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import axios from 'axios';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

dotenv.config();

const rootDir = process.cwd();
console.log('DEBUG: Server starting. Root Dir:', rootDir);

// Initialize Firebase
const serviceAccount = await (async () => {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log('DEBUG: Parsing service account from env.');
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        const keyPath = path.join(rootDir, 'travel-guide-key.json');
        if (fs.existsSync(keyPath)) {
            console.log('DEBUG: Reading service account from local file.');
            return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        }
        return null;
    } catch (err) {
        console.error('DEBUG ERROR: Firebase Parse failed:', err.message);
        return null;
    }
})();

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('DEBUG: Firebase Admin Initialized.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(rootDir, 'public')));

// Framework loading
const loadFramework = (file) => {
    try {
        const p = path.join(rootDir, file);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    } catch (e) { return ''; }
};

const itineraryFramework = loadFramework('UNIVERSAL_TRAVEL_ITINERARY_SKILL.md');
const survivalKitFramework = loadFramework('TRAVEL_SURVIVAL_KIT_SKILL.md');
const visaFramework = loadFramework('visa_requirements_generic_template.md');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const getCachedData = (dir, country) => {
    const safeName = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const p = path.join(rootDir, 'data', dir, `${safeName}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};

app.post(['/api/generate-itinerary', '/generate-itinerary'], async (req, res) => {
    try {
        const { country } = req.body;
        if (!country) return res.status(400).json({ error: "Country is required" });

        const cached = getCachedData('itinerary', country);
        if (cached) return res.json({ itinerary: cached.itinerary });

        if (!ai) return res.status(404).json({ error: "Destination not in offline database and AI key missing." });

        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a high-depth travel itinerary for ${country} based on the following framework:\n${itineraryFramework}`;
        const result = await model.generateContent(prompt);
        res.json({ itinerary: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(['/api/generate-survival-kit', '/generate-survival-kit'], async (req, res) => {
    try {
        const { country } = req.body;
        if (!country) return res.status(400).json({ error: "Country is required" });

        const cached = getCachedData('survival_kit', country);
        if (cached) return res.json({ survivalKit: cached.survivalKit });

        if (!ai) return res.status(404).json({ error: "Destination not in offline database." });

        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate a travel survival kit for ${country} using this framework:\n${survivalKitFramework}`;
        const result = await model.generateContent(prompt);
        res.json({ survivalKit: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(['/api/generate-visa', '/generate-visa'], async (req, res) => {
    try {
        const { country } = req.body;
        const cached = getCachedData('visa', country);
        if (cached) return res.json({ visa: cached.visa });

        if (!ai) return res.status(404).json({ error: "Visa data not found." });

        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Generate visa requirements for ${country} using this template:\n${visaFramework}`;
        const result = await model.generateContent(prompt);
        res.json({ visa: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(['/api/record-view', '/record-view'], async (req, res) => {
    try {
        if (!serviceAccount) return res.status(200).json({ status: "skipped (no firebase)" });
        const db = admin.firestore();
        const todayKey = new Date().toISOString().slice(0, 10);
        const viewRef = db.collection('quickflixViews').doc(todayKey);
        
        let ip = req.headers['x-forwarded-for'] || req.ip || '';
        if (Array.isArray(ip)) ip = ip[0];
        
        let country = 'Unknown', city = 'Unknown';
        if (ip && ip !== '::1' && ip !== '127.0.0.1' && !ip.startsWith('192.168')) {
            try {
                const geo = await axios.get(`http://ip-api.com/json/${ip}`);
                if (geo.data.status === 'success') {
                    country = geo.data.country;
                    city = geo.data.city;
                }
            } catch (e) {}
        }

        await viewRef.set({ 
            count: admin.firestore.FieldValue.increment(1),
            date: todayKey
        }, { merge: true });

        res.status(200).json({ status: "recorded" });
    } catch (error) {
        res.status(200).json({ status: "error (silent)", error: error.message });
    }
});

app.get(['/api/get-view-reports', '/get-view-reports'], async (req, res) => {
    try {
        if (!serviceAccount) return res.status(200).json({ today: 0, total: 0 });
        const db = admin.firestore();
        const snapshot = await db.collection('quickflixViews').get();
        let total = 0, today = 0;
        const todayKey = new Date().toISOString().slice(0, 10);
        snapshot.forEach(doc => {
            const count = doc.data().count || 0;
            total += count;
            if (doc.id === todayKey) today = count;
        });
        res.json({ today, total });
    } catch (error) {
        res.status(200).json({ today: 0, total: 0 });
    }
});

app.post(['/api/download-pdf', '/download-pdf'], async (req, res) => {
    const { htmlContent, country } = req.body;
    let browser = null;
    try {
        const isProd = !!process.env.VERCEL;
        browser = await puppeteer.launch({
            args: isProd ? chromium.args : ['--no-sandbox'],
            executablePath: isProd ? await chromium.executablePath() : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true
        });
        const page = await browser.newPage();
        await page.setContent(`<html><body><h1>${country}</h1>${htmlContent}</body></html>`);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.contentType("application/pdf");
        res.send(pdf);
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
