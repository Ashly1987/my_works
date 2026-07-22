import { admin, serviceAccount } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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
        res.status(200).json({ today, total });
    } catch (error) {
        res.status(200).json({ today: 0, total: 0 });
    }
}
