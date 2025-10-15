const axios = require('axios');

// Skillbook names and NPC prices
const skillNames = [
  "Infomorph Psychology",
  "Cybernetics II", "Cybernetics III",
  "Caldari Frigate II", "Caldari Frigate III", "Caldari Frigate IV",
  "Caldari Destroyer I", "Caldari Destroyer II", "Caldari Destroyer III",
  "Caldari Cruiser I", "Caldari Cruiser II", "Caldari Cruiser III", "Caldari Cruiser IV",
  "Caldari Battlecruiser I", "Caldari Battlecruiser II", "Caldari Battlecruiser III", "Caldari Battlecruiser IV",
  "Power Grid Management V",
  "Shield Upgrades III", "Shield Upgrades IV",
  "Weapon Upgrades III", "Weapon Upgrades IV",
  "Advanced Weapon Upgrades I", "Advanced Weapon Upgrades II", "Advanced Weapon Upgrades III",
  "Energy Grid Upgrades II",
  "Tactical Shield Manipulation III", "Tactical Shield Manipulation IV",
  "Hull Upgrades III", "Hull Upgrades IV",
  "Small Hybrid Turret II", "Small Hybrid Turret III",
  "Medium Hybrid Turret I", "Medium Hybrid Turret II", "Medium Hybrid Turret III", "Medium Hybrid Turret IV", "Medium Hybrid Turret V",
  "Medium Railgun Specialization I", "Medium Railgun Specialization II", "Medium Railgun Specialization III",
  "Drones II", "Drones III", "Drones IV", "Drones V",
  "Drone Avionics II", "Drone Avionics III", "Drone Avionics IV",
  "Light Drone Operation I", "Light Drone Operation II", "Light Drone Operation III", "Light Drone Operation IV", "Light Drone Operation V",
  "Minmatar Drone Specialization I", "Minmatar Drone Specialization II",
  "Drone Durability I", "Drone Durability II", "Drone Durability III",
  "Drone Navigation I", "Drone Navigation II", "Drone Navigation III", "Drone Navigation IV",
  "Drone Sharpshooting I", "Drone Sharpshooting II", "Drone Sharpshooting III",
  "Drone Interfacing I", "Drone Interfacing II", "Drone Interfacing III",
  "Capacitor Emission Systems I", "Capacitor Emission Systems II", "Capacitor Emission Systems III", "Capacitor Emission Systems IV",
  "Shield Emission Systems I", "Shield Emission Systems II", "Shield Emission Systems III",
  "Sharpshooter III", "Sharpshooter IV",
  "Electronic Warfare II", "Electronic Warfare III", "Electronic Warfare IV",
  "Capacitor Management IV",
  "Spaceship Command IV",
  "Shield Management III", "Shield Management IV",
  "Shield Operation I", "Shield Operation II", "Shield Operation III", "Shield Operation IV",
  "Long Range Targeting III",
  "Signature Analysis III",
  "Target Management IV",
  "Thermodynamics I", "Thermodynamics II", "Thermodynamics III",
  "Jury Rigging I", "Jury Rigging II", "Jury Rigging III",
  "Shield Rigging I", "Shield Rigging II", "Shield Rigging III",
  "Surgical Strike I", "Surgical Strike II", "Surgical Strike III", "Surgical Strike IV",
  "Trajectory Analysis II", "Trajectory Analysis III", "Trajectory Analysis IV",
  "Rapid Firing III", "Rapid Firing IV",
  "Motion Prediction III", "Motion Prediction IV",
  "Controlled Bursts III", "Controlled Bursts IV",
  "Gunnery V"
];

const basePrices = {
  "Infomorph Psychology": 1000000,
  "Cybernetics II": 100000, "Cybernetics III": 100000,
  "Caldari Frigate II": 50000, "Caldari Frigate III": 50000, "Caldari Frigate IV": 50000,
  "Caldari Destroyer I": 100000, "Caldari Destroyer II": 100000, "Caldari Destroyer III": 100000,
  "Caldari Cruiser I": 1000000, "Caldari Cruiser II": 1000000, "Caldari Cruiser III": 1000000, "Caldari Cruiser IV": 1000000,
  "Caldari Battlecruiser I": 2500000, "Caldari Battlecruiser II": 2500000, "Caldari Battlecruiser III": 2500000, "Caldari Battlecruiser IV": 2500000,
  "Power Grid Management V": 30000,
  "Shield Upgrades III": 100000, "Shield Upgrades IV": 100000,
  "Weapon Upgrades III": 80000, "Weapon Upgrades IV": 80000,
  "Advanced Weapon Upgrades I": 1000000, "Advanced Weapon Upgrades II": 1000000, "Advanced Weapon Upgrades III": 1000000,
  "Energy Grid Upgrades II": 79000,
  "Tactical Shield Manipulation III": 210000, "Tactical Shield Manipulation IV": 210000,
  "Hull Upgrades III": 85000, "Hull Upgrades IV": 85000,
  "Small Hybrid Turret II": 30000, "Small Hybrid Turret III": 30000,
  "Medium Hybrid Turret I": 125000, "Medium Hybrid Turret II": 125000, "Medium Hybrid Turret III": 125000, "Medium Hybrid Turret IV": 125000, "Medium Hybrid Turret V": 125000,
  "Medium Railgun Specialization I": 5000000, "Medium Railgun Specialization II": 5000000, "Medium Railgun Specialization III": 5000000,
  "Drones II": 30000, "Drones III": 30000, "Drones IV": 30000, "Drones V": 30000,
  "Drone Avionics II": 60000, "Drone Avionics III": 60000, "Drone Avionics IV": 60000,
  "Light Drone Operation I": 75000, "Light Drone Operation II": 75000, "Light Drone Operation III": 75000, "Light Drone Operation IV": 75000, "Light Drone Operation V": 75000,
  "Minmatar Drone Specialization I": 10000000, "Minmatar Drone Specialization II": 10000000,
  "Drone Durability I": 100000, "Drone Durability II": 100000, "Drone Durability III": 100000,
  "Drone Navigation I": 100000, "Drone Navigation II": 100000, "Drone Navigation III": 100000, "Drone Navigation IV": 100000,
  "Drone Sharpshooting I": 150000, "Drone Sharpshooting II": 150000, "Drone Sharpshooting III": 150000,
  "Drone Interfacing I": 750000, "Drone Interfacing II": 750000, "Drone Interfacing III": 750000,
  "Capacitor Emission Systems I": 75000, "Capacitor Emission Systems II": 75000, "Capacitor Emission Systems III": 75000, "Capacitor Emission Systems IV": 75000,
  "Shield Emission Systems I": 55000, "Shield Emission Systems II": 100000, "Shield Emission Systems III": 100000,
  "Sharpshooter III": 4500000, "Sharpshooter IV": 4500000,
  "Electronic Warfare II": 200000, "Electronic Warfare III": 200000, "Electronic Warfare IV": 200000,
  "Capacitor Management IV": 200000,
  "Spaceship Command IV": 30000,
  "Shield Management III": 170000, "Shield Management IV": 170000,
  "Shield Operation I": 55000, "Shield Operation II": 55000, "Shield Operation III": 55000, "Shield Operation IV": 55000,
  "Long Range Targeting III": 100000,
  "Signature Analysis III": 100000,
  "Target Management IV": 150000,
  "Thermodynamics I": 4500000, "Thermodynamics II": 4500000, "Thermodynamics III": 4500000,
  "Jury Rigging I": 75000, "Jury Rigging II": 75000, "Jury Rigging III": 75000,
  "Shield Rigging I": 250000, "Shield Rigging II": 250000, "Shield Rigging III": 250000,
  "Surgical Strike I": 1500000, "Surgical Strike II": 1500000, "Surgical Strike III": 1500000, "Surgical Strike IV": 1500000,
  "Trajectory Analysis II": 4500000, "Trajectory Analysis III": 4500000, "Trajectory Analysis IV": 4500000,
  "Rapid Firing III": 75000, "Rapid Firing IV": 75000,
  "Motion Prediction III": 75000, "Motion Prediction IV": 75000,
  "Controlled Bursts III": 75000, "Controlled Bursts IV": 75000,
  "Gunnery V": 30000
};

module.exports = async (req, res) => {
  let output = '\n=== Jita Multi-Buy List (Cheaper on Market) ===\n';
  const jitaBuyList = [];
  const npcBuyList = [];

  for (const skill of skillNames) {
    const baseSkill = skill.includes(' ') ? skill.split(' ')[0] : skill;
    const encodedSkill = encodeURIComponent(baseSkill);
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

  const grandTotal = (jitaBuyList.reduce((sum, item) => sum + item.price, 0) || 0) + (npcBuyList.reduce((sum, item) => sum + item.price, 0) || 0);
  output += `\nGrand total estimated cost: ${grandTotal.toLocaleString()} ISK\n`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(output);
};
