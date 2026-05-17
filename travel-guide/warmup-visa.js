import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { VertexAI } from '@google-cloud/vertexai'; // Using the Cloud SDK
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Vertex AI Client
const vertex_ai = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1' // Standard region for Gemini
});

// Instantiate the model
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-2.5-flash',
});

const visaFramework = fs.readFileSync('visa_requirements_generic_template.md', 'utf8');
const dataDir = path.join(__dirname, 'data', 'visa');

// Your specific list of countries provided for Visa generation
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bali (Indonesia)", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Côte d'Ivoire", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "USA", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runWarmup() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    for (const country of countries) {
        const safeName = country.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const filePath = path.join(dataDir, `${safeName}.json`);

        if (fs.existsSync(filePath)) {
            console.log(`⏩ Skipping ${country}: Visa Info already cached.`);
            continue;
        }

        const prompt = `
<SYSTEM_INSTRUCTION>
You are an expert travel planner and visa consultant. You will generate tailored visa requirements for the requested country by following the provided framework, strictly applying the overrides below.
</SYSTEM_INSTRUCTION>

<FRAMEWORK_CONTEXT>
${visaFramework}
</FRAMEWORK_CONTEXT>

<STRICT_OVERRIDES>
1. Replace [COUNTRY NAME] with ${country}.
2. Ensure the requirements accurately reflect the real-world visa policy for Indian Passport Holders traveling to ${country} as of the current year.
3. Keep the format concise, using Markdown headers, lists, and bold text as in the template.
</STRICT_OVERRIDES>

<OUTPUT_FORMAT>
Output entirely in rich Markdown. Use proper H2 (##) and H3 (###) headers. Use tables and bullet points exactly where requested.
</OUTPUT_FORMAT>

Generate the visa requirements for: ${country}.
        `;

        try {
            console.log(`⏳ Generating Visa Info for ${country} via Vertex AI...`);
            
            // The Vertex AI call structure
            const response = await generativeModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            
            // Extract the text from the Vertex response object
            const resultText = response.response.candidates[0].content.parts[0].text;
            
            console.log(`✅ Success: ${country} Visa`);
            fs.writeFileSync(filePath, JSON.stringify({ visa: resultText }, null, 2));
            
            // Vertex AI gives you massive enterprise rate limits out of the gate
            // 1 second is plenty of breathing room.
            await sleep(1000); 

        } catch (error) {
            console.error(`❌ Error generating Visa for ${country}:`, error.message);
            await sleep(15000);
        }
    }
    console.log("🏁 All visa requirements processed!");
}

runWarmup();