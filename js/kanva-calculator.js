/**
 * Kanva Botanicals Quote Calculator - Consolidated Module
 * Handles all core functionality: data loading, calculations, and UI updates
 */

class KanvaCalculator {
    constructor() {
        this.data = {
            products: {},
            tiers: {},
            shipping: {},
            payment: {},
            adminEmails: []
        };
        this.currentQuote = {
            products: [],
            subtotal: 0,
            shipping: 0,
            total: 0,
            tier: null
        };
        this.isAdmin = false;
        this.isReady = false;
        this.lastGeneratedQuote = '';
        this.currentShippingZone = null;
    }

    /**
     * Initialize the calculator
     */
    async init() {
        console.log('🚀 Initializing Kanva Calculator...');
        
        try {
            // Load all data from JSON files
            await this.loadData();
            
            // Set up admin detection
            this.detectAdmin();
            
            // Initialize UI
            this.initializeUI();
            
            // Bind event listeners
            this.bindEvents();
            
            // Hide loading, show app
            this.showApp();
            
            this.isReady = true;
            console.log('✅ Kanva Calculator initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize calculator:', error);
            this.showError('Failed to load calculator. Please refresh the page.');
        }
    }

    /**
     * Load all data from JSON files
     */
    async loadData() {
        console.log('📊 Loading data from JSON files...');
        
        const dataFiles = ['products', 'tiers', 'shipping', 'payment', 'admin-emails'];
        
        for (const file of dataFiles) {
            try {
                const response = await fetch(`data/${file}.json`);
                if (!response.ok) throw new Error(`Failed to load ${file}.json`);
                
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
        // Simple admin detection - can be enhanced later
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email') || 'demo@kanvabotanicals.com';
        
        this.isAdmin = this.data.adminEmails.includes(email);
        console.log(`👤 User: ${email} (Admin: ${this.isAdmin})`);
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        console.log('🎨 Initializing UI...');
        
        // Populate product dropdowns
        this.populateProductDropdowns();
        
        // Populate state dropdown
        this.populateStateDropdown();
        
        // Show/hide admin elements
        this.updateAdminUI();
        
        // Set initial values
        this.resetCalculation();
    }

    /**
     * Populate product dropdown menus
     */
    populateProductDropdowns() {
        const productSelects = document.querySelectorAll('select[id*="product"], select[name*="product"]');
        
        productSelects.forEach(select => {
            // Clear existing options except first
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add product options
            Object.entries(this.data.products).forEach(([key, product]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${product.name} ($${product.price})`;
                select.appendChild(option);
            });
        });
        
        console.log('✅ Product dropdowns populated');
    }
    
    /**
     * Populate state dropdown
     */
    populateStateDropdown() {
        const stateSelect = document.getElementById('customerState');
        if (!stateSelect) return;
        
        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];
        
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
        
        // Add state change listener for shipping zone
        stateSelect.addEventListener('change', () => {
            this.updateShippingZone(stateSelect.value);
        });
        
        console.log('✅ State dropdown populated');
    }
    
    /**
     * Update shipping zone display
     */
    updateShippingZone(state) {
        const shippingDisplay = document.getElementById('shippingZoneDisplay');
        if (!shippingDisplay) return;
        
        // Find the zone for this state
        let currentZone = null;
        Object.entries(this.data.shipping.zones).forEach(([zoneKey, zone]) => {
            if (zone.states.includes(state)) {
                currentZone = { key: zoneKey, ...zone };
            }
        });
        
        if (!currentZone) {
            shippingDisplay.innerHTML = `
                <div style="padding: 0.75rem; background: #fee2e2; border-radius: 6px; color: #991b1b;">
                    <strong>Unknown Zone</strong><br>
                    <small>Please contact for shipping quote</small>
                </div>
            `;
            return;
        }
        
        shippingDisplay.innerHTML = `
            <div style="padding: 0.75rem; background: #f0f9ff; border-radius: 6px;">
                <strong>${currentZone.name}</strong><br>
                <div style="font-size: 0.875rem; margin-top: 0.5rem;">
                    <div>1-3 display boxes: $${currentZone.rates['1-3']}</div>
                    <div>4-8 display boxes: $${currentZone.rates['4-8']}</div>
                    <div>9-11 display boxes: $${currentZone.rates['9-11']}</div>
                    <div>Master case+: $${currentZone.rates.mastercase}</div>
                </div>
            </div>
        `;
        
        // Store current zone for calculation
        this.currentShippingZone = currentZone;
        
        // Update shipping calculation
        this.calculateQuote();
    }

    /**
     * Update admin-specific UI elements
     */
    updateAdminUI() {
        const adminElements = document.querySelectorAll('[data-admin-only]');
        adminElements.forEach(el => {
            el.style.display = this.isAdmin ? 'block' : 'none';
        });
        
        const adminButton = document.getElementById('adminSettingsToggle');
        if (adminButton) {
            adminButton.style.display = this.isAdmin ? 'inline-block' : 'none';
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        console.log('🎯 Binding events...');
        
        // Product selection changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('select[id*="product"], input[id*="cases"]')) {
                this.calculateQuote();
            }
        });
        
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-tab-trigger]')) {
                this.switchTab(e.target.dataset.tabTrigger);
            }
        });
        
        // Multi-product line management
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-add-product-line]')) {
                this.addProductLine();
            }
            if (e.target.matches('[data-remove-product-line]')) {
                this.removeProductLine(e.target);
            }
        });
        
        // Quote generation
        const generateBtn = document.querySelector('[data-generate-quote]');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateQuote());
        }
        
        // Admin panel toggle - Fix the binding
        const adminBtn = document.getElementById('adminSettingsToggle');
        if (adminBtn) {
            adminBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAdminPanel();
            });
        }
        
        // Customer state change for shipping
        const stateSelect = document.getElementById('customerState');
        if (stateSelect) {
            stateSelect.addEventListener('change', () => {
                this.updateShippingZone(stateSelect.value);
            });
        }
        
        console.log('✅ Events bound successfully');
    }

    /**
     * Calculate quote based on current selections
     */
    calculateQuote() {
        console.log('🧮 Calculating quote...');
        
        try {
            // Reset current quote
            this.currentQuote = {
                products: [],
                subtotal: 0,
                shipping: 0,
                total: 0,
                tier: null
            };
            
            // Get active tab
            const activeTab = document.querySelector('[data-tab].active')?.dataset.tab || 'single';
            
            if (activeTab === 'single') {
                this.calculateSingleProduct();
            } else {
                this.calculateMultipleProducts();
            }
            
            // Calculate tier pricing
            this.applyTierPricing();
            
            // Calculate shipping
            this.calculateShipping();
            
            // Update UI
            this.updateCalculationDisplay();
            
        } catch (error) {
            console.error('❌ Calculation error:', error);
            this.showError('Calculation error. Please check your inputs.');
        }
    }

    /**
     * Calculate single product quote
     */
    calculateSingleProduct() {
        const productSelect = document.getElementById('productSelect');
        const casesInput = document.getElementById('masterCases');
        
        if (!productSelect || !casesInput) return;
        
        const productKey = productSelect.value;
        const cases = parseInt(casesInput.value) || 0;
        
        if (!productKey || cases <= 0) return;
        
        const product = this.data.products[productKey];
        if (!product) return;
        
        const lineTotal = cases * product.price * product.unitsPerCase;
        
        this.currentQuote.products = [{
            key: productKey,
            name: product.name,
            cases: cases,
            unitsPerCase: product.unitsPerCase,
            totalUnits: cases * product.unitsPerCase,
            unitPrice: product.price,
            lineTotal: lineTotal
        }];
        
        this.currentQuote.subtotal = lineTotal;
    }

    /**
     * Calculate multiple products quote
     */
    calculateMultipleProducts() {
        const productLines = document.querySelectorAll('[data-product-line]');
        
        this.currentQuote.products = []; // Reset products array
        
        productLines.forEach((line, index) => {
            const productSelect = line.querySelector(`select[name*="product"]`);
            const casesInput = line.querySelector(`input[name*="cases"]`);
            
            if (!productSelect || !casesInput) return;
            
            const productKey = productSelect.value;
            const cases = parseInt(casesInput.value) || 0;
            
            if (!productKey || cases <= 0) return;
            
            const product = this.data.products[productKey];
            if (!product) return;
            
            const lineTotal = cases * product.price * product.unitsPerCase;
            
            this.currentQuote.products.push({
                key: productKey,
                name: product.name,
                cases: cases,
                unitsPerCase: product.unitsPerCase,
                totalUnits: cases * product.unitsPerCase,
                unitPrice: product.price,
                lineTotal: lineTotal
            });
        });
        
        this.currentQuote.subtotal = this.currentQuote.products.reduce((sum, p) => sum + p.lineTotal, 0);
    }

    /**
     * Apply tier pricing discounts
     */
    applyTierPricing() {
        const totalCases = this.currentQuote.products.reduce((sum, p) => sum + p.cases, 0);
        
        // Find applicable tier
        let tier = null;
        Object.entries(this.data.tiers).forEach(([key, tierData]) => {
            if (totalCases >= tierData.threshold) {
                tier = { key, ...tierData };
            }
        });
        
        if (tier && tier.discount > 0) {
            this.currentQuote.tier = tier;
            this.currentQuote.discount = this.currentQuote.subtotal * (tier.discount / 100);
            this.currentQuote.subtotal -= this.currentQuote.discount;
        }
    }

    /**
     * Calculate shipping costs
     */
    calculateShipping() {
        // Simple shipping calculation - can be enhanced
        const totalCases = this.currentQuote.products.reduce((sum, p) => sum + p.cases, 0);
        
        if (totalCases > 0 && this.currentShippingZone) {
            // Determine shipping rate based on total cases
            let rate = 0;
            if (totalCases <= 3) {
                rate = this.currentShippingZone.rates['1-3'];
            } else if (totalCases <= 8) {
                rate = this.currentShippingZone.rates['4-8'];
            } else if (totalCases <= 11) {
                rate = this.currentShippingZone.rates['9-11'];
            } else {
                rate = this.currentShippingZone.rates.mastercase;
            }
            
            this.currentQuote.shipping = rate || 0;
        }
        
        this.currentQuote.total = this.currentQuote.subtotal + this.currentQuote.shipping;
    }

    /**
     * Update calculation display in UI
     */
    updateCalculationDisplay() {
        // Update order calculation section
        const calculationSection = document.querySelector('[data-section="calculation"]');
        if (!calculationSection) return;
        
        let html = '<h3>📊 Order Calculation</h3>';
        
        // Product details
        this.currentQuote.products.forEach(product => {
            html += `
                <div class="calculation-line">
                    <strong>${product.name}</strong> - ${product.cases} Master Cases
                    <br>
                    <small>${product.totalUnits} units × $${product.unitPrice} = $${product.lineTotal.toFixed(2)}</small>
                </div>
            `;
        });
        
        // Totals
        html += `
            <div class="calculation-totals">
                <div>Subtotal: $${this.currentQuote.subtotal.toFixed(2)}</div>
                ${this.currentQuote.tier ? `<div>Tier ${this.currentQuote.tier.key} Discount: -$${this.currentQuote.discount.toFixed(2)}</div>` : ''}
                <div>Shipping: $${this.currentQuote.shipping.toFixed(2)}</div>
                <div class="total"><strong>Total: $${this.currentQuote.total.toFixed(2)}</strong></div>
            </div>
        `;
        
        calculationSection.innerHTML = html;
    }

    /**
     * Switch between single/multiple product tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show/hide content
        document.querySelectorAll('[data-tab-content]').forEach(content => {
            content.style.display = content.dataset.tabContent === tabName ? 'block' : 'none';
        });
        
        // Recalculate
        this.calculateQuote();
    }

    /**
     * Reset calculation
     */
    resetCalculation() {
        this.currentQuote = {
            products: [],
            subtotal: 0,
            shipping: 0,
            total: 0,
            tier: null
        };
        this.updateCalculationDisplay();
    }

    /**
     * Show admin panel
     */
    showAdminPanel() {
        if (!this.isAdmin) {
            this.showError('Access denied. Admin privileges required.');
            return;
        }
        
        // Create admin panel if it doesn't exist
        let adminModal = document.getElementById('adminModal');
        if (!adminModal) {
            adminModal = document.createElement('div');
            adminModal.id = 'adminModal';
            adminModal.className = 'modal';
            document.body.appendChild(adminModal);
        }
        
        // Generate admin panel content
        adminModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; margin: 2rem auto; background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="margin: 0; color: #1f2937;">⚙️ Admin Configuration</h2>
                    <button onclick="kanvaCalculator.hideAdminPanel()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <!-- Products Section -->
                    <div>
                        <h3 style="color: #374151; margin-bottom: 1rem;">📦 Products</h3>
                        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                            ${this.generateProductsAdminHTML()}
                        </div>
                    </div>
                    
                    <!-- Tiers Section -->
                    <div>
                        <h3 style="color: #374151; margin-bottom: 1rem;">🎯 Pricing Tiers</h3>
                        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                            ${this.generateTiersAdminHTML()}
                        </div>
                    </div>
                </div>
                
                <!-- Admin Emails Section -->
                <div style="margin-top: 2rem;">
                    <h3 style="color: #374151; margin-bottom: 1rem;">👥 Admin Emails</h3>
                    <textarea id="adminEmailsList" style="width: 100%; height: 100px; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; font-family: monospace;" placeholder="Enter admin emails, one per line">${this.data.adminEmails.join('\n')}</textarea>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                    <button onclick="kanvaCalculator.resetToDefaults()" class="btn btn-secondary">🔄 Reset to Defaults</button>
                    <div>
                        <button onclick="kanvaCalculator.hideAdminPanel()" class="btn btn-secondary" style="margin-right: 1rem;">Cancel</button>
                        <button onclick="kanvaCalculator.saveAdminSettings()" class="btn btn-primary">💾 Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        this.addModalBackdrop(adminModal);
        adminModal.style.display = 'block';
        console.log('✅ Admin panel opened');
    }
    
    /**
     * Hide admin panel
     */
    hideAdminPanel() {
        const adminModal = document.getElementById('adminModal');
        if (adminModal) {
            adminModal.style.display = 'none';
        }
    }
    
    /**
     * Generate products admin HTML
     */
    generateProductsAdminHTML() {
        return Object.entries(this.data.products).map(([key, product]) => `
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 6px;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${product.name}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
                    <div>Price: $${product.price}</div>
                    <div>MSRP: $${product.msrp}</div>
                    <div>Units/Case: ${product.unitsPerCase}</div>
                    <div>Category: ${product.category}</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Generate tiers admin HTML
     */
    generateTiersAdminHTML() {
        return Object.entries(this.data.tiers).map(([key, tier]) => `
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f0f9ff; border-radius: 8px;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">Tier ${key.toUpperCase()}</div>
                <div style="font-size: 0.875rem;">
                    <div>Threshold: ${tier.threshold} cases</div>
                    <div>Discount: ${tier.discount}%</div>
                    <div style="margin-top: 0.5rem; color: #6b7280;">${tier.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Save admin settings
     */
    saveAdminSettings() {
        try {
            // Update admin emails
            const adminEmailsText = document.getElementById('adminEmailsList').value;
            this.data.adminEmails = adminEmailsText.split('\n')
                .map(email => email.trim())
                .filter(email => email.length > 0);
            
            // In a real app, you would save to server here
            console.log('💾 Admin settings saved:', {
                adminEmails: this.data.adminEmails
            });
            
            this.showSuccess('Admin settings saved successfully!');
            this.hideAdminPanel();
            
            // Re-detect admin status
            this.detectAdmin();
            this.updateAdminUI();
            
        } catch (error) {
            console.error('❌ Failed to save admin settings:', error);
            this.showError('Failed to save admin settings.');
        }
    }
    
    /**
     * Reset to defaults
     */
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            // Reload data from JSON files
            this.loadData().then(() => {
                this.showSuccess('Settings reset to defaults.');
                this.hideAdminPanel();
                this.initializeUI();
            }).catch(error => {
                this.showError('Failed to reset settings.');
            });
        }
    }

    /**
     * Generate quote email
     */
    generateQuote() {
        console.log('📧 Generating quote...');
        
        // Validate customer information
        const customerInfo = this.getCustomerInfo();
        if (!customerInfo.quoteName || !customerInfo.company) {
            this.showError('Please fill in customer name and company');
            return;
        }
        
        // Ensure we have products
        if (this.currentQuote.products.length === 0) {
            this.showError('Please add at least one product');
            return;
        }
        
        // Show quote modal with template selection
        this.showQuoteModal(customerInfo);
    }
    
    /**
     * Show quote modal with email template options
     */
    showQuoteModal(customerInfo) {
        let quoteModal = document.getElementById('quoteModal');
        if (!quoteModal) {
            quoteModal = document.createElement('div');
            quoteModal.id = 'quoteModal';
            document.body.appendChild(quoteModal);
        }
        
        const quoteNumber = `KB-${Date.now().toString().slice(-6)}`;
        
        quoteModal.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                        max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; z-index: 10000;">
                
                <!-- Header -->
                <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; background: #f8fafc; border-radius: 12px 12px 0 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem;">Generate Professional Quote</h2>
                        <button onclick="document.getElementById('quoteModal').style.display='none'" 
                                style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">×</button>
                    </div>
                </div>
                
                <!-- Email Template Selection -->
                <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 1rem 0; color: #374151;">📧 Select Email Template</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <button onclick="kanvaCalculator.generateEmailQuote('initial')" 
                                style="padding: 1rem; border: 2px solid #10b981; background: #ecfdf5; color: #065f46; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            📋 Initial Proposal
                        </button>
                        <button onclick="kanvaCalculator.generateEmailQuote('followup')" 
                                style="padding: 1rem; border: 2px solid #3b82f6; background: #eff6ff; color: #1e40af; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            📞 Follow-up Email
                        </button>
                        <button onclick="kanvaCalculator.generateEmailQuote('negotiation')" 
                                style="padding: 1rem; border: 2px solid #f59e0b; background: #fffbeb; color: #92400e; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            💼 Negotiation Email
                        </button>
                        <button onclick="kanvaCalculator.generateEmailQuote('closing')" 
                                style="padding: 1rem; border: 2px solid #8b5cf6; background: #f5f3ff; color: #5b21b6; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            🤝 Closing Email
                        </button>
                    </div>
                </div>
                
                <!-- CRM Actions -->
                <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 1rem 0; color: #374151;">🔗 CRM Integration</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <button onclick="kanvaCalculator.saveToAccount()" 
                                style="padding: 1rem; border: 2px solid #dc2626; background: #fef2f2; color: #991b1b; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            🏢 Save to Account
                        </button>
                        <button onclick="kanvaCalculator.createOpportunity()" 
                                style="padding: 1rem; border: 2px solid #7c3aed; background: #f5f3ff; color: #5b21b6; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            🎯 Create Opportunity
                        </button>
                    </div>
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; font-size: 0.875rem; color: #0c4a6e;">
                        💡 <strong>Save to Account:</strong> Links quote as activity to customer account<br>
                        💡 <strong>Create Opportunity:</strong> Adds to quote pipeline for sales follow-up
                    </div>
                </div>
                
                <!-- Quote Preview -->
                <div style="padding: 1.5rem;">
                    <h3 style="margin: 0 0 1rem 0; color: #374151;">📄 Quote Preview</h3>
                    <div id="quotePreview" style="background: #f9fafb; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.875rem; max-height: 300px; overflow-y: auto;">
                        Loading quote preview...
                    </div>
                </div>
                
            </div>
        `;
        
        this.addModalBackdrop(quoteModal);
        quoteModal.style.display = 'block';
        
        // Generate initial quote preview
        this.updateQuotePreview('initial', customerInfo, quoteNumber);
        
        console.log('✅ Quote modal opened');
    }
    
    /**
     * Generate email quote with specific template
     */
    generateEmailQuote(template) {
        const customerInfo = this.getCustomerInfo();
        const quoteNumber = `KB-${Date.now().toString().slice(-6)}`;
        
        const templates = {
            initial: {
                subject: `Partnership Proposal - ${customerInfo.company}`,
                greeting: `Hi there,\n\nThank you for your interest in partnering with Kanva Botanicals! We're excited about the opportunity to work with ${customerInfo.company}.`,
                closing: `We'd love to discuss this partnership opportunity further. Please let me know if you have any questions or would like to schedule a call.\n\nLooking forward to hearing from you!`
            },
            followup: {
                subject: `Following up - Partnership with ${customerInfo.company}`,
                greeting: `Hi ${customerInfo.quoteName},\n\nI wanted to follow up on the partnership proposal I sent over for ${customerInfo.company}. Have you had a chance to review the details?`,
                closing: `I'm here to answer any questions you might have. Would you be available for a quick call this week to discuss next steps?\n\nBest regards,`
            },
            negotiation: {
                subject: `Revised Proposal - ${customerInfo.company} Partnership`,
                greeting: `Hi ${customerInfo.quoteName},\n\nThank you for your feedback on our initial proposal. I've revised the terms based on our discussion:`,
                closing: `I believe this revised proposal addresses your concerns while maintaining a mutually beneficial partnership. Let me know your thoughts!\n\nBest regards,`
            },
            closing: {
                subject: `Ready to Move Forward - ${customerInfo.company}`,
                greeting: `Hi ${customerInfo.quoteName},\n\nI'm excited to finalize our partnership agreement! Here are the final terms we discussed:`,
                closing: `Everything looks great on our end. Once you're ready to proceed, I can send over the partnership agreement for signature.\n\nLooking forward to working together!`
            }
        };
        
        const selectedTemplate = templates[template];
        const quoteContent = this.generateQuoteContent(customerInfo, quoteNumber);
        
        const emailContent = `${selectedTemplate.greeting}\n\n## Partnership Overview\n\n${quoteContent}\n\n${selectedTemplate.closing}\n\nBest regards,\n[Your Name]\nKanva Botanicals\n[Your Email]\n[Your Phone]`;
        
        // Update preview
        this.updateQuotePreview(template, customerInfo, quoteNumber);
        
        // Copy to clipboard
        navigator.clipboard.writeText(emailContent).then(() => {
            this.showSuccess(`${template.charAt(0).toUpperCase() + template.slice(1)} email copied to clipboard!`);
        });
        
        // Open email client
        const mailtoLink = `mailto:${customerInfo.email}?subject=${encodeURIComponent(selectedTemplate.subject)}&body=${encodeURIComponent(emailContent)}`;
        window.open(mailtoLink);
    }
    
    /**
     * Update quote preview in modal
     */
    updateQuotePreview(template, customerInfo, quoteNumber) {
        const preview = document.getElementById('quotePreview');
        if (!preview) return;
        
        const quoteContent = this.generateQuoteContent(customerInfo, quoteNumber);
        preview.innerHTML = `<strong>Template:</strong> ${template.charAt(0).toUpperCase() + template.slice(1)}<br><br>${quoteContent.replace(/\n/g, '<br>')}`;
    }
    
    /**
     * Save quote to CRM account
     */
    saveToAccount() {
        const customerInfo = this.getCustomerInfo();
        
        // Simulate CRM integration
        console.log('💾 Saving to CRM Account:', customerInfo);
        
        // Here you would integrate with your actual CRM API
        // For now, show success message
        this.showSuccess(`Quote saved to ${customerInfo.company} account as activity`);
        
        // Close modal
        document.getElementById('quoteModal').style.display = 'none';
    }
    
    /**
     * Create opportunity in CRM
     */
    createOpportunity() {
        const customerInfo = this.getCustomerInfo();
        const quoteValue = this.currentQuote.total;
        
        // Simulate CRM integration
        console.log('🎯 Creating Opportunity:', { customer: customerInfo, value: quoteValue });
        
        // Here you would integrate with your actual CRM API
        // For now, show success message
        this.showSuccess(`Opportunity created for ${customerInfo.company} ($${quoteValue.toFixed(2)})`);
        
        // Close modal
        document.getElementById('quoteModal').style.display = 'none';
    }
    
    /**
     * Get customer information from form
     */
    getCustomerInfo() {
        return {
            quoteName: document.getElementById('quoteName')?.value || 'Product Quote',
            company: document.getElementById('companyName')?.value || 'Customer',
            customerSegment: document.getElementById('customerSegment')?.value || '',
            customerState: document.getElementById('customerState')?.value || '',
            emailDomain: document.getElementById('emailDomain')?.value || '',
            phoneNumber: document.getElementById('phoneNumber')?.value || ''
        };
    }
    
    /**
     * Generate quote content
     */
    generateQuoteContent(customerInfo, quoteNumber) {
        const date = new Date().toLocaleDateString();
        
        let content = `
# ${customerInfo.quoteName}
**Quote #:** ${quoteNumber}  
**Date:** ${date}  
**Company:** ${customerInfo.company}  
${customerInfo.customerSegment ? `**Segment:** ${customerInfo.customerSegment}  ` : ''}
${customerInfo.customerState ? `**State:** ${customerInfo.customerState}  ` : ''}

---

## Product Details

`;
        
        // Add product lines
        this.currentQuote.products.forEach((product, index) => {
            content += `
**${index + 1}. ${product.name}**
- Master Cases: ${product.cases}
- Total Units: ${product.totalUnits}
- Unit Price: $${product.unitPrice.toFixed(2)}
- Line Total: $${product.lineTotal.toFixed(2)}

`;
        });
        
        // Add pricing summary
        content += `
---

## Pricing Summary

| Item | Amount |
|------|--------|
| Subtotal | $${this.currentQuote.subtotal.toFixed(2)} |
`;
        
        if (this.currentQuote.tier) {
            content += `| ${this.currentQuote.tier.key.toUpperCase()} Tier Discount (${this.currentQuote.tier.discount}%) | -$${this.currentQuote.discount.toFixed(2)} |\n`;
        }
        
        content += `| Shipping | $${this.currentQuote.shipping.toFixed(2)} |
| **Total** | **$${this.currentQuote.total.toFixed(2)}** |

`;
        
        // Add terms and contact info
        content += `
---

## Terms & Conditions
- Payment terms: Net 30 days
- Prices valid for 30 days
- Minimum order quantities may apply
- Shipping costs are estimates

## Contact Information
For questions about this quote, please contact:
- Email: sales@kanvabotanicals.com
- Phone: (555) 123-4567

*Thank you for choosing Kanva Botanicals!*
`;
        
        return content;
    }

    /**
     * Show app and hide loading
     */
    showApp() {
        const loading = document.getElementById('loadingState');
        const app = document.getElementById('app');
        
        if (loading) loading.style.display = 'none';
        if (app) app.style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('❌', message);
        this.showNotification(message, 'error');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        console.log('✅', message);
        this.showNotification(message, 'success');
    }
    
    /**
     * Show notification with better styling
     */
    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; pointer-events: none;';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#e0f2fe';
        const textColor = type === 'error' ? '#991b1b' : type === 'success' ? '#166534' : '#0c4a6e';
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        
        notification.style.cssText = `
            background: ${bgColor};
            color: ${textColor};
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#bbf7d0' : '#bae6fd'};
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `${icon} ${message}`;
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    /**
     * Add modal backdrop styling
     */
    addModalBackdrop(modal) {
        modal.style.cssText = `
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            backdrop-filter: blur(2px);
        `;
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Add product line
     */
    addProductLine() {
        const productLineContainer = document.getElementById('productLines');
        if (!productLineContainer) return;
        
        const lineIndex = productLineContainer.children.length;
        
        // Create product line element
        const productLine = document.createElement('div');
        productLine.className = 'product-line-item';
        productLine.setAttribute('data-product-line', lineIndex);
        productLine.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr auto; gap: 1rem; align-items: end; margin-bottom: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;';
        
        // Create product options HTML
        const productOptions = Object.entries(this.data.products)
            .map(([key, product]) => `<option value="${key}">${product.name} ($${product.price})</option>`)
            .join('');
        
        productLine.innerHTML = `
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Product</label>
                <select name="product-${lineIndex}" class="form-control">
                    <option value="">Select product...</option>
                    ${productOptions}
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Master Cases</label>
                <input type="number" name="cases-${lineIndex}" class="form-control" min="0" value="1">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">&nbsp;</label>
                <button type="button" class="btn btn-sm btn-danger" data-remove-line="${lineIndex}" style="height: 40px;">🗑️ Remove</button>
            </div>
        `;
        
        productLineContainer.appendChild(productLine);
        
        console.log(`✅ Added product line ${lineIndex}`);
        this.calculateQuote();
    }

    /**
     * Remove product line
     */
    removeProductLine(index) {
        const productLineContainer = document.getElementById('productLines');
        if (!productLineContainer) return;
        
        const productLine = productLineContainer.children[index];
        if (productLine) {
            productLineContainer.removeChild(productLine);
        }
        
        this.calculateQuote();
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanvaCalculator = new KanvaCalculator();
    window.kanvaCalculator.init();
});

console.log('✅ Kanva Calculator module loaded');
