// Fixed Multiple Product Calculator for Kanva Botanicals Quote Calculator
// FIXES: Correct subtotaling, display box fields, manual shipping override

const MultiProductCalculator = {
    // Product line items array
    lineItems: [],
    
    // Tax and fee settings
    settings: {
        creditCardFeeRate: 0.03, // 3%
        shippingRateMin: 0.005,  // 0.5%
        shippingRateMax: 0.025,  // 2.5%
        manualShippingRate: null, // Manual override percentage
        palletThreshold: 0.5,    // Half pallet threshold
        stateTaxRate: 0,         // Will be set dynamically
        countyTaxRate: 0
    },

    // Initialize multi-product calculator
    initialize: function() {
        console.log('🧮 Initializing multi-product calculator...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize with one product line if none exist
        if (this.lineItems.length === 0) {
            this.addProductLine();
        }
        
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

            // Listen for manual shipping override
            if (event.target.id === 'manualShippingRate') {
                this.settings.manualShippingRate = parseFloat(event.target.value) / 100 || null;
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
            displayBoxes: 336, // 28 * 12 = 336 display boxes
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

    // Update product line with display box auto-conversion
    updateProductLine: function(lineItemId, field, value) {
        const lineItem = this.lineItems.find(item => item.id === lineItemId);
        if (!lineItem) return;

        if (field === 'displayBoxes') {
            // Convert display boxes to master cases (12 display boxes = 1 master case)
            const displayBoxes = parseInt(value) || 0;
            lineItem.displayBoxes = displayBoxes;
            lineItem.masterCases = Math.floor(displayBoxes / 12);
            
            // Update the master cases input in the UI
            const masterCasesInput = document.querySelector(`[data-line-id="${lineItemId}"] input[data-field="masterCases"]`);
            if (masterCasesInput) {
                masterCasesInput.value = lineItem.masterCases;
            }
        } else if (field === 'masterCases') {
            // Convert master cases to display boxes (1 master case = 12 display boxes)
            const masterCases = parseInt(value) || 0;
            lineItem.masterCases = masterCases;
            lineItem.displayBoxes = masterCases * 12;
            
            // Update the display boxes input in the UI
            const displayBoxesInput = document.querySelector(`[data-line-id="${lineItemId}"] input[data-field="displayBoxes"]`);
            if (displayBoxesInput) {
                displayBoxesInput.value = lineItem.displayBoxes;
            }
        } else {
            lineItem[field] = value;
        }
        
        this.calculateTotal();
        console.log(`🔄 Updated line ${lineItemId}: ${field} = ${value}`);
    },

    // FIXED: Calculate individual line item with correct math
    calculateLineItem: function(lineItem) {
        const product = ProductManager.get(lineItem.productKey);
        if (!product) return null;

        const masterCases = parseInt(lineItem.masterCases) || 0;
        const displayBoxes = parseInt(lineItem.displayBoxes) || 0;
        const tierInfo = TierManager.getTier(masterCases);
        
        // FIXED: Use custom price if set, otherwise use calculated price per unit
        const unitPrice = lineItem.customPrice || (product.price * (1 - tierInfo.discount));
        
        // FIXED: Calculate based on master cases, not display boxes
        const totalUnits = masterCases * product.unitsPerCase; // Total individual bottles
        const actualDisplayBoxes = masterCases * 12; // 12 display boxes per master case
        
        // FIXED: Line total = master cases × (unit price × units per case)
        const casePrice = unitPrice * product.unitsPerCase;
        const lineTotal = masterCases * casePrice;

        return {
            id: lineItem.id,
            product,
            tierInfo,
            masterCases,
            displayBoxes: actualDisplayBoxes,
            unitPrice,
            casePrice,
            totalUnits,
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

    // FIXED: Calculate total for all line items with proper aggregation
    calculateTotal: function() {
        const calculations = [];
        let subtotal = 0;
        let totalUnits = 0;
        let totalDisplayBoxes = 0;
        let totalMasterCases = 0;

        // FIXED: Calculate each line item correctly
        this.lineItems.forEach(lineItem => {
            const calc = this.calculateLineItem(lineItem);
            if (calc) {
                calculations.push(calc);
                subtotal += calc.lineTotal; // FIXED: Use lineTotal, not raw calculation
                totalUnits += calc.totalUnits;
                totalDisplayBoxes += calc.displayBoxes;
                totalMasterCases += calc.masterCases;
            }
        });

        // FIXED: Calculate shipping with manual override option
        let shipping = 0;
        if (this.settings.manualShippingRate !== null) {
            // Use manual shipping rate
            shipping = subtotal * this.settings.manualShippingRate;
        } else {
            // Use automatic shipping calculation
            const isPalletized = totalMasterCases >= (this.settings.palletThreshold * 100);
            const shippingRate = isPalletized ? this.settings.shippingRateMax : this.settings.shippingRateMin;
            shipping = subtotal * shippingRate;
        }

        // Calculate taxes (removed for B2B customers as requested)
        const stateTax = 0; // Removed for B2B
        const countyTax = 0; // Removed for B2B
        const totalTax = 0; // Removed for B2B

        // Subtotal including shipping and taxes
        const subtotalWithExtras = subtotal + shipping + totalTax;

        // Calculate credit card fee if enabled
        const creditCardEnabled = document.getElementById('creditCardFee')?.checked || false;
        const creditCardFee = creditCardEnabled ? subtotalWithExtras * this.settings.creditCardFeeRate : 0;

        // FIXED: Final total calculation
        const grandTotal = subtotalWithExtras + creditCardFee;

        const result = {
            lineItems: calculations,
            summary: {
                totalMasterCases,
                totalDisplayBoxes,
                totalUnits,
                subtotal,
                shipping,
                shippingRate: this.settings.manualShippingRate || 
                             (totalMasterCases >= (this.settings.palletThreshold * 100) ? 
                              this.settings.shippingRateMax : this.settings.shippingRateMin),
                isManualShipping: this.settings.manualShippingRate !== null,
                isPalletized: totalMasterCases >= (this.settings.palletThreshold * 100),
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

    // UPDATED: Render product lines interface with display box fields
    renderProductLines: function() {
        const container = document.getElementById('productLines');
        if (!container) return;

        const html = this.lineItems.map((lineItem, index) => `
            <div class="bg-white border-2 border-kanva-green rounded-xl p-6 hover:border-kanva-dark hover:shadow-lg transition-all duration-300" data-line-id="${lineItem.id}">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h4 class="text-lg font-bold text-kanva-dark">Product Line ${index + 1}</h4>
                    ${this.lineItems.length > 1 ? `
                        <button type="button" 
                                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-md transition-all duration-300"
                                onclick="MultiProductCalculator.removeProductLine('${lineItem.id}')">
                            ✕ Remove
                        </button>
                    ` : ''}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">Product:</label>
                        <select class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                                onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'productKey', this.value)">
                            ${Object.entries(ProductManager.getAll()).map(([key, product]) => `
                                <option value="${key}" ${lineItem.productKey === key ? 'selected' : ''}>
                                    ${product.name} ($${product.price})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">Display Boxes:</label>
                        <input type="number" 
                               class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                               value="${lineItem.displayBoxes}" 
                               min="1" 
                               step="12"
                               data-field="displayBoxes"
                               onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'displayBoxes', this.value)"
                               placeholder="336 (auto-converts to master cases)">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">Master Cases:</label>
                        <input type="number" 
                               class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                               value="${lineItem.masterCases}" 
                               min="1" 
                               max="1000"
                               data-field="masterCases"
                               onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'masterCases', this.value)"
                               placeholder="28 (auto-converts from display boxes)">
                        <small class="text-gray-600 text-xs">12 display boxes = 1 master case</small>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">Custom Unit Price:</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-kanva-dark font-bold">$</span>
                            <input type="number" 
                                   class="w-full p-3 pl-8 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                                   step="0.01" 
                                   placeholder="Override pricing"
                                   value="${lineItem.customPrice || ''}"
                                   onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'customPrice', this.value || null)">
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">Notes:</label>
                    <input type="text" 
                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                           placeholder="Line item notes or special instructions"
                           value="${lineItem.notes}"
                           onchange="MultiProductCalculator.updateProductLine('${lineItem.id}', 'notes', this.value)">
                </div>
                
                <div class="bg-gradient-to-r from-kanva-light to-kanva-accent p-4 rounded-lg border border-kanva-green/30" id="lineItemSummary-${lineItem.id}">
                    <!-- Populated by calculateTotal() -->
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    // UPDATED: Display calculations with shipping override
    displayCalculations: function(result) {
        // Update individual line item summaries
        result.lineItems.forEach(lineItem => {
            const summaryEl = document.getElementById(`lineItemSummary-${lineItem.id}`);
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="text-sm text-kanva-dark space-y-1">
                        <div class="flex justify-between">
                            <span>📦 Display Boxes:</span>
                            <span class="font-bold">${this.formatNumber(lineItem.displayBoxes)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>🔢 Individual Units:</span>
                            <span class="font-bold">${this.formatNumber(lineItem.totalUnits)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>💰 Pricing Tier:</span>
                            <span class="font-bold">${lineItem.tierInfo.name}</span>
                        </div>
                        <div class="flex justify-between border-t pt-1 mt-2">
                            <span class="font-bold">Line Total:</span>
                            <span class="font-bold text-lg">${this.formatCurrency(lineItem.lineTotal)}</span>
                        </div>
                    </div>
                `;
            }
        });

        // Update main results with shipping override section
        const resultsContainer = document.getElementById('multiProductResults');
        if (resultsContainer) {
            const summary = result.summary;
            
            resultsContainer.innerHTML = `
                <div class="space-y-6">
                    <h3 class="text-2xl font-bold text-kanva-dark mb-4">Order Summary</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-white p-4 rounded-lg border-2 border-kanva-green text-center">
                            <div class="text-2xl font-bold text-kanva-dark">${this.formatNumber(summary.totalMasterCases)}</div>
                            <div class="text-sm text-gray-600">Total Cases</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border-2 border-kanva-green text-center">
                            <div class="text-2xl font-bold text-kanva-dark">${this.formatNumber(summary.totalDisplayBoxes)}</div>
                            <div class="text-sm text-gray-600">Display Boxes</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border-2 border-kanva-green text-center">
                            <div class="text-2xl font-bold text-kanva-dark">${this.formatNumber(summary.totalUnits)}</div>
                            <div class="text-sm text-gray-600">Individual Units</div>
                        </div>
                    </div>
                    
                    <!-- ADDED: Manual Shipping Override Section -->
                    <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                        <h4 class="text-lg font-bold text-blue-900 mb-3">🚚 Shipping Options</h4>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center">
                                <input type="radio" 
                                       name="shippingType" 
                                       value="auto" 
                                       ${!summary.isManualShipping ? 'checked' : ''}
                                       onchange="MultiProductCalculator.setShippingMode('auto')"
                                       class="mr-2">
                                Auto-Calculate (${(summary.shippingRate * 100).toFixed(1)}%${summary.isPalletized ? ' - Palletized' : ''})
                            </label>
                            <label class="flex items-center">
                                <input type="radio" 
                                       name="shippingType" 
                                       value="manual" 
                                       ${summary.isManualShipping ? 'checked' : ''}
                                       onchange="MultiProductCalculator.setShippingMode('manual')"
                                       class="mr-2">
                                Manual Override:
                            </label>
                            <div class="flex items-center gap-2">
                                <input type="number" 
                                       id="manualShippingRate"
                                       step="0.1" 
                                       min="0" 
                                       max="10"
                                       placeholder="1.5"
                                       value="${summary.isManualShipping ? (summary.shippingRate * 100).toFixed(1) : ''}"
                                       class="w-20 p-2 border border-blue-300 rounded text-center"
                                       ${!summary.isManualShipping ? 'disabled' : ''}>
                                <span class="text-blue-900">% of subtotal</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg border-2 border-kanva-green">
                        <div class="space-y-3">
                            <div class="flex justify-between text-lg">
                                <span class="text-kanva-dark">Subtotal:</span>
                                <span class="font-bold text-kanva-dark">${this.formatCurrency(summary.subtotal)}</span>
                            </div>
                            
                            <div class="flex justify-between text-lg">
                                <span class="text-kanva-dark">Shipping ${summary.isManualShipping ? '(Manual Override)' : '(Auto)'}:</span>
                                <span class="font-bold text-kanva-dark">${this.formatCurrency(summary.shipping)}</span>
                            </div>
                            
                            ${summary.creditCardFee > 0 ? `
                                <div class="flex justify-between text-lg">
                                    <span class="text-kanva-dark">Credit Card Fee (3%):</span>
                                    <span class="font-bold text-kanva-dark">${this.formatCurrency(summary.creditCardFee)}</span>
                                </div>
                            ` : ''}
                            
                            <div class="border-t-2 border-kanva-green pt-3 mt-3">
                                <div class="flex justify-between text-2xl">
                                    <span class="font-bold text-kanva-dark">Grand Total:</span>
                                    <span class="font-bold text-kanva-dark">${this.formatCurrency(summary.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // ADDED: Set shipping mode (auto vs manual)
    setShippingMode: function(mode) {
        const manualShippingInput = document.getElementById('manualShippingRate');
        
        if (mode === 'manual') {
            manualShippingInput.disabled = false;
            // Set default manual rate if not already set
            if (!manualShippingInput.value) {
                manualShippingInput.value = '1.5';
                this.settings.manualShippingRate = 0.015;
            }
        } else {
            manualShippingInput.disabled = true;
            this.settings.manualShippingRate = null;
        }
        
        this.calculateTotal();
    },

    // Get calculation for email generation - FIXED to handle both single and multi-product
    getCalculationForEmail: function() {
        const result = this.calculateTotal();
        
        if (result.lineItems.length === 1) {
            // Single product - return in legacy format for compatibility
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
            // Multiple products - return array with summary
            return {
                isMultiProduct: true,
                lineItems: result.lineItems.map(lineItem => ({
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
                })),
                summary: {
                    totalMasterCases: result.summary.totalMasterCases,
                    totalDisplayBoxes: result.summary.totalDisplayBoxes,
                    totalUnits: result.summary.totalUnits,
                    subtotal: this.formatCurrency(result.summary.subtotal),
                    shipping: this.formatCurrency(result.summary.shipping),
                    creditCardFee: this.formatCurrency(result.summary.creditCardFee),
                    grandTotal: this.formatCurrency(result.summary.grandTotal),
                    raw: {
                        subtotal: result.summary.subtotal,
                        shipping: result.summary.shipping,
                        creditCardFee: result.summary.creditCardFee,
                        grandTotal: result.summary.grandTotal
                    }
                }
            };
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

    // Generate line item ID
    generateLineItemId: function() {
        return `line-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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

function setShippingMode(mode) {
    MultiProductCalculator.setShippingMode(mode);
}

console.log('✅ FIXED Multi-product calculator module loaded successfully');
