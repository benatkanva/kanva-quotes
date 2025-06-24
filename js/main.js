// Main application orchestration for Kanva Botanicals Quote Calculator
// Coordinates all modules and manages application lifecycle

const App = {
    // Application initialization
    initialize: function() {
        console.log('🚀 Starting Kanva Botanicals Quote Calculator...');
        console.log(`📋 Version: ${adminConfig.metadata.version}`);
        
        try {
            // Step 1: Initialize configuration
            this.initializeConfiguration();
            
            // Step 2: Check environment and set up mode
            this.detectEnvironment();
            
            // Step 3: Initialize Copper CRM integration
            this.initializeCopperIntegration();
            
            // Step 4: Initialize core modules
            this.initializeModules();
            
            // Step 5: Set up UI and render interface
            this.initializeUI();
            
            // Step 6: Bind event listeners
            this.bindEventListeners();
            
            // Step 7: Perform initial calculations
            this.performInitialCalculations();
            
            // Step 8: Final setup and ready state
            this.finalizeInitialization();
            
        } catch (error) {
            console.error('❌ Critical error during initialization:', error);
            this.handleInitializationError(error);
        }
    },

    // Initialize configuration system
    initializeConfiguration: function() {
        console.log('⚙️ Initializing configuration...');
        
        // Load saved configuration if available
        const configLoaded = ConfigManager.load();
        if (configLoaded) {
            console.log('✅ Configuration loaded from storage');
        } else {
            console.log('📝 Using default configuration');
        }
        
        // Validate configuration integrity
        const validation = ConfigManager.validate();
        if (!validation.isValid) {
            console.warn('⚠️ Configuration validation issues:', validation.errors);
        }
    },

    // Detect environment and application mode
    detectEnvironment: function() {
        console.log('🔍 Detecting environment and mode...');
        
        // Check URL parameters for mode hints
        const urlParams = new URLSearchParams(window.location.search);
        const location = urlParams.get('location');
        const mode = urlParams.get('mode');
        
        // Detect based on window size and URL parameters
        if (location === 'modal' || mode === 'modal') {
            appState.isModalMode = true;
            appState.appLocation = 'modal';
            document.body.className = 'modal-mode';
            console.log('📍 Modal mode detected');
        } else if (location === 'activity_panel') {
            appState.isActivityPanel = true;
            appState.appLocation = 'activity_panel';
            document.body.className = 'activity-panel-mode';
            console.log('📍 Activity panel mode detected');
        } else if (location === 'left_nav' || window.innerWidth > 800) {
            appState.isLeftNav = true;
            appState.appLocation = 'left_nav';
            document.body.className = 'left-nav-mode';
            console.log('📍 Left navigation mode detected');
        } else {
            appState.appLocation = 'sidebar';
            document.body.className = 'sidebar-mode';
            console.log('📍 Sidebar mode detected');
        }
        
        // Log environment details
        console.log(`🌐 Environment: ${window.location.hostname}`);
        console.log(`📏 Window size: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`📱 User agent: ${navigator.userAgent.substring(0, 50)}...`);
    },

    // Initialize Copper CRM integration
    initializeCopperIntegration: function() {
        console.log('🔗 Initializing Copper CRM integration...');
        
        try {
            // Check environment first
            if (typeof CopperIntegration !== 'undefined' && CopperIntegration.checkEnvironment) {
                CopperIntegration.checkEnvironment();
            }
            
            // Initialize SDK
            let copperAvailable = false;
            if (typeof CopperIntegration !== 'undefined') {
                copperAvailable = CopperIntegration.initialize();
            }
            
            if (copperAvailable) {
                console.log('✅ Copper CRM integration active');
                appState.isCopperActive = true;
            } else {
                console.log('⚠️ Running in standalone mode');
                appState.isCopperActive = false;
                
                // FIXED: Proper admin detection in standalone mode
                this.setupStandaloneMode();
            }
        } catch (error) {
            console.error('❌ Error initializing Copper:', error);
            appState.isCopperActive = false;
            this.setupStandaloneMode();
        }
    },

    // FIXED: Setup standalone mode with proper admin detection
    setupStandaloneMode: function() {
        appState.isCopperActive = false;
        appState.integrationMode = 'standalone';
        
        // FIXED: Use your actual admin email for testing
        const testUser = {
            email: 'ben@kanvabotanicals.com',  // Your email from adminEmails
            name: 'Ben (Admin)'
        };
        
        // Set user and check admin status
        AuthManager.setUser(testUser);
        appState.isAdmin = AuthManager.isAdmin(testUser.email);
        
        console.log('🔧 Running in standalone demo mode');
        console.log(`👤 User: ${testUser.email}`);
        console.log(`🛡️ Admin access: ${appState.isAdmin ? 'GRANTED' : 'DENIED'}`);
        
        // Enable customer search in left nav mode
        if (appState.isLeftNav) {
            setTimeout(() => {
                if (typeof CopperIntegration !== 'undefined' && CopperIntegration.enableCustomerSearch) {
                    CopperIntegration.enableCustomerSearch();
                }
            }, 1000);
        }
    },

    // Initialize core application modules
    initializeModules: function() {
        console.log('🧩 Initializing core modules...');
        
        // Initialize notification manager first
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.initialize();
            console.log('✅ Notification manager initialized');
        }
        
        // Initialize calculator engine
        if (typeof Calculator !== 'undefined') {
            Calculator.initializeEventListeners();
            console.log('✅ Calculator module initialized');
        }
        
        // Initialize multi-product calculator
        if (typeof MultiProductCalculator !== 'undefined') {
            MultiProductCalculator.initialize();
            console.log('✅ Multi-product calculator initialized');
        }
        
        // Initialize email generator
        if (typeof EmailGenerator !== 'undefined') {
            EmailGenerator.initialize();
            console.log('✅ Email generator initialized');
        }
        
        // Initialize admin panel if user has access
        if (typeof AdminPanel !== 'undefined') {
            AdminPanel.initialize();
            console.log('✅ Admin panel initialized');
        }
        
        console.log('✅ All core modules initialized');
    },

    // Initialize user interface
    initializeUI: function() {
        console.log('🎨 Initializing user interface...');
        
        // Render main application interface
        this.renderMainInterface();
        
        // Set up mode-specific UI
        this.setupModeSpecificUI();
        
        // Initialize tooltips and help system
        this.initializeHelpSystem();
        
        // Set up responsive behavior
        this.setupResponsiveUI();
        
        console.log('✅ User interface initialized');
    },

    // Render the main application interface
    renderMainInterface: function() {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            throw new Error('App container element not found');
        }
        
        // Generate the main HTML structure based on mode
        const mainHTML = this.generateMainHTML();
        appContainer.innerHTML = mainHTML;
        
        // Populate product dropdowns
        this.populateProductDropdowns();
        
        // Set initial values
        this.setInitialValues();
    },

    // Generate main HTML structure based on mode
    generateMainHTML: function() {
        const isAdmin = appState.isAdmin;
        const isModal = appState.isModalMode;
        const isLeftNav = appState.isLeftNav;
        const isActivityPanel = appState.isActivityPanel;
        
        if (isActivityPanel) {
            return this.generateActivityPanelHTML();
        } else {
            return this.generateFullCalculatorHTML();
        }
    },

    // Generate activity panel HTML (compact view)
    generateActivityPanelHTML: function() {
        return `
            <!-- Activity Panel Quick Calculator -->
            <div class="activity-panel-calculator">
                <div class="activity-header">
                    <h3>🌿 Kanva Quick Quote</h3>
                    <button class="launch-modal-btn" onclick="openFullCalculatorModal()">Open Full Calculator</button>
                </div>

                <!-- Quick Product Selection -->
                <div class="quick-product-section">
                    <div class="input-group">
                        <label for="quickProduct">Product:</label>
                        <select id="quickProduct" onchange="updateQuickCalculation()">
                            <!-- Populated by JavaScript -->
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="quickCases">Cases:</label>
                        <input type="number" id="quickCases" value="28" min="1" max="500" onchange="updateQuickCalculation()">
                    </div>
                </div>

                <!-- Quick Results -->
                <div id="quickResults" class="quick-results">
                    <!-- Populated by Calculator -->
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <button class="action-btn" onclick="generateQuickEmail()">📧 Generate Email</button>
                    ${appState.isCopperActive ? '<button class="action-btn" onclick="saveQuickQuote()">💾 Save Quote</button>' : ''}
                </div>
            </div>
        `;
    },

    // Generate full calculator HTML
    generateFullCalculatorHTML: function() {
        const isAdmin = appState.isAdmin;
        const isModal = appState.isModalMode;
        const isLeftNav = appState.isLeftNav;
        
        return `
            <!-- Main Calculator Container -->
            <div class="calculator" id="mainCalculator">
                <div class="header">
                    <h1>🌿 Kanva Botanicals Quote Calculator</h1>
                    <p>Instantly generate professional quotes with accurate pricing</p>
                    ${isAdmin ? '<button class="admin-btn" onclick="showAdminPanel()">⚙️ Admin Settings</button>' : ''}
                </div>

                <!-- Customer Information Section -->
                <section class="customer-info">
                    <h3>Customer Information</h3>
                    <div class="input-group">
                        <label for="quoteName">Quote Name:</label>
                        <input type="text" id="quoteName" placeholder="Product Quote for Company Name">
                    </div>
                    <div class="input-group">
                        <label for="companyName">Company Name:</label>
                        <input type="text" id="companyName" placeholder="ABC Distribution">
                    </div>
                    <div class="input-group">
                        <label for="segment">Segment:</label>
                        <input type="text" id="segment" placeholder="smoke and vape shops">
                    </div>
                    <div class="input-group">
                        <label for="emailDomain">Email Domain:</label>
                        <input type="text" id="emailDomain" placeholder="company.com">
                    </div>
                    <div class="input-group">
                        <label for="phone">Phone:</label>
                        <input type="tel" id="phone" placeholder="(555) 123-4567">
                    </div>
                    
                    <!-- Tax Information -->
                    <div class="tax-section">
                        <h4>Tax Information</h4>
                        <div class="input-group">
                            <label for="stateTaxRate">State Tax Rate (%):</label>
                            <input type="number" id="stateTaxRate" step="0.01" placeholder="0.00">
                        </div>
                        <div class="input-group">
                            <label for="countyTaxRate">County Tax Rate (%):</label>
                            <input type="number" id="countyTaxRate" step="0.01" placeholder="0.00">
                        </div>
                        <button type="button" class="detect-tax-btn" onclick="autoDetectTaxRate()">Auto-Detect Tax Rate</button>
                    </div>
                </section>

                <!-- Product & Order Details Section -->
                <section class="product-details">
                    <div class="product-mode-toggle">
                        <h3>Product & Order Details</h3>
                        <div class="mode-buttons">
                            <button type="button" id="singleProductBtn" class="mode-btn active" onclick="switchToSingleProduct()">Single Product</button>
                            <button type="button" id="multiProductBtn" class="mode-btn" onclick="switchToMultiProduct()">Multiple Products</button>
                        </div>
                    </div>
                    
                    <!-- Single Product Mode -->
                    <div id="singleProductMode" class="product-mode">
                        <div class="input-group">
                            <label for="primaryProduct">Primary Product:</label>
                            <select id="primaryProduct" onchange="updateCalculation()">
                                <!-- Populated by JavaScript -->
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="masterCases">Master Cases:</label>
                            <input type="number" id="masterCases" value="28" min="1" max="500" onchange="updateCalculation()">
                        </div>
                        <div class="input-group">
                            <label for="maxRetail">Max Retail Price:</label>
                            <input type="number" id="maxRetail" value="5.00" step="0.01" min="0">
                        </div>
                    </div>
                    
                    <!-- Multiple Product Mode -->
                    <div id="multiProductMode" class="product-mode" style="display: none;">
                        <div class="multi-product-controls">
                            <button type="button" class="add-product-btn" onclick="addProductLine()">➕ Add Product Line</button>
                            <div class="input-group">
                                <label>
                                    <input type="checkbox" id="creditCardFee" onchange="calculateMultiProductTotal()">
                                    Add 3% Credit Card Fee
                                </label>
                            </div>
                        </div>
                        <div id="productLines" class="product-lines">
                            <!-- Product lines populated by MultiProductCalculator -->
                        </div>
                        <div id="multiProductResults" class="multi-product-results">
                            <!-- Results populated by MultiProductCalculator -->
                        </div>
                    </div>
                </section>

                <!-- Calculation Results Section -->
                <section class="results" id="resultsSection">
                    <h3>Order Calculation</h3>
                    <div id="orderResults">
                        <!-- Populated by Calculator -->
                    </div>
                    <div id="tierInfo" class="tier-info">
                        <!-- Populated by Calculator -->
                    </div>
                </section>

                <!-- Action Buttons Section -->
                <section class="actions">
                    <button class="copy-btn" onclick="generateEmail()">📧 Generate Professional Quote Email</button>
                    ${appState.isCopperActive ? `
                        <button class="copy-btn" onclick="saveQuoteToCRM()">💾 Save to CRM</button>
                        <button class="copy-btn" onclick="createOpportunity()">🎯 Create Opportunity</button>
                    ` : ''}
                </section>

                ${isLeftNav ? this.generateProductReferenceSection() : ''}
            </div>

            <!-- Email Template Display -->
            <div class="email-template" id="emailTemplate" style="display: none;">
                <h3>Generated Quote Email</h3>
                <div class="email-actions">
                    <button class="copy-btn" onclick="copyEmail()">📋 Copy Email to Clipboard</button>
                    <button class="copy-btn" onclick="exportEmail('text')">📄 Export as Text</button>
                    <button class="copy-btn" onclick="exportEmail('html')">🌐 Export as HTML</button>
                    ${appState.isCopperActive ? '<button class="copy-btn" onclick="sendEmailViaCRM()">📧 Log in CRM</button>' : ''}
                </div>
                <div id="emailOutput" class="email-output">
                    <!-- Generated email content -->
                </div>
                
                <!-- Email Template Options -->
                <div class="email-templates">
                    <h4>Quick Templates</h4>
                    <button class="template-btn" onclick="generateFollowUpEmail()">Follow-up Email</button>
                    <button class="template-btn" onclick="generateNegotiationEmail()">Negotiation Email</button>
                    <button class="template-btn" onclick="generateClosingEmail()">Closing Email</button>
                </div>
            </div>

            ${isAdmin ? this.generateAdminPanel() : ''}
        `;
    },

    // Generate product reference section for left nav mode
    generateProductReferenceSection: function() {
        return `
            <!-- Product Reference Section -->
            <section class="product-reference">
                <h3>Quick Product Reference</h3>
                <div class="product-grid">
                    <div class="product-card">
                        <h4>2oz Wellness Shots</h4>
                        <p><strong>Focus + Flow:</strong> $4.50 → $9.99 MSRP <span class="pricing-tier tier1">Best Seller</span></p>
                        <p><strong>Release + Relax:</strong> $4.50 → $9.99 MSRP <span class="pricing-tier tier1">Kanna + Kava</span></p>
                        <p><strong>Raw + Releaf:</strong> $4.50 → $9.99 MSRP <span class="pricing-tier tier2">New Product</span></p>
                    </div>
                    <div class="product-card">
                        <h4>Energy & Extract Shots</h4>
                        <p><strong>Kanva Zoom:</strong> $3.10 → $6.99 MSRP <span class="pricing-tier tier1">Energy Boost</span></p>
                    </div>
                    <div class="product-card">
                        <h4>High-Margin Products</h4>
                        <p><strong>Kratom Capsules:</strong> 49-58% margins <span class="pricing-tier tier3">High Profit</span></p>
                        <p><strong>Kratom Powders:</strong> 49-56% margins <span class="pricing-tier tier3">High Profit</span></p>
                        <p><em>Perfect add-ons for experienced customers</em></p>
                    </div>
                </div>
            </section>
        `;
    },

    // Generate admin panel HTML
    generateAdminPanel: function() {
        return `
            <!-- Admin Panel Modal -->
            <div id="adminPanel" class="admin-panel" style="display: none;">
                <div class="admin-content">
                    <div class="admin-header">
                        <h2>⚙️ Admin Settings</h2>
                        <button class="close-btn" onclick="hideAdminPanel()">×</button>
                    </div>
                    
                    <div class="admin-sections">
                        <!-- Product Pricing Section -->
                        <section class="admin-section">
                            <h3>Product Pricing</h3>
                            ${Object.keys(adminConfig.products).map(key => {
                                const product = adminConfig.products[key];
                                return `
                                    <div class="admin-product">
                                        <h4>${product.name}</h4>
                                        <label>Wholesale Price: <input type="number" id="admin_${key}_price" step="0.01" /></label>
                                        <label>MSRP: <input type="number" id="admin_${key}_msrp" step="0.01" /></label>
                                        <label>Units per Case: <input type="number" id="admin_${key}_units" /></label>
                                    </div>
                                `;
                            }).join('')}
                        </section>

                        <!-- Volume Tiers Section -->
                        <section class="admin-section">
                            <h3>Volume Pricing Tiers</h3>
                            <div class="tier-config">
                                <h4>Tier 2</h4>
                                <label>Threshold: <input type="number" id="admin_tier2_threshold" /> cases</label>
                                <label>Discount: <input type="number" id="admin_tier2_discount" step="0.1" />%</label>
                            </div>
                            <div class="tier-config">
                                <h4>Tier 3</h4>
                                <label>Threshold: <input type="number" id="admin_tier3_threshold" /> cases</label>
                                <label>Discount: <input type="number" id="admin_tier3_discount" step="0.1" />%</label>
                            </div>
                        </section>

                        <!-- Shipping & Payment Section -->
                        <section class="admin-section">
                            <h3>Shipping & Payment</h3>
                            <label>Shipping Rate: <input type="number" id="admin_shipping_rate" step="0.01" />%</label>
                            <label>Free Shipping Threshold: $<input type="number" id="admin_free_shipping" /></label>
                            <label>ACH Required Over: $<input type="number" id="admin_ach_threshold" /></label>
                        </section>
                    </div>

                    <div class="admin-actions">
                        <button class="admin-save-btn" onclick="saveAdminSettings()">💾 Save Settings</button>
                        <button class="admin-reset-btn" onclick="resetAdminSettings()">🔄 Reset to Defaults</button>
                        <button class="admin-export-btn" onclick="exportAdminConfig()">📤 Export Config</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Populate product dropdown menus
    populateProductDropdowns: function() {
        const dropdowns = ['primaryProduct', 'quickProduct'];
        const products = ProductManager.getAll();
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                dropdown.innerHTML = '';
                
                Object.entries(products).forEach(([key, product]) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${product.name} ($${product.price})`;
                    dropdown.appendChild(option);
                });
                
                // Set default selection
                if (dropdown.options.length > 0) {
                    dropdown.selectedIndex = 0;
                }
            }
        });
    },

    // Set initial form values
    setInitialValues: function() {
        // Set default master cases
        const masterCasesInput = document.getElementById('masterCases');
        if (masterCasesInput && !masterCasesInput.value) {
            masterCasesInput.value = '28';
        }
        
        const quickCasesInput = document.getElementById('quickCases');
        if (quickCasesInput && !quickCasesInput.value) {
            quickCasesInput.value = '28';
        }
        
        // Set default max retail price
        this.updateMaxRetailPrice();
        
        // Set up quote name auto-generation
        this.setupQuoteNameGeneration();
        
        // Auto-populate customer info from Copper if available
        if (appState.isCopperActive && appState.isActivityPanel) {
            setTimeout(() => {
                if (typeof CopperIntegration !== 'undefined' && CopperIntegration.populateCustomerInfo) {
                    CopperIntegration.populateCustomerInfo();
                }
            }, 500);
        }
    },

    // Set up quote name auto-generation
    setupQuoteNameGeneration: function() {
        const productSelect = document.getElementById('primaryProduct');
        const companyNameInput = document.getElementById('companyName');
        const quoteNameInput = document.getElementById('quoteName');
        
        if (productSelect && companyNameInput && quoteNameInput) {
            const updateQuoteName = () => {
                const productText = productSelect.selectedOptions[0]?.text || '';
                const productName = productText.split(' (')[0] || 'Product';
                const companyName = companyNameInput.value.trim();
                
                if (companyName && !quoteNameInput.value) {
                    quoteNameInput.value = `${productName} Quote for ${companyName}`;
                    console.log('📝 Auto-generated quote name:', quoteNameInput.value);
                }
            };
            
            productSelect.addEventListener('change', updateQuoteName);
            companyNameInput.addEventListener('blur', updateQuoteName);
        }
    },

    // Update max retail price based on selected product
    updateMaxRetailPrice: function() {
        const productKey = document.getElementById('primaryProduct')?.value;
        const maxRetailInput = document.getElementById('maxRetail');
        
        if (productKey && maxRetailInput && adminConfig.maxRetailPrices) {
            const maxPrice = adminConfig.maxRetailPrices[productKey] || adminConfig.maxRetailPrices.default;
            maxRetailInput.value = maxPrice.toFixed(2);
        }
    },

    // Set up mode-specific UI behavior
    setupModeSpecificUI: function() {
        if (appState.isModalMode) {
            this.optimizeForModal();
        } else if (appState.isActivityPanel) {
            this.optimizeForActivityPanel();
        } else if (appState.isLeftNav) {
            this.optimizeForLeftNav();
        } else {
            this.optimizeForSidebar();
        }
    },

    // Optimize interface for modal mode
    optimizeForModal: function() {
        console.log('🔧 Optimizing UI for modal mode');
        
        // Adjust sizing and spacing
        const calculator = document.getElementById('mainCalculator');
        if (calculator) {
            calculator.style.minHeight = '600px';
            calculator.style.padding = '20px';
        }
    },

    // Optimize interface for activity panel mode
    optimizeForActivityPanel: function() {
        console.log('🔧 Optimizing UI for activity panel mode');
        
        // Compact layout for activity panel
        document.body.classList.add('activity-panel-mode');
    },

    // Optimize interface for left navigation mode
    optimizeForLeftNav: function() {
        console.log('🔧 Optimizing UI for left navigation mode');
        
        // Enable all features
        const productReference = document.querySelector('.product-reference');
        if (productReference) {
            productReference.style.display = 'block';
        }
        
        // Let copper-integration handle customer search
        // The copper-integration.js will automatically add search interface when needed
    },

    // Optimize interface for sidebar mode
    optimizeForSidebar: function() {
        console.log('🔧 Optimizing UI for sidebar mode');
        
        // Compact main calculator
        const mainCalc = document.getElementById('mainCalculator');
        if (mainCalc) {
            mainCalc.style.padding = '10px';
        }
    },

    // Initialize help system and tooltips
    initializeHelpSystem: function() {
        console.log('❓ Initializing help system...');
        
        // Add tooltips for key elements
        this.addTooltips();
        
        // Set up help keyboard shortcuts
        this.setupHelpShortcuts();
    },

    // Add helpful tooltips
    addTooltips: function() {
        const tooltips = {
            'masterCases': 'Number of master cases for the order. Higher quantities may qualify for better pricing tiers.',
            'maxRetail': 'Maximum recommended retail price to maintain market stability.',
            'primaryProduct': 'Select the main product for this quote.',
            'quoteName': 'Descriptive name for this quote (auto-generated from product and company).',
            'companyName': 'Name of the customer company or business.',
            'segment': 'Customer segment or industry type (e.g., smoke shops, convenience stores).',
            'emailDomain': 'Company\'s website domain for email communications.',
            'phone': 'Primary contact phone number for the customer.',
            'stateTaxRate': 'State sales tax rate as a percentage.',
            'countyTaxRate': 'County/local tax rate as a percentage.',
            'creditCardFee': 'Add 3% credit card processing fee to the total.'
        };
        
        Object.entries(tooltips).forEach(([elementId, tooltipText]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.title = tooltipText;
                element.setAttribute('data-tooltip', tooltipText);
            }
        });
    },

    // Set up help keyboard shortcuts
    setupHelpShortcuts: function() {
        document.addEventListener('keydown', (event) => {
            // F1 - Show help
            if (event.key === 'F1') {
                event.preventDefault();
                this.showHelp();
            }
            
            // Ctrl/Cmd + ? - Show shortcuts
            if ((event.ctrlKey || event.metaKey) && event.key === '?') {
                event.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    },

    // Set up responsive UI behavior
    setupResponsiveUI: function() {
        console.log('📱 Setting up responsive UI...');
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Listen for orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleWindowResize();
            }, 100);
        });
    },

    // Handle window resize events
    handleWindowResize: function() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        console.log(`📏 Window resized to ${newWidth}x${newHeight}`);
        
        // Adjust layout based on new size
        if (newWidth < 768 && !appState.isMobile) {
            appState.isMobile = true;
            this.switchToMobileLayout();
        } else if (newWidth >= 768 && appState.isMobile) {
            appState.isMobile = false;
            this.switchToDesktopLayout();
        }
    },

    // Switch to mobile-optimized layout
    switchToMobileLayout: function() {
        console.log('📱 Switching to mobile layout');
        document.body.classList.add('mobile-layout');
    },

    // Switch to desktop layout
    switchToDesktopLayout: function() {
        console.log('🖥️ Switching to desktop layout');
        document.body.classList.remove('mobile-layout');
    },

    // Bind global event listeners
    bindEventListeners: function() {
        console.log('🔗 Binding event listeners...');
        
        // Product selection changes
        this.bindProductSelectionEvents();
        
        // Calculation triggers
        this.bindCalculationEvents();
        
        // Form validation events
        this.bindValidationEvents();
        
        // Global keyboard shortcuts
        this.bindKeyboardShortcuts();
        
        // Error handling
        this.bindErrorHandlers();
    },

    // Bind product selection events
    bindProductSelectionEvents: function() {
        ['primaryProduct', 'quickProduct'].forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateMaxRetailPrice();
                    this.triggerCalculation();
                    this.updateQuoteNameFromProductChange();
                });
            }
        });
    },

    // Update quote name when product changes
    updateQuoteNameFromProductChange: function() {
        const productSelect = document.getElementById('primaryProduct');
        const companyNameInput = document.getElementById('companyName');
        const quoteNameInput = document.getElementById('quoteName');
        
        if (productSelect && companyNameInput && quoteNameInput) {
            const productText = productSelect.selectedOptions[0]?.text || '';
            const productName = productText.split(' (')[0] || 'Product';
            const companyName = companyNameInput.value.trim();
            
            if (companyName) {
                quoteNameInput.value = `${productName} Quote for ${companyName}`;
                console.log('📝 Updated quote name for product change:', quoteNameInput.value);
            }
        }
    },

    // Bind calculation trigger events
    bindCalculationEvents: function() {
        ['masterCases', 'quickCases'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.triggerCalculation();
                });
                
                input.addEventListener('change', () => {
                    this.triggerCalculation();
                });
            }
        });
    },

    // Bind form validation events
    bindValidationEvents: function() {
        // Validate number inputs
        ['masterCases', 'quickCases', 'maxRetail', 'stateTaxRate', 'countyTaxRate'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            }
        });
        
        // Validate text fields
        ['quoteName', 'companyName', 'segment', 'emailDomain', 'phone'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateNewFields(input);
                });
            }
        });
    },

    // Validate new field types
    validateNewFields: function(input) {
        const value = input.value.trim();
        const fieldId = input.id;
        
        // Clear existing validation
        input.classList.remove('invalid');
        this.clearValidationError(input);
        
        // Field-specific validation
        switch (fieldId) {
            case 'quoteName':
                if (!value) {
                    this.showValidationError(input, 'Quote name is required');
                    input.classList.add('invalid');
                }
                break;
                
            case 'companyName':
                if (!value) {
                    this.showValidationError(input, 'Company name is required');
                    input.classList.add('invalid');
                }
                break;
                
            case 'emailDomain':
                if (value && !this.isValidDomain(value)) {
                    this.showValidationError(input, 'Please enter a valid domain (e.g., company.com)');
                    input.classList.add('invalid');
                }
                break;
                
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    this.showValidationError(input, 'Please enter a valid phone number');
                    input.classList.add('invalid');
                }
                break;
        }
    },

    // Domain validation helper
    isValidDomain: function(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    },

    // Phone validation helper
    isValidPhone: function(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\(]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },

    // Bind keyboard shortcuts
    bindKeyboardShortcuts: function() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + G - Generate email
            if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
                event.preventDefault();
                if (typeof generateEmail === 'function') {
                    generateEmail();
                }
            }
            
            // Ctrl/Cmd + S - Save to CRM (if available)
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                if (appState.isCopperActive && typeof saveQuoteToCRM === 'function') {
                    saveQuoteToCRM();
                }
            }
        });
    },

    // Bind error handlers
    bindErrorHandlers: function() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('💥 Global error:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    },

    // Trigger calculation update
    triggerCalculation: function() {
        if (appState.isActivityPanel) {
            this.updateQuickCalculation();
        } else {
            if (typeof Calculator !== 'undefined') {
                Calculator.updateResults();
            }
        }
    },

    // Update quick calculation for activity panel
    updateQuickCalculation: function() {
        const productKey = document.getElementById('quickProduct')?.value;
        const masterCases = parseInt(document.getElementById('quickCases')?.value) || 0;
        
        if (!productKey || masterCases <= 0) return;

        const product = ProductManager.get(productKey);
        const tierInfo = TierManager.getTier(masterCases);
        
        if (!product) return;

        const unitPrice = product.price * (1 - tierInfo.discount);
        const totalUnits = masterCases * product.unitsPerCase;
        const displayBoxes = masterCases * product.displayBoxesPerCase;
        const subtotal = masterCases * unitPrice * product.unitsPerCase;
        const shipping = subtotal * adminConfig.shipping.rate;
        const total = subtotal + shipping;

        const resultsContainer = document.getElementById('quickResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="quick-summary">
                    <div class="quick-item">
                        <span class="quick-label">Product:</span>
                        <span class="quick-value">${product.name}</span>
                    </div>
                    <div class="quick-item">
                        <span class="quick-label">Cases:</span>
                        <span class="quick-value">${masterCases} MC (${displayBoxes} boxes)</span>
                    </div>
                    <div class="quick-item">
                        <span class="quick-label">Units:</span>
                        <span class="quick-value">${totalUnits.toLocaleString()}</span>
                    </div>
                    <div class="quick-item">
                        <span class="quick-label">Unit Price:</span>
                        <span class="quick-value">$${unitPrice.toFixed(2)} (${tierInfo.name})</span>
                    </div>
                    <div class="quick-item total">
                        <span class="quick-label">Total:</span>
                        <span class="quick-value">$${total.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
    },

    // Validate input fields
    validateInput: function(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            this.showValidationError(input, `Value must be between ${min} and ${max}`);
        } else {
            input.classList.remove('invalid');
            this.clearValidationError(input);
        }
    },

    // Show validation error
    showValidationError: function(input, message) {
        this.clearValidationError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    },

    // Clear validation error
    clearValidationError: function(input) {
        const existingError = input.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
    },

    // Perform initial calculations
    performInitialCalculations: function() {
        console.log('🧮 Performing initial calculations...');
        
        setTimeout(() => {
            this.triggerCalculation();
        }, 100);
    },

    // ADDED: Force admin UI to show
    forceAdminUI: function() {
        // Force admin button to show if user is admin
        setTimeout(() => {
            if (appState.isAdmin) {
                const header = document.querySelector('.header');
                if (header) {
                    const existingAdminBtn = header.querySelector('.admin-btn');
                    if (!existingAdminBtn) {
                        const adminBtn = document.createElement('button');
                        adminBtn.className = 'admin-btn';
                        adminBtn.onclick = () => showAdminPanel();
                        adminBtn.innerHTML = '⚙️ Admin Settings';
                        header.appendChild(adminBtn);
                        console.log('✅ Admin button forcefully added to header');
                    }
                }
            }
        }, 500);
    },

    // Finalize initialization
    finalizeInitialization: function() {
        appState.isReady = true;
        appState.loadTime = Date.now() - appState.startTime;
        
        console.log(`✅ Kanva Botanicals Quote Calculator initialized successfully`);
        console.log(`⏱️ Load time: ${appState.loadTime}ms`);
        console.log(`🏃 Running in ${appState.appLocation} mode`);
        console.log(`🔗 Copper CRM: ${appState.isCopperActive ? 'Active' : 'Standalone'}`);
        console.log(`👤 User: ${appState.currentUser?.email || 'Anonymous'}`);
        console.log(`🛡️ Admin: ${appState.isAdmin ? 'Yes' : 'No'}`);
        
        // ADDED: Force admin UI if needed
        this.forceAdminUI();
        
        this.fireReadyEvent();
    },

    // Fire application ready event
    fireReadyEvent: function() {
        const readyEvent = new CustomEvent('kanvaAppReady', {
            detail: {
                loadTime: appState.loadTime,
                mode: appState.appLocation,
                copperActive: appState.isCopperActive,
                user: appState.currentUser,
                isAdmin: appState.isAdmin
            }
        });
        
        window.dispatchEvent(readyEvent);
        console.log('🎉 Kanva app ready event fired');
    },

    // Handle initialization errors
    handleInitializationError: function(error) {
        console.error('💥 Critical initialization error:', error);
        
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="error-container">
                    <h2>⚠️ Application Error</h2>
                    <p>Sorry, there was a problem loading the Kanva Quote Calculator.</p>
                    <details>
                        <summary>Technical Details</summary>
                        <pre>${error.message}</pre>
                    </details>
                    <button onclick="location.reload()">🔄 Reload Application</button>
                </div>
            `;
        }
        
        appState.isReady = false;
        appState.hasError = true;
    },

    // Handle global application errors
    handleGlobalError: function(error) {
        console.error('💥 Application error:', error);
        
        if (this.lastErrorTime && Date.now() - this.lastErrorTime < 5000) {
            return;
        }
        this.lastErrorTime = Date.now();
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('An error occurred. Please try again.');
        }
    },

    // Show help dialog
    showHelp: function() {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showInfo('Help system will be implemented in the next update.', 'Help');
        }
    },

    // Show keyboard shortcuts
    showKeyboardShortcuts: function() {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showInfo('Ctrl+G: Generate Email\nCtrl+S: Save to CRM\nF1: Show Help', 'Keyboard Shortcuts');
        }
    },

    // Get application status
    getStatus: function() {
        return {
            ready: appState.isReady,
            mode: appState.appLocation,
            copperActive: appState.isCopperActive,
            user: appState.currentUser,
            isAdmin: appState.isAdmin,
            loadTime: appState.loadTime,
            hasError: appState.hasError
        };
    }
};

// Global functions for UI interactions
function updateCalculation() {
    App.triggerCalculation();
}

function updateQuickCalculation() {
    App.updateQuickCalculation();
}

function switchToSingleProduct() {
    document.getElementById('singleProductMode').style.display = 'block';
    document.getElementById('multiProductMode').style.display = 'none';
    document.getElementById('singleProductBtn').classList.add('active');
    document.getElementById('multiProductBtn').classList.remove('active');
    App.triggerCalculation();
}

function switchToMultiProduct() {
    document.getElementById('singleProductMode').style.display = 'none';
    document.getElementById('multiProductMode').style.display = 'block';
    document.getElementById('singleProductBtn').classList.remove('active');
    document.getElementById('multiProductBtn').classList.add('active');
    if (typeof MultiProductCalculator !== 'undefined') {
        MultiProductCalculator.calculateTotal();
    }
}

// FIXED: Modal opening function for all modes
function openFullCalculatorModal() {
    console.log('🔄 Opening full calculator modal...');
    
    if (appState.sdk && appState.sdk.showModal) {
        try {
            // Configure modal for full calculator in Copper
            appState.sdk.setAppUI({
                width: 1000,
                height: 700,
                showActionBar: false
            });
            appState.sdk.showModal();
            console.log('✅ Copper modal opened');
        } catch (error) {
            console.error('❌ Error opening Copper modal:', error);
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showError('Failed to open modal. Please try again.');
            }
        }
    } else {
        // FIXED: Fallback for standalone mode - open in new window
        console.log('🔄 Opening calculator in new window (standalone mode)');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('mode', 'modal');
        
        const newWindow = window.open(
            currentUrl.toString(), 
            'KanvaCalculator', 
            'width=1000,height=700,scrollbars=yes,resizable=yes,location=yes'
        );
        
        if (!newWindow) {
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showWarning('Please allow popups to open the full calculator');
            } else {
                alert('Please allow popups to open the full calculator');
            }
        } else {
            console.log('✅ New window opened for full calculator');
        }
    }
}

function generateQuickEmail() {
    console.log('📧 Generating quick email from activity panel...');
    
    // Update the quick calculation first
    if (typeof App !== 'undefined' && App.updateQuickCalculation) {
        App.updateQuickCalculation();
    }
    
    // Then generate the email
    if (typeof EmailGenerator !== 'undefined') {
        EmailGenerator.generateEmail();
    } else if (typeof generateEmail === 'function') {
        generateEmail();
    } else {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showError('Email generator not available');
        }
    }
}

function saveQuickQuote() {
    console.log('💾 Saving quick quote to CRM...');
    
    if (typeof saveQuoteToCRM === 'function') {
        saveQuoteToCRM();
    } else if (typeof CopperIntegration !== 'undefined') {
        CopperIntegration.saveQuoteToCRM();
    } else {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showInfo('CRM integration not available - quote ready to copy');
        }
    }
}

// Set start time for load measurement
appState.startTime = Date.now();

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.initialize();
    });
} else {
    App.initialize();
}

// Global access to app instance
window.KanvaApp = App;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

console.log('✅ Main application module loaded successfully');
