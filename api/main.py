import requests
import urllib.parse
import io

# List of skillbook names from full Jabroni plan (one each needed)
skill_names = [
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
]

# Fixed NPC seeded prices (from EVE University wiki)
base_prices = {
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
}

def run_skillbook_tool():
    output = io.StringIO()
    jita_buy_list = []  # (name, quantity, min_price)
    npc_buy_list = []   # (name, base_price)

    for skill in skill_names:
        # Get type ID from ESI search (strips level, e.g., "Cybernetics")
        base_skill = skill.rsplit(' ', 1)[0] if ' ' in skill else skill
        encoded_skill = urllib.parse.quote(base_skill)
        search_url = f"https://esi.evetech.net/latest/search/?categories=inventory_type&datasource=tranquility&language=en&search={encoded_skill}&strict=true"
        try:
            response = requests.get(search_url)
            response.raise_for_status()
            data = response.json()
            if 'inventory_type' in data and data['inventory_type']:
                type_id = data['inventory_type'][0]
            else:
                output.write(f"No type ID found for {skill}. Skipping.\n")
                continue
        except Exception as e:
            output.write(f"Error fetching type ID for {skill}: {e}\n")
            continue

        # Get sell orders in The Forge region
        market_url = f"https://esi.evetech.net/latest/markets/10000002/orders/?datasource=tranquility&order_type=sell&type_id={type_id}"
        try:
            response = requests.get(market_url)
            response.raise_for_status()
            orders = response.json()
            # Filter for Jita system only
            jita_orders = [o for o in orders if o['system_id'] == 30000142]
            if jita_orders:
                min_price = min(o['price'] for o in jita_orders)
            else:
                min_price = None
        except Exception as e:
            output.write(f"Error fetching market data for {skill}: {e}\n")
            min_price = None

        # Compare prices
        base = base_prices.get(skill, float('inf'))  # Default to high if missing
        if min_price and min_price < base:
            jita_buy_list.append((skill, 1, min_price))
        else:
            npc_buy_list.append((skill, base))

    # Output results
    output.write("\n=== Jita Multi-Buy List (Cheaper on Market) ===\n")
    if jita_buy_list:
        for name, qty, _ in jita_buy_list:
            output.write(f"{name}\t{qty}\n")  # Copy-paste this block into EVE multi-buy
        total_jita = sum(price for _, _, price in jita_buy_list) if jita_buy_list else 0
        output.write(f"\nTotal estimated cost: {total_jita:,.0f} ISK\n")
    else:
        output.write("No items cheaper in Jita.\n")

    output.write("\n=== NPC Buy List (Cheaper or Only from NPC Schools) ===\n")
    if npc_buy_list:
        for name, price in npc_buy_list:
            output.write(f"{name} - {price:,.0f} ISK\n")
        output.write("\nBuy these manually from an NPC school station (e.g., State War Academy in Saisio for Caldari skills, or any starter system school).\n")
        total_npc = sum(price for _, price in npc_buy_list)
        output.write(f"Total estimated cost: {total_npc:,.0f} ISK\n")
    else:
        output.write("No items cheaper from NPC.\n")

    grand_total = total_jita + sum(price for _, price in npc_buy_list)
    output.write(f"\nGrand total estimated cost: {grand_total:,.0f} ISK\n")

    return output.getvalue()

# Vercel serverless handler
def handler(request, response):
    result = run_skillbook_tool()
    response.set_header('Content-Type', 'text/plain')
    response.send(result)