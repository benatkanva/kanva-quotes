// FIXED Core calculation engine with proper display box math and shipping

const Calculator = {
    // FIXED: Main calculation function with proper display box handling
    calculateOrder: function() {
        try {
            // Get form values
            const productKey = this.getElementValue('primaryProduct') || this.getElementValue('sidebarProduct');
            let masterCases = parseInt(this.getElementValue('masterCases') || this.getElementValue('sidebarCases')) || 0;
            let displayBoxes = parseInt(this.getElementValue('displayBoxes')) || 0;
            
            // FIXED: Handle display box to master case conversion
            if (displayBoxes > 0 && masterCases === 0) {
                // User entered display boxes - convert to master cases
                masterCases = Math.floor(displayBoxes / 12);
                const remainingDisplayBoxes = displayBoxes % 12;
                
                // Update the master cases field
                const masterCasesInput = document.getElementById('masterCases');
                if (masterCasesInput) {
                    masterCasesInput.value = masterCases;
                }
                
                console.log(`Display boxes: ${displayBoxes} → ${masterCases} master cases + ${remainingDisplayBoxes} extra boxes`);
            }
            
            if (!productKey || (masterCases <= 0 && displayBoxes <= 0)) {
                return this.createEmptyResult();
            }

            // Get product and tier information
            const product = ProductManager.get(productKey);
            const tierInfo = TierManager.getTier(masterCases);
            
            if (!product) {
                console.error('Product not found:', productKey);
                return this.createEmptyResult();
            }

            // FIXED: Calculate pricing with correct math
            const unitPrice = product.price * (1 - tierInfo.discount);
            
            // FIXED: Use correct units per case from product config
            const totalUnits = masterCases * product.unitsPerCase;
            const totalDisplayBoxes = masterCases * product.displayBoxesPerCase;
            
            // FIXED: Calculate subtotal properly
            const casePrice = unitPrice * product.unitsPerCase;  // Price per master case
            const subtotal = masterCases * casePrice;
            
            // FIXED: Calculate shipping using new zone-based system
            const customerState = this.getCustomerState();
            let shipping = 0;
            
            if (customerState && typeof ShippingManager !== 'undefined') {
                shipping = ShippingManager.calculateShipping(totalDisplayBoxes, masterCases, customerState);
            } else {
                // Fallback to old percentage-based shipping
                shipping = subtotal * (adminConfig.shipping.rate || 0.015);
            }
            
            // Check for free shipping
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
                displayBoxes: totalDisplayBoxes,
                unitPrice: this.formatCurrency(unitPrice),
                casePrice: this.formatCurrency(casePrice),
                totalUnits,
                subtotal: this.formatCurrency(subtotal),
                shipping: this.formatCurrency(shipping),
                total: this.formatCurrency(total),
                freeShipping,
                customerState,
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

    // NEW: Get customer state for shipping calculation
    getCustomerState: function() {
        // Try to get from form field
        const stateField = document.getElementById('customerState');
        if (stateField && stateField.value) {
            return stateField.value.toUpperCase();
        }
        
        // Try to extract from phone number area code (basic guess)
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value) {
            const areaCode = phoneField.value.replace(/\D/g, '').substring(1, 4);
            return this.guessStateFromAreaCode(areaCode);
        }
        
        // Default to California if unknown
        return 'CA';
    },

    // NEW: Basic area code to state mapping (simplified)
    guessStateFromAreaCode: function(areaCode) {
        const areaCodeMap = {
            '213': 'CA', '310': 'CA', '415': 'CA', '510': 'CA', '619': 'CA', '714': 'CA', '818': 'CA', '831': 'CA',
            '702': 'NV', '775': 'NV',
            '503': 'OR', '541': 'OR', '971': 'OR',
            '206': 'WA', '253': 'WA', '360': 'WA', '425': 'WA', '509': 'WA',
            '208': 'ID',
            '303': 'CO', '719': 'CO', '720': 'CO', '970': 'CO',
            '801': 'UT', '385': 'UT', '435': 'UT',
            '212': 'NY', '315': 'NY', '516': 'NY', '518': 'NY', '585': 'NY', '607': 'NY', '631': 'NY', '646': 'NY', '716': 'NY', '718': 'NY', '845': 'NY', '914': 'NY', '917': 'NY', '929': 'NY'
        };
        
        return areaCodeMap[areaCode] || 'CA'; // Default to CA
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
            displayBoxes: 0,
            unitPrice: '$0.00',
            casePrice: '$0.00',
            totalUnits: 0,
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

    // UPDATED: Update main calculator results display with correct info
    updateResults: function() {
        const resultsContainer = document.getElementById('orderResults');
        if (!resultsContainer) return;
        
        const calc = this.calculateOrder();
        if (!calc.product) return;

        // Calculate next tier information
        const nextTierInfo = TierManager.getNextTier(calc.masterCases);
        const hasNextTier = nextTierInfo !== null;

        resultsContainer.innerHTML = `
            <div class="calculation-summary">
                <p><strong>${calc.product.name} - ${calc.masterCases} Master Cases</strong></p>
                <p>📦 <strong>${this.formatNumber(calc.displayBoxes)}</strong> Display Boxes | <strong>${this.formatNumber(calc.totalUnits)}</strong> Individual Units</p>
                <p>💰 Unit Price: <strong>${calc.unitPrice}</strong> | Case Price: <strong>${calc.casePrice}</strong></p>
                <p>📊 Subtotal: <strong>${calc.subtotal}</strong></p>
                <p>🚚 Shipping${calc.customerState ? ` (${calc.customerState})` : ''}: <strong>${calc.freeShipping ? 'FREE' : calc.shipping}</strong>${calc.freeShipping ? ' (Free shipping applied!)' : ''}</p>
                <p class="total-amount" style="font-size: 18px; color: #17351A; font-weight: bold; background: linear-gradient(135deg, #e8f5e8 0%, #d4f4d4 100%); padding: 8px 12px; border-radius: 6px; border: 1px solid #93D500;">💳 TOTAL: ${calc.total}</p>
            </div>
        `;

        // Update tier information
        this.updateTierInfo(calc, hasNextTier, nextTierInfo);
    },

    // UPDATED: Update tier information display with correct upselling
    updateTierInfo: function(calc, hasNextTier, nextTierInfo) {
        const tierContainer = document.getElementById('tierInfo');
        if (!tierContainer) return;

        const savingsText = calc.tierInfo.discount > 0 ? 
            ` (${(calc.tierInfo.discount * 100).toFixed(1)}% savings)` : '';
        
        const nextTierText = hasNextTier ? 
            `<br><small>📈 Order ${nextTierInfo.casesNeeded} more cases to qualify for ${nextTierInfo.tier.name} pricing</small>` : 
            '<br><small>🎉 You\'re already getting our best pricing!</small>';

        tierContainer.innerHTML = `
            <div class="tier-display">
                <span class="pricing-tier tier${calc.tierInfo.name.split(' ')[1]}">${calc.tierInfo.name}</span> pricing applied${savingsText}
                ${nextTierText}
            </div>
        `;
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
        const displayBoxesInput = document.getElementById('displayBoxes');
        const productSelect = document.getElementById('primaryProduct');

        if (masterCasesInput) {
            masterCasesInput.addEventListener('input', () => this.updateResults());
            masterCasesInput.addEventListener('change', () => this.updateResults());
        }

        if (displayBoxesInput) {
            displayBoxesInput.addEventListener('input', () => this.updateResults());
            displayBoxesInput.addEventListener('change', () => this.updateResults());
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
    console.log('🧮 Initializing calculator engine with zone-based shipping...');
    
    // Set up event listeners after a brief delay to ensure DOM is fully loaded
    setTimeout(() => {
        Calculator.initializeEventListeners();
    }, 100);
});

console.log('✅ Fixed calculator module loaded with proper display box math');
