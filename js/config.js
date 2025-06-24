// Configuration and settings for Kanva Botanicals Quote Calculator
// This file contains all admin-configurable variables

// Admin email list - Add/remove admin users here
const adminEmails = [
    'ben@kanvabotanicals.com',
    'shane@kanvabotanicals.com',
    'rob@cwlbrands.com',
    'corey@cwlbrands.com',
  
    // Add more admin emails as needed
];

// Default admin configuration (can be overridden by localStorage)
let adminConfig = {
    // Product catalog with pricing and details
    products: {
        focus: {
            name: "Focus + Flow",
            price: 4.50,
            msrp: 9.99,
            unitsPerCase: 144,
            displayBoxesPerCase: 12,
            description: "Kava + Kratom extract blend for focus and flow"
        },
        release: {
            name: "Release + Relax",
            price: 4.50,
            msrp: 9.99,
            unitsPerCase: 96,
            displayBoxesPerCase: 8,
            description: "Kanna + Kava blend for relaxation"
        },
        zoom: {
            name: "Kanva Zoom",
            price: 3.10,
            msrp: 6.99,
            unitsPerCase: 144,
            displayBoxesPerCase: 12,
            description: "Kratom energy shot with caffeine"
        },
        mango: {
            name: "Mango Extract",
            price: 4.25,
            msrp: 9.99,
            unitsPerCase: 144,
            displayBoxesPerCase: 12,
            description: "Premium kratom extract shot"
        }
    },

    // Volume tier pricing structure
    tiers: {
        tier1: {
            threshold: 0,
            discount: 0,
            name: "Tier 1",
            description: "Standard pricing for orders under 56 cases"
        },
        tier2: {
            threshold: 56,
            discount: 0.035,
            name: "Tier 2", 
            description: "Volume discount for 56-111 cases"
        },
        tier3: {
            threshold: 112,
            discount: 0.06,
            name: "Tier 3",
            description: "Best pricing for 112+ cases"
        }
    },

    // Shipping and logistics settings
    shipping: {
        rate: 0.015,                    // 1.5% of subtotal
        freeThreshold: 50000,           // Free shipping over $50k
        description: "Standard shipping rate and thresholds"
    },

    // Payment processing rules
    payment: {
        achThreshold: 10000,            // ACH required over $10k
        acceptedMethods: ['ACH', 'Wire Transfer', 'Company Check'],
        description: "Payment thresholds and accepted methods"
    },

    // Maximum retail price guidance
    maxRetailPrices: {
        default: 5.00,
        focus: 5.00,
        release: 5.00,
        zoom: 5.00,
        mango: 5.00,
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
        volumeDiscounts: true
    },

    // Application metadata
    metadata: {
        version: "2.0.0",
        lastUpdated: new Date().toISOString(),
        configuredBy: null
    }
};

// Global application state
let appState = {
    // User and authentication
    currentUser: null,
    isAdmin: false,
    isModalMode: false,
    isLeftNav: false,
    appLocation: 'sidebar',

    // Copper SDK integration
    sdk: null,
    copperContext: null,

    // UI state
    currentView: 'calculator',
    adminPanelOpen: false,
    
    // Calculation cache
    lastCalculation: null
};

// Utility functions for configuration management
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

        // Validate shipping
        if (config.shipping.rate < 0 || config.shipping.freeThreshold < 0) {
            errors.push('Invalid shipping configuration');
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

// Authentication helper functions
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

// Product helper functions
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

// Tier calculation helper
const TierManager = {
    // Get tier for given quantity
    getTier: function(masterCases) {
        const tiers = adminConfig.tiers;
        if (masterCases < tiers.tier2.threshold) return tiers.tier1;
        if (masterCases < tiers.tier3.threshold) return tiers.tier2;
        return tiers.tier3;
    },

    // Get all tiers
    getAll: function() {
        return adminConfig.tiers;
    }
};

// Initialize configuration on script load
console.log('🔧 Initializing Kanva Botanicals configuration...');

// Load saved configuration
ConfigManager.load();

// Validate configuration
const validation = ConfigManager.validate();
if (!validation.isValid) {
    console.warn('⚠️  Configuration validation errors:', validation.errors);
}

console.log('✅ Configuration initialized successfully');
