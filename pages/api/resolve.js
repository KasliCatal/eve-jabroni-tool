import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const names = req.body;
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Invalid names array' });
  }

  try {
    const esiBase = 'https://esi.evetech.net/latest';
    const userAgent = 'EveJabroniTool/0.1 (kaslicatal@example.com)'; // Replace with your email
    const npcPricesPath = path.join(process.cwd(), 'data/npc-prices.json');
    const npcPricesRaw = fs.readFileSync(npcPricesPath, 'utf8');
    const npcPrices = JSON.parse(npcPricesRaw);

    const idsRes = await fetch(`${esiBase}/universe/ids/?datasource=tranquility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': userAgent },
      body: JSON.stringify(names)
    });
    if (!idsRes.ok) throw new Error(`ESI ids failed: ${idsRes.status}`);
    const { inventory_types } = await idsRes.json();

    const skillbooks = [];
    for (const { id: type_id, name } of inventory_types || []) {
      const typeRes = await fetch(`${esiBase}/universe/types/${type_id}/?datasource=tranquility`, {
        headers: { 'User-Agent': userAgent }
      });
      if (!typeRes.ok) continue;
      const typeData = await typeRes.json();
      const groupRes = await fetch(`${esiBase}/universe/groups/${typeData.group_id}/?datasource=tranquility`, {
        headers: { 'User-Agent': userAgent }
      });
      if (!groupRes.ok) continue;
      const groupData = await groupRes.json();
      if (groupData.category_id === 16) {
        skillbooks.push({ type_id, name });
      }
    }

    if (skillbooks.length === 0) {
      return res.status(200).json({ betterJita: [], betterNPC: [], totalSavings: 0 });
    }

    const betterJita = [];
    const betterNPC = [];
    let totalSavings = 0;

    for (const { type_id, name } of skillbooks) {
      const npc_price = npcPrices[type_id.toString()] || 0;
      const ordersRes = await fetch(`${esiBase}/markets/10000002/orders/?datasource=tranquility&order_type=sell&type_id=${type_id}`, {
        headers: { 'User-Agent': userAgent }
      });
      if (!ordersRes.ok) continue;
      const orders = await ordersRes.json();
      let jita_price = Infinity;
      let fallback = false;

      const stationOrders = orders.filter(o => !o.is_buy_order && o.location_id === 60003760);
      if (stationOrders.length > 0) {
        jita_price = Math.min(...stationOrders.map(o => o.price));
      } else {
        const regionOrders = orders.filter(o => !o.is_buy_order);
        if (regionOrders.length > 0) {
          jita_price = Math.min(...regionOrders.map(o => o.price));
          fallback = true;
        }
      }

      jita_price = jita_price === Infinity ? 0 : jita_price; // Fallback to 0 if no data
      const savings = npc_price > jita_price ? npc_price - jita_price : 0;
      const item = { name, type_id, jita_price, npc_price, savings, fallback };

      if (jita_price < npc_price && jita_price > 0) {
        betterJita.push(item);
      } else if (npc_price > 0) {
        betterNPC.push(item);
      }
      totalSavings += savings;
    }

    res.status(200).json({ betterJita, betterNPC, totalSavings });
  } catch (err) {
    console.error('Proxy Error:', err.message);
    res.status(500).json({ error: `Proxy failed: ${err.message}` });
  }
}
