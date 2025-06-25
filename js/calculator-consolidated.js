
/**
 * Consolidated Kanva Botanicals Quote Calculator
 * Combines features from calculator.js, kanva-calculator.js, and multi-product-calculator.js
 * 
 * Features:
 * - Single & multi-product calculations
 * - Robust tier pricing with unit/display box/case structure
 * - Shipping zone detection with LTL percentages
 * - Admin panel functionality
 * - Product line management (add/remove)
 * - Quote generation and email templates
 * - JSON data loading architecture
 * - Credit card fee calculation (3%)
 * - Manual shipping override
 */

class KanvaCalculator {
    constructor() {
        this.data = {
            products: {},
            tiers: {},
            shipping: { zones: {}, states: [] },
            payment: {},
            adminEmails: []
        };
        
        this.lineItems = [];
        this.quote = {
            products: [],
            lineItems: [], // Add missing lineItems array
            subtotal: 0,
            shipping: 0,
            creditCardFee: 0,
            total: 0,
            tierInfo: null
        };
        
        this.isAdmin = false;
        this.isReady = false;
        this.currentShippingZone = null;
        
        // Settings
        this.settings = {
            creditCardFeeRate: 0.03, // 3%
            shippingRateMin: 0.005,  // 0.5%
            shippingRateMax: 0.025,  // 2.5%
            palletThreshold: 0.5     // Half pallet threshold
        };
        
        // Admin password
        this.adminPassword = 'kanva123'; // Default admin password
    }

    /**
     * Initialize the calculator
     */
    async init() {
        console.log('🧮 Initializing Kanva Calculator...');
        
        try {
            await this.loadData();
            this.detectAdmin();
            this.initializeUI();
            this.updateEmptyState(); // Show empty state initially
            this.bindEvents();
            
            // Initialize order details manager if available
            if (typeof OrderDetailsManager !== 'undefined') {
                window.orderDetails = new OrderDetailsManager(this);
                console.log('📋 Order details manager initialized');
            }
            
            // Initialize admin manager if available
            if (typeof AdminManager !== 'undefined') {
                console.log('🔧 AdminManager class found, creating instance...');
                window.adminManager = new AdminManager(this);
                console.log('👥 Admin manager initialized:', window.adminManager);
                
                // Also create global reference for backward compatibility
                window.adminManager = window.adminManager;
            } else {
                console.error('❌ AdminManager class not found. Make sure admin-manager.js is loaded.');
            }
            
            this.isReady = true;
            this.showApp();
            
            console.log('✅ Kanva Calculator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize calculator:', error);
            this.showError('Failed to initialize calculator. Please refresh the page.');
        }
    }

    /**
     * Load all JSON data files
     */
    async loadData() {
        const dataFiles = ['products', 'tiers', 'shipping', 'payment', 'admin-emails'];
        
        for (const file of dataFiles) {
            try {
                const response = await fetch(`data/${file}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                
                if (file === 'admin-emails') {
                    this.data.adminEmails = data.emails || [];
                } else {
                    this.data[file] = data;
                }
                
                console.log(`✅ Loaded ${file}.json`);
            } catch (error) {
                console.error(`❌ Failed to load ${file}.json:`, error);
                throw error;
            }
        }
    }

    /**
     * Detect if current user is admin
     */
    detectAdmin() {
        // For testing: Make everyone an admin
        this.isAdmin = false;
        console.log('👤 Admin mode DISABLED for testing');
        
        // Original admin detection (commented out for reference):
        // const urlParams = new URLSearchParams(window.location.search);
        // const email = urlParams.get('email') || 'demo@kanvabotanicals.com';
        // this.isAdmin = this.data.adminEmails.includes(email);
        // console.log(`👤 User: ${email} (Admin: ${this.isAdmin})`);
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        this.populateProductDropdowns();
        this.populateStateDropdown();
        this.populateProductReference(); // Add product reference tiles
        this.updateAdminUI();
        
        console.log('✅ UI initialized with product reference tiles');
    }

    /**
     * Populate product dropdowns
     */
    populateProductDropdowns() {
        const productSelects = document.querySelectorAll('.product-select');
        
        productSelects.forEach(select => {
            this.populateProductDropdown(select);
        });
        
        console.log('✅ Product dropdowns populated');
    }

    populateProductDropdown(selectElement) {
        if (!selectElement) return;
        
        // Clear existing options except the first one
        selectElement.innerHTML = '<option value="">Select a product...</option>';
        
        // Handle both array and object product structures
        let products = [];
        if (Array.isArray(this.data.products)) {
            products = this.data.products;
        } else if (this.data.products && typeof this.data.products === 'object') {
            products = Object.entries(this.data.products).map(([key, product]) => ({
                ...product,
                id: key
            }));
        }
        
        // Sort products by name
        products.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
        
        // Add options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name || product.title || 'Unknown'} - ${product.sku || product.id || 'No SKU'}`;
            selectElement.appendChild(option);
        });
    }
    
    /**
     * Populate state dropdown from shipping zones
     */
    populateStateDropdown() {
        const stateSelect = document.getElementById('customerState');
        if (!stateSelect || !this.data.shipping?.zones) return;
        
        // Clear existing options
        stateSelect.innerHTML = '<option value="">Select state...</option>';
        
        // Collect all states from zones
        const allStates = [];
        Object.values(this.data.shipping.zones).forEach(zone => {
            if (zone.states && Array.isArray(zone.states)) {
                zone.states.forEach(stateCode => {
                    allStates.push({
                        code: stateCode,
                        name: this.getStateName(stateCode)
                    });
                });
            }
        });
        
        // Sort states alphabetically by name
        allStates.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add options
        allStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = state.name;
            stateSelect.appendChild(option);
        });
        
        console.log('✅ State dropdown populated with', allStates.length, 'states');
    }
    
    /**
     * Convert state code to full name
     */
    getStateName(code) {
        const stateNames = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
            'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
            'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
            'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        };
        return stateNames[code] || code;
    }
    
    /**
     * Update shipping zone display
     */
    updateShippingZoneDisplay() {
        const shippingZoneInfo = document.getElementById('shippingZoneInfo');
        if (!shippingZoneInfo) return;
        
        if (!this.currentShippingZone) {
            shippingZoneInfo.innerHTML = '<p class="text-muted">Select a state to see shipping information</p>';
            return;
        }
        
        const zoneData = this.data.shipping.zones[this.currentShippingZone];
        if (!zoneData) {
            shippingZoneInfo.innerHTML = '<p class="text-muted">No shipping information available</p>';
            return;
        }
        
        shippingZoneInfo.innerHTML = `
            <div class="shipping-zone-details">
                <div class="zone-header">
                    <span class="zone-name">${this.currentShippingZone.toUpperCase()}</span>
                    <span class="zone-color" style="background-color: ${zoneData.color || '#ccc'}"></span>
                </div>
                <div class="zone-info">
                    <p><strong>LTL Rate:</strong> ${zoneData.ltlPercentage}% of subtotal</p>
                    <p><strong>States:</strong> ${zoneData.states ? zoneData.states.join(', ') : 'N/A'}</p>
                </div>
            </div>
        `;
    }

    /**
     * Update admin UI based on current admin status
     */
    updateAdminUI() {
        const adminPanel = document.getElementById('adminPanel');
        const adminContent = document.getElementById('adminContent');
        
        // Always show the admin panel, but control access to features
        if (adminPanel) {
            adminPanel.style.display = 'block';
            document.body.classList.add('admin-panel-open');
        }
        
        if (adminContent) {
            if (this.isAdmin) {
                // Show full admin controls when authenticated
                adminContent.innerHTML = `
                    <div class="admin-controls">
                        <h4 class="text-lg font-semibold text-blue-800 mb-3">Admin Panel</h4>
                        <p class="text-sm text-green-600 mb-3">✅ Admin Mode Active</p>
                        
                        <div class="admin-buttons">
                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="calculator.showProductManager()">
                                📦 Manage Products
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="calculator.showTierManager()">
                                🏆 Manage Tiers
                            </button>
                            <button type="button" class="btn btn-outline-info btn-sm" onclick="calculator.showShippingManager()">
                                🚚 Manage Shipping
                            </button>
                            <button type="button" class="btn btn-outline-warning btn-sm" onclick="window.adminManager.showGitHubSettings()">
                                🔗 GitHub Settings
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="calculator.logoutAdmin()">
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Show login form when not authenticated
                adminContent.innerHTML = `
                    <div class="admin-controls">
                        <h4 class="text-lg font-semibold text-blue-800 mb-3">Admin Panel</h4>
                        <p class="text-sm text-gray-600 mb-3">Enter admin password to access management features</p>
                        
                        <div class="form-group mb-3">
                            <input type="password" id="adminPassword" class="form-control" placeholder="Admin Password" style="margin-bottom: 10px;">
                            <button type="button" class="btn btn-primary btn-sm" onclick="calculator.loginAdmin()">
                                🔑 Login
                            </button>
                        </div>
                    </div>
                `;
                
                // Add enter key support for password field
                setTimeout(() => {
                    const passwordField = document.getElementById('adminPassword');
                    if (passwordField) {
                        passwordField.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') {
                                this.loginAdmin();
                            }
                        });
                    }
                }, 100);
            }
        }
        
        console.log('✅ Admin UI updated');
    }

    /**
     * Toggle admin panel visibility
     */
    toggleAdminPanel() {
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            const isVisible = adminContent.style.display !== 'none';
            adminContent.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add Product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.addProductLine();
            });
        }

        // Customer state change for shipping zone detection
        const customerState = document.getElementById('customerState');
        if (customerState) {
            customerState.addEventListener('change', (e) => {
                this.updateShippingZone(e.target.value);
                this.calculateAll();
            });
        }

        // Admin toggle button
        const adminToggle = document.getElementById('adminToggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                if (this.isAdmin) {
                    this.showAdminPanel();
                } else {
                    this.showAdminLogin();
                }
            });
        }
        
        // Manual shipping override
        const manualShippingInput = document.getElementById('manualShipping');
        if (manualShippingInput) {
            manualShippingInput.addEventListener('input', () => {
                this.calculateAll();
            });
        }
        
        // Credit card fee toggle
        const creditCardFeeToggle = document.getElementById('includeCreditCardFee');
        if (creditCardFeeToggle) {
            creditCardFeeToggle.addEventListener('change', () => {
                this.calculateAll();
            });
        }
        
        console.log('✅ Event listeners bound');
    }

    /**
     * Show the app (hide loading state)
     */
    showApp() {
        const loadingElement = document.getElementById('loading');
        const appElement = document.getElementById('app');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (appElement) appElement.style.display = 'block';
        
        console.log('✅ App shown');
    }

    /**
     * Calculate all - main calculation method
     */
    calculateAll() {
        try {
            // Reset current quote
            this.quote = {
                products: [],
                lineItems: [], // Add missing lineItems array
                subtotal: 0,
                shipping: 0,
                creditCardFee: 0,
                total: 0,
                tierInfo: null
            };
            
            // Calculate based on line items
            this.calculateLineItems();
            this.calculateShipping();
            
            // Smart credit card fee calculation
            const subtotalWithShipping = this.quote.subtotal + this.quote.shipping;
            const includeCreditCardFee = document.getElementById('includeCreditCardFee')?.checked ?? true;
            
            if (includeCreditCardFee && subtotalWithShipping < 10000) {
                this.quote.creditCardFee = subtotalWithShipping * 0.03;
            } else {
                // No fee for orders $10K and above
                this.quote.creditCardFee = 0;
            }
            
            // Calculate total
            this.quote.total = this.quote.subtotal + this.quote.shipping + this.quote.creditCardFee;
            
            // Update UI
            this.updateCalculationDisplay();
            
            // Update order details if available
            if (window.orderDetails && this.quote.lineItems && this.quote.lineItems.length > 0) {
                window.orderDetails.renderLineItemDetails();
            }
            
            console.log('💰 Quote calculated:', this.quote);
        } catch (error) {
            console.error('❌ Calculation error:', error);
            this.showError('Error calculating quote. Please check your inputs.');
        }
    }

    /**
     * Legacy method for compatibility
     */
    calculateQuote() {
        this.calculateAll();
    }

    /**
     * Calculate line items
     */
    calculateLineItems() {
        this.quote.products = [];
        let totalCases = 0;
        
        // Process each line item
        this.lineItems.forEach(lineItem => {
            if (!lineItem.productData || !lineItem.masterCases) return;
            
            const product = lineItem.productData;
            const cases = lineItem.masterCases;
            
            // Calculate line total - handle different product data structures
            let unitPrice = 0;
            let unitsPerCase = 1;
            
            if (product.price !== undefined) {
                unitPrice = product.price;
            } else if (product.pricing && product.pricing.unit) {
                unitPrice = product.pricing.unit;
            }
            
            if (product.unitsPerCase !== undefined) {
                unitsPerCase = product.unitsPerCase;
            } else if (product.packaging && product.packaging.unitsPerCase) {
                unitsPerCase = product.packaging.unitsPerCase;
            }
            
            const lineTotal = cases * unitPrice * unitsPerCase;
            
            this.quote.products.push({
                key: lineItem.productKey,
                name: product.name || product.title || 'Unknown Product',
                sku: product.sku || product.id || '',
                cases: cases,
                displayBoxes: lineItem.displayBoxes || cases * 12,
                unitPrice: unitPrice,
                unitsPerCase: unitsPerCase,
                lineTotal: lineTotal
            });
            
            // Also populate lineItems for order details manager
            this.quote.lineItems.push({
                id: lineItem.id,
                productKey: lineItem.productKey,
                productName: product.name || product.title || 'Unknown Product',
                sku: product.sku || product.id || '',
                cases: cases,
                displayBoxes: lineItem.displayBoxes || cases * 12,
                unitPrice: unitPrice,
                unitsPerCase: unitsPerCase,
                lineTotal: lineTotal,
                productData: product
            });
            
            totalCases += cases;
        });
        
        this.quote.subtotal = this.quote.products.reduce((sum, p) => sum + p.lineTotal, 0);
        
        // Find applicable tier - handle both array and object structures
        let tier = null;
        if (Array.isArray(this.data.tiers)) {
            tier = this.data.tiers.find(t => totalCases >= t.threshold);
        } else if (this.data.tiers && typeof this.data.tiers === 'object') {
            // Find the highest tier that applies based on threshold
            let bestTier = null;
            for (const [tierKey, tierData] of Object.entries(this.data.tiers)) {
                if (totalCases >= (tierData.threshold || 0)) {
                    bestTier = { ...tierData, key: tierKey };
                }
            }
            tier = bestTier;
        }
        
        // Apply tier discount
        if (tier && tier.discount > 0) {
            this.quote.tierInfo = {
                tier: tier.key || tier.name || 'Unknown',
                discount: tier.discount * 100, // Convert to percentage
                totalCases: totalCases
            };
            this.quote.subtotal *= (1 - tier.discount);
            
            // Update product line totals with discount
            this.quote.products.forEach(product => {
                product.lineTotal *= (1 - tier.discount);
                product.unitPrice *= (1 - tier.discount);
            });
        }
    }

    /**
     * Calculate shipping based on zone and manual override
     */
    calculateShipping() {
        const manualShippingInput = document.getElementById('manualShipping');
        const manualShipping = manualShippingInput ? parseFloat(manualShippingInput.value) : 0;
        
        if (manualShipping > 0) {
            this.quote.shipping = manualShipping;
            return;
        }
        
        if (!this.currentShippingZone || this.quote.subtotal <= 0) {
            this.quote.shipping = 0;
            return;
        }
        
        // Get the zone data using the zone key
        const zoneData = this.data.shipping.zones[this.currentShippingZone];
        if (!zoneData) {
            console.error(`❌ Zone data not found for: ${this.currentShippingZone}`);
            this.quote.shipping = 0;
            return;
        }
        
        // Use LTL percentage for shipping calculation (convert percentage to decimal)
        const ltlPercentage = zoneData.ltlPercentage / 100;
        this.quote.shipping = this.quote.subtotal * ltlPercentage;
        
        console.log(`🚚 Shipping calculated: ${this.formatCurrency(this.quote.shipping)} (${zoneData.ltlPercentage}% of ${this.formatCurrency(this.quote.subtotal)})`);
    }

    /**
     * Update calculation display in the UI
     */
    updateCalculationDisplay() {
        // Update main calculation display
        document.getElementById('subtotalAmount').textContent = this.formatCurrency(this.quote.subtotal);
        document.getElementById('shippingAmount').textContent = this.formatCurrency(this.quote.shipping);
        document.getElementById('creditCardFee').textContent = this.formatCurrency(this.quote.creditCardFee);
        document.getElementById('totalAmount').textContent = this.formatCurrency(this.quote.total);
        
        // Update tier info if available
        const tierInfoElement = document.getElementById('tierInfo');
        if (tierInfoElement && this.quote.tierInfo) {
            tierInfoElement.style.display = 'block';
            tierInfoElement.innerHTML = `
                <strong>Tier Applied:</strong> ${this.quote.tierInfo.tier.toUpperCase()}<br>
                <strong>Discount:</strong> ${this.quote.tierInfo.discount}%<br>
                <strong>Volume:</strong> ${this.quote.tierInfo.totalCases} master cases
            `;
        } else if (tierInfoElement) {
            tierInfoElement.style.display = 'none';
        }
        
        // Update credit card fee label based on order amount
        const feeRow = document.querySelector('.calc-row:nth-child(3) span:first-child');
        if (feeRow) {
            const subtotalWithShipping = this.quote.subtotal + this.quote.shipping;
            if (subtotalWithShipping >= 10000) {
                feeRow.textContent = 'Credit Card Fee (Waived - $10K+):';
            } else {
                feeRow.textContent = 'Credit Card Fee (3%):';
            }
        }
        
        // Update shipping zone info
        this.updateShippingZoneDisplay();
        
        console.log('💰 Quote calculated:', this.quote);
    }

    /**
     * Add a new product line
     */
    addProductLine() {
        const lineId = `line_${Date.now()}`;
        const newLine = {
            id: lineId,
            productKey: '',
            masterCases: 0,
            displayBoxes: 0,
            productData: null
        };
        
        this.lineItems.push(newLine);
        this.renderProductLines();
        this.updateEmptyState();
        
        console.log('➕ Added product line:', lineId);
    }

    /**
     * Remove a product line
     */
    removeProductLine(lineId) {
        this.lineItems = this.lineItems.filter(item => item.id !== lineId);
        this.renderProductLines();
        this.updateEmptyState();
        this.calculateAll();
        
        console.log('➖ Removed product line:', lineId);
    }

    /**
     * Update product line
     */
    updateProductLine(lineId, field, value) {
        const lineItem = this.lineItems.find(item => item.id === lineId);
        if (!lineItem) return;

        if (field === 'productKey') {
            lineItem.productKey = value;
            lineItem.productData = this.data.products[value] || null;
        } else if (field === 'masterCases') {
            lineItem.masterCases = parseInt(value) || 0;
            // Auto-calculate display boxes (12 per master case)
            lineItem.displayBoxes = lineItem.masterCases * 12;
        } else if (field === 'displayBoxes') {
            lineItem.displayBoxes = parseInt(value) || 0;
            // Auto-calculate master cases (12 display boxes = 1 master case)
            lineItem.masterCases = Math.floor(lineItem.displayBoxes / 12);
        } else if (field === 'customUnitPrice') {
            lineItem.customUnitPrice = parseFloat(value) || 0;
        }

        // Check for upsell opportunities
        this.checkUpsellOpportunity(lineItem);
        
        this.renderProductLines();
        this.calculateAll();
    }

    /**
     * Check for upsell opportunities
     */
    checkUpsellOpportunity(lineItem) {
        if (!lineItem.displayBoxes || lineItem.displayBoxes < 8) return;

        const displayBoxes = lineItem.displayBoxes;
        const masterCases = Math.floor(displayBoxes / 12);
        const remainingBoxes = displayBoxes % 12;

        // Upsell if they're close to a full master case (8-11 display boxes remaining)
        if (remainingBoxes >= 8 && remainingBoxes < 12) {
            const suggestedBoxes = (masterCases + 1) * 12;
            const additionalBoxes = suggestedBoxes - displayBoxes;
            
            this.showUpsellAlert(lineItem, additionalBoxes, suggestedBoxes);
        } else {
            this.hideUpsellAlert();
        }
    }

    /**
     * Show upsell alert
     */
    showUpsellAlert(lineItem, additionalBoxes, suggestedBoxes) {
        const alertElement = document.getElementById('upsellAlert');
        const messageElement = document.getElementById('upsellMessage');
        const acceptBtn = document.getElementById('acceptUpsellBtn');

        if (!alertElement || !messageElement) return;

        const productName = lineItem.productData?.name || 'this product';
        messageElement.textContent = `Add ${additionalBoxes} more display boxes of ${productName} to complete a full master case (${suggestedBoxes} total boxes = ${Math.ceil(suggestedBoxes/12)} master cases)`;
        
        // Store upsell data for acceptance
        this.currentUpsell = {
            lineId: lineItem.id,
            suggestedBoxes: suggestedBoxes
        };

        alertElement.style.display = 'flex';
    }

    /**
     * Hide upsell alert
     */
    hideUpsellAlert() {
        const alertElement = document.getElementById('upsellAlert');
        if (alertElement) {
            alertElement.style.display = 'none';
        }
        this.currentUpsell = null;
    }

    /**
     * Accept upsell suggestion
     */
    acceptUpsell() {
        if (!this.currentUpsell) return;

        const lineItem = this.lineItems.find(item => item.id === this.currentUpsell.lineId);
        if (lineItem) {
            lineItem.displayBoxes = this.currentUpsell.suggestedBoxes;
            lineItem.masterCases = Math.floor(this.currentUpsell.suggestedBoxes / 12);
            
            this.renderProductLines();
            this.calculateAll();
            this.hideUpsellAlert();
            
            this.showNotification('✅ Upsell accepted! Order updated to full master cases.', 'success');
        }
    }

    /**
     * Render product lines
     */
    renderProductLines() {
        const container = document.getElementById('productLinesContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        if (this.lineItems.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        // Hide empty state when we have products
        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = this.lineItems.map(lineItem => {
            const product = lineItem.productData;
            const defaultUnitPrice = product ? (product.price || (product.pricing && product.pricing.unit) || 0) : 0;
            const currentUnitPrice = lineItem.customUnitPrice !== undefined ? lineItem.customUnitPrice : defaultUnitPrice;
            const isPriceOverridden = lineItem.customUnitPrice !== undefined;
            
            return `
            <div class="product-line" data-line-id="${lineItem.id}">
                <div class="product-line-header">
                    <span class="product-line-title">Product Line ${this.lineItems.indexOf(lineItem) + 1}</span>
                    <button type="button" class="product-line-remove" onclick="calculator.removeProductLine('${lineItem.id}')" title="Remove Product">
                        ×
                    </button>
                </div>
                
                <div class="grid grid-3" style="gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Product</label>
                        <select class="form-control" onchange="calculator.updateProductLine('${lineItem.id}', 'productKey', this.value)">
                            <option value="">Select Product...</option>
                            ${Object.entries(this.data.products).map(([key, product]) => `
                                <option value="${key}" ${lineItem.productKey === key ? 'selected' : ''}>
                                    ${product.name || product.title || key}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Master Cases</label>
                        <div class="quantity-input-group">
                            <input type="number" 
                                   class="form-control quantity-input" 
                                   value="${lineItem.masterCases || 0}"
                                   min="0"
                                   onchange="calculator.updateProductLine('${lineItem.id}', 'masterCases', this.value)">
                            <span class="quantity-label">cases</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Display Boxes</label>
                        <div class="quantity-input-group">
                            <input type="number" 
                                   class="form-control quantity-input" 
                                   value="${lineItem.displayBoxes || 0}"
                                   min="0"
                                   onchange="calculator.updateProductLine('${lineItem.id}', 'displayBoxes', this.value)">
                            <span class="quantity-label">boxes</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            Cost Per Unit 
                            ${isPriceOverridden ? '<span class="price-override-indicator" title="Price has been overridden">⚠️</span>' : ''}
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input type="number" 
                                   class="form-control ${isPriceOverridden ? 'price-overridden' : ''}" 
                                   value="${currentUnitPrice.toFixed(2)}"
                                   step="0.01"
                                   min="0"
                                   placeholder="${defaultUnitPrice.toFixed(2)}"
                                   onchange="calculator.updateProductLine('${lineItem.id}', 'customUnitPrice', this.value)"
                                   ${!product ? 'disabled' : ''}>
                        </div>
                        ${isPriceOverridden ? `
                            <small class="text-muted">
                                Default: $${defaultUnitPrice.toFixed(2)} 
                                <button type="button" class="btn-link" onclick="calculator.resetUnitPrice('${lineItem.id}')" title="Reset to default price">
                                    Reset
                                </button>
                            </small>
                        ` : ''}
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Total Units</label>
                        <div class="form-control" style="background: #f8f9fa; font-weight: 600;">
                            ${lineItem.displayBoxes ? (lineItem.displayBoxes * 12).toLocaleString() : '0'} units
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Line Total</label>
                        <div class="form-control" style="background: #f8f9fa; font-weight: 600; color: var(--primary-color);">
                            ${this.calculateLineTotal(lineItem)}
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
        
        // Trigger calculation and order details update
        this.calculateAll();
    }

    /**
     * Calculate line total for display
     */
    calculateLineTotal(lineItem) {
        if (!lineItem.productData || !lineItem.displayBoxes) return '$0.00';

        const product = lineItem.productData;
        const displayBoxes = lineItem.displayBoxes;
        
        // Get unit price
        let unitPrice = product.price || (product.pricing && product.pricing.unit) || 0;
        
        if (lineItem.customUnitPrice !== undefined) {
            unitPrice = lineItem.customUnitPrice;
        }
        
        // Calculate total (12 units per display box)
        const totalUnits = displayBoxes * 12;
        const lineTotal = totalUnits * unitPrice;
        
        return this.formatCurrency(lineTotal);
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const addBtn = document.getElementById('addProductBtn');
        
        if (emptyState) {
            emptyState.style.display = this.lineItems.length === 0 ? 'block' : 'none';
        }
        
        if (addBtn) {
            addBtn.style.display = this.lineItems.length === 0 ? 'none' : 'inline-block';
        }
    }

    /**
     * Populate product reference tiles with enhanced image-based design
     */
    populateProductReference() {
        const container = document.getElementById('productCatalog');
        if (!container || !this.data.products) return;

        container.innerHTML = '';

        Object.entries(this.data.products).forEach(([key, product]) => {
            const tile = document.createElement('div');
            tile.className = 'product-tile';
            tile.dataset.productKey = key;

            // Create badges
            const badges = [];
            if (product.isBestSeller) {
                badges.push('<span class="product-badge badge-bestseller">Best Seller</span>');
            }
            if (product.isNewProduct) {
                badges.push('<span class="product-badge badge-new">New</span>');
            }
            if (product.category) {
                const categoryName = product.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                badges.push(`<span class="product-badge badge-category">${categoryName}</span>`);
            }

            // Calculate pricing
            const unitPrice = product.price.toFixed(2);
            const displayBoxPrice = (product.price * product.unitsPerDisplayBox).toFixed(2);
            const masterCasePrice = (product.price * product.unitsPerCase).toFixed(2);

            tile.innerHTML = `
                <button class="add-to-quote-btn" title="Add to Quote">+</button>
                
                <div class="product-image-container">
                    <img src="${product.image || 'assets/logo/kanva-logo.png'}" 
                         alt="${product.name}" 
                         class="product-image"
                         onerror="this.src='assets/logo/kanva-logo.png'">
                </div>
                
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    
                    <div class="product-description">${product.description}</div>
                    
                    ${badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : ''}
                    
                    <div class="product-pricing">
                        <div class="price-row">
                            <span class="price-label">Unit:</span>
                            <span class="price-value price-primary">$${unitPrice}</span>
                        </div>
                        <div class="price-row">
                            <span class="price-label">Display Box (${product.unitsPerDisplayBox}):</span>
                            <span class="price-value">$${displayBoxPrice}</span>
                        </div>
                        <div class="price-row">
                            <span class="price-label">Master Case (${product.unitsPerCase}):</span>
                            <span class="price-value">$${masterCasePrice}</span>
                        </div>
                    </div>
                </div>
            `;

            // Add click event listener
            tile.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectProductFromTile(key);
            });

            container.appendChild(tile);
        });
    }

    /**
     * Select product from reference tile
     */
    selectProductFromTile(productKey) {
        // Remove previous selections
        document.querySelectorAll('.product-tile').forEach(tile => {
            tile.classList.remove('selected');
        });
        
        // Mark this tile as selected
        const selectedTile = document.querySelector(`[data-product-key="${productKey}"]`);
        if (selectedTile) {
            selectedTile.classList.add('selected');
        }

        // If no product lines exist, create one
        if (this.lineItems.length === 0) {
            this.addProductLine();
        }

        // Set the product for the first empty line or create a new one
        let targetLine = this.lineItems.find(item => !item.productKey);
        if (!targetLine) {
            this.addProductLine();
            targetLine = this.lineItems[this.lineItems.length - 1];
        }

        // Update the line with selected product
        this.updateProductLine(targetLine.id, 'productKey', productKey);
        
        this.showNotification(`✅ ${this.data.products[productKey].name} added to quote`, 'success');
    }

    /**
     * Get shipping zone for a given state
     */
    getShippingZone(state) {
        if (!state || !this.data.shipping?.zones) return null;
        
        // Iterate through zones object (not array)
        for (const [zoneKey, zone] of Object.entries(this.data.shipping.zones)) {
            if (zone.states && zone.states.includes(state)) {
                return {
                    ...zone,
                    key: zoneKey
                };
            }
        }
        
        return null;
    }

    /**
     * Generate unique line item ID
     */
    generateLineItemId() {
        return 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Format currency values
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    /**
     * Format large numbers with commas
     */
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number || 0);
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('❌ Error:', message);
        // You can implement a toast notification or modal here
        alert(message);
    }

    /**
     * Generate quote for email
     */
    generateQuote() {
        if (this.quote.total <= 0) {
            this.showError('Please add products and calculate before generating a quote.');
            return;
        }
        
        let quoteText = `KANVA BOTANICALS QUOTE\n`;
        quoteText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        // Product details
        quoteText += `PRODUCTS:\n`;
        this.quote.products.forEach(product => {
            quoteText += `• ${product.name}: ${product.cases} cases @ ${this.formatCurrency(product.unitPrice)}/unit\n`;
            quoteText += `  Total: ${this.formatCurrency(product.lineTotal)}\n`;
        });
        
        // Totals
        quoteText += `\nORDER SUMMARY:\n`;
        quoteText += `Subtotal: ${this.formatCurrency(this.quote.subtotal)}\n`;
        quoteText += `Shipping: ${this.formatCurrency(this.quote.shipping)}\n`;
        if (this.quote.creditCardFee > 0) {
            quoteText += `Credit Card Fee (3%): ${this.formatCurrency(this.quote.creditCardFee)}\n`;
        }
        quoteText += `TOTAL: ${this.formatCurrency(this.quote.total)}\n`;
        
        if (this.quote.tierInfo) {
            quoteText += `\nTier Discount Applied: ${this.quote.tierInfo.tier} (${this.quote.tierInfo.discount}%)\n`;
        }
        
        return quoteText;
    }

    /**
     * Copy quote to clipboard
     */
    copyQuote() {
        const quote = this.generateQuote();
        if (quote) {
            navigator.clipboard.writeText(quote).then(() => {
                this.showNotification('Quote copied to clipboard!', 'success');
            }).catch(() => {
                this.showError('Failed to copy quote to clipboard.');
            });
        }
    }

    /**
     * Show product manager
     */
    showProductManager() {
        console.log('🔧 showProductManager called');
        console.log('adminManager exists:', typeof adminManager !== 'undefined');
        console.log('window.adminManager exists:', typeof window.adminManager !== 'undefined');
        
        if (window.adminManager) {
            console.log('✅ Calling adminManager.showProductManager()');
            window.adminManager.showProductManager();
        } else if (typeof adminManager !== 'undefined') {
            console.log('✅ Calling global adminManager.showProductManager()');
            adminManager.showProductManager();
        } else {
            console.error('❌ Admin manager not found');
            alert('Admin manager not initialized. Please refresh the page and try again.');
        }
    }

    /**
     * Show tier manager
     */
    showTierManager() {
        console.log('🔧 showTierManager called');
        console.log('adminManager exists:', typeof adminManager !== 'undefined');
        console.log('window.adminManager exists:', typeof window.adminManager !== 'undefined');
        
        if (window.adminManager) {
            console.log('✅ Calling adminManager.showTierManager()');
            window.adminManager.showTierManager();
        } else if (typeof adminManager !== 'undefined') {
            console.log('✅ Calling global adminManager.showTierManager()');
            adminManager.showTierManager();
        } else {
            console.error('❌ Admin manager not found');
            alert('Admin manager not initialized. Please refresh the page and try again.');
        }
    }

    /**
     * Show shipping manager
     */
    showShippingManager() {
        console.log('🔧 showShippingManager called');
        console.log('adminManager exists:', typeof adminManager !== 'undefined');
        console.log('window.adminManager exists:', typeof window.adminManager !== 'undefined');
        
        if (window.adminManager) {
            console.log('✅ Calling adminManager.showShippingManager()');
            window.adminManager.showShippingManager();
        } else if (typeof adminManager !== 'undefined') {
            console.log('✅ Calling global adminManager.showShippingManager()');
            adminManager.showShippingManager();
        } else {
            console.error('❌ Admin manager not found');
            alert('Admin manager not initialized. Please refresh the page and try again.');
        }
    }

    /**
     * Export configuration
     */
    exportConfig() {
        if (adminManager) {
            adminManager.downloadJSON('config', {
                products: this.data.products,
                tiers: this.data.tiers,
                shipping: this.data.shipping,
                timestamp: new Date().toISOString()
            });
        } else {
            // Fallback to original method
            const config = {
                products: this.data.products,
                tiers: this.data.tiers,
                shipping: this.data.shipping,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kanva-config-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Email quote
     */
    emailQuote() {
        const quote = this.generateQuote();
        if (quote) {
            const subject = encodeURIComponent('Kanva Botanicals Quote');
            const body = encodeURIComponent(quote);
            window.open(`mailto:?subject=${subject}&body=${body}`);
        }
    }

    /**
     * Login as admin
     */
    loginAdmin() {
        const passwordField = document.getElementById('adminPassword');
        if (passwordField) {
            const password = passwordField.value.trim();
            if (password === this.adminPassword) {
                this.isAdmin = true;
                this.updateAdminUI();
            } else {
                this.showError('Invalid admin password. Please try again.');
            }
        }
    }

    /**
     * Logout as admin
     */
    logoutAdmin() {
        this.isAdmin = false;
        this.updateAdminUI();
    }

    /**
     * Delete a line item from the quote
     */
    deleteLineItem(lineId) {
        // Find and remove from lineItems array
        const lineIndex = this.lineItems.findIndex(item => item.id === lineId);
        if (lineIndex !== -1) {
            this.lineItems.splice(lineIndex, 1);
        }

        // Re-render everything
        this.renderProductLines();
        this.calculateAll();
        this.updateEmptyState();
        
        // Update order details if available
        if (window.orderDetails && this.quote.lineItems && this.quote.lineItems.length > 0) {
            window.orderDetails.renderLineItemDetails();
        }

        this.showNotification('Line item deleted successfully', 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type) {
        console.log(`📣 ${type}: ${message}`);
        // You can implement a toast notification or modal here
        alert(message);
    }

    /**
     * Reset unit price to default
     */
    resetUnitPrice(lineId) {
        const lineItem = this.lineItems.find(item => item.id === lineId);
        if (lineItem) {
            delete lineItem.customUnitPrice;
            this.renderProductLines();
            this.calculateAll();
        }
    }

    /**
     * Update shipping zone based on customer state
     */
    updateShippingZone(state) {
        if (!state) {
            this.currentShippingZone = null;
            return;
        }

        // Find the shipping zone for this state
        const zones = this.data.shipping.zones;
        for (const [zoneKey, zone] of Object.entries(zones)) {
            if (zone.states && zone.states.includes(state.toUpperCase())) {
                this.currentShippingZone = zoneKey;
                console.log(`🚚 Shipping zone updated to: ${zoneKey} for state: ${state}`);
                return;
            }
        }

        // If no zone found, default to null
        this.currentShippingZone = null;
        console.log(`⚠️ No shipping zone found for state: ${state}`);
    }
}

// Global instance
let calculator;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting Kanva Calculator...');
    
    calculator = new KanvaCalculator();
    await calculator.init();
    
    // Make calculator globally available for HTML onclick handlers
    window.calculator = calculator;
});

console.log('✅ Consolidated Kanva Calculator module loaded successfully');