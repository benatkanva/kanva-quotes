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
        
        // Use custom price if set, otherwise use calculated price
        const unitPrice = lineItem.customPrice || (product.price * (1 - tierInfo.discount));
        const casePrice = unitPrice * product.unitsPerCase;
        const totalUnits = masterCases * product.unitsPerCase;
        const displayBoxes = masterCases * product.displayBoxesPerCase;
        const lineTotal = masterCases * casePrice;

        return {
            id: lineItem.id,
            product,
            tierInfo,
            masterCases,
            unitPrice,
            casePrice,
            totalUnits,
            displayBoxes,
            lineTotal,
            notes: lineItem.notes,
            // Raw values for calculations
            raw: {
                unitPrice,
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

        // Calculate shipping (based on whether it's palletized)
        const isPalletized = totalMasterCases >= (this.settings.palletThreshold * 100); // Assuming 100 cases per pallet
        const shippingRate = isPalletized ? this.settings.shippingRateMax : this.settings.shippingRateMin;
        const shipping = subtotal * shippingRate;

        // Calculate taxes
        const stateTax = subtotal * this.settings.stateTaxRate;
        const countyTax = subtotal * this.settings.countyTaxRate;
        const totalTax = stateTax + countyTax;

        // Subtotal including shipping and taxes
        const subtotalWithExtras = subtotal + shipping + totalTax;

        // Calculate credit card fee if enabled
        const creditCardEnabled = document.getElementById('creditCardFee')?.checked || false;
        const creditCardFee = creditCardEnabled ? subtotalWithExtras * this.settings.creditCardFeeRate : 0;

        // Final total
        const grandTotal = subtotalWithExtras + creditCardFee;

        const result = {
            lineItems: calculations,
            summary: {
                totalMasterCases,
                totalDisplayBoxes,
                totalUnits,
                subtotal,
                shipping,
                shippingRate,
                isPalletized,
                stateTax,
                countyTax,
                totalTax,
                creditCardFee,
                creditCardEnabled,
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
                        📦 ${this.formatNumber(lineItem.displayBoxes)} Display Boxes | 
                        ${this.formatNumber(lineItem.totalUnits)} Units | 
                        ${lineItem.tierInfo.name} | 
                        <strong>${this.formatCurrency(lineItem.lineTotal)}</strong>
                    </div>
                `;
            }
        });

        // Update main results
        const resultsContainer = document.getElementById('multiProductResults');
        if (resultsContainer) {
            const summary = result.summary;
            
            resultsContainer.innerHTML = `
                <div class="calculation-summary">
                    <h3>Order Summary</h3>
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
                            <span class="breakdown-label">Shipping (${(summary.shippingRate * 100).toFixed(1)}%${summary.isPalletized ? ' - Palletized' : ''}):</span>
                            <span class="breakdown-value">${this.formatCurrency(summary.shipping)}</span>
                        </div>
                        
                        ${summary.totalTax > 0 ? `
                            <div class="breakdown-item">
                                <span class="breakdown-label">Taxes:</span>
                                <span class="breakdown-value">${this.formatCurrency(summary.totalTax)}</span>
                            </div>
                        ` : ''}
                        
                        ${summary.creditCardFee > 0 ? `
                            <div class="breakdown-item">
                                <span class="breakdown-label">Credit Card Fee (3%):</span>
                                <span class="breakdown-value">${this.formatCurrency(summary.creditCardFee)}</span>
                            </div>
                        ` : ''}
                        
                        <div class="breakdown-total">
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
        return `line-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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
                casePrice: this.formatCurrency(lineItem.casePrice),
                totalUnits: lineItem.totalUnits,
                displayBoxes: lineItem.displayBoxes,
                subtotal: this.formatCurrency(result.summary.subtotal),
                shipping: this.formatCurrency(result.summary.shipping),
                total: this.formatCurrency(result.summary.grandTotal),
                freeShipping: result.summary.shipping === 0,
                raw: {
                    unitPrice: lineItem.unitPrice,
                    casePrice: lineItem.casePrice,
                    subtotal: result.summary.subtotal,
                    shipping: result.summary.shipping,
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
