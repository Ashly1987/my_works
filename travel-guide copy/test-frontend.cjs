const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;
const document = window.document;

// Mock fetch
window.fetch = async (url, options) => {
    if (url === '/api/generate-itinerary') {
        const body = JSON.parse(options.body);
        if (body.country === 'Cambodia') {
            return {
                status: 200,
                json: async () => ({
                    itinerary: fs.readFileSync('data/itinerary/cambodia.json', 'utf8')
                })
            };
        }
    }
    return { status: 404 };
};

setTimeout(() => {
    const searchInput = document.getElementById("destination-search");
    searchInput.value = "Cambodia";
    
    // Create change event
    const event = new window.Event('change');
    searchInput.dispatchEvent(event);
    
    setTimeout(() => {
        const grid = document.getElementById("destinations-grid");
        const tile = grid.querySelector('[data-search="cambodia"]');
        if (tile) {
            const timeSpan = tile.querySelector(".mt-3.flex.flex-wrap.gap-2 span");
            const budgetP = tile.querySelector(".mt-3.text-\\[17px\\]");
            console.log("timeSpan:", timeSpan ? timeSpan.textContent : 'null');
            console.log("budgetP:", budgetP ? budgetP.innerHTML : 'null');
        } else {
            console.log("Tile not found");
        }
    }, 1000);
}, 500);
