import axios from 'axios';

// Unique skillbook names with costs from EVEMon screenshots (one book per skill needed)
const skillNames = [
  "Infomorph Psychology",
  "Cybernetics",
  "Caldari Frigate",
  "Caldari Destroyer",
  "Caldari Cruiser",
  "Caldari Battlecruiser",
  "Power Grid Management",
  "Shield Upgrades",
  "Weapon Upgrades",
  "Advanced Weapon Upgrades",
  "Energy Grid Upgrades",
  "Tactical Shield Manipulation",
  "Hull Upgrades",
  "Small Hybrid Turret",
  "Medium Hybrid Turret",
  "Medium Railgun Specialization",
  "Drones",
  "Drone Avionics",
  "Light Drone Operation",
  "Minmatar Drone Specialization",
  "Drone Durability",
  "Drone Navigation",
  "Drone Sharpshooting",
  "Drone Interfacing",
  "Capacitor Emission Systems",
  "Shield Emission Systems",
  "Sharpshooter",
  "Electronic Warfare",
  "Capacitor Management",
  "Spaceship Command",
  "Shield Management",
  "Shield Operation",
  "Long Range Targeting",
  "Signature Analysis",
  "Target Management",
  "Thermodynamics",
  "Jury Rigging",
  "Shield Rigging",
  "Surgical Strike",
  "Trajectory Analysis",
  "Rapid Firing",
  "Motion Prediction",
  "Controlled Bursts",
  "Gunnery"
];

const basePrices = {
  "Infomorph Psychology": 1000000,
  "Cybernetics": 100000,
  "Caldari Frigate": 50000,
  "Caldari Destroyer": 100000,
  "Caldari Cruiser": 1000000,
  "Caldari Battlecruiser": 2500000,
  "Power Grid Management": 30000,
  "Shield Upgrades": 100000,
  "Weapon Upgrades": 80000,
  "Advanced Weapon Upgrades": 1000000,
  "Energy Grid Upgrades": 79000,
  "Tactical Shield Manipulation": 210000,
  "Hull Upgrades": 85000,
  "Small Hybrid Turret": 30000,
  "Medium Hybrid Turret": 125000,
  "Medium Railgun Specialization": 5000000,
  "Drones": 30000,
  "Drone Avionics": 60000,
  "Light Drone Operation": 75000,
  "Minmatar Drone Specialization": 10000000,
  "Drone Durability": 100000,
  "Drone Navigation": 100000,
  "Drone Sharpshooting": 150000,
  "Drone Interfacing": 750000,
  "Capacitor Emission Systems": 75000,
  "Shield Emission Systems": 100000,
  "Sharpshooter": 4500000,
  "Electronic Warfare": 200000,
  "Capacitor Management": 200000,
  "Spaceship Command": 30000,
  "Shield Management": 170000,
  "Shield Operation": 55000,
  "Long Range Targeting": 100000,
  "Signature Analysis": 100000,
  "Target Management": 150000,
  "Thermodynamics": 4500000,
  "Jury Rigging": 75000,
  "Shield Rigging": 250000,
  "Surgical Strike": 1500000,
  "Trajectory Analysis": 4500000,
  "Rapid Firing": 75000,
  "Motion Prediction": 75000,
  "Controlled Bursts": 75000,
  "Gunnery": 30000
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let output = '\n=== Jita Multi-Buy List (Cheaper on Market) ===\n';
  const jitaBuyList = [];
  const npcBuyList = [];

  for (const skill of skillNames) {
    const encodedSkill = encodeURIComponent(skill);
    let minPrice = null;

    try {
      const searchResponse = await axios.get(
        `https://esi.evetech.net/latest/search/?categories=inventory_type&datasource=tranquility&language=en&search=${encodedSkill}&strict=true`
      );
      const typeId = searchResponse.data.inventory_type?.[0];
      if (!typeId) {
        output += `No type ID found for ${skill}. Skipping.\n`;
        continue;
      }

      const marketResponse = await axios.get(
        `https://esi.evetech.net/latest/markets/10000002/orders/?datasource=tranquility&order_type=sell&type_id=${typeId}`
      );
      const jitaOrders = marketResponse.data.filter(o => o.system_id === 30000142);
      if (jitaOrders.length) {
        minPrice = Math.min(...jitaOrders.map(o => o.price));
      }
    } catch (error) {
      output += `Error fetching data for ${skill}: ${error.message}\n`;
      continue;
    }

    const base = basePrices[skill] || Infinity;
    if (minPrice !== null && minPrice < base) {
      jitaBuyList.push({ name: skill, qty: 1, price: minPrice });
    } else {
      npcBuyList.push({ name: skill, price: base });
    }
  }

  if (jitaBuyList.length) {
    jitaBuyList.forEach(item => output += `${item.name}\t${item.qty}\n`);
    const totalJita = jitaBuyList.reduce((sum, item) => sum + item.price, 0);
    output += `\nTotal estimated cost: ${totalJita.toLocaleString()} ISK\n`;
  } else {
    output += 'No items cheaper in Jita.\n';
  }

  output += '\n=== NPC Buy List (Cheaper or Only from NPC Schools) ===\n';
  if (npcBuyList.length) {
    npcBuyList.forEach(item => output += `${item.name} - ${item.price.toLocaleString()} ISK\n`);
    output += '\nBuy these manually from an NPC school station (e.g., State War Academy in Saisio for Caldari skills, or any starter system school).\n';
    const totalNpc = npcBuyList.reduce((sum, item) => sum + item.price, 0);
    output += `Total estimated cost: ${totalNpc.toLocaleString()} ISK\n`;
  } else {
    output += 'No items cheaper from NPC.\n';
  }

  const grandTotal = jitaBuyList.reduce((sum, item) => sum + item.price, 0) + npcBuyList.reduce((sum, item) => sum + item.price, 0);
  output += `\nGrand total estimated cost: ${grandTotal.toLocaleString()} ISK\n`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(output);
}
