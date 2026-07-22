import express from 'express';
import { handler } from './functions/api.js';

const app = express();

app.use('/.netlify/functions/api', handler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
