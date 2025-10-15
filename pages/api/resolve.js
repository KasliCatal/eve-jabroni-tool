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

    // Resolve names to type_ids
    const idsRes = await fetch(`${esiBase}/universe/ids/?datasource=tranquility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': userAgent },
      body: JSON.stringify(names)
    });
    if (!idsRes.ok) throw new Error(`ESI ids failed: ${idsRes.status}`);
    const { inventory_types } = await idsRes.json();

    // Filter to only skillbooks (category_id=16)
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

    // Fetch all base_prices (NPC prices)
    const pricesRes = await fetch(`${esiBase}/markets/prices/?datasource=tranquility`, {
      headers: { 'User-Agent': userAgent }
    });
    if (!pricesRes.ok) throw new Error(`ESI prices failed: ${pricesRes.status}`);
    const allPrices = await pricesRes.json();
    const basePricesMap = new Map(allPrices.map(p => [p.type_id, p.base_price]));

    // Fetch Jita prices and compare
    const betterJita = [];
    const betterNPC = [];
    let totalSavings = 0;

    for (const { type_id, name } of skillbooks) {
      const npc_price = basePricesMap.get(type_id) || Infinity;
      const ordersRes = await fetch(`${esiBase}/markets/10000002/orders/?datasource=tranquility&order_type=sell&type_id=${type_id}`, {
        headers: { 'User-Agent': userAgent }
      });
      if (!ordersRes.ok) continue;
      const orders = await ordersRes.json();
      let jita_price = Infinity;
      let fallback = false;

      // Find min price at Jita 4-4 (station_id=60003760)
      const stationOrders = orders.filter(o => !o.is_buy_order && o.location_id === 60003760);
      if (stationOrders.length > 0) {
        jita_price = Math.min(...stationOrders.map(o => o.price));
      } else {
        // Fallback to region min sell
        const regionOrders = orders.filter(o => !o.is_buy_order);
        if (regionOrders.length > 0) {
          jita_price = Math.min(...regionOrders.map(o => o.price));
          fallback = true;
        }
      }

      if (jita_price === Infinity) continue;

      const savings = Math.abs(jita_price - npc_price);
      const item = { name, type_id, jita_price, npc_price, savings, fallback };

      if (jita_price < npc_price) {
        betterJita.push(item);
      } else {
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
