import { admin, serviceAccount } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        if (!serviceAccount) return res.status(200).json({ status: "skipped" });
        const db = admin.firestore();
        const todayKey = new Date().toISOString().slice(0, 10);
        const viewRef = db.collection('quickflixViews').doc(todayKey);
        await viewRef.set({ count: admin.firestore.FieldValue.increment(1), date: todayKey }, { merge: true });
        res.status(200).json({ status: "recorded" });
    } catch (error) {
        res.status(200).json({ status: "error" });
    }
}
