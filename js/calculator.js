// Core calculation engine for Kanva Botanicals Quote Calculator
// Handles all pricing calculations, tier logic, and quote generation

const Calculator = {
    // Main calculation function
    calculateOrder: function() {
        try {
            // Get form values
            const productKey = this.getElementValue('primaryProduct') || this.getElementValue('sidebarProduct');
            const masterCases = parseInt(this.getElementValue('masterCases') || this.getElementValue('sidebarCases')) || 0;
            const displayBoxes = parseInt(this.getElementValue('displayBoxes')) || 0;
            
            if (!productKey || (masterCases <= 0 && displayBoxes <= 0)) {
                return this.createEmptyResult();
            }

            // Get product and calculate total quantity for tier determination
            const product = ProductManager.get(productKey);
            if (!product) {
                console.error('Product not found:', productKey);
                return this.createEmptyResult();
            }

            // Calculate total display boxes for tier calculation
            const totalDisplayBoxes = (masterCases * product.displayBoxesPerCase) + displayBoxes;
            const equivalentMasterCases = totalDisplayBoxes / product.displayBoxesPerCase;
            const tierInfo = TierManager.getTier(Math.floor(equivalentMasterCases));
            
            // Calculate pricing based on correct unit structure
            const unitPrice = product.price * (1 - tierInfo.discount);
            const displayBoxPrice = unitPrice * product.unitsPerDisplayBox;
            const casePrice = unitPrice * product.unitsPerCase;
            
            // Calculate totals
            const totalUnits = (masterCases * product.unitsPerCase) + (displayBoxes * product.unitsPerDisplayBox);
            const subtotal = (masterCases * casePrice) + (displayBoxes * displayBoxPrice);
            
            // Calculate shipping based on LTL percentage and selected zone
            let shipping = 0;
            const selectedState = this.getElementValue('customerState');
            if (selectedState && subtotal > 0) {
                const shippingZone = this.getShippingZone(selectedState);
                if (shippingZone) {
                    // For LTL shipping (full cases), use percentage
                    if (masterCases > 0) {
                        shipping = subtotal * (shippingZone.ltlPercentage / 100);
                    } else if (displayBoxes > 0) {
                        // For display box only orders, use standard shipping rates
                        shipping = this.getStandardShipping(displayBoxes, shippingZone);
                    }
                }
            }
            
            // Check for manual shipping override
            const manualShipping = parseFloat(this.getElementValue('manualShipping')) || 0;
            if (manualShipping > 0) {
                shipping = manualShipping;
            }
            
            // Calculate credit card fee (3% of subtotal + shipping)
            const creditCardFee = (subtotal + shipping) * 0.03;
            
            const total = subtotal + shipping + creditCardFee;

            // Create result object
            const result = {
                product,
                tierInfo,
                masterCases,
                displayBoxes,
                unitPrice: this.formatCurrency(unitPrice),
                displayBoxPrice: this.formatCurrency(displayBoxPrice),
                casePrice: this.formatCurrency(casePrice),
                totalUnits,
                subtotal: this.formatCurrency(subtotal),
                shipping: this.formatCurrency(shipping),
                creditCardFee: this.formatCurrency(creditCardFee),
                total: this.formatCurrency(total),
                freeShipping: false,
                // Raw values for calculations
                raw: {
                    unitPrice,
                    displayBoxPrice,
                    casePrice,
                    subtotal,
                    shipping,
                    creditCardFee,
                    total
                }
            };

            // Cache the calculation
            appState.lastCalculation = result;
            
            return result;
        } catch (error) {
            console.error('Calculation error:', error);
            return this.createEmptyResult();
        }
    },

    // Helper function to get element value safely
    getElementValue: function(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : null;
    },
    
    // Get shipping zone for a given state
    getShippingZone: function(state) {
        // Load shipping data from JSON
        if (!this.shippingData) {
            // This would normally be loaded from shipping.json
            // For now, we'll use a basic lookup
            const zones = {
                west: { states: ["CA", "NV", "OR", "WA", "ID", "AZ", "UT"], ltlPercentage: 1.0, name: "West" },
                mountain: { states: ["MT", "WY", "CO", "NM"], ltlPercentage: 1.0, name: "Mountain" },
                southwest: { states: ["TX", "OK", "KS", "NE", "AR", "LA", "MS"], ltlPercentage: 1.5, name: "Southwest" },
                midwest: { states: ["ND", "SD", "MN", "IA", "MO", "WI", "IL", "IN", "MI", "OH"], ltlPercentage: 1.5, name: "Midwest" },
                southeast: { states: ["AL", "TN", "KY", "WV", "VA", "NC", "SC", "GA", "FL"], ltlPercentage: 2.0, name: "Southeast" },
                northeast: { states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "DE", "MD", "DC"], ltlPercentage: 2.0, name: "Northeast" },
                remote: { states: ["AK", "HI"], ltlPercentage: 2.0, name: "Remote" }
            };
            this.shippingData = zones;
        }
        
        // Find zone for the given state
        for (const [zoneKey, zone] of Object.entries(this.shippingData)) {
            if (zone.states.includes(state)) {
                return zone;
            }
        }
        
        return null;
    },

    // Get standard shipping for display box orders
    getStandardShipping: function(displayBoxes, shippingZone) {
        // Load shipping data to get standard rates
        if (typeof ShippingManager !== 'undefined' && ShippingManager.getStandardShipping) {
            return ShippingManager.getStandardShipping(displayBoxes, shippingZone.name.toLowerCase());
        }
        
        // Fallback to hardcoded rates if ShippingManager not available
        const standardRates = {
            west: { base: 15.00, perBox: 8.50 },
            mountain: { base: 18.00, perBox: 10.00 },
            southwest: { base: 22.00, perBox: 12.50 },
            midwest: { base: 25.00, perBox: 15.00 },
            southeast: { base: 28.00, perBox: 17.50 },
            northeast: { base: 32.00, perBox: 20.00 },
            remote: { base: 40.00, perBox: 25.00 }
        };
        
        const zoneName = shippingZone.name.toLowerCase();
        const rates = standardRates[zoneName] || standardRates.remote;
        
        // Calculate shipping: base rate + per display box rate
        return rates.base + (displayBoxes * rates.perBox);
    },

    // Create empty result for error cases
    createEmptyResult: function() {
        return {
            product: null,
            tierInfo: null,
            masterCases: 0,
            displayBoxes: 0,
            unitPrice: '$0.00',
            displayBoxPrice: '$0.00',
            casePrice: '$0.00',
            totalUnits: 0,
            subtotal: '$0.00',
            shipping: '$0.00',
            creditCardFee: '$0.00',
            total: '$0.00',
            freeShipping: false,
            // Raw values for calculations
            raw: {
                unitPrice: 0,
                displayBoxPrice: 0,
                casePrice: 0,
                subtotal: 0,
                shipping: 0,
                creditCardFee: 0,
                total: 0
            }
        };
    },

    // Format currency values
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Format large numbers with commas
    formatNumber: function(number) {
        return new Intl.NumberFormat('en-US').format(number);
    },

    // Update main calculator results display
    updateResults: function() {
        const resultsContainer = document.getElementById('calculationResults');
        if (!resultsContainer) return;
        
        const calc = this.calculateOrder();
        if (!calc.product) return;

        // Calculate next tier information
        const currentTierName = calc.tierInfo.name;
        const nextTierThreshold = this.getNextTierThreshold(calc.tierInfo);
        const hasNextTier = nextTierThreshold > 0;

        resultsContainer.innerHTML = `
            <div class="calculation-summary">
                <p><strong>${calc.product.name} - ${calc.masterCases} Master Cases, ${calc.displayBoxes} Display Boxes</strong></p>
                <p>📦 <strong>${this.formatNumber(calc.displayBoxes + (calc.masterCases * calc.product.displayBoxesPerCase))}</strong> Display Boxes | <strong>${this.formatNumber(calc.totalUnits)}</strong> Individual Units</p>
                <p>💰 Unit Price: <strong>${calc.unitPrice}</strong> | Display Box Price: <strong>${calc.displayBoxPrice}</strong> | Case Price: <strong>${calc.casePrice}</strong></p>
                <p>📊 Subtotal: <strong>${calc.subtotal}</strong></p>
                <p>🚚 Shipping: <strong>${calc.shipping}</strong></p>
                <p>💳 Credit Card Fee: <strong>${calc.creditCardFee}</strong></p>
                <p class="total-amount" style="font-size: 18px; color: #17351A; font-weight: bold; background: linear-gradient(135deg, #e8f5e8 0%, #d4f4d4 100%); padding: 8px 12px; border-radius: 6px; border: 1px solid #93D500;">💳 TOTAL: ${calc.total}</p>
            </div>
        `;

        // Update tier information
        this.updateTierInfo(calc, hasNextTier, nextTierThreshold);
    },

    // Update tier information display
    updateTierInfo: function(calc, hasNextTier, nextTierThreshold) {
        const tierContainer = document.getElementById('tierInfo');
        if (!tierContainer) return;

        const tierNumber = calc.tierInfo.name.split(' ')[1];
        const tierClass = `tier${tierNumber}`;
        const savingsText = calc.tierInfo.discount > 0 ? 
            ` (${(calc.tierInfo.discount * 100).toFixed(1)}% savings)` : '';
        
        const nextTierText = hasNextTier ? 
            `<br><small>📈 Order ${nextTierThreshold}+ cases to qualify for better pricing</small>` : 
            '<br><small>🎉 You\'re already getting our best pricing!</small>';

        tierContainer.innerHTML = `
            <div class="tier-display">
                <span class="pricing-tier ${tierClass}">${calc.tierInfo.name}</span> pricing applied${savingsText}
                ${nextTierText}
            </div>
        `;
    },

    // Get next tier threshold
    getNextTierThreshold: function(currentTier) {
        const tiers = adminConfig.tiers;
        if (currentTier.name === "Tier 1") return tiers.tier2.threshold;
        if (currentTier.name === "Tier 2") return tiers.tier3.threshold;
        return 0; // Already at highest tier
    },

    // Update sidebar results (compact version)
    updateSidebarResults: function() {
        const resultsContainer = document.getElementById('sidebarResults');
        if (!resultsContainer) return;
        
        const calc = this.calculateOrder();
        if (!calc.product) return;

        resultsContainer.innerHTML = `
            <div class="sidebar-summary">
                <p><strong>${calc.product.name}</strong></p>
                <p>💰 <strong>${calc.unitPrice}</strong> per unit</p>
                <p>📦 <strong>${calc.masterCases}</strong> Master Cases, <strong>${calc.displayBoxes}</strong> Display Boxes</p>
                <p style="color: #17351A; font-weight: bold;">Total: ${calc.total}</p>
                <p style="font-size: 11px; color: #4D5358;">${calc.tierInfo.name} pricing</p>
            </div>
        `;
    },

    // Get calculation summary for email generation
    getCalculationSummary: function() {
        return this.calculateOrder();
    },

    // Validate calculation inputs
    validateInputs: function(productKey, masterCases, displayBoxes) {
        const errors = [];

        if (!productKey) {
            errors.push('Please select a product');
        }

        if (!masterCases && !displayBoxes) {
            errors.push('Please enter a valid number of master cases or display boxes');
        }

        if (masterCases > 1000) {
            errors.push('Master cases cannot exceed 1000');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Get calculation summary for external use
    getCalculationSummaryExternal: function() {
        const calc = this.calculateOrder();
        if (!calc.product) return null;

        return {
            productName: calc.product.name,
            quantity: calc.masterCases + (calc.displayBoxes / calc.product.displayBoxesPerCase),
            unitPrice: calc.raw.unitPrice,
            total: calc.raw.total,
            tierName: calc.tierInfo.name,
            freeShipping: calc.freeShipping
        };
    },

    // Calculate profit margins
    calculateMargins: function() {
        const calc = this.calculateOrder();
        if (!calc.product) return null;

        const wholesalePrice = calc.raw.unitPrice;
        const msrp = calc.product.msrp;
        const margin = ((msrp - wholesalePrice) / msrp) * 100;

        return {
            wholesalePrice,
            msrp,
            margin: Math.round(margin * 100) / 100,
            profitPerUnit: msrp - wholesalePrice
        };
    },

    // Initialize calculator event listeners
    initializeEventListeners: function() {
        // Main calculator inputs
        const masterCasesInput = document.getElementById('masterCases');
        const productSelect = document.getElementById('primaryProduct');
        const displayBoxesInput = document.getElementById('displayBoxes');

        if (masterCasesInput) {
            masterCasesInput.addEventListener('input', () => this.updateResults());
            masterCasesInput.addEventListener('change', () => this.updateResults());
        }

        if (productSelect) {
            productSelect.addEventListener('change', () => this.updateResults());
        }

        if (displayBoxesInput) {
            displayBoxesInput.addEventListener('input', () => this.updateResults());
            displayBoxesInput.addEventListener('change', () => this.updateResults());
        }

        // Sidebar inputs
        const sidebarCasesInput = document.getElementById('sidebarCases');
        const sidebarProductSelect = document.getElementById('sidebarProduct');
        const sidebarDisplayBoxesInput = document.getElementById('sidebarDisplayBoxes');

        if (sidebarCasesInput) {
            sidebarCasesInput.addEventListener('input', () => this.updateSidebarResults());
            sidebarCasesInput.addEventListener('change', () => this.updateSidebarResults());
        }

        if (sidebarProductSelect) {
            sidebarProductSelect.addEventListener('change', () => this.updateSidebarResults());
        }

        if (sidebarDisplayBoxesInput) {
            sidebarDisplayBoxesInput.addEventListener('input', () => this.updateSidebarResults());
            sidebarDisplayBoxesInput.addEventListener('change', () => this.updateSidebarResults());
        }

        console.log('✅ Calculator event listeners initialized');
    },

    // Update max retail price based on product selection
    updateMaxRetailPrice: function() {
        const productKey = this.getElementValue('primaryProduct');
        const maxRetailInput = document.getElementById('maxRetail');
        
        if (productKey && maxRetailInput) {
            const maxPrice = adminConfig.maxRetailPrices[productKey] || adminConfig.maxRetailPrices.default;
            maxRetailInput.value = maxPrice.toFixed(2);
        }
    },

    // Sync values between sidebar and main calculator
    syncCalculatorValues: function() {
        const sidebarProduct = this.getElementValue('sidebarProduct');
        const sidebarCases = this.getElementValue('sidebarCases');
        const sidebarDisplayBoxes = this.getElementValue('sidebarDisplayBoxes');
        
        if (sidebarProduct && document.getElementById('primaryProduct')) {
            document.getElementById('primaryProduct').value = sidebarProduct;
        }
        
        if (sidebarCases && document.getElementById('masterCases')) {
            document.getElementById('masterCases').value = sidebarCases;
        }
        
        if (sidebarDisplayBoxes && document.getElementById('displayBoxes')) {
            document.getElementById('displayBoxes').value = sidebarDisplayBoxes;
        }
        
        this.updateMaxRetailPrice();
    }
};

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Initializing calculator engine...');
    
    // Set up event listeners after a brief delay to ensure DOM is fully loaded
    setTimeout(() => {
        Calculator.initializeEventListeners();
    }, 100);
});

console.log('✅ Calculator module loaded successfully');
