import express from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
//import puppeteer from 'puppeteer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up static file serving for the 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Read the MD framework when the server starts
const itineraryFramework = fs.readFileSync('UNIVERSAL_TRAVEL_ITINERARY_SKILL.md', 'utf8');
const survivalKitFramework = fs.readFileSync('TRAVEL_SURVIVAL_KIT_SKILL.md', 'utf8');
const visaFramework = fs.readFileSync('visa_requirements_generic_template.md', 'utf8');

app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        // Define the path for the data directory and the specific country file
        const dataDir = path.join(__dirname, 'data', 'itinerary');
        const safeCountryName = userCountry.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filePath = path.join(dataDir, `${safeCountryName}.json`);

        // Check if the file already exists (Cache Hit)
        if (fs.existsSync(filePath)) {
            console.log(`⏩ Serving itinerary for ${userCountry} from cache...`);
            const cachedData = fs.readFileSync(filePath, 'utf8');
            return res.json({ itinerary: JSON.parse(cachedData).itinerary });
        }

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

        let generatedItinerary = "";

        // ==========================================
        // ATTEMPT 1: Try the fast 'flash-2.5' model first
        // ==========================================
        try {
            const flashResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            generatedItinerary = flashResponse.text;
            console.log(`✅ Success: Generated ${userCountry} using Flash 2.5 model.`);

        } catch (flashError) {
            console.warn(`⚠️ Flash 2.5 model failed (${flashError.status || flashError.message}). Attempting seamless fallback to falsh preview 3 model...`);
            
            // ==========================================
            // ATTEMPT 2: Fallback to the '3-flash-preview' model
            // ==========================================
            const proResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            generatedItinerary = proResponse.text;
            console.log(`✅ Success: Generated ${userCountry} using flash 3 preview model fallback.`);
        }

        // Ensure the data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Save the successfully generated itinerary to the cache
        fs.writeFileSync(filePath, JSON.stringify({ itinerary: generatedItinerary }, null, 2), 'utf8');
        console.log(`💾 Saved new itinerary for ${userCountry} to local cache.`);

        // Send to frontend
        res.json({ itinerary: generatedItinerary });

    } catch (error) {
        // This catch block only triggers if BOTH Flash AND Pro completely fail
        console.error("❌ Fatal Error: Both models failed.", error);
        
        // Handle rate limit (429) or Server Overload (503) errors gracefully
        if (error.status === 429 || error.status === 503 || error.message.includes("429") || error.message.includes("503")) {
            return res.status(error.status || 503).json({ 
                error: "Our service is currently experiencing high demand. Please wait about 60 seconds and try again." 
            });
        }
        
        res.status(500).json({ error: "Failed to generate itinerary. Please try again later." });
    }
});

app.post('/api/generate-survival-kit', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        const dataDir = path.join(__dirname, 'data', 'survival_kit');
        const safeCountryName = userCountry.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filePath = path.join(dataDir, `${safeCountryName}.json`);

        if (fs.existsSync(filePath)) {
            console.log(`⏩ Serving survival kit for ${userCountry} from cache...`);
            const cachedData = fs.readFileSync(filePath, 'utf8');
            return res.json({ survivalKit: JSON.parse(cachedData).survivalKit });
        }

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

        let generatedSurvivalKit = "";

        try {
            const flashResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            generatedSurvivalKit = flashResponse.text;
            console.log(`✅ Success: Generated survival kit for ${userCountry} using Flash 2.5 model.`);
        } catch (flashError) {
            console.warn(`⚠️ Flash 2.5 model failed. Attempting seamless fallback to flash 3 preview model...`);
            const proResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            generatedSurvivalKit = proResponse.text;
            console.log(`✅ Success: Generated survival kit for ${userCountry} using flash 3 preview model fallback.`);
        }

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify({ survivalKit: generatedSurvivalKit }, null, 2), 'utf8');
        console.log(`💾 Saved new survival kit for ${userCountry} to local cache.`);

        res.json({ survivalKit: generatedSurvivalKit });

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

import puppeteer from 'puppeteer';


app.post('/api/generate-visa', async (req, res) => {
    try {
        const userCountry = req.body.country;
        if (!userCountry) return res.status(400).json({ error: "Country is required" });

        const dataDir = path.join(__dirname, 'data', 'visa');
        const safeCountryName = userCountry.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filePath = path.join(dataDir, `${safeCountryName}.json`);

        if (fs.existsSync(filePath)) {
            console.log(`⏩ Serving visa for ${userCountry} from cache...`);
            const cachedData = fs.readFileSync(filePath, 'utf8');
            return res.json({ visa: JSON.parse(cachedData).visa });
        }

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

        let generatedVisa = "";

        try {
            const flashResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            generatedVisa = flashResponse.text;
            console.log(`✅ Success: Generated visa requirements for ${userCountry} using Flash 2.5 model.`);
        } catch (flashError) {
            console.warn(`⚠️ Flash 2.5 model failed. Attempting seamless fallback to flash 3 preview model...`);
            const proResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            generatedVisa = proResponse.text;
            console.log(`✅ Success: Generated visa requirements for ${userCountry} using flash 3 preview model fallback.`);
        }

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify({ visa: generatedVisa }, null, 2), 'utf8');
        console.log(`💾 Saved new visa requirements for ${userCountry} to local cache.`);

        res.json({ visa: generatedVisa });

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

app.post('/api/download-pdf', async (req, res) => {
    const { htmlContent, country } = req.body;
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Inject the "Perfect" PDF Styles
        await page.setContent(`
            <html>
                <head>
                    <style>
                        body { background: #1a1a1a; color: #f0f0f0; font-family: 'Montserrat', sans-serif; padding: 50px; }
                        h1, h2, h3 { color: #d4af37; font-family: 'Cormorant Garamond', serif; }
                        p, li { color: #a0a0a0; line-height: 1.6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #333; padding: 12px; text-align: left; }
                        th { color: #d4af37; }
                    </style>
                </head>
                <body>
                    <h1>Lumière | ${country}</h1>
                    ${htmlContent}
                </body>
            </html>
        `);

        const footerHtml = `
            <div style="width: 100%; text-align: center; font-size: 11px; color: #999999; font-weight: 500; font-family: sans-serif; padding-bottom: 10px;">
                COPYRIGHT &copy; 2026 ASH - INSTA: <a href="https://www.instagram.com/ashlydeedward?igsh=MmQ1cG9uMTlmNWc1&amp;utm_source=qr" style="color: #999999; text-decoration: underline;">@ASHTAGRAM</a>
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

        await browser.close();
        res.contentType("application/pdf");
        res.send(pdf);
    } catch (error) {
        res.status(500).send("Error generating PDF");
    }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));