import { ai, loadFramework, getCachedData } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        const { country } = req.body;
        if (!country) return res.status(400).json({ error: "Country is required" });
        
        const cached = getCachedData('itinerary', country);
        if (cached) return res.json({ itinerary: cached.itinerary });
        
        if (!ai) return res.status(404).json({ error: "No AI key" });
        
        const itineraryFramework = loadFramework('UNIVERSAL_TRAVEL_ITINERARY_SKILL.md');
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Generate itinerary for ${country} using ${itineraryFramework}`);
        
        res.status(200).json({ itinerary: result.response.text() });
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).json({ error: error.message });
    }
}
