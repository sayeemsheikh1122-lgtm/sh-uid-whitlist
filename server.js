const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ── PROXY ROUTE ────────────────────────────────────────
// Browser call: POST /proxy/add_uid
// Server forwards to HTTP API (no Mixed Content issue)
app.post('/proxy/add_uid', async (req, res) => {
  const TARGET = 'http://cloud.obsidianhosting.xyz:2091/api/free/add_uid';
  try {
    const response = await fetch(TARGET, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body)
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).send('Proxy error: ' + err.message);
  }
});

// Catch-all: return index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UID Portal running on port ${PORT}`);
});
