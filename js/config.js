// UPDATED Configuration with REAL Kanva Botanicals pricing data from 2025 sheet

// Admin email list - Add/remove admin users here
const adminEmails = [
    'ben@kanvabotanicals.com',
    'shane@kanvabotanicals.com',
    'rob@cwlbrands.com',
    'corey@cwlbrands.com'
];

// FIXED: Real product catalog with actual pricing from sheet
let adminConfig = {
    products: {
        focus: {
            name: "Focus+Flow",
            price: 4.50,                    // CONFIRMED: $4.50 from sheet
            msrp: 9.99,                     
            unitsPerCase: 144,              // FIXED: 144 units per master case (12x12)
            displayBoxesPerCase: 12,        // FIXED: 12 display boxes per master case
            unitsPerDisplayBox: 12,         // NEW: 12 units per display box
            description: "Kava + Kratom extract blend - #1 selling shot",
            category: "2oz_wellness",
            isBestSeller: true,
            // NEW: Pack dimensions for shipping
            masterCaseDimensions: { length: 14, width: 10, height: 12, weight: 42 },
            displayBoxDimensions: { length: 4, width: 5, height: 7, weight: 3.5 }
        },
        release: {
            name: "Release+Relax", 
            price: 4.50,                    // CONFIRMED: $4.50 from sheet
            msrp: 9.99,                     
            unitsPerCase: 96,               // FIXED: 96 units per master case (8x12)  
            displayBoxesPerCase: 8,         // FIXED: 8 display boxes per master case
            unitsPerDisplayBox: 12,         
            description: "Kanna + Kava blend for stress relief",
            category: "2oz_wellness",
            isBestSeller: false,
            // NEW: Pack dimensions
            masterCaseDimensions: { length: 14, width: 10, height: 8, weight: 28 },
            displayBoxDimensions: { length: 4, width: 5, height: 7, weight: 3.5 }
        },
        zoom: {
            name: "Kanva Zoom",
            price: 3.10,                    // FIXED: $3.10 from sheet (was wrong!)
            msrp: 6.99,                     // FIXED: Lower MSRP for Zoom
            unitsPerCase: 144,              // 144 units per master case
            displayBoxesPerCase: 12,        
            unitsPerDisplayBox: 12,         
            description: "Kratom energy shot",
            category: "energy_shots",
            isBestSeller: false,
            // NEW: Pack dimensions  
            masterCaseDimensions: { length: 9, width: 9, height: 9, weight: 18 },
            displayBoxDimensions: { length: 3, width: 4, height: 5, weight: 2 }
        },
        mango: {
            name: "Mango Extract",
            price: 4.25,                    // From pricing sheet
            msrp: 11.99,                    
            unitsPerCase: 144,              
            displayBoxesPerCase: 12,        
            unitsPerDisplayBox: 12,         
            description: "Mango Extract 12ct shot",
            category: "extract_shots",
            isBestSeller: false,
            // NEW: Pack dimensions
            masterCaseDimensions: { length: 14, width: 10, height: 12, weight: 42 },
            displayBoxDimensions: { length: 4, width: 5, height: 7, weight: 3.5 }
        },
        raw: {
            name: "Raw+Releaf",
            price: 4.50,                    
            msrp: 9.99,                     
            unitsPerCase: 144,              
            displayBoxesPerCase: 12,        
            unitsPerDisplayBox: 12,         
            description: "Pure leaf, pure relief - Kratom leaf + Kava extract",
            category: "2oz_wellness",
            isNewProduct: true,
            // NEW: Pack dimensions
            masterCaseDimensions: { length: 14, width: 10, height: 12, weight: 42 },
            displayBoxDimensions: { length: 4, width: 5, height: 7, weight: 3.5 }
        }
    },

    // FIXED: Volume tier pricing structure from actual sheet
    tiers: {
        tier1: {
            threshold: 0,
            discount: 0,
            name: "Tier 1",
            description: "Standard pricing for 0-55 master cases",
            margin: "10.00%"
        },
        tier2: {
            threshold: 56,                  // FIXED: Starts at 56 MC (was wrong)
            discount: 0.033,                // FIXED: 3.3% discount ($4.50 -> $4.35)
            name: "Tier 2", 
            description: "Volume discount for 56-111 master cases",
            margin: "13.00%"
        },
        tier3: {
            threshold: 112,                 // FIXED: Starts at 112 MC  
            discount: 0.056,                // FIXED: 5.6% discount ($4.50 -> $4.25)
            name: "Tier 3",
            description: "Best pricing for 112+ master cases",
            margin: "15.00%"
        }
    },

    // NEW: Zone-based shipping structure from sheet
    shipping: {
        zones: {
            zone1: {
                name: "Zone 1 (West)",
                states: ['CA', 'NV', 'OR', 'WA', 'ID'],
                rates: {
                    '1-3boxes': 5,
                    '4-8boxes': 10, 
                    '9-11boxes': 10,
                    'mastercase': 20
                }
            },
            zone2: {
                name: "Zone 2 (Mountain)",
                states: ['UT', 'MT', 'WY', 'CO', 'AZ', 'NM'],
                rates: {
                    '1-3boxes': 10,
                    '4-8boxes': 10,
                    '9-11boxes': 15,
                    'mastercase': 20
                }
            },
            zone3: {
                name: "Zone 3 (Central)",
                states: ['ND', 'SD', 'NE', 'KS', 'OK', 'TX', 'MN', 'IA', 'MO', 'AR', 'LA', 'IN', 'WI', 'IL', 'MS', 'AL', 'TN', 'KY'],
                rates: {
                    '1-3boxes': 10,
                    '4-8boxes': 15,
                    '9-11boxes': 20,
                    'mastercase': 25
                }
            },
            zone4: {
                name: "Zone 4 (East)",
                states: ['MI', 'OH', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL', 'DC', 'PA', 'DE', 'MD', 'RI', 'NY', 'CT', 'MA', 'NH', 'VT', 'NJ', 'ME', 'AK', 'HI'],
                rates: {
                    '1-3boxes': 15,
                    '4-8boxes': 20,
                    '9-11boxes': 25,
                    'mastercase': 30
                }
            }
        },
        freeThreshold: 50000,              // Free shipping over $50k
        description: "Zone-based shipping rates by master cases and display boxes"
    },

    // Payment processing rules  
    payment: {
        achThreshold: 10000,               // ACH required over $10k
        acceptedMethods: ['ACH', 'Wire Transfer', 'Company Check'],
        description: "Payment thresholds and accepted methods"
    },

    // FIXED: Maximum retail price guidance per product
    maxRetailPrices: {
        default: 5.00,
        focus: 5.00,        
        release: 5.00,      
        raw: 5.00,          
        zoom: 3.50,                        // FIXED: Lower for Zoom
        mango: 6.00,                       // NEW: Mango pricing
        description: "Maximum recommended retail prices"
    },

    // Email template settings
    emailSettings: {
        companyName: "Kanva Botanicals",
        supportEmail: "sales@kanvabotanicals.com",
        phone: "[PHONE NUMBER]",
        website: "www.kanvabotanicals.com"
    },

    // Feature flags
    features: {
        adminPanel: true,
        emailGeneration: true,
        crmIntegration: true,
        freeShipping: true,
        volumeDiscounts: true,
        zoneShipping: true                 // NEW: Enable zone-based shipping
    },

    // Application metadata
    metadata: {
        version: "2.1.0",                  // Updated version
        lastUpdated: new Date().toISOString(),
        configuredBy: null,
        pricingSheetVersion: "2025-v1"     // NEW: Track pricing sheet version
    }
};

// NEW: Shipping zone detection helper
const ShippingManager = {
    // Get shipping zone for a state
    getZoneForState: function(state) {
        const stateUpper = state.toUpperCase();
        
        for (const [zoneKey, zone] of Object.entries(adminConfig.shipping.zones)) {
            if (zone.states.includes(stateUpper)) {
                return {
                    zone: zoneKey,
                    name: zone.name,
                    rates: zone.rates
                };
            }
        }
        
        // Default to Zone 4 (highest rate) if state not found
        return {
            zone: 'zone4',
            name: adminConfig.shipping.zones.zone4.name,
            rates: adminConfig.shipping.zones.zone4.rates
        };
    },
    
    // Calculate shipping cost based on quantity and zone
    calculateShipping: function(totalDisplayBoxes, totalMasterCases, state) {
        const zoneInfo = this.getZoneForState(state);
        const rates = zoneInfo.rates;
        
        // If customer ordered full master cases, use master case rate
        if (totalMasterCases >= 1) {
            return rates.mastercase * totalMasterCases;
        }
        
        // Otherwise use display box rates
        if (totalDisplayBoxes >= 1 && totalDisplayBoxes <= 3) {
            return rates['1-3boxes'];
        } else if (totalDisplayBoxes >= 4 && totalDisplayBoxes <= 8) {
            return rates['4-8boxes'];
        } else if (totalDisplayBoxes >= 9 && totalDisplayBoxes <= 11) {
            return rates['9-11boxes'];
        }
        
        // Default fallback
        return rates['1-3boxes'];
    },
    
    // Get all zones for dropdown
    getAllZones: function() {
        return Object.entries(adminConfig.shipping.zones).map(([key, zone]) => ({
            value: key,
            label: zone.name,
            states: zone.states
        }));
    }
};

// FIXED: Updated TierManager with correct thresholds
const TierManager = {
    // Get tier for given quantity (FIXED)
    getTier: function(masterCases) {
        const tiers = adminConfig.tiers;
        
        if (masterCases >= tiers.tier3.threshold) return tiers.tier3;
        if (masterCases >= tiers.tier2.threshold) return tiers.tier2;
        return tiers.tier1;
    },

    // Get all tiers
    getAll: function() {
        return adminConfig.tiers;
    },
    
    // Get next tier info for upselling
    getNextTier: function(currentMasterCases) {
        const tiers = adminConfig.tiers;
        
        if (currentMasterCases < tiers.tier2.threshold) {
            return {
                tier: tiers.tier2,
                casesNeeded: tiers.tier2.threshold - currentMasterCases
            };
        } else if (currentMasterCases < tiers.tier3.threshold) {
            return {
                tier: tiers.tier3,
                casesNeeded: tiers.tier3.threshold - currentMasterCases
            };
        }
        
        return null; // Already at highest tier
    }
};

// Keep existing managers but update them
const ConfigManager = {
    // Load configuration from localStorage
    load: function() {
        try {
            const saved = localStorage.getItem('kanvaAdminConfig');
            if (saved) {
                const savedConfig = JSON.parse(saved);
                // Merge saved config with defaults to handle new fields
                adminConfig = this.mergeConfigs(adminConfig, savedConfig);
                console.log('✅ Admin configuration loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading admin configuration:', error);
        }
        return false;
    },

    // Save configuration to localStorage
    save: function(config = adminConfig) {
        try {
            config.metadata.lastUpdated = new Date().toISOString();
            config.metadata.configuredBy = appState.currentUser?.email || 'Unknown';
            localStorage.setItem('kanvaAdminConfig', JSON.stringify(config));
            console.log('✅ Admin configuration saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving admin configuration:', error);
        }
        return false;
    },

    // Merge configurations (saved overwrites defaults)
    mergeConfigs: function(defaultConfig, savedConfig) {
        const merged = { ...defaultConfig };
        
        // Deep merge for nested objects
        for (const key in savedConfig) {
            if (typeof savedConfig[key] === 'object' && !Array.isArray(savedConfig[key])) {
                merged[key] = { ...defaultConfig[key], ...savedConfig[key] };
            } else {
                merged[key] = savedConfig[key];
            }
        }
        
        return merged;
    },

    // Reset to default configuration
    reset: function() {
        try {
            localStorage.removeItem('kanvaAdminConfig');
            console.log('✅ Admin configuration reset to defaults');
            return true;
        } catch (error) {
            console.error('❌ Error resetting admin configuration:', error);
        }
        return false;
    },

    // Validate configuration integrity
    validate: function(config = adminConfig) {
        const errors = [];

        // Validate products
        for (const [key, product] of Object.entries(config.products)) {
            if (!product.name || product.price <= 0 || product.msrp <= 0) {
                errors.push(`Invalid product configuration: ${key}`);
            }
        }

        // Validate tiers  
        if (config.tiers.tier2.threshold <= config.tiers.tier1.threshold ||
            config.tiers.tier3.threshold <= config.tiers.tier2.threshold) {
            errors.push('Invalid tier thresholds');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Get current configuration
    get: function() {
        return adminConfig;
    },

    // Update specific configuration section
    update: function(section, data) {
        if (adminConfig[section]) {
            adminConfig[section] = { ...adminConfig[section], ...data };
            return this.save();
        }
        return false;
    }
};

// Keep existing AuthManager
const AuthManager = {
    // Check if user is admin
    isAdmin: function(email) {
        return adminEmails.includes(email?.toLowerCase());
    },

    // Set current user
    setUser: function(user) {
        appState.currentUser = user;
        appState.isAdmin = this.isAdmin(user?.email);
        console.log(`👤 User set: ${user?.email || 'Unknown'} (Admin: ${appState.isAdmin})`);
    },

    // Get current user
    getUser: function() {
        return appState.currentUser;
    }
};

// Keep existing ProductManager
const ProductManager = {
    // Get all products
    getAll: function() {
        return adminConfig.products;
    },

    // Get specific product
    get: function(productKey) {
        return adminConfig.products[productKey];
    },

    // Get product options for dropdowns
    getOptions: function() {
        return Object.entries(adminConfig.products).map(([key, product]) => ({
            value: key,
            label: `${product.name} ($${product.price})`,
            product: product
        }));
    }
};

// Initialize configuration on script load
console.log('🔧 Initializing Kanva Botanicals configuration with 2025 pricing...');

// Load saved configuration
ConfigManager.load();

// Validate configuration
const validation = ConfigManager.validate();
if (!validation.isValid) {
    console.warn('⚠️  Configuration validation errors:', validation.errors);
}

console.log('✅ Configuration initialized with real 2025 pricing data');
