// Core calculation engine for Kanva Botanicals Quote Calculator
// Handles all pricing calculations, tier logic, and quote generation

const Calculator = {
    // Main calculation function
    calculateOrder: function() {
        try {
            // Get form values
            const productKey = this.getElementValue('primaryProduct') || this.getElementValue('sidebarProduct');
            const masterCases = parseInt(this.getElementValue('masterCases') || this.getElementValue('sidebarCases')) || 0;
            
            if (!productKey || masterCases <= 0) {
                return this.createEmptyResult();
            }

            // Get product and tier information
            const product = ProductManager.get(productKey);
            const tierInfo = TierManager.getTier(masterCases);
            
            if (!product) {
                console.error('Product not found:', productKey);
                return this.createEmptyResult();
            }

            // Calculate pricing
            const unitPrice = product.price * (1 - tierInfo.discount);
            const casePrice = unitPrice * product.unitsPerCase;
            const totalUnits = masterCases * product.unitsPerCase;
            const displayBoxes = masterCases * product.displayBoxesPerCase;
            const subtotal = masterCases * casePrice;
            
            // Calculate shipping
            let shipping = subtotal * adminConfig.shipping.rate;
            const freeShipping = subtotal >= adminConfig.shipping.freeThreshold;
            if (freeShipping) {
                shipping = 0;
            }
            
            const total = subtotal + shipping;

            // Create result object
            const result = {
                product,
                tierInfo,
                masterCases,
                unitPrice: this.formatCurrency(unitPrice),
                casePrice: this.formatCurrency(casePrice),
                totalUnits,
                displayBoxes,
                subtotal: this.formatCurrency(subtotal),
                shipping: this.formatCurrency(shipping),
                total: this.formatCurrency(total),
                freeShipping,
                // Raw values for calculations
                raw: {
                    unitPrice,
                    casePrice,
                    subtotal,
                    shipping,
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

    // Create empty result for error cases
    createEmptyResult: function() {
        return {
            product: null,
            tierInfo: null,
            masterCases: 0,
            unitPrice: '$0.00',
            casePrice: '$0.00',
            totalUnits: 0,
            displayBoxes: 0,
            subtotal: '$0.00',
            shipping: '$0.00',
            total: '$0.00',
            freeShipping: false,
            raw: {
                unitPrice: 0,
                casePrice: 0,
                subtotal: 0,
                shipping: 0,
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
        const resultsContainer = document.getElementById('orderResults');
        if (!resultsContainer) return;
        
        const calc = this.calculateOrder();
        if (!calc.product) return;

        // Calculate next tier information
        const currentTierName = calc.tierInfo.name;
        const nextTierThreshold = this.getNextTierThreshold(calc.tierInfo);
        const hasNextTier = nextTierThreshold > 0;

        resultsContainer.innerHTML = `
            <div class="calculation-summary">
                <p><strong>${calc.product.name} - ${calc.masterCases} Master Cases</strong></p>
                <p>📦 <strong>${this.formatNumber(calc.displayBoxes)}</strong> Display Boxes | <strong>${this.formatNumber(calc.totalUnits)}</strong> Individual Units</p>
                <p>💰 Unit Price: <strong>${calc.unitPrice}</strong> | Case Price: <strong>${calc.casePrice}</strong></p>
                <p>📊 Subtotal: <strong>${calc.subtotal}</strong></p>
                <p>🚚 Shipping: <strong>${calc.freeShipping ? 'FREE' : calc.shipping}</strong>${calc.freeShipping ? ' (Free shipping applied!)' : ''}</p>
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
                <p>📦 <strong>${calc.masterCases}</strong> Master Cases</p>
                <p style="color: #17351A; font-weight: bold;">Total: ${calc.total}</p>
                <p style="font-size: 11px; color: #4D5358;">${calc.tierInfo.name} pricing</p>
            </div>
        `;
    },

    // Validate calculation inputs
    validateInputs: function(productKey, masterCases) {
        const errors = [];

        if (!productKey) {
            errors.push('Please select a product');
        }

        if (!masterCases || masterCases <= 0) {
            errors.push('Please enter a valid number of master cases');
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
    getCalculationSummary: function() {
        const calc = this.calculateOrder();
        if (!calc.product) return null;

        return {
            productName: calc.product.name,
            quantity: calc.masterCases,
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

        if (masterCasesInput) {
            masterCasesInput.addEventListener('input', () => this.updateResults());
            masterCasesInput.addEventListener('change', () => this.updateResults());
        }

        if (productSelect) {
            productSelect.addEventListener('change', () => this.updateResults());
        }

        // Sidebar inputs
        const sidebarCasesInput = document.getElementById('sidebarCases');
        const sidebarProductSelect = document.getElementById('sidebarProduct');

        if (sidebarCasesInput) {
            sidebarCasesInput.addEventListener('input', () => this.updateSidebarResults());
            sidebarCasesInput.addEventListener('change', () => this.updateSidebarResults());
        }

        if (sidebarProductSelect) {
            sidebarProductSelect.addEventListener('change', () => this.updateSidebarResults());
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
        
        if (sidebarProduct && document.getElementById('primaryProduct')) {
            document.getElementById('primaryProduct').value = sidebarProduct;
        }
        
        if (sidebarCases && document.getElementById('masterCases')) {
            document.getElementById('masterCases').value = sidebarCases;
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
