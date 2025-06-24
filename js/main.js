// Kanva Botanicals Quote Calculator - Main Application
// Version 2.0 - Enhanced with all products and zone-based shipping

// Global state
const appState = {
    currentMode: 'single',
    currentUser: null,
    isAdmin: false,
    copperContext: null,
    sdk: null,
    isCopperActive: false,
    isActivityPanel: false,
    isModalMode: false,
    isLeftNav: true
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Kanva Botanicals Quote Calculator v2.0');
    
    // Initialize components
    initializeApp();
    
    // Initialize Copper CRM integration
    if (typeof CopperIntegration !== 'undefined') {
        CopperIntegration.initialize();
    }
    
    // Set initial values
    updateProductInfo();
    
    // Add event listeners
    addEventListeners();
});

// Initialize application
function initializeApp() {
    // Check environment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('location') === 'activity_panel') {
        appState.isActivityPanel = true;
        appState.isLeftNav = false;
        document.body.classList.add('activity-panel-mode');
    }
    
    // Set default product
    const productSelect = document.getElementById('primaryProduct');
    if (productSelect && productSelect.options.length > 0) {
        productSelect.selectedIndex = 0;
        updateProductInfo();
    }
    
    // Initialize notifications if available
    if (typeof NotificationManager !== 'undefined') {
        NotificationManager.init();
    }
}

// Add event listeners
function addEventListeners() {
    // Product changes
    const productSelect = document.getElementById('primaryProduct');
    if (productSelect) {
        productSelect.addEventListener('change', updateProductInfo);
    }
    
    // Quantity changes
    const displayBoxes = document.getElementById('displayBoxes');
    const masterCases = document.getElementById('masterCases');
    
    if (displayBoxes) {
        displayBoxes.addEventListener('input', calculateAndUpdate);
    }
    
    if (masterCases) {
        masterCases.addEventListener('input', calculateAndUpdate);
    }
    
    // State change for shipping
    const stateSelect = document.getElementById('customerState');
    if (stateSelect) {
        stateSelect.addEventListener('change', calculateAndUpdate);
    }
}

// Update product information display
function updateProductInfo() {
    const productKey = document.getElementById('primaryProduct')?.value;
    if (!productKey) return;
    
    const product = products[productKey];
    if (!product) return;
    
    // Update display box info
    const displayBoxInfo = document.getElementById('displayBoxInfo');
    if (displayBoxInfo) {
        displayBoxInfo.textContent = `${product.unitsPerDisplayBox} units per box, ${product.displayBoxesPerCase} boxes = 1 master case`;
    }
    
    // Update max retail price
    const maxRetailPrice = document.getElementById('maxRetailPrice');
    if (maxRetailPrice) {
        maxRetailPrice.value = `$${product.msrp.toFixed(2)}`;
    }
    
    // Update quote name if needed
    updateQuoteName();
    
    // Trigger calculation
    calculateAndUpdate();
}

// Update quote name based on product and company
function updateQuoteName() {
    const quoteNameInput = document.getElementById('quoteName');
    const companyNameInput = document.getElementById('companyName');
    const productSelect = document.getElementById('primaryProduct');
    
    if (quoteNameInput && !quoteNameInput.value && productSelect) {
        const product = products[productSelect.value];
        const companyName = companyNameInput?.value || 'Company';
        if (product) {
            quoteNameInput.value = `${product.name} Quote for ${companyName}`;
        }
    }
}

// Calculate and update display
function calculateAndUpdate() {
    const calc = Calculator.calculateOrder();
    if (!calc) {
        displayEmptyState();
        return;
    }
    
    displayCalculation(calc);
}

// Display calculation results
function displayCalculation(calc) {
    const resultsDiv = document.getElementById('calculationResults');
    if (!resultsDiv) return;
    
    let html = '<div class="calculation-breakdown">';
    
    // Product info
    html += `
        <div class="calculation-header">
            <strong>${calc.product.name} - ${calc.masterCases} Master Cases</strong>
        </div>
    `;
    
    // Units breakdown
    html += `
        <div class="calculation-item">
            <span>📦 ${calc.displayBoxes} Display Boxes | ${calc.totalUnits.toLocaleString()} Individual Units</span>
        </div>
    `;
    
    // Pricing
    html += `
        <div class="calculation-item">
            <span>💰 Unit Price: ${calc.unitPrice} | Case Price: ${calc.casePrice}</span>
        </div>
    `;
    
    // Subtotal
    html += `
        <div class="calculation-item">
            <span>📊 Subtotal:</span>
            <span>${calc.subtotal}</span>
        </div>
    `;
    
    // Volume discount if applicable
    if (calc.discountAmount) {
        html += `
            <div class="calculation-item">
                <span>🏷️ Volume Discount <span class="tier-badge">${calc.tierInfo.name}</span></span>
                <span>-${calc.discountAmount}</span>
            </div>
            <div class="calculation-item">
                <span>Discounted Subtotal:</span>
                <span>${calc.discountedSubtotal}</span>
            </div>
        `;
    }
    
    // Shipping
    html += `
        <div class="calculation-item">
            <span>🚚 Shipping ${calc.shippingZone ? `(${calc.shippingZone})` : ''}</span>
            <span>${calc.shipping}</span>
        </div>
    `;
    
    if (calc.freeShipping) {
        html += `<div class="free-shipping-notice">✅ Free shipping on orders over $${shippingConfig.freeShippingThreshold}</div>`;
    }
    
    // Total
    html += `
        <div class="calculation-item total">
            <span>TOTAL:</span>
            <span>${calc.total}</span>
        </div>
    `;
    
    html += '</div>';
    
    // Add manual shipping override option
    const shippingOverride = document.querySelector('.shipping-override');
    if (shippingOverride && calc.raw.total > 0) {
        shippingOverride.style.display = 'block';
    }
    
    resultsDiv.innerHTML = html;
}

// Display empty state
function displayEmptyState() {
    const resultsDiv = document.getElementById('calculationResults');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<p class="empty-state">Enter product details to see calculation</p>';
    }
}

// Set calculator mode (single/multiple)
function setMode(mode) {
    appState.currentMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Show/hide appropriate sections
    const singleMode = document.getElementById('singleProductMode');
    const multiMode = document.getElementById('multipleProductMode');
    
    if (mode === 'single') {
        singleMode.style.display = 'block';
        multiMode.style.display = 'none';
        calculateAndUpdate();
    } else {
        singleMode.style.display = 'none';
        multiMode.style.display = 'block';
        if (typeof initializeMultiProduct === 'function') {
            initializeMultiProduct();
        }
    }
}

// Toggle manual shipping override
function toggleManualShipping() {
    const checkbox = document.getElementById('manualShipping');
    const amountInput = document.getElementById('manualShippingAmount');
    
    if (checkbox.checked) {
        amountInput.style.display = 'block';
        amountInput.focus();
    } else {
        amountInput.style.display = 'none';
        amountInput.value = '';
        calculateAndUpdate();
    }
}

// Generate professional email
function generateEmail() {
    const calc = Calculator.calculateOrder();
    if (!calc) {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Please calculate a quote first');
        }
        return;
    }
    
    if (typeof EmailGenerator !== 'undefined') {
        EmailGenerator.generate(calc);
    }
}

// Save quote to CRM
function saveQuoteToCRM() {
    if (typeof CopperIntegration !== 'undefined' && CopperIntegration.isCrmAvailable()) {
        CopperIntegration.saveQuoteToCRM();
    } else {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showInfo('CRM integration not available');
        }
    }
}

// Create opportunity in CRM
function createOpportunity() {
    if (typeof CopperIntegration !== 'undefined' && CopperIntegration.isCrmAvailable()) {
        CopperIntegration.createOpportunity();
    } else {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showInfo('CRM integration not available');
        }
    }
}

// Add product line (for multi-product mode)
function addProductLine() {
    if (typeof MultiProductCalculator !== 'undefined') {
        MultiProductCalculator.addProductLine();
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions for global use
window.setMode = setMode;
window.generateEmail = generateEmail;
window.saveQuoteToCRM = saveQuoteToCRM;
window.createOpportunity = createOpportunity;
window.addProductLine = addProductLine;
window.toggleManualShipping = toggleManualShipping;
window.calculateAndUpdate = calculateAndUpdate;
window.updateProductInfo = updateProductInfo;

console.log('✅ Main application loaded successfully');
