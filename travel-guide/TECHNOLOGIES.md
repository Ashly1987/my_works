# Technical Overview: The Monograph Travel Guide

This document outlines the technology stack and architecture used in **The Monograph Travel Guide** project.

## 🏗️ Core Architecture

The project follows a modern client-server architecture with a heavy emphasis on AI-driven content generation and local caching.

- **Frontend:** Single Page Application (SPA) using Vanilla JavaScript and Tailwind CSS.
- **Backend:** Node.js Express server handling AI orchestration, data management, and PDF generation.
- **Cloud Infrastructure:** Google Firebase for database services and potentially hosting/functions.

---

## 💻 Frontend Stack

The frontend is designed with a "Noir" aesthetic, focusing on typography and high-end design.

- **Language:** Vanilla JavaScript (ES6+)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN with Typography plugin)
- **Typography:** [Google Fonts](https://fonts.google.com/)
  - _Serif:_ Noto Serif, Playfair Display, Cormorant Garamond
  - _Sans:_ Manrope, Outfit
  - _Display:_ Cinzel
- **Markdown Rendering:** [Marked.js](https://marked.js.org/) for real-time conversion of AI-generated Markdown to HTML.
- **Iconography:** Google Material Symbols (Outlined).

---

## ⚙️ Backend Stack

The backend acts as the brain of the application, interfacing with AI models and managing the data lifecycle.

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/)
- **AI Integration:** [Google Generative AI SDK](https://github.com/google-gemini/generative-ai-js)
  - Models used: `gemini-2.5-flash`, `gemini-3-flash-preview`
- **PDF Generation:** [Puppeteer](https://pptr.dev/) (Headless Chrome) for high-fidelity HTML-to-PDF conversion with custom branding.
- **HTTP Client:** [Axios](https://axios-http.com/) for external API requests (e.g., Geolocation).
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)

---

## 🗄️ Database & Services

The project leverages Google's cloud ecosystem for data persistence and user analytics.

- **Database:** [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
  - Used for recording page views, tracking user counts, and logging visitor locations (Country/City).
- **Authentication/Admin:** [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- **Geolocation:** [IP-API](https://ip-api.com/) for resolving user IP addresses to geographic locations.

---

## 🤖 AI Capabilities

The application uses a sophisticated prompt-engineering approach to generate structured travel data:

- **Itineraries:** Detailed day-by-day plans based on the `UNIVERSAL_TRAVEL_ITINERARY_SKILL.md` framework.
- **Survival Kits:** Practical country-specific advice based on the `TRAVEL_SURVIVAL_KIT_SKILL.md` framework.
- **Visa Requirements:** Accurate, real-time visa policy information for Indian passport holders.
- **Fallback Mechanism:** A multi-layered fallback system that switches between Gemini models (`2.5-flash` → `3-flash-preview`) to ensure high availability.

---

## 📂 Data Management & Caching

To optimize performance and reduce API costs, the server implements a local file-based caching system:

- **Directory Structure:**
  - `data/itinerary/`: Cached JSON itineraries.
  - `data/survival_kit/`: Cached JSON survival kits.
  - `data/visa/`: Cached JSON visa requirements.
- **Logic:** Before calling the AI, the server checks for a existing `.json` file for the requested country. If found, it serves the cached version (Cache Hit). If not, it generates new content and saves it (Cache Miss).

---

## 🛠️ Development & Tooling

- **Package Manager:** NPM
- **Version Control:** Git
- **Configuration:** `firebase.json`, `.firebaserc` for deployment and infrastructure-as-code.
