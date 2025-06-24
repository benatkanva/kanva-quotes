// Missing Functions for Kanva Quote Calculator
// This file contains all the missing global functions referenced in HTML onclick handlers

// =============================================================================
// TAX DETECTION FUNCTIONS
// =============================================================================

// Auto-detect tax rate based on customer location
function autoDetectTaxRate() {
    try {
        console.log('🏛️ Auto-detecting tax rate...');
        
        // Get customer state from form
        const stateField = document.getElementById('stateTaxRate') || 
                          document.querySelector('input[placeholder*="State"]') ||
                          document.querySelector('select[name*="state"]');
        
        if (!stateField) {
            console.warn('No state field found for tax detection');
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showWarning('Please enter customer state for accurate tax calculation');
            }
            return;
        }

        let state = '';
        
        // Try to get state from different possible fields
        if (stateField.value) {
            state = stateField.value.toUpperCase().substring(0, 2);
        } else {
            // Try to get from customer info fields
            const customerFields = ['customerState', 'companyState', 'billingState'];
            for (const fieldId of customerFields) {
                const field = document.getElementById(fieldId);
                if (field && field.value) {
                    state = field.value.toUpperCase().substring(0, 2);
                    break;
                }
            }
        }

        if (!state) {
            console.warn('No state information found');
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showInfo('Enter customer state to calculate tax automatically');
            }
            return;
        }

        // State tax rates (simplified - in production, use a tax API)
        const stateTaxRates = {
            'CA': 7.25,  // California
            'NY': 8.0,   // New York
            'TX': 6.25,  // Texas
            'FL': 6.0,   // Florida
            'WA': 6.5,   // Washington
            'IL': 6.25,  // Illinois
            'PA': 6.0,   // Pennsylvania
            'OH': 5.75,  // Ohio
            'GA': 4.0,   // Georgia
            'NC': 4.75,  // North Carolina
            'MI': 6.0,   // Michigan
            'NJ': 6.625, // New Jersey
            'VA': 5.3,   // Virginia
            'TN': 7.0,   // Tennessee
            'AZ': 5.6,   // Arizona
            'MA': 6.25,  // Massachusetts
            'IN': 7.0,   // Indiana
            'WI': 5.0,   // Wisconsin
            'CO': 2.9,   // Colorado
            'MN': 6.875, // Minnesota
            'MD': 6.0,   // Maryland
            'MO': 4.225, // Missouri
            'AL': 4.0,   // Alabama
            'LA': 4.45,  // Louisiana
            'KY': 6.0,   // Kentucky
            'SC': 6.0,   // South Carolina
            'OK': 4.5,   // Oklahoma
            'AR': 6.5,   // Arkansas
            'IA': 6.0,   // Iowa
            'KS': 6.5,   // Kansas
            'UT': 5.95,  // Utah
            'NV': 6.85,  // Nevada
            'NM': 5.125, // New Mexico
            'WV': 6.0,   // West Virginia
            'NE': 5.5,   // Nebraska
            'ID': 6.0,   // Idaho
            'HI': 4.0,   // Hawaii
            'ME': 5.5,   // Maine
            'RI': 7.0,   // Rhode Island
            'VT': 6.0,   // Vermont
            'CT': 6.35,  // Connecticut
            'AK': 0,     // Alaska - no state tax
            'DE': 0,     // Delaware - no state tax
            'MT': 0,     // Montana - no state tax
            'NH': 0,     // New Hampshire - no state tax
            'OR': 0      // Oregon - no state tax
        };

        const taxRate = stateTaxRates[state] || 0;
        
        // Update the state tax rate field
        const stateTaxInput = document.getElementById('stateTaxRate');
        if (stateTaxInput) {
            stateTaxInput.value = taxRate.toFixed(2);
        }

        // Log success
        console.log(`✅ Tax rate for ${state}: ${taxRate}%`);
        
        if (typeof NotificationManager !== 'undefined') {
            if (taxRate > 0) {
                NotificationManager.showSuccess(`Tax rate detected: ${taxRate}% for ${state}`);
            } else {
                NotificationManager.showInfo(`${state} has no state sales tax`);
            }
        }

        // Trigger calculation update if calculator is available
        if (typeof Calculator !== 'undefined' && Calculator.calculateQuote) {
            Calculator.calculateQuote();
        } else if (typeof calculateMultiProductTotal === 'function') {
            calculateMultiProductTotal();
        }

    } catch (error) {
        console.error('❌ Error auto-detecting tax rate:', error);
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Failed to auto-detect tax rate: ' + error.message);
        }
    }
}

// =============================================================================
// MULTI-PRODUCT FUNCTIONS
// =============================================================================

// Add new product line to multi-product calculator
function addProductLine() {
    try {
        console.log('➕ Adding product line...');
        
        // Get the product lines container
        const container = document.getElementById('productLines');
        if (!container) {
            console.error('Product lines container not found');
            return;
        }

        // Generate unique ID for this line
        const lineId = `line-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Create product line HTML
        const productLineHTML = `
            <div class="product-line" id="${lineId}" data-line-id="${lineId}">
                <div class="product-line-header">
                    <h4>Product Line ${container.children.length + 1}</h4>
                    <button type="button" class="remove-line-btn" onclick="removeProductLine('${lineId}')">🗑️ Remove</button>
                </div>
                <div class="product-line-fields">
                    <div class="input-group">
                        <label>Product:</label>
                        <select onchange="updateProductLine('${lineId}', 'product', this.value)">
                            <option value="focus">Focus + Flow (4.5)</option>
                            <option value="release">Release + Relax (4.5)</option>
                            <option value="zoom">Kanva Zoom (3.1)</option>
                            <option value="mango">Kanva Mango (6.99)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Master Cases:</label>
                        <input type="number" min="1" value="28" onchange="updateProductLine('${lineId}', 'cases', this.value)">
                    </div>
                    <div class="product-line-totals">
                        <div class="line-total">
                            <span class="total-label">Line Total:</span>
                            <span class="total-amount" id="${lineId}-total">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to container
        container.insertAdjacentHTML('beforeend', productLineHTML);
        
        // Calculate totals
        calculateMultiProductTotal();
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Product line added successfully');
        }
        
    } catch (error) {
        console.error('❌ Error adding product line:', error);
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Failed to add product line: ' + error.message);
        }
    }
}

// Remove product line from multi-product calculator
function removeProductLine(lineId) {
    try {
        console.log(`🗑️ Removing product line: ${lineId}`);
        
        const lineElement = document.getElementById(lineId);
        if (!lineElement) {
            console.warn(`Product line ${lineId} not found`);
            return;
        }

        // Don't allow removing the last line
        const container = document.getElementById('productLines');
        if (container && container.children.length <= 1) {
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showWarning('Cannot remove the last product line');
            }
            return;
        }

        // Remove the line
        lineElement.remove();
        
        // Recalculate totals
        calculateMultiProductTotal();
        
        // Renumber remaining lines
        renumberProductLines();
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Product line removed');
        }
        
    } catch (error) {
        console.error('❌ Error removing product line:', error);
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Failed to remove product line: ' + error.message);
        }
    }
}

// Update product line data
function updateProductLine(lineId, field, value) {
    try {
        console.log(`📝 Updating line ${lineId}, field ${field}, value: ${value}`);
        
        // Store the update (you could extend this to store in a data structure)
        const lineElement = document.getElementById(lineId);
        if (!lineElement) {
            console.warn(`Product line ${lineId} not found`);
            return;
        }

        // Set data attribute for the field
        lineElement.setAttribute(`data-${field}`, value);
        
        // Recalculate totals
        calculateMultiProductTotal();
        
    } catch (error) {
        console.error('❌ Error updating product line:', error);
    }
}

// Calculate multi-product total
function calculateMultiProductTotal() {
    try {
        console.log('🧮 Calculating multi-product total...');
        
        const container = document.getElementById('productLines');
        if (!container) {
            console.warn('Product lines container not found');
            return 0;
        }

        // Product prices (should match your config.js)
        const productPrices = {
            focus: { price: 4.5, unitsPerCase: 144 },
            release: { price: 4.5, unitsPerCase: 96 },
            zoom: { price: 3.1, unitsPerCase: 144 },
            mango: { price: 6.99, unitsPerCase: 144 }
        };

        let grandTotal = 0;
        let totalCases = 0;

        // Calculate each line
        const lines = container.querySelectorAll('.product-line');
        lines.forEach(line => {
            const lineId = line.id;
            const productSelect = line.querySelector('select');
            const casesInput = line.querySelector('input[type="number"]');
            
            if (!productSelect || !casesInput) return;

            const productKey = productSelect.value;
            const masterCases = parseInt(casesInput.value) || 0;
            const product = productPrices[productKey];
            
            if (!product) return;

            // Calculate line total
            const totalUnits = masterCases * product.unitsPerCase;
            const lineTotal = totalUnits * product.price;
            
            // Update line total display
            const lineTotalElement = document.getElementById(`${lineId}-total`);
            if (lineTotalElement) {
                lineTotalElement.textContent = `$${lineTotal.toFixed(2)}`;
            }

            grandTotal += lineTotal;
            totalCases += masterCases;
        });

        // Apply volume discounts (if any)
        let discountedTotal = grandTotal;
        let discountTier = '';
        
        if (totalCases >= 10) {
            discountedTotal = grandTotal * 0.85; // 15% off
            discountTier = 'Tier 3 (15% off)';
        } else if (totalCases >= 5) {
            discountedTotal = grandTotal * 0.90; // 10% off
            discountTier = 'Tier 2 (10% off)';
        } else {
            discountTier = 'Tier 1 (no discount)';
        }

        // Apply taxes
        const stateTaxRate = parseFloat(document.getElementById('stateTaxRate')?.value || 0) / 100;
        const countyTaxRate = parseFloat(document.getElementById('countyTaxRate')?.value || 0) / 100;
        const totalTaxRate = stateTaxRate + countyTaxRate;
        const taxAmount = discountedTotal * totalTaxRate;
        
        // Apply credit card fee if checked
        const creditCardFeeCheckbox = document.getElementById('creditCardFee');
        const creditCardFee = (creditCardFeeCheckbox && creditCardFeeCheckbox.checked) ? 
                             (discountedTotal + taxAmount) * 0.03 : 0;

        const finalTotal = discountedTotal + taxAmount + creditCardFee;

        // Update results display
        updateMultiProductResultsDisplay({
            subtotal: grandTotal,
            discountedSubtotal: discountedTotal,
            discountTier: discountTier,
            totalCases: totalCases,
            taxAmount: taxAmount,
            creditCardFee: creditCardFee,
            finalTotal: finalTotal
        });

        console.log(`✅ Multi-product calculation complete: $${finalTotal.toFixed(2)}`);
        return finalTotal;

    } catch (error) {
        console.error('❌ Error calculating multi-product total:', error);
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Failed to calculate total: ' + error.message);
        }
        return 0;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Renumber product lines after removal
function renumberProductLines() {
    const container = document.getElementById('productLines');
    if (!container) return;

    const lines = container.querySelectorAll('.product-line');
    lines.forEach((line, index) => {
        const header = line.querySelector('.product-line-header h4');
        if (header) {
            header.textContent = `Product Line ${index + 1}`;
        }
    });
}

// Update multi-product results display
function updateMultiProductResultsDisplay(results) {
    const resultsContainer = document.getElementById('multiProductResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
        <div class="multi-product-summary">
            <h4>Order Summary</h4>
            <div class="summary-line">
                <span>Total Cases:</span>
                <span><strong>${results.totalCases}</strong></span>
            </div>
            <div class="summary-line">
                <span>Subtotal:</span>
                <span>$${results.subtotal.toFixed(2)}</span>
            </div>
            ${results.discountedSubtotal !== results.subtotal ? `
                <div class="summary-line discount">
                    <span>After Volume Discount (${results.discountTier}):</span>
                    <span>$${results.discountedSubtotal.toFixed(2)}</span>
                </div>
            ` : ''}
            ${results.taxAmount > 0 ? `
                <div class="summary-line">
                    <span>Tax:</span>
                    <span>$${results.taxAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            ${results.creditCardFee > 0 ? `
                <div class="summary-line">
                    <span>Credit Card Fee (3%):</span>
                    <span>$${results.creditCardFee.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="summary-line total">
                <span><strong>Grand Total:</strong></span>
                <span><strong>$${results.finalTotal.toFixed(2)}</strong></span>
            </div>
        </div>
    `;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize missing functions when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Missing functions module initialized');
    });
} else {
    console.log('✅ Missing functions module loaded');
}

console.log('🔧 Missing functions module loaded successfully');
