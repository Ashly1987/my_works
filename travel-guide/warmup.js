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
const itineraryFramework = fs.readFileSync('UNIVERSAL_TRAVEL_ITINERARY_SKILL.md', 'utf8');
const dataDir = path.join(__dirname, 'data', 'itinerary');

// Your full list of 200 countries
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
            console.log(`⏩ Skipping ${country}: Already cached.`);
            continue;
        }

        console.log(`⏳ Generating itinerary for ${country}...`);
        
        const prompt = `
        You are an expert travel planner. 
        Read the following framework and strict guidelines:
        
        ${itineraryFramework}
        
        CRITICAL OVERRIDES - You MUST apply the following modifications to the framework when generating the itinerary:
        1. Remove "Southeast Asian Country Date Updated: October 26, 2023" (if applicable).
        2. In SECTION 1 — OVERVIEW: Reduce the description to 3-4 lines based on the important facts.
        3. In 2.2 Festivals & Events: Remove the "Travel impact" and "Worth timing your trip" sections.
        4. In SECTION 3 — DESTINATION DEEP-DIVES: You MUST format EVERY single attraction EXACTLY like this template. Use bullet points to force line breaks:
           **[Attraction Name]**: ([distance], [time], [transport])
           [Exactly 1 to 2 lines of description here. No more.]
           * **Rating:** [Score/5] ([Justification])
           * **Duration:** [Time]
           * **Timings:** [Hours]
           * **Entrance Fee:** [Cost]
           * **Pro Tip:** [Your tip here]
        5. COMPLETELY REMOVE "SECTION 4 — RATING METHODOLOGY".
        6. In SECTION 5: Add "Local Transport:" to the Universal Budget Table Format section and COMPLETELY REMOVE the "5.3 Per-Item Cost Breakdown" section.
        7. Under SECTION 6 — PRACTICAL TRAVEL INFORMATION: Keep ONLY "Accommodation" and "Emergency Contacts". Remove all other subsections.
        8. Under SECTION 7 — SPECIAL INTEREST EXPERIENCES, in "7.2 Culinary Tourism": Remove "Signature Dishes to Try:" and "Local Drinks (alcoholic + non-alcoholic):".
        9. In SECTION 8 — SUGGESTED ITINERARIES: Remove "8.1 Universal Rules for Itinerary Design (Applied)", the 3-Day Itinerary, and the 10-Day Itinerary.
        10. COMPLETELY REMOVE "SECTION 9 — ETIQUETTE & CULTURAL RESPECT".
        11. In SECTION 10 — FINAL RECOMMENDATIONS: Keep ONLY the "Who this destination suits best:" section.
        12. Keep all the numbering formatted and adjusted sequentially after making these removals.
        
        CONTENT PRESERVATION RULE: 
        Aside from the explicit removals and reductions listed in the 12 rules above, you MUST NOT reduce, summarize, or omit any other content required by the framework. Maintain the full depth, detail, and original intended length for all remaining sections. Do not change the underlying content.

        FORMATTING REQUIREMENT: 
        You MUST output the entire response in rich Markdown format. Use proper H2 (##) and H3 (###) headers for your sections, use bullet points for lists, and use tables where specified. Do not output plain text.

        Generate a comprehensive travel itinerary for: ${country}.
        `;

        try {
            // Attempt with flagship Gemini 2.5 Flash
            let resultText = "";
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                resultText = response.text;
                console.log(`✅ Success: ${country} (Gemini 2.5 Flash)`);
            } catch (e) {
                console.warn(`⚠️ Primary model failed for ${country}. Trying stable fallback using Gemini 3 Flash Preview...`);
                // Fallback to stable Gemini 3 Flash preview
                const fallback = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                });
                resultText = fallback.text;
                console.log(`✅ Success: ${country} (Gemini 3 Flash Preview Fallback)`);
            }

            fs.writeFileSync(filePath, JSON.stringify({ itinerary: resultText }, null, 2));
            
            // Respect rate limits (1,500 daily requests / 15 per minute)
            // Pausing for 6 seconds ensures you stay at 10 requests per minute.
            await sleep(6000); 

        } catch (error) {
            console.error(`❌ Error generating ${country}:`, error.message);
            // If the server is totally down, wait longer before trying the next one
            await sleep(30000);
        }
    }
    console.log("🏁 All countries processed!");
}

runWarmup();