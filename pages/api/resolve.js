export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const names = req.body;
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Invalid names array' });
  }

  try {
    const esiUrl = 'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility';
    const esiRes = await fetch(esiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EveJabroniTool/0.1 (kaslicatal@example.com)' // Replace with your contact; required for ESI compliance
      },
      body: JSON.stringify(names)
    });

    if (!esiRes.ok) {
      const errorText = await esiRes.text(); // Get body for details
      console.error('ESI Error:', esiRes.status, errorText); // Logs to Vercel for debug
      return res.status(502).json({ error: `ESI failed: ${esiRes.status} - ${errorText}` });
    }

    const data = await esiRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Proxy Error:', err.message); // Logs full error
    res.status(500).json({ error: `Proxy failed: ${err.message}` });
  }
}
