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
            // Continue with warnings but note issues
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
            CopperIntegration.checkEnvironment();
            
            // Initialize SDK
            const copperAvailable = CopperIntegration.initialize();
            
            if (copperAvailable) {
                console.log('✅ Copper CRM integration active');
                appState.isCopperActive = true;
            } else {
                console.log('⚠️ Running in standalone mode');
                appState.isCopperActive = false;
                
                // Set demo mode for standalone testing
                appState.isAdmin = true;
                AuthManager.setUser({
                    email: 'demo@kanvabotanicals.com',
                    name: 'Demo User'
                });
            }
        } catch (error) {
            console.error('❌ Error initializing Copper:', error);
            appState.isCopperActive = false;
        }
    },

    // Initialize core application modules
    initializeModules: function() {
        console.log('🧩 Initializing core modules...');
        
        // Initialize calculator engine
        if (typeof Calculator !== 'undefined') {
            Calculator.initializeEventListeners();
            console.log('✅ Calculator module initialized');
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
        
        // Generate the main HTML structure
        const mainHTML = this.generateMainHTML();
        appContainer.innerHTML = mainHTML;
        
        // Populate product dropdowns
        this.populateProductDropdowns();
        
        // Set initial values
        this.setInitialValues();
    },

    // Generate main HTML structure with updated field names
    generateMainHTML: function() {
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
                    ${isLeftNav ? `
                    <div class="input-group">
                        <label for="phone">Phone:</label>
                        <input type="tel" id="phone" placeholder="(555) 123-4567">
                    </div>
                    ` : ''}
                </section>

                <!-- Product & Order Details Section -->
                <section class="product-details">
                    <h3>Product & Order Details</h3>
                    <div class="input-group">
                        <label for="primaryProduct">Primary Product:</label>
                        <select id="primaryProduct">
                            <!-- Populated by JavaScript -->
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="masterCases">Master Cases:</label>
                        <input type="number" id="masterCases" value="28" min="1" max="500">
                    </div>
                    <div class="input-group">
                        <label for="maxRetail">Max Retail Price:</label>
                        <input type="number" id="maxRetail" value="5.00" step="0.01" min="0">
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
                    ${isModal ? '<button class="copy-btn" onclick="openCopperModal()">🔄 Open Full Calculator</button>' : ''}
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
            ${!isLeftNav ? this.generateSidebarCalculator() : ''}
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
                        <p><strong>Mango Extract:</strong> $4.25 → $9.99 MSRP <span class="pricing-tier tier2">Premium Extract</span></p>
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

    // Generate sidebar calculator for compact mode
    generateSidebarCalculator: function() {
        if (appState.isLeftNav) return ''; // Don't show sidebar in left nav mode
        
        return `
            <!-- Sidebar Quick Calculator -->
            <div class="sidebar-calculator" id="sidebarCalculator">
                <h4>Quick Calculate</h4>
                <div class="sidebar-inputs">
                    <label>Product:</label>
                    <select id="sidebarProduct">
                        <!-- Populated by JavaScript -->
                    </select>
                    
                    <label>Cases:</label>
                    <input type="number" id="sidebarCases" value="28" min="1" max="500">
                </div>
                
                <div id="sidebarResults" class="sidebar-results">
                    <!-- Populated by Calculator -->
                </div>
                
                <button class="launch-modal-btn" onclick="openCopperModal()">Open Full Calculator</button>
            </div>
        `;
    },

    // Populate product dropdown menus
    populateProductDropdowns: function() {
        const dropdowns = ['primaryProduct', 'sidebarProduct'];
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

    // Set initial form values with updated field names
    setInitialValues: function() {
        // Set default master cases
        const masterCasesInput = document.getElementById('masterCases');
        if (masterCasesInput && !masterCasesInput.value) {
            masterCasesInput.value = '28';
        }
        
        const sidebarCasesInput = document.getElementById('sidebarCases');
        if (sidebarCasesInput && !sidebarCasesInput.value) {
            sidebarCasesInput.value = '28';
        }
        
        // Set default max retail price
        this.updateMaxRetailPrice();
        
        // Set up quote name auto-generation when product changes
        this.setupQuoteNameGeneration();
        
        // Auto-populate customer info from Copper if available
        if (appState.isCopperActive) {
            setTimeout(() => {
                CopperIntegration.populateCustomerInfo();
            }, 500); // Small delay to ensure context is loaded
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
            // Modal mode: larger sizing, focused interface
            document.body.classList.add('modal-mode');
            this.optimizeForModal();
        } else if (appState.isLeftNav) {
            // Left nav mode: full-featured interface
            document.body.classList.add('left-nav-mode');
            this.optimizeForLeftNav();
        } else {
            // Sidebar mode: compact interface
            document.body.classList.add('sidebar-mode');
            this.optimizeForSidebar();
        }
    },

    // Optimize interface for modal mode
    optimizeForModal: function() {
        console.log('🔧 Optimizing UI for modal mode');
        
        // Adjust sizing and spacing
        const calculator = document.getElementById('mainCalculator');
        if (calculator) {
            calculator.style.minHeight = '700px';
            calculator.style.padding = '25px';
        }
    },

    // Optimize interface for left navigation mode
    optimizeForLeftNav: function() {
        console.log('🔧 Optimizing UI for left navigation mode');
        
        // Enable all features
        const productReference = document.querySelector('.product-reference');
        if (productReference) {
            productReference.style.display = 'block';
        }
    },

    // Optimize interface for sidebar mode
    optimizeForSidebar: function() {
        console.log('🔧 Optimizing UI for sidebar mode');
        
        // Hide complex elements, show sidebar calculator
        const sidebarCalc = document.getElementById('sidebarCalculator');
        if (sidebarCalc) {
            sidebarCalc.style.display = 'block';
        }
        
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

    // Add helpful tooltips with updated field names
    addTooltips: function() {
        const tooltips = {
            'masterCases': 'Number of master cases for the order. Higher quantities may qualify for better pricing tiers.',
            'maxRetail': 'Maximum recommended retail price to maintain market stability.',
            'primaryProduct': 'Select the main product for this quote.',
            'quoteName': 'Descriptive name for this quote (auto-generated from product and company).',
            'companyName': 'Name of the customer company or business.',
            'segment': 'Customer segment or industry type (e.g., smoke shops, convenience stores).',
            'emailDomain': 'Company\'s website domain for email communications.',
            'phone': 'Primary contact phone number for the customer.'
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
        
        // Simplify interface for mobile
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.style.gridTemplateColumns = '1fr';
        }
    },

    // Switch to desktop layout
    switchToDesktopLayout: function() {
        console.log('🖥️ Switching to desktop layout');
        document.body.classList.remove('mobile-layout');
        
        // Restore full interface
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.style.gridTemplateColumns = '';
        }
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
        ['primaryProduct', 'sidebarProduct'].forEach(selectId => {
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
        ['masterCases', 'sidebarCases'].forEach(inputId => {
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

    // Bind form validation events with updated field names
    bindValidationEvents: function() {
        // Validate number inputs
        ['masterCases', 'sidebarCases', 'maxRetail'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            }
        });
        
        // Add validation for new fields
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
        if (typeof Calculator !== 'undefined') {
            Calculator.updateResults();
            Calculator.updateSidebarResults();
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
        // Remove existing error
        this.clearValidationError(input);
        
        // Add error message
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
        
        // Trigger initial calculation
        setTimeout(() => {
            this.triggerCalculation();
        }, 100);
    },

    // Finalize initialization
    finalizeInitialization: function() {
        // Mark app as ready
        appState.isReady = true;
        appState.loadTime = Date.now() - appState.startTime;
        
        console.log(`✅ Kanva Botanicals Quote Calculator initialized successfully`);
        console.log(`⏱️ Load time: ${appState.loadTime}ms`);
        console.log(`🏃 Running in ${appState.appLocation} mode`);
        console.log(`🔗 Copper CRM: ${appState.isCopperActive ? 'Active' : 'Standalone'}`);
        console.log(`👤 User: ${appState.currentUser?.email || 'Anonymous'}`);
        console.log(`🛡️ Admin: ${appState.isAdmin ? 'Yes' : 'No'}`);
        
        // Fire ready event
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
        
        // Show user-friendly error message
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
        
        // Mark app as failed
        appState.isReady = false;
        appState.hasError = true;
    },

    // Handle global application errors
    handleGlobalError: function(error) {
        console.error('💥 Application error:', error);
        
        // Don't overwhelm user with error messages
        if (this.lastErrorTime && Date.now() - this.lastErrorTime < 5000) {
            return; // Skip if recent error
        }
        this.lastErrorTime = Date.now();
        
        // Show subtle error notification
        this.showErrorNotification('An error occurred. Please try again.');
    },

    // Show error notification
    showErrorNotification: function(message) {
        // Try to use admin panel messaging if available
        if (typeof AdminPanel !== 'undefined' && AdminPanel.showError) {
            AdminPanel.showError(message);
            return;
        }
        
        // Fallback: create temporary error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },

    // Show help dialog
    showHelp: function() {
        const helpContent = `
            <div class="help-dialog">
                <h3>📚 Kanva Quote Calculator Help</h3>
                
                <section>
                    <h4>Getting Started</h4>
                    <p>1. Enter customer information (quote name, company, segment)</p>
                    <p>2. Select a product and specify the number of master cases</p>
                    <p>3. Review the calculated pricing and terms</p>
                    <p>4. Generate a professional quote email</p>
                </section>
                
                <section>
                    <h4>New Field Guide</h4>
                    <p><strong>Quote Name:</strong> Auto-generated as "Product Quote for Company"</p>
                    <p><strong>Segment:</strong> Customer type (smoke shops, convenience stores, etc.)</p>
                    <p><strong>Email Domain:</strong> Company website for communications</p>
                </section>
                
                <section>
                    <h4>Pricing Tiers</h4>
                    <p><strong>Tier 1:</strong> Standard pricing (under 56 cases)</p>
                    <p><strong>Tier 2:</strong> Volume discount (56-111 cases)</p>
                    <p><strong>Tier 3:</strong> Best pricing (112+ cases)</p>
                </section>
                
                <section>
                    <h4>Search & Auto-population</h4>
                    <p>• Use the search box to find existing customers</p>
                    <p>• Fields auto-populate when you select a customer</p>
                    <p>• Context-aware when used within Copper CRM</p>
                </section>
                
                <section>
                    <h4>Keyboard Shortcuts</h4>
                    <p><kbd>Ctrl/Cmd + G</kbd> - Generate Email</p>
                    <p><kbd>Ctrl/Cmd + S</kbd> - Save to CRM</p>
                    <p><kbd>F1</kbd> - Show Help</p>
                    <p><kbd>Ctrl/Cmd + ?</kbd> - Show Shortcuts</p>
                </section>
                
                <button onclick="this.closest('.help-dialog').remove()">Close</button>
            </div>
        `;
        
        this.showModal(helpContent);
    },

    // Show keyboard shortcuts
    showKeyboardShortcuts: function() {
        const shortcutsContent = `
            <div class="shortcuts-dialog">
                <h3>⌨️ Keyboard Shortcuts</h3>
                
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + G</kbd>
                        <span>Generate Quote Email</span>
                    </div>
                    
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + S</kbd>
                        <span>Save Quote to CRM</span>
                    </div>
                    
                    <div class="shortcut-item">
                        <kbd>F1</kbd>
                        <span>Show Help Dialog</span>
                    </div>
                    
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + ?</kbd>
                        <span>Show This Dialog</span>
                    </div>
                    
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close Dialogs</span>
                    </div>
                    
                    <div class="shortcut-item">
                        <kbd>Tab</kbd>
                        <span>Navigate Between Fields</span>
                    </div>
                </div>
                
                <button onclick="this.closest('.shortcuts-dialog').remove()">Close</button>
            </div>
        `;
        
        this.showModal(shortcutsContent);
    },

    // Show modal dialog
    showModal: function(content) {
        // Remove existing modals
        const existingModals = document.querySelectorAll('.app-modal');
        existingModals.forEach(modal => modal.remove());
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'app-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        `;
        modalContent.innerHTML = content;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close on escape key
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Close on backdrop click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        });
    },

    // Utility function to check if app is ready
    isReady: function() {
        return appState.isReady === true;
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
    },

    // Restart application
    restart: function() {
        console.log('🔄 Restarting application...');
        
        // Reset app state
        appState.isReady = false;
        appState.hasError = false;
        
        // Clear any existing content
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = '<div class="loading">🔄 Loading Kanva Quote Calculator...</div>';
        }
        
        // Reinitialize after short delay
        setTimeout(() => {
            this.initialize();
        }, 500);
    },

    // Debug information
    debug: function() {
        console.group('🐛 Debug Information');
        console.log('App State:', appState);
        console.log('Admin Config:', adminConfig);
        console.log('Current Calculation:', Calculator?.getCalculationSummary?.());
        console.log('Copper Context:', appState.copperContext);
        console.log('Window Size:', `${window.innerWidth}x${window.innerHeight}`);
        console.log('User Agent:', navigator.userAgent);
        console.groupEnd();
        
        return this.getStatus();
    }
};

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.initialize();
    });
} else {
    // DOM already loaded
    App.initialize();
}

// Global access to app instance
window.KanvaApp = App;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

console.log('✅ Main application module loaded successfully');
