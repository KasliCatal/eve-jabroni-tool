export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const names = req.body; // Array from JSON
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Invalid names array' });
  }

  try {
    const esiRes = await fetch('https://esi.evetech.net/latest/universe/ids/?datasource=tranquility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EveJabroniTool/0.1 (contact: your.email@example.com)' // ESI requires, per docs
      },
      body: JSON.stringify(names)
    });
    if (!esiRes.ok) throw new Error(`ESI error: ${esiRes.status}`);
    const data = await esiRes.json();
    res.status(200).json(data); // Return full response, frontend extracts inventory_types
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
