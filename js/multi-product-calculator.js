// Multiple Product Calculator for Kanva Botanicals Quote Calculator
// Handles multiple product line items, tier pricing, taxes, and fees

const MultiProductCalculator = {
    // Product line items array
    lineItems: [],
    
    // Tax and fee settings
    settings: {
        creditCardFeeRate: 0.03, // 3%
        shippingRateMin: 0.005,  // 0.5%
        shippingRateMax: 0.025,  // 2.5%
        palletThreshold: 0.5,    // Half pallet threshold
        stateTaxRate: 0,         // Will be set dynamically
        countyTaxRate: 0
    },

    // Initialize multi-product calculator
    initialize: function() {
        console.log('🧮 Initializing multi-product calculator...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize with one product line
        this.addProductLine();
        
        console.log('✅ Multi-product calculator initialized');
    },

    // Set up event listeners
    setupEventListeners: function() {
        // Listen for tax rate changes
        document.addEventListener('change', (event) => {
            if (event.target.id === 'stateTaxRate' || event.target.id === 'countyTaxRate') {
                this.updateTaxRates();
                this.calculateTotal();
            }
            
            if (event.target.id === 'creditCardFee') {
                this.calculateTotal();
            }
        });
    },

    // Add new product line
    addProductLine: function() {
        const lineItem = {
            id: this.generateLineItemId(),
            productKey: 'focus',
            masterCases: 28,
            customPrice: null, // For override pricing
            notes: ''
        };
        
        this.lineItems.push(lineItem);
        this.renderProductLines();
        this.calculateTotal();
        
        console.log('➕ Added product line:', lineItem.id);
    },

    // Remove product line
    removeProductLine: function(lineItemId) {
        const index = this.lineItems.findIndex(item => item.id === lineItemId);
        if (index > -1) {
            this.lineItems.splice(index, 1);
            this.renderProductLines();
            this.calculateTotal();
            console.log('➖ Removed product line:', lineItemId);
        }
        
        // Ensure at least one line item
        if (this.lineItems.length === 0) {
            this.addProductLine();
        }
    },

    // Update product line
    updateProductLine: function(lineItemId, field, value) {
        const lineItem = this.lineItems.find(item => item.id === lineItemId);
        if (lineItem) {
            lineItem[field] = value;
            this.calculateTotal();
            console.log(`🔄 Updated line ${lineItemId}: ${field} = ${value}`);
        }
    },

    // Calculate individual line item
    calculateLineItem: function(lineItem) {
        const product = ProductManager.get(lineItem.productKey);
        if (!product) return null;

        const masterCases = parseInt(lineItem.masterCases) || 0;
        const tierInfo = TierManager.getTier(masterCases);
        
        // Calculate pricing based on correct unit structure
        // product.price = distributor cost per individual unit
        const unitPrice = product.price * (1 - tierInfo.discount);
        const displayBoxPrice = unitPrice * product.unitsPerDisplayBox; // 12 units per display box
        const casePrice = unitPrice * product.unitsPerCase; // 144 units per master case
        const totalUnits = masterCases * product.unitsPerCase;
        const displayBoxes = masterCases * product.displayBoxesPerCase;
        const lineTotal = masterCases * casePrice;

        return {
            id: lineItem.id,
            product,
            tierInfo,
            masterCases,
            unitPrice,
            displayBoxPrice,
            casePrice,
            totalUnits,
            displayBoxes,
            lineTotal,
            notes: lineItem.notes,
            // Raw values for calculations
            raw: {
                unitPrice,
                displayBoxPrice,
                casePrice,
                lineTotal
            }
        };
    },

    // Calculate total for all line items
    calculateTotal: function() {
        const calculations = [];
        let subtotal = 0;
        let totalUnits = 0;
        let totalDisplayBoxes = 0;
        let totalMasterCases = 0;

        // Calculate each line item
        this.lineItems.forEach(lineItem => {
            const calc = this.calculateLineItem(lineItem);
            if (calc) {
                calculations.push(calc);
                subtotal += calc.lineTotal;
                totalUnits += calc.totalUnits;
                totalDisplayBoxes += calc.displayBoxes;
                totalMasterCases += calc.masterCases;
            }
        });

        // Calculate shipping based on LTL percentage and selected zone
        let shipping = 0;
        const selectedState = document.getElementById('customerState')?.value;
        if (selectedState && subtotal > 0) {
            const shippingZone = this.getShippingZone(selectedState);
            if (shippingZone) {
                shipping = subtotal * (shippingZone.ltlPercentage / 100);
            }
        }
        
        // Check for manual shipping override
        const manualShipping = parseFloat(document.getElementById('manualShipping')?.value || 0);
        if (manualShipping > 0) {
            shipping = manualShipping;
        }

        // Calculate credit card fee (3% of subtotal + shipping) - always included
        const creditCardFee = (subtotal + shipping) * 0.03;

        // Final total
        const grandTotal = subtotal + shipping + creditCardFee;

        const result = {
            lineItems: calculations,
            summary: {
                totalMasterCases,
                totalDisplayBoxes,
                totalUnits,
                subtotal,
                shipping,
                shippingZone: selectedState ? this.getShippingZone(selectedState) : null,
                creditCardFee,
                grandTotal
            }
        };

        // Update display
        this.displayCalculations(result);
        
        // Cache result for email generation
        appState.lastMultiProductCalculation = result;

        return result;
    },

    // Render product lines interface
    renderProductLines: function() {
        const container = document.getElementById('productLines');
        if (!container) return;

        const html = this.lineItems.map((lineItem, index) => `
            <div class="product-line" data-line-id="${lineItem.id}">
                <div class="product-line-header">
                    <h4>Product ${index + 1}</h4>
                    ${this.lineItems.length > 1 ? `
                        <button type="button" class="remove-line-btn" onclick="MultiProductCalculator.removeProductLine('${lineItem.id}')">
                            ✕ Remove
                        </button>
                    ` : ''}
                </div>
                
                <div class="product-line-fields">
                    <div class="input-group">
                        <label>Product:</label>
                        <select onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'productKey', this.value)">
                            ${Object.entries(ProductManager.getAll()).map(([key, product]) => `
                                <option value="${key}" ${lineItem.productKey === key ? 'selected' : ''}>
                                    ${product.name} ($${product.price})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label>Master Cases:</label>
                        <input type="number" value="${lineItem.masterCases}" min="1" max="1000"
                               onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'masterCases', this.value)">
                    </div>
                    
                    <div class="input-group">
                        <label>Custom Unit Price:</label>
                        <input type="number" step="0.01" placeholder="Override pricing"
                               value="${lineItem.customPrice || ''}"
                               onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'customPrice', this.value || null)">
                    </div>
                    
                    <div class="input-group">
                        <label>Notes:</label>
                        <input type="text" placeholder="Line item notes"
                               value="${lineItem.notes}"
                               onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'notes', this.value)">
                    </div>
                </div>
                
                <div class="line-item-summary" id="lineItemSummary-${lineItem.id}">
                    <!-- Populated by calculateTotal() -->
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    // Display calculations
    displayCalculations: function(result) {
        // Update individual line item summaries
        result.lineItems.forEach(lineItem => {
            const summaryEl = document.getElementById(`lineItemSummary-${lineItem.id}`);
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="line-summary">
                        <div class="line-pricing">
                            💰 Unit: <strong>${this.formatCurrency(lineItem.unitPrice)}</strong> | 
                            Display Box: <strong>${this.formatCurrency(lineItem.displayBoxPrice)}</strong> | 
                            Case: <strong>${this.formatCurrency(lineItem.casePrice)}</strong>
                        </div>
                        <div class="line-quantities">
                            📦 ${this.formatNumber(lineItem.displayBoxes)} Display Boxes | 
                            ${this.formatNumber(lineItem.totalUnits)} Units | 
                            ${lineItem.tierInfo.name}
                        </div>
                        <div class="line-total">
                            Line Total: <strong>${this.formatCurrency(lineItem.lineTotal)}</strong>
                        </div>
                    </div>
                `;
            }
        });

        // Update main results
        const resultsContainer = document.getElementById('calculationResults');
        if (resultsContainer) {
            const summary = result.summary;
            
            resultsContainer.innerHTML = `
                <div class="calculation-summary">
                    <h3>Multi-Product Order Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">Total Master Cases:</span>
                            <span class="summary-value">${this.formatNumber(summary.totalMasterCases)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Total Display Boxes:</span>
                            <span class="summary-value">${this.formatNumber(summary.totalDisplayBoxes)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Total Individual Units:</span>
                            <span class="summary-value">${this.formatNumber(summary.totalUnits)}</span>
                        </div>
                    </div>
                    
                    <div class="pricing-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Subtotal:</span>
                            <span class="breakdown-value">${this.formatCurrency(summary.subtotal)}</span>
                        </div>
                        
                        <div class="breakdown-item">
                            <span class="breakdown-label">Shipping:</span>
                            <span class="breakdown-value">${this.formatCurrency(summary.shipping)}</span>
                        </div>
                        
                        <div class="breakdown-item">
                            <span class="breakdown-label">Credit Card Fee (3%):</span>
                            <span class="breakdown-value">${this.formatCurrency(summary.creditCardFee)}</span>
                        </div>
                        
                        <div class="breakdown-item total-row">
                            <span class="breakdown-label"><strong>Grand Total:</strong></span>
                            <span class="breakdown-value"><strong>${this.formatCurrency(summary.grandTotal)}</strong></span>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Update tax rates
    updateTaxRates: function() {
        const stateTaxInput = document.getElementById('stateTaxRate');
        const countyTaxInput = document.getElementById('countyTaxRate');
        
        if (stateTaxInput) {
            this.settings.stateTaxRate = parseFloat(stateTaxInput.value) / 100 || 0;
        }
        
        if (countyTaxInput) {
            this.settings.countyTaxRate = parseFloat(countyTaxInput.value) / 100 || 0;
        }
    },

    // Get state tax rate from API (placeholder)
    getStateTaxRate: async function(state, county = null) {
        try {
            // This would call a real tax API service
            // For now, return common state rates
            const stateTaxRates = {
                'CA': 7.25,
                'NY': 8.0,
                'TX': 6.25,
                'FL': 6.0,
                'WA': 6.5,
                'OR': 0, // No state sales tax
                'MT': 0, // No state sales tax
                'NH': 0, // No state sales tax
                'DE': 0, // No state sales tax
                'AK': 0  // No state sales tax
            };
            
            const rate = stateTaxRates[state] || 0;
            
            // Update the form
            const stateTaxInput = document.getElementById('stateTaxRate');
            if (stateTaxInput) {
                stateTaxInput.value = rate;
                this.settings.stateTaxRate = rate / 100;
            }
            
            return rate;
        } catch (error) {
            console.error('Failed to get tax rate:', error);
            return 0;
        }
    },

    // Auto-detect state from customer address
    autoDetectTaxRate: function() {
        // Get state from customer info
        const stateField = document.getElementById('customerState');
        const countyField = document.getElementById('customerCounty');
        
        if (stateField && stateField.value) {
            this.getStateTaxRate(stateField.value, countyField?.value);
        }
    },

    // Generate line item ID
    generateLineItemId: function() {
        return 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Get shipping zone for a given state
    getShippingZone: function(state) {
        // Load shipping data from JSON
        if (!this.shippingData) {
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

    // Get calculation for email generation
    getCalculationForEmail: function() {
        const result = this.calculateTotal();
        
        if (result.lineItems.length === 1) {
            // Single product - return in legacy format
            const lineItem = result.lineItems[0];
            return {
                product: lineItem.product,
                tierInfo: lineItem.tierInfo,
                masterCases: lineItem.masterCases,
                unitPrice: this.formatCurrency(lineItem.unitPrice),
                displayBoxPrice: this.formatCurrency(lineItem.displayBoxPrice),
                casePrice: this.formatCurrency(lineItem.casePrice),
                totalUnits: lineItem.totalUnits,
                displayBoxes: lineItem.displayBoxes,
                subtotal: this.formatCurrency(result.summary.subtotal),
                shipping: this.formatCurrency(result.summary.shipping),
                creditCardFee: this.formatCurrency(result.summary.creditCardFee),
                total: this.formatCurrency(result.summary.grandTotal),
                freeShipping: false,
                raw: {
                    unitPrice: lineItem.unitPrice,
                    displayBoxPrice: lineItem.displayBoxPrice,
                    casePrice: lineItem.casePrice,
                    subtotal: result.summary.subtotal,
                    shipping: result.summary.shipping,
                    creditCardFee: result.summary.creditCardFee,
                    total: result.summary.grandTotal
                }
            };
        } else {
            // Multiple products - return array
            return result.lineItems.map(lineItem => ({
                product: lineItem.product,
                tierInfo: lineItem.tierInfo,
                masterCases: lineItem.masterCases,
                unitPrice: this.formatCurrency(lineItem.unitPrice),
                casePrice: this.formatCurrency(lineItem.casePrice),
                totalUnits: lineItem.totalUnits,
                displayBoxes: lineItem.displayBoxes,
                total: this.formatCurrency(lineItem.lineTotal),
                raw: {
                    unitPrice: lineItem.unitPrice,
                    casePrice: lineItem.casePrice,
                    total: lineItem.lineTotal
                }
            }));
        }
    },

    // Utility functions
    formatNumber: function(number) {
        return new Intl.NumberFormat('en-US').format(number);
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Export configuration
    exportConfiguration: function() {
        return {
            lineItems: this.lineItems,
            settings: this.settings
        };
    },

    // Import configuration
    importConfiguration: function(config) {
        if (config.lineItems) {
            this.lineItems = config.lineItems;
        }
        if (config.settings) {
            this.settings = { ...this.settings, ...config.settings };
        }
        
        this.renderProductLines();
        this.calculateTotal();
    },

    // Reset to single product
    resetToSingleProduct: function() {
        this.lineItems = [];
        this.addProductLine();
    }
};

// Global functions for HTML onclick handlers
function addProductLine() {
    MultiProductCalculator.addProductLine();
}

function removeProductLine(lineItemId) {
    MultiProductCalculator.removeProductLine(lineItemId);
}

function updateProductLine(lineItemId, field, value) {
    MultiProductCalculator.updateProductLine(lineItemId, field, value);
}

function calculateMultiProductTotal() {
    return MultiProductCalculator.calculateTotal();
}

function autoDetectTaxRate() {
    MultiProductCalculator.autoDetectTaxRate();
}

// Override Calculator.calculateOrder to use multi-product when appropriate
const OriginalCalculateOrder = Calculator.calculateOrder;
Calculator.calculateOrder = function() {
    // If we're in multi-product mode, use that calculator
    const multiProductContainer = document.getElementById('productLines');
    if (multiProductContainer && multiProductContainer.style.display !== 'none') {
        return MultiProductCalculator.getCalculationForEmail();
    }
    
    // Otherwise use original single-product calculator
    return OriginalCalculateOrder.call(this);
};

console.log('✅ Multi-product calculator module loaded successfully');
