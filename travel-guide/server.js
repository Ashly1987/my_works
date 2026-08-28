import express from 'express';
import { app as apiApp } from './functions/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chrome DevTools probes this optional endpoint on localhost. Return a valid
// empty configuration instead of Express's CSP-protected 404 response.
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.json({});
});
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/.netlify/functions', apiApp);
app.use('/', apiApp);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
