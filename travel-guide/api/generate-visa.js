import { ai, loadFramework, getCachedData } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { country } = req.body;
        const cached = getCachedData('visa', country);
        if (cached) return res.json({ visa: cached.visa });
        if (!ai) return res.status(404).json({ error: "No AI key" });
        const visaFramework = loadFramework('visa_requirements_generic_template.md');
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Generate visa for ${country} using ${visaFramework}`);
        res.status(200).json({ visa: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
