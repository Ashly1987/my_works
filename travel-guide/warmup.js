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

const itineraryFramework = fs.readFileSync('UNIVERSAL_TRAVEL_ITINERARY_SKILL.md', 'utf8');
const dataDir = path.join(__dirname, 'data', 'itinerary');

// Your full list of countries
const countries = [
  "Afghanistan",
  "Agra, Uttar Pradesh, India",
  "Ahmedabad, Gujarat, India",
  "Alabama, USA",
  "Alaska, USA",
  "Albania",
  "Alberta, Canada",
  "Alibaug, Maharashtra, India",
  "Algeria",
  "Alleppey, Kerala, India",
  "Amritsar, Punjab, India",
  "Andaman and Nicobar Islands, India",
  "Andorra",
  "Andhra Pradesh, India",
  "Angola",
  "Antigua and Barbuda",
  "Araku Valley, Andhra Pradesh, India",
  "Argentina",
  "Arizona, USA",
  "Arkansas, USA",
  "Armenia",
  "Arunachal Pradesh, India",
  "Assam, India",
  "Auli, Uttarakhand, India",
  "Aurangabad, Maharashtra, India",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bali, Indonesia",
  "Bangalore, Karnataka, India",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhopal, Madhya Pradesh, India",
  "Bhutan",
  "Bhubaneswar, Odisha, India",
  "Bhuj, Gujarat, India",
  "Bihar, India",
  "Bikaner, Rajasthan, India",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "British Columbia, Canada",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "California, USA",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chandigarh, India",
  "Chennai, Tamil Nadu, India",
  "Cherrapunji, Meghalaya, India",
  "Chhattisgarh, India",
  "Chikmagalur, Karnataka, India",
  "Chile",
  "China",
  "Colombia",
  "Colorado, USA",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Connecticut, USA",
  "Coonoor, Tamil Nadu, India",
  "Coorg, India",
  "Coorg, Karnataka, India",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Côte d'Ivoire",
  "Dadra and Nagar Haveli and Daman and Diu, India",
  "Dalhousie, Himachal Pradesh, India",
  "Darjeeling, West Bengal, India",
  "Dawki, Meghalaya, India",
  "Dehradun, Uttarakhand, India",
  "Delaware, USA",
  "Delhi, India",
  "Democratic Republic of the Congo",
  "Denmark",
  "Dharamshala, Himachal Pradesh, India",
  "District of Columbia, USA",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Dwarka, Gujarat, India",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "Florida, USA",
  "France",
  "Gabon",
  "Gambia",
  "Gangtok, Sikkim, India",
  "Gaya, Bihar, India",
  "Georgia",
  "Georgia, USA",
  "Germany",
  "Ghana",
  "Goa, India",
  "Gokarna, Karnataka, India",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Gujarat, India",
  "Gulmarg, Jammu & Kashmir, India",
  "Guwahati, Assam, India",
  "Guyana",
  "Gwalior, Madhya Pradesh, India",
  "Haiti",
  "Hampi, Karnataka, India",
  "Haridwar, Uttarakhand, India",
  "Haryana, India",
  "Hawaii, USA",
  "Himachal Pradesh, India",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Hyderabad, Telangana, India",
  "Iceland",
  "Idaho, USA",
  "Igatpuri, Maharashtra, India",
  "Illinois, USA",
  "India",
  "Indiana, USA",
  "Indore, Madhya Pradesh, India",
  "Indonesia",
  "Iowa, USA",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jaipur, Rajasthan, India",
  "Jaisalmer, Rajasthan, India",
  "Jamaica",
  "Jammu and Kashmir, India",
  "Japan",
  "Jharkhand, India",
  "Jodhpur, Rajasthan, India",
  "Jordan",
  "Jorhat, Assam, India",
  "Kalimpong, West Bengal, India",
  "Kansas, USA",
  "Kanyakumari, Tamil Nadu, India",
  "Karnataka, India",
  "Kasauli, Himachal Pradesh, India",
  "Kasol, Himachal Pradesh, India",
  "Kazakhstan",
  "Kentucky, USA",
  "Kenya",
  "Kerala, India",
  "Khajuraho, Madhya Pradesh, India",
  "Kiribati",
  "Kochi, Kerala, India",
  "Kodaikanal, Tamil Nadu, India",
  "Kohima, Nagaland, India",
  "Kolkata, West Bengal, India",
  "Konark, Odisha, India",
  "Kosovo",
  "Kovalam, Kerala, India",
  "Kumarakom, Kerala, India",
  "Kuwait",
  "Kyrgyzstan",
  "Ladakh, India",
  "Lakshadweep, India",
  "Laos",
  "Latvia",
  "Lebanon",
  "Leh, Ladakh, India",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Lonavala, Maharashtra, India",
  "Louisiana, USA",
  "Lucknow, Uttar Pradesh, India",
  "Luxembourg",
  "Macau",
  "Madagascar",
  "Madhya Pradesh, India",
  "Madurai, Tamil Nadu, India",
  "Mahabaleshwar, Maharashtra, India",
  "Mahabalipuram, Tamil Nadu, India",
  "Maharashtra, India",
  "Maine, USA",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Manali, Himachal Pradesh, India",
  "Manipur, India",
  "Manitoba, Canada",
  "Marshall Islands",
  "Maryland, USA",
  "Massachusetts, USA",
  "Mathura, Uttar Pradesh, India",
  "Mauritania",
  "Mauritius",
  "Meghalaya, India",
  "Mexico",
  "Michigan, USA",
  "Micronesia",
  "Minnesota, USA",
  "Mississippi, USA",
  "Missouri, USA",
  "Mizoram, India",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montana, USA",
  "Montenegro",
  "Morocco",
  "Mount Abu, Rajasthan, India",
  "Mozambique",
  "Mumbai, Maharashtra, India",
  "Munnar, Kerala, India",
  "Mussoorie, Uttarakhand, India",
  "Myanmar",
  "Mysore, Karnataka, India",
  "Nagaland, India",
  "Nainital, Uttarakhand, India",
  "Namibia",
  "Nashik, Maharashtra, India",
  "Nauru",
  "Nebraska, USA",
  "Nepal",
  "Netherlands",
  "Nevada, USA",
  "New Brunswick, Canada",
  "New Delhi, Delhi, India",
  "New Hampshire, USA",
  "New Jersey, USA",
  "New Mexico, USA",
  "New York, USA",
  "New Zealand",
  "Newfoundland and Labrador, Canada",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Carolina, USA",
  "North Dakota, USA",
  "North Korea",
  "North Macedonia",
  "Northwest Territories, Canada",
  "Norway",
  "Nova Scotia, Canada",
  "Nunavut, Canada",
  "Odisha, India",
  "Ohio, USA",
  "Oklahoma, USA",
  "Oman",
  "Ontario, Canada",
  "Ooty, Tamil Nadu, India",
  "Orchha, Madhya Pradesh, India",
  "Oregon, USA",
  "Pachmarhi, Madhya Pradesh, India",
  "Pahalgam, Jammu & Kashmir, India",
  "Pakistan",
  "Palau",
  "Palestine State",
  "Panama",
  "Panchgani, Maharashtra, India",
  "Papua New Guinea",
  "Paraguay",
  "Pelling, Sikkim, India",
  "Pennsylvania, USA",
  "Peru",
  "Philippines",
  "Poland",
  "Pondicherry, India",
  "Portugal",
  "Prince Edward Island, Canada",
  "Puducherry, India",
  "Pune, Maharashtra, India",
  "Punjab, India",
  "Puri, Odisha, India",
  "Pushkar, Rajasthan, India",
  "Qatar",
  "Quebec, Canada",
  "Rajasthan, India",
  "Rameswaram, Tamil Nadu, India",
  "Ranchi, Jharkhand, India",
  "Rhode Island, USA",
  "Rishikesh, Uttarakhand, India",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saskatchewan, Canada",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Shillong, Meghalaya, India",
  "Shimla, Himachal Pradesh, India",
  "Shirdi, Maharashtra, India",
  "Sierra Leone",
  "Sikkim, India",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "Somnath, Gujarat, India",
  "South Africa",
  "South Carolina, USA",
  "South Dakota, USA",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Srinagar, Jammu & Kashmir, India",
  "Sudan",
  "Surat, Gujarat, India",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tamil Nadu, India",
  "Tanzania",
  "Tawang, Arunachal Pradesh, India",
  "Telangana, India",
  "Tennessee, USA",
  "Texas, USA",
  "Thailand",
  "Timor-Leste",
  "Tirupati, Andhra Pradesh, India",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tripura, India",
  "Trivandrum, Kerala, India",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Udaipur, Rajasthan, India",
  "Udupi, Karnataka, India",
  "Uganda",
  "Ujjain, Madhya Pradesh, India",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States of America",
  "Uruguay",
  "Utah, USA",
  "Uttar Pradesh, India",
  "Uttarakhand, India",
  "Uzbekistan",
  "Vadodara, Gujarat, India",
  "Vanuatu",
  "Varanasi, Uttar Pradesh, India",
  "Varkala, Kerala, India",
  "Vatican City",
  "Venezuela",
  "Vermont, USA",
  "Vietnam",
  "Virginia, USA",
  "Visakhapatnam, Andhra Pradesh, India",
  "Vrindavan, Uttar Pradesh, India",
  "Washington, USA",
  "Wayanad, Kerala, India",
  "West Bengal, India",
  "West Virginia, USA",
  "Western Sahara",
  "Wisconsin, USA",
  "Wyoming, USA",
  "Yemen",
  "Yercaud, Tamil Nadu, India",
  "Yukon, Canada",
  "Zambia",
  "Zimbabwe"
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
            console.log(`⏳ Generating itinerary for ${country} via Vertex AI...`);
            
            // The Vertex AI call structure
            const response = await generativeModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            
            // Extract the text from the Vertex response object
            const resultText = response.response.candidates[0].content.parts[0].text;
            
            console.log(`✅ Success: ${country} (Vertex AI)`);
            fs.writeFileSync(filePath, JSON.stringify({ itinerary: resultText }, null, 2));
            
            // Vertex AI gives you massive enterprise rate limits out of the gate
            // 1 second is plenty of breathing room.
            await sleep(1000); 

        } catch (error) {
            console.error(`❌ Error generating itinerary for ${country}:`, error.message);
            await sleep(15000);
        }
    }
    console.log("🏁 All countries processed!");
}

runWarmup();