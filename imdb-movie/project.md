# QuickFlix - Project Technologies

This document outlines the technologies used in the QuickFlix project, detailing how the frontend, backend, and external services work together to deliver a seamless movie search experience.

## Frontend Technologies

- **HTML5:** Forms the structural foundation of the application (`index.html` and `report.html`). It utilizes semantic elements (`<main>`, `<section>`, `<header>`, `<footer>`) for accessibility and `<template>` tags for efficient DOM cloning of movie cards.
- **CSS3:** Handles all styling, layout, and responsive design within `styles.css`. It features custom CSS variables for theming, CSS grid/flexbox for layouts, and incorporates Google Fonts (Fraunces and Manrope).
- **Vanilla JavaScript (ES Modules):** The interactive core of the app is built without heavy frameworks.
  - Uses ES Modules (`type="module"`) for modern code organization.
  - Dynamic imports are used to load the Firebase SDK only when necessary.
  - Leverages the Fetch API for external network requests and `localStorage` as a fallback for the view counter.

## Backend & Services

- **Serverless Functions (Node.js):** The `api/search.js` file acts as a Backend-for-Frontend (BFF). It securely proxies requests to the IMDb and OMDb APIs, hiding API keys (like the OMDb key) from the client and formatting the response before sending it back to the browser.
- **Vercel:** The deployment platform of choice. It hosts the static frontend assets and automatically provisions the serverless functions found in the `api/` directory.
- **Firebase Firestore:** A NoSQL cloud database used to store and retrieve global view counts. The frontend communicates directly with Firestore using transactional updates to ensure accurate counting even with concurrent users.

## External APIs

- **IMDb Suggestion API:** A public API used for auto-complete suggestions on IMDb. QuickFlix uses this to fetch real-time search results, posters, and basic movie metadata.
- **OMDb API:** Used in tandem with the IMDb API to retrieve additional, specific details like the IMDb rating, enriching the data displayed on the movie cards.
