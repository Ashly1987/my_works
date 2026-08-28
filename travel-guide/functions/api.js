
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import fs from 'fs';
// Gemini generation is intentionally disabled. The API serves prebuilt JSON only.
// import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestoreDb = null;

// Firebase is optional locally, but required in production for persistent reports.
// A bad environment variable must not prevent the rest of the site from starting.
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const firebaseApp = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.GCP_PROJECT_ID || serviceAccount.project_id,
        });
    firestoreDb = firebaseApp.firestore();
  } catch (error) {
    console.error('Firebase Admin initialization failed. Reports will use temporary memory.', error);
  }
}

export const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// The 'public' folder will be served directly by Netlify's CDN, so we don't need this in the function.
// app.use(express.static(path.join(__dirname, 'public')));

const guideDirectories = {
  itinerary: path.resolve(__dirname, '../data/itinerary'),
  survivalKit: path.resolve(__dirname, '../data/survival_kit'),
  visa: path.resolve(__dirname, '../data/visa'),
};

const toFileSlug = (value) => String(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()
  .replace(/\s/g, '_')
  .replace(/[^a-z0-9_]/g, '_');

const toComparableSlug = (value) => toFileSlug(value).replace(/_+/g, '_');

// To re-enable AI generation in the future, restore the Gemini import above and
// this client/helper. Keep it disabled while the JSON library is the source of truth.
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const generateWithGemini = async (prompt) => {
//   const response = await ai.models.generateContent({
//     model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
//     contents: prompt,
//   });
//   return response.text;
// };

const loadGuide = (guideType, country) => {
  const directory = guideDirectories[guideType];
  const requestedSlug = toFileSlug(country);
  const exactPath = path.join(directory, `${requestedSlug}.json`);
  let filePath = fs.existsSync(exactPath) ? exactPath : null;

  if (!filePath) {
    const comparableSlug = toComparableSlug(country);
    const matches = fs.readdirSync(directory)
      .filter((file) => file.endsWith('.json'))
      .filter((file) => toComparableSlug(file.slice(0, -5)) === comparableSlug);

    if (matches.length === 1) filePath = path.join(directory, matches[0]);
  }

  if (!filePath) return null;

  const guide = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return guide[guideType] || null;
};

const localViewReports = {
    total: 0,
    allDailyViews: {},
};

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const buildViewReport = (viewData = localViewReports) => {
    const todayKey = getDateKey();
    const report = {
        today: viewData.allDailyViews?.[todayKey]?.count || 0,
        total: viewData.total || 0,
        days7: { count: 0 },
        days14: { count: 0 },
        days30: { count: 0 },
        allDailyViews: viewData.allDailyViews || {},
    };

    for (let index = 0; index < 30; index += 1) {
        const date = new Date();
        date.setDate(date.getDate() - index);
        const count = viewData.allDailyViews?.[getDateKey(date)]?.count || 0;

        if (index < 7) report.days7.count += count;
        if (index < 14) report.days14.count += count;
        report.days30.count += count;
    }

    return report;
};

const recordLocalView = (location) => {
    const todayKey = getDateKey();

    if (!localViewReports.allDailyViews[todayKey]) {
        localViewReports.allDailyViews[todayKey] = { count: 0, locations: {} };
    }

    localViewReports.total += 1;
    localViewReports.allDailyViews[todayKey].count += 1;
    localViewReports.allDailyViews[todayKey].locations[location] =
        (localViewReports.allDailyViews[todayKey].locations[location] || 0) + 1;

    return localViewReports;
};

const reportsDocument = () => firestoreDb.collection('analytics').doc('viewReports');

const decodeHeader = (value) => {
    if (!value) return '';
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const getCityLevelLocation = (req) => {
    const city = decodeHeader(req.get('x-vercel-ip-city'));
    const region = decodeHeader(req.get('x-vercel-ip-country-region'));
    const country = decodeHeader(req.get('x-vercel-ip-country'));
    const parts = [city, region, country].filter(Boolean);

    // Vercel derives this from the visitor's IP. It is city-level analytics,
    // not precise browser GPS location.
    return parts.length ? parts.join(', ') : '';
};

app.get('/api/get-view-reports', async (_req, res) => {
    try {
        if (!firestoreDb) return res.json(buildViewReport());

        const snapshot = await reportsDocument().get();
        return res.json(buildViewReport(snapshot.exists ? snapshot.data() : undefined));
    } catch (error) {
        console.error('Unable to read view reports from Firestore.', error);
        return res.status(500).json({ error: 'Unable to load view reports.' });
    }
});

app.post('/api/record-view', async (req, res) => {
    const location = String(
        getCityLevelLocation(req) || req.body?.fallbackLocation || 'Location unavailable',
    ).slice(0, 120);

    try {
        if (!firestoreDb) return res.status(201).json(buildViewReport(recordLocalView(location)));

        const updatedData = await firestoreDb.runTransaction(async (transaction) => {
            const document = reportsDocument();
            const snapshot = await transaction.get(document);
            const viewData = snapshot.exists ? snapshot.data() : { total: 0, allDailyViews: {} };
            const todayKey = getDateKey();
            const allDailyViews = { ...(viewData.allDailyViews || {}) };
            const todayViews = { ...(allDailyViews[todayKey] || { count: 0, locations: {} }) };
            const locations = { ...(todayViews.locations || {}) };

            locations[location] = (locations[location] || 0) + 1;
            allDailyViews[todayKey] = { count: (todayViews.count || 0) + 1, locations };

            const nextData = { total: (viewData.total || 0) + 1, allDailyViews };
            transaction.set(document, {
                ...nextData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return nextData;
        });

        return res.status(201).json(buildViewReport(updatedData));
    } catch (error) {
        console.error('Unable to record view in Firestore.', error);
        return res.status(500).json({ error: 'Unable to record view.' });
    }
});


app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        const itinerary = loadGuide('itinerary', userCountry);
        if (!itinerary) {
            return res.status(404).json({ error: `No itinerary data is available for ${userCountry}.` });
        }
        return res.json({ itinerary });

        // Caching in a serverless environment is tricky. We'll disable it for now.
        // A better approach would be to use a distributed cache like Redis.

        /* Gemini prompt retained for future use (disabled).
        const prompt = `
<SYSTEM_INSTRUCTION>
You are an expert travel planner. You will generate a high-depth itinerary by following the provided framework but applying the STRICT OVERRIDES listed below.
</SYSTEM_INSTRUCTION>

<FRAMEWORK_CONTEXT>
${itineraryFramework}
</FRAMEWORK_CONTEXT>

<STRICT_OVERRIDES>
1. **STARTING LINE:** Do not include any headers like "Sovereign Country," "Southeast Asian Country," or "Date Updated." The very first line of your response must be the name of the country: ${userCountry}.
2. **SECTION 1 — OVERVIEW:** Reduce the description to 3-4 lines based on the important facts.
3. **SECTION 2.2 — FESTIVALS:** Remove the "Travel impact" and "Worth timing your trip" sections.
4. **SECTION 3 — ATTRACTION FORMAT:** You MUST format EVERY attraction EXACTLY like this:
   **[Attraction Name]**: ([distance], [time], [transport])
   [Exactly 1 to 2 lines of description here.]
   * **Rating:** [Score/5] ([Justification])
   * **Duration:** [Time]
   * **Timings:** [Hours]
   * **Entrance Fee:** [Cost]
   * **Pro Tip:** [Your tip here]
5. **REMOVE SECTION 4:** Completely omit "SECTION 4 — RATING METHODOLOGY".
6. **SECTION 5:** Add "Local Transport:" to the Universal Budget Table. COMPLETELY REMOVE section "5.3 Per-Item Cost Breakdown".
7. **SECTION 6:** Keep ONLY "Accommodation" and "Emergency Contacts". Remove all other subsections.
8. **SECTION 7.2:** Remove "Signature Dishes to Try:" and "Local Drinks".
9. **SECTION 8:** Remove "8.1 Universal Rules", the 3-Day Itinerary, and the 10-Day Itinerary.
10. **REMOVE SECTION 9:** Completely omit "SECTION 9 — ETIQUETTE & CULTURAL RESPECT".
11. **SECTION 10:** Keep ONLY "Who this destination suits best:".
12. **SEQUENTIAL NUMBERING:** Re-number all remaining sections (1, 2, 3, 4, 5, 6, 7) so the sequence is unbroken after the removals.
</STRICT_OVERRIDES>

<CONTENT_PRESERVATION_RULE>
Aside from the explicit removals in the 12 rules above, you MUST NOT reduce, summarize, or omit any other content required by the framework. Maintain the full depth and original intended length for all remaining sections to match previously generated itineraries.
</CONTENT_PRESERVATION_RULE>

<OUTPUT_FORMAT>
Output in rich Markdown. Use H2 (##) and H3 (###) headers. Use bullet points for lists and tables where specified. Start the output with the header: # ${userCountry}
</OUTPUT_FORMAT>

Generate the itinerary for: ${userCountry}.
`;

        // const generatedItinerary = await generateWithGemini(prompt);
        // console.log(`✅ Success: Generated itinerary for ${userCountry}.`);

        // res.json({ itinerary: generatedItinerary });
        */

    } catch (error) {
        console.error("❌ Fatal Error: Both models failed.", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStatus = Number(error?.status);
        
        if (errorStatus === 429 || errorStatus === 503 || errorMessage.includes("429") || errorMessage.includes("503")) {
            return res.status(errorStatus || 503).json({
                error: "Our service is currently experiencing high demand. Please wait about 60 seconds and try again." 
            });
        }
        
        res.status(500).json({
            error: "Failed to generate itinerary. Please try again later.",
            // Keep production responses minimal, but make a local setup issue actionable.
            ...(process.env.VERCEL ? {} : { detail: errorMessage }),
        });
    }
});

app.post('/api/generate-visa', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        const visa = loadGuide('visa', userCountry);
        if (!visa) {
            return res.status(404).json({ error: `No visa data is available for ${userCountry}.` });
        }
        return res.json({ visa });

        /* Gemini prompt retained for future use (disabled).
        const prompt = `
<SYSTEM_INSTRUCTION>
You are an expert travel planner and visa consultant. You will generate tailored visa requirements for the requested country by following the provided framework, strictly applying the overrides below.
</SYSTEM_INSTRUCTION>

<FRAMEWORK_CONTEXT>
${visaFramework}
</FRAMEWORK_CONTEXT>

<STRICT_OVERRIDES>
1. Replace [COUNTRY NAME] with ${userCountry}.
2. Ensure the requirements accurately reflect the real-world visa policy for Indian Passport Holders traveling to ${userCountry} as of the current year.
3. Keep the format concise, using Markdown headers, lists, and bold text as in the template.
</STRICT_OVERRIDES>

<OUTPUT_FORMAT>
Output entirely in rich Markdown. Use proper H2 (##) and H3 (###) headers. Use tables and bullet points exactly where requested.
</OUTPUT_FORMAT>

Generate the visa requirements for: ${userCountry}.
`;

        // const generatedVisa = await generateWithGemini(prompt);
        // console.log(`✅ Success: Generated visa requirements for ${userCountry}.`);

        // res.json({ visa: generatedVisa });
        */

    } catch (error) {
        console.error("❌ Fatal Error: Both models failed.", error);
        if (error.status === 429 || error.status === 503 || error.message.includes("429") || error.message.includes("503")) {
            return res.status(error.status || 503).json({ 
                error: "Our service is currently experiencing high demand. Please wait about 60 seconds and try again." 
            });
        }
        res.status(500).json({ error: "Failed to generate visa requirements. Please try again later." });
    }
});


app.post('/api/generate-survival-kit', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        const survivalKit = loadGuide('survivalKit', userCountry);
        if (!survivalKit) {
            return res.status(404).json({ error: `No survival-kit data is available for ${userCountry}.` });
        }
        return res.json({ survivalKit });

        /* Gemini prompt retained for future use (disabled).
        const prompt = `
<SYSTEM_INSTRUCTION>
You are an expert travel planner. You will generate a tailored survival kit by following the provided framework, strictly applying the overrides below.
</SYSTEM_INSTRUCTION>

<FRAMEWORK_CONTEXT>
${survivalKitFramework}
</FRAMEWORK_CONTEXT>

<STRICT_OVERRIDES>
1. **STARTING LINE:** Do NOT print the country name as plain text at the top. The absolute first line of your output MUST be the H1 header exactly like this: # ${userCountry} TRAVEL SURVIVAL KIT
2. **REMOVE UPDATED DATE:** Completely omit the "Last Updated: October 26, 2023" line (or any date reference) from the introductory section.
3. **CONDENSE SECTIONS 11, 12 & 13:** For Sections 11 (Festivals & Events), 12 (Customs & Etiquette), and 13 (Safety & Practical Info), you MUST keep all Markdown tables exactly as detailed in the framework. However, you must drastically shorten all surrounding paragraphs and bullet lists to be extremely brief (1-2 sentences maximum per subsection). 
4. **THE SAFETY EXCEPTION:** Ignore the shortening rule for the "Personal Safety & Crime Awareness" section. You MUST keep this specific safety section at its full, original, detailed length, preserving all scam warnings, theft advice, and formatting exactly as they are.
5. **COUNTRY NAME:** Replace [COUNTRY NAME] with ${userCountry}.
</STRICT_OVERRIDES>

<OUTPUT_FORMAT>
Output entirely in rich Markdown. Use proper H2 (##) and H3 (###) headers. Use tables and bullet points exactly where requested.
</OUTPUT_FORMAT>

Generate the survival kit for: ${userCountry}.
`;

        // const generatedSurvivalKit = await generateWithGemini(prompt);
        // console.log(`✅ Success: Generated survival kit for ${userCountry}.`);

        // res.json({ survivalKit: generatedSurvivalKit });
        */

    } catch (error) {
        console.error("❌ Fatal Error: Both models failed.", error);
        if (error.status === 429 || error.status === 503 || error.message.includes("429") || error.message.includes("503")) {
            return res.status(error.status || 503).json({ 
                error: "Our service is currently experiencing high demand. Please wait about 60 seconds and try again." 
            });
        }
        res.status(500).json({ error: "Failed to generate survival kit. Please try again later." });
    }
});

app.post('/api/download-pdf', async (req, res) => {
    const { htmlContent, country } = req.body;
    let browser;
    
    try {
        if (!htmlContent) return res.status(400).json({ error: 'Document content is required.' });

        // PDF rendering does not use WebGL. Disabling it makes Chromium lighter
        // and more reliable in Vercel's serverless environment.
        chromium.setGraphicsMode = false;
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        const page = await browser.newPage();
        
        await page.setContent(`
            <html>
                <head>
                    <style>
                        body { background: #1a1a1a; color: #f0f0f0; font-family: 'Montserrat', sans-serif; padding: 50px; }
                        h1, h2, h3 { color: #d4af37; font-family: 'Cormorant Garamond', serif; }
                        p, li { color: #a0a0a0; line-height: 1.6; }
                        a { color: #d7b86d; text-decoration: underline; text-underline-offset: 2px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #333; padding: 12px; text-align: left; }
                        th { color: #d4af37; }
                        .content-toc { margin: 20px 0 30px; padding: 16px 18px; border: 1px solid #3b3b3b; background: #202020; }
                        .content-toc__title { margin: 0 0 10px; color: #d7b86d; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
                        .content-toc__links { columns: 2; column-gap: 28px; margin: 0; padding-left: 18px; }
                        .content-toc__links li { break-inside: avoid; margin: 0 0 6px; }
                        .content-toc__links a { color: #d7b86d; text-decoration: none; }
                        .export-credit { margin-top: 42px; padding-top: 14px; border-top: 1px solid #333; text-align: center; color: #999999; font-size: 11px; font-weight: 500; }
                        .export-credit a { color: #999999; text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h1>Lumière | ${country}</h1>
                    ${htmlContent}
                    <div class="export-credit">
                        COPYRIGHT &copy; 2026 - <a href="https://www.instagram.com/ashlydeedward?utm_source=qr" target="_blank" style="color: #d4af37; font-weight: 700;">INSTAGRAM: ASHTAGRAM</a>
                    </div>
                </body>
            </html>
        `, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const footerHtml = `
            <div style="width: 100%; text-align: center; font-size: 11px; color: #999999; font-weight: 500; font-family: sans-serif; padding-bottom: 10px;">
                COPYRIGHT &copy; 2026 - <a href="https://www.instagram.com/ashlydeedward?utm_source=qr" style="color: #d4af37; text-decoration: underline; font-weight: 700;">INSTAGRAM: ASHTAGRAM</a>
            </div>
        `;

        const pdf = await page.pdf({
            format: 'A4',
            margin: { top: '0.5in', right: '0.5in', bottom: '0.8in', left: '0.5in' },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: footerHtml
        });

        res.contentType("application/pdf");
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Could not generate PDF.',
            // This error is surfaced to the site owner to diagnose a missing
            // Chromium runtime dependency. It contains no request content.
            detail: error instanceof Error ? error.message : String(error),
        });
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
});


export const handler = serverless(app);
