// Kanva Botanicals Quote Calculator - Configuration
// Version 2.0 - Enhanced with all products and zone-based shipping

const adminConfig = {
    metadata: {
        version: "2.0.0",
        lastUpdated: "2025-01-07",
        company: "Kanva Botanicals"
    },
    
    // Admin access configuration
    adminPassword: "kanva2025!",
    
    // Customer segments
    segments: [
        "smoke and vape shops",
        "convenience stores", 
        "cannabis dispensaries",
        "wholesale distribution",
        "retail customers"
    ],
    
    // Product categories
    categories: {
        shots: "Ready-to-Drink Shots",
        powders: "Kratom Powders"
    }
};

// Product catalog with all items
const products = {
    // Ready-to-Drink Shots
    focus: {
        name: "Focus+Flow",
        category: "shots",
        wholesalePrice: 4.50,
        msrp: 9.99,
        unitsPerDisplayBox: 12,
        displayBoxesPerCase: 12,
        unitsPerCase: 144,
        margin: 54.95,
        description: "Kava + Kratom Extract Blend"
    },
    release: {
        name: "Release+Relax", 
        category: "shots",
        wholesalePrice: 4.50,
        msrp: 9.99,
        unitsPerDisplayBox: 12,
        displayBoxesPerCase: 8,
        unitsPerCase: 96,
        margin: 54.95,
        description: "Kanna + Kava Blend"
    },
    raw: {
        name: "Raw+Releaf",
        category: "shots",
        wholesalePrice: 4.50,
        msrp: 9.99,
        unitsPerDisplayBox: 12,
        displayBoxesPerCase: 12,
        unitsPerCase: 144,
        margin: 54.95,
        description: "Raw Kratom + Kava Extract"
    },
    zoom: {
        name: "Zoom", 
        category: "shots",
        wholesalePrice: 3.10,
        msrp: 6.99,
        unitsPerDisplayBox: 6,
        displayBoxesPerCase: 16,
        unitsPerCase: 96,
        margin: 55.65,
        description: "Pure Kratom Energy Boost"
    },
    mango: {
        name: "Mango",
        category: "shots", 
        wholesalePrice: 3.10,
        msrp: 6.99,
        unitsPerDisplayBox: 6,
        displayBoxesPerCase: 16,
        unitsPerCase: 96,
        margin: 55.65,
        description: "Pure Kava Relaxation"
    },
    
    // Kratom Powders
    green20g: {
        name: "Green Kratom 20g",
        category: "powders",
        wholesalePrice: 2.50,
        msrp: 4.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 250,
        unitsPerCase: 250,
        margin: 49.90,
        description: "Green Vein Kratom Powder"
    },
    red20g: {
        name: "Red Kratom 20g",
        category: "powders",
        wholesalePrice: 2.50,
        msrp: 4.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 250,
        unitsPerCase: 250,
        margin: 49.90,
        description: "Red Vein Kratom Powder"
    },
    white20g: {
        name: "White Kratom 20g",
        category: "powders",
        wholesalePrice: 2.50,
        msrp: 4.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 250,
        unitsPerCase: 250,
        margin: 49.90,
        description: "White Vein Kratom Powder"
    },
    green60g: {
        name: "Green Kratom 60g",
        category: "powders",
        wholesalePrice: 5.00,
        msrp: 9.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.95,
        description: "Green Vein Kratom Powder"
    },
    red60g: {
        name: "Red Kratom 60g",
        category: "powders",
        wholesalePrice: 5.00,
        msrp: 9.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.95,
        description: "Red Vein Kratom Powder"
    },
    white60g: {
        name: "White Kratom 60g",
        category: "powders",
        wholesalePrice: 5.00,
        msrp: 9.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.95,
        description: "White Vein Kratom Powder"
    },
    green120g: {
        name: "Green Kratom 120g",
        category: "powders",
        wholesalePrice: 7.50,
        msrp: 14.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.97,
        description: "Green Vein Kratom Powder"
    },
    red120g: {
        name: "Red Kratom 120g",
        category: "powders",
        wholesalePrice: 7.50,
        msrp: 14.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.97,
        description: "Red Vein Kratom Powder"
    },
    white120g: {
        name: "White Kratom 120g",
        category: "powders",
        wholesalePrice: 7.50,
        msrp: 14.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 125,
        unitsPerCase: 125,
        margin: 49.97,
        description: "White Vein Kratom Powder"
    },
    green250g: {
        name: "Green Kratom 250g",
        category: "powders",
        wholesalePrice: 11.50,
        msrp: 24.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 25,
        unitsPerCase: 25,
        margin: 53.98,
        description: "Green Vein Kratom Powder"
    },
    red250g: {
        name: "Red Kratom 250g",
        category: "powders",
        wholesalePrice: 11.50,
        msrp: 24.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 25,
        unitsPerCase: 25,
        margin: 53.98,
        description: "Red Vein Kratom Powder"
    },
    white250g: {
        name: "White Kratom 250g",
        category: "powders",
        wholesalePrice: 11.50,
        msrp: 24.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 25,
        unitsPerCase: 25,
        margin: 53.98,
        description: "White Vein Kratom Powder"
    },
    green1kg: {
        name: "Green Kratom 1kg",
        category: "powders",
        wholesalePrice: 35.00,
        msrp: 79.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 10,
        unitsPerCase: 10,
        margin: 56.24,
        description: "Green Vein Kratom Powder"
    },
    red1kg: {
        name: "Red Kratom 1kg",
        category: "powders",
        wholesalePrice: 35.00,
        msrp: 79.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 10,
        unitsPerCase: 10,
        margin: 56.24,
        description: "Red Vein Kratom Powder"
    },
    white1kg: {
        name: "White Kratom 1kg",
        category: "powders",
        wholesalePrice: 35.00,
        msrp: 79.99,
        unitsPerDisplayBox: 1,
        displayBoxesPerCase: 10,
        unitsPerCase: 10,
        margin: 56.24,
        description: "White Vein Kratom Powder"
    }
};

// Volume-based pricing tiers
const pricingTiers = {
    tier1: {
        name: "Standard Pricing",
        threshold: 1,
        discount: 0,
        color: "#93D500"
    },
    tier2: {
        name: "Volume Discount",
        threshold: 5,
        discount: 10,
        color: "#7AB500"
    },
    tier3: {
        name: "Wholesale Pricing", 
        threshold: 10,
        discount: 15,
        color: "#5A9500"
    }
};

// Shipping zones by state
const shippingZones = {
    // Zone 1 - Pacific Northwest & Mountain West
    zone1: {
        states: ["ID", "WA", "OR", "MT", "WY", "UT", "NV"],
        percentage: 5,
        color: "#FF6B6B"
    },
    // Zone 2 - West & Southwest
    zone2: {
        states: ["CA", "AZ", "NM", "CO", "ND", "SD", "NE", "KS"],
        percentage: 7,
        color: "#4ECDC4"
    },
    // Zone 3 - Central & South
    zone3: {
        states: ["TX", "OK", "AR", "LA", "MS", "AL", "TN", "KY", "MO", "IA", "MN", "WI", "IL", "IN", "MI", "OH"],
        percentage: 9,
        color: "#FFD93D"
    },
    // Zone 4 - East Coast
    zone4: {
        states: ["FL", "GA", "SC", "NC", "VA", "WV", "MD", "DE", "PA", "NJ", "NY", "CT", "RI", "MA", "VT", "NH", "ME", "DC"],
        percentage: 11,
        color: "#FF5252"
    },
    // Non-contiguous
    special: {
        states: ["AK", "HI"],
        percentage: 15,
        color: "#9C27B0"
    }
};

// Free shipping thresholds
const shippingConfig = {
    freeShippingThreshold: 2500,
    manualOverrideEnabled: true
};

// Tax configuration
const taxConfig = {
    defaultRate: 8.5,
    exemptStates: ["OR", "NH", "DE", "MT", "AK"],
    customRates: {
        "CA": 10.25,
        "NY": 8.0,
        "TX": 6.25,
        "WA": 6.5,
        "FL": 6.0,
        "IL": 6.25,
        "PA": 6.0,
        "OH": 5.75,
        "GA": 4.0,
        "NC": 4.75
    }
};

// US States for dropdown
const usStates = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "DC", name: "District of Columbia" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" }
];

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        adminConfig,
        products,
        pricingTiers,
        shippingZones,
        shippingConfig,
        taxConfig,
        usStates
    };
}
