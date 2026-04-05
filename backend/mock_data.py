# ==========================================
# STATIC CONTENT & REAL-WORLD FALLBACK DATA
# ==========================================

DISPOSAL_INSTRUCTIONS = {
    "plastic": {
        "category": "Plastic",
        "recyclable": True,
        "hazard_level": "Low",
        "steps": [
            "Rinse out any food or liquid residue thoroughly.",
            "Remove non-plastic components like lids or paper labels.",
            "Crush the item to save space.",
            "Place in the blue municipal recycling bin (Dry Waste)."
        ],
        "warning": "Do not mix with wet kitchen waste."
    },
    "organic": {
        "category": "Organic",
        "recyclable": False,
        "hazard_level": "None",
        "steps": [
            "Ensure no plastic bags or rubber bands are mixed in.",
            "Store in a compostable bag or green bin (Wet Waste).",
            "Can be used for home composting or municipal collection."
        ],
        "warning": "Avoid adding large amounts of dairy or meat to home compost."
    },
    "e-waste": {
        "category": "E-Waste",
        "recyclable": True,
        "hazard_level": "High",
        "steps": [
            "Do not throw in regular trash bins.",
            "Tape over battery terminals.",
            "Take to a specialized e-waste collection center or authorized recycler."
        ],
        "warning": "Lithium batteries can cause fires if crushed in garbage trucks."
    },
    "cardboard": {
        "category": "Cardboard",
        "recyclable": True,
        "hazard_level": "Low",
        "steps": [
            "Remove all packing tape and styrofoam.",
            "Flatten the box completely.",
            "Keep dry; wet cardboard is often rejected by recyclers."
        ],
        "warning": "Pizza boxes with heavy grease belong in the organic bin."
    },
    "metal": {
        "category": "Metal",
        "recyclable": True,
        "hazard_level": "Medium",
        "steps": [
            "Rinse cans to remove food residue.",
            "Place in the blue municipal recycling bin (Dry Waste)."
        ],
        "warning": "Ensure aerosol cans are completely empty before disposal."
    }
}

# REAL-WORLD DELHI-NCR CENTERS (FALLBACKS)
MOCK_CENTERS = [
    {
        "id": "delhi_1",
        "name": "MCD Waste to Energy Plant",
        "address": "Okhla Phase III, New Delhi",
        "lat": 28.5360, 
        "lng": 77.2713, 
        "rating": 4.2,
        "type": "Municipal/Multi-Category"
    },
    {
        "id": "delhi_2",
        "name": "Namo E-Waste Management Ltd",
        "address": "14/1, Main Mathura Rd, Faridabad",
        "lat": 28.3600, 
        "lng": 77.3100, 
        "rating": 4.7,
        "type": "E-Waste Specialist"
    },
    {
        "id": "delhi_3",
        "name": "Attero Recycling Center",
        "address": "H-59, Sector 63, Noida",
        "lat": 28.6210, 
        "lng": 77.3880, 
        "rating": 4.5,
        "type": "E-Waste & Metals"
    },
    {
        "id": "delhi_4",
        "name": "Chintan Environmental Research Group",
        "address": "222, Ratendon Rd, New Delhi",
        "lat": 28.6015,
        "lng": 77.2270,
        "rating": 4.8,
        "type": "Organic & Plastic"
    },
    {
        "id": "delhi_5",
        "name": "SWACHH Multi-Waste Collection Hub",
        "address": "Plot No. 5, Sector 18, Gurugram",
        "lat": 28.4800,
        "lng": 77.0800,
        "rating": 4.1,
        "type": "Multi-Category"
    }
]