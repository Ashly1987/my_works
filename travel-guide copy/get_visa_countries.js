const fs = require('fs');

const content = fs.readFileSync('public/index.html', 'utf8');
const match = content.match(/const countries = \[([\s\S]*?)\];/);

if (match) {
    const arrString = '[' + match[1] + ']';
    const countries = eval(arrString);
    
    const visaCountries = new Set();
    
    countries.forEach(countryName => {
        let apiCountryName = countryName;
        const lowerName = countryName.toLowerCase();
        if (lowerName.includes(", usa") || lowerName === "usa") {
          apiCountryName = "USA";
        } else if (lowerName.includes(", india") || lowerName === "india") {
          apiCountryName = "India";
        } else if (lowerName.includes(", canada") || lowerName === "canada") {
          apiCountryName = "Canada";
        } else if (lowerName === "united states of america") {
          apiCountryName = "USA";
        }
        visaCountries.add(apiCountryName);
    });
    
    console.log(Array.from(visaCountries).sort().join(', '));
}
