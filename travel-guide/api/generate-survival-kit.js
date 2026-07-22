import { ai, loadFramework, getCachedData } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { country } = req.body;
        const cached = getCachedData('survival_kit', country);
        if (cached) return res.json({ survivalKit: cached.survivalKit });
        if (!ai) return res.status(404).json({ error: "No AI key" });
        const survivalKitFramework = loadFramework('TRAVEL_SURVIVAL_KIT_SKILL.md');
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Generate survival kit for ${country} using ${survivalKitFramework}`);
        res.status(200).json({ survivalKit: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
