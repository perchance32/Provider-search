// api/maps.js — Vercel serverless proxy for Google Maps APIs
// Your GOOGLE_MAPS_API_KEY env var is never exposed to the browser.

const ALLOWED_ENDPOINTS = ['geocode', 'place/textsearch', 'place/details', 'distancematrix'];
const BASE = 'https://maps.googleapis.com/maps/api';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { endpoint, ...params } = req.query;

  if (!endpoint || !ALLOWED_ENDPOINTS.some(e => endpoint.startsWith(e))) {
    return res.status(400).json({ error: 'Invalid or missing endpoint' });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured on server' });

  const qs = new URLSearchParams({ ...params, key }).toString();
  const url = `${BASE}/${endpoint}/json?${qs}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Upstream request failed', detail: err.message });
  }
}
```

4. Scroll down and click **Commit new file**

After that your repo should have:
```
api/maps.js        ← just created
vercel.json
package.json
