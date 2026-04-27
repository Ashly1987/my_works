
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const survivalKitFramework = fs.readFileSync('TRAVEL_SURVIVAL_KIT_SKILL.md', 'utf8');

// Notice the target directory is now 'survival_kit'
const dataDir = path.join(__dirname, 'data', 'survival_kit');

// Your full list of countries (including the newly added provinces/states)
const countries = [
  "Afghanistan", "Alabama, USA", "Alaska, USA", "Albania", "Alberta, Canada", "Algeria", "Andaman and Nicobar Islands, India", 
  "Andorra", "Andhra Pradesh, India", "Angola", "Antigua and Barbuda", "Argentina", "Arizona, USA", "Arkansas, USA", 
  "Armenia", "Arunachal Pradesh, India", "Assam, India", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bali, Indonesia", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bihar, India", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Columbia, Canada", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "California, USA", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
  "Chad", "Chandigarh, India", "Chhattisgarh, India", "Chile", "China", "Colombia", "Colorado, USA", "Comoros", 
  "Congo (Congo-Brazzaville)", "Connecticut, USA", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Côte d'Ivoire", 
  "Dadra and Nagar Haveli and Daman and Diu, India", "Delaware, USA", "Delhi, India", "Democratic Republic of the Congo", 
  "Denmark", "District of Columbia, USA", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "Florida, USA", "France", "Gabon", 
  "Gambia", "Georgia", "Georgia, USA", "Germany", "Ghana", "Goa, India", "Greece", "Grenada", "Guatemala", "Guinea", 
  "Guinea-Bissau", "Gujarat, India", "Guyana", "Haiti", "Haryana, India", "Hawaii, USA", "Himachal Pradesh, India", 
  "Honduras", "Hong Kong", "Hungary", "Iceland", "Idaho, USA", "Illinois, USA", "India", "Indiana, USA", "Indonesia", 
  "Iowa, USA", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Jammu and Kashmir, India", "Japan", 
  "Jharkhand, India", "Jordan", "Kansas, USA", "Karnataka, India", "Kazakhstan", "Kentucky, USA", "Kenya", "Kiribati", 
  "Kosovo", "Kuwait", "Kyrgyzstan", "Ladakh, India", "Lakshadweep, India", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Louisiana, USA", "Luxembourg", "Macau", "Madagascar", 
  "Madhya Pradesh, India", "Maine, USA", "Maharashtra, India", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Manipur, India", "Manitoba, Canada", "Marshall Islands", "Maryland, USA", "Massachusetts, USA", "Mauritania", 
  "Mauritius", "Meghalaya, India", "Mexico", "Michigan, USA", "Micronesia", "Minnesota, USA", "Mississippi, USA", 
  "Missouri, USA", "Mizoram, India", "Moldova", "Monaco", "Mongolia", "Montana, USA", "Montenegro", "Morocco", 
  "Mozambique", "Myanmar", "Nagaland, India", "Namibia", "Nauru", "Nebraska, USA", "Nepal", "Netherlands", "Nevada, USA", 
  "New Brunswick, Canada", "New Hampshire, USA", "New Jersey, USA", "New Mexico, USA", "New York, USA", "New Zealand", 
  "Newfoundland and Labrador, Canada", "Nicaragua", "Niger", "Nigeria", "North Carolina, USA", "North Dakota, USA", 
  "North Korea", "North Macedonia", "Northwest Territories, Canada", "Norway", "Nova Scotia, Canada", "Nunavut, Canada", 
  "Odisha, India", "Ohio, USA", "Oklahoma, USA", "Oman", "Ontario, Canada", "Oregon, USA", "Pakistan", "Palau", 
  "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Pennsylvania, USA", "Peru", "Philippines", "Poland", 
  "Portugal", "Prince Edward Island, Canada", "Puducherry, India", "Punjab, India", "Qatar", "Quebec, Canada", 
  "Rajasthan, India", "Rhode Island, USA", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saskatchewan, Canada", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Sikkim, India", "Singapore", "Slovakia", 
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Carolina, USA", "South Dakota, USA", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
  "Tamil Nadu, India", "Tanzania", "Telangana, India", "Tennessee, USA", "Texas, USA", "Thailand", "Timor-Leste", "Togo", 
  "Tonga", "Trinidad and Tobago", "Tripura, India", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Utah, USA", "Uttar Pradesh, India", 
  "Uttarakhand, India", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vermont, USA", "Vietnam", "Virginia, USA", 
  "Washington, USA", "West Bengal, India", "West Virginia, USA", "Western Sahara", "Wisconsin, USA", "Wyoming, USA", 
  "Yemen", "Yukon, Canada", "Zambia", "Zimbabwe"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runWarmup() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    for (const country of countries) {
        const safeName = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filePath = path.join(dataDir, `${safeName}.json`);

        if (fs.existsSync(filePath)) {
            console.log(`⏩ Skipping ${country}: Survival Kit already cached.`);
            continue;
        }

        console.log(`⏳ Generating Survival Kit for ${country} via Gemini 2.5 Flash...`);
        
        // RESTORED PROMPT: Exactly as in your original file
        const prompt = `
<SYSTEM_INSTRUCTION>
You are an expert travel planner. You will generate a tailored survival kit by following the provided framework, strictly applying the overrides below.
</SYSTEM_INSTRUCTION>

<FRAMEWORK_CONTEXT>
${survivalKitFramework}
</FRAMEWORK_CONTEXT>

<STRICT_OVERRIDES>
1. **STARTING LINE:** Do NOT print the country name as plain text at the top. The absolute first line of your output MUST be the H1 header exactly like this: # ${country} TRAVEL SURVIVAL KIT
2. **REMOVE UPDATED DATE:** Completely omit the "Last Updated: October 26, 2023" line (or any date reference) from the introductory section.
3. **CONDENSE SECTIONS 11, 12 & 13:** For Sections 11 (Festivals & Events), 12 (Customs & Etiquette), and 13 (Safety & Practical Info), you MUST keep all Markdown tables exactly as detailed in the framework. However, you must drastically shorten all surrounding paragraphs and bullet lists to be extremely brief (1-2 sentences maximum per subsection). 
4. **THE SAFETY EXCEPTION:** Ignore the shortening rule for the "Personal Safety & Crime Awareness" section. You MUST keep this specific safety section at its full, original, detailed length, preserving all scam warnings, theft advice, and formatting exactly as they are.
5. **COUNTRY NAME:** Replace [COUNTRY NAME] with ${country}.
</STRICT_OVERRIDES>

<OUTPUT_FORMAT>
Output entirely in rich Markdown. Use proper H2 (##) and H3 (###) headers. Use tables and bullet points exactly where requested.
</OUTPUT_FORMAT>

Generate the survival kit for: ${country}.
        `;

       // Add a retry counter inside your loop
let attempts = 0;
const maxAttempts = 3;

while (attempts < maxAttempts) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const resultText = response.text;
        console.log(`✅ Success: ${country} Kit`);
        fs.writeFileSync(filePath, JSON.stringify({ survivalKit: resultText }, null, 2));
        break; // Exit the retry loop on success

    } catch (error) {
        if (error.message.includes('503') || error.message.includes('504')) {
            attempts++;
            console.warn(`⚠️ Server overloaded for ${country}. Retry ${attempts}/${maxAttempts}...`);
            await sleep(15000 * attempts); // Wait longer with each failure (15s, 30s...)
        } else {
            console.error(`❌ Non-retryable error for ${country}:`, error.message);
            break; 
        }
    }
}
    }
    console.log("🏁 All survival kits processed!");
}

runWarmup();