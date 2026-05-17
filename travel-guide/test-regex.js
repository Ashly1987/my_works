const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/itinerary/cambodia.json', 'utf8'));
const text = data.itinerary;
const peakMatch = text.match(/\|\s*Peak\s*\|\s*([^|]+)\s*\|/);
console.log("peakMatch:", peakMatch ? peakMatch[1] : "null");
const budgetMatch = text.match(/\|\s*\*\*(?:[0-9]+-Day)?\s*Total\*\*\s*\|.*?\|\s*\*\*(.+?)\*\*\s*\|/);
console.log("budgetMatch:", budgetMatch ? budgetMatch[1] : "null");
