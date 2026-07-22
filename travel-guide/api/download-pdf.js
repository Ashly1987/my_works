import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { htmlContent, country } = req.body;
    let browser = null;
    try {
        const isProd = !!process.env.VERCEL;
        browser = await puppeteer.launch({
            args: isProd ? chromium.args : ['--no-sandbox'],
            executablePath: isProd ? await chromium.executablePath() : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true
        });
        const page = await browser.newPage();
        await page.setContent(`<html><body><h1>${country}</h1>${htmlContent}</body></html>`);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.setHeader("Content-Type", "application/pdf");
        res.status(200).send(pdf);
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
}
