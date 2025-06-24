const appState = {
    // Application status
    isReady: false,
    startTime: Date.now(),
    loadTime: null,
    hasError: false,
    
    // Environment detection
    isModalMode: false,
    isActivityPanel: false,
    isLeftNav: false,
    isSidebar: false,
    isMobile: false,
    appLocation: 'unknown',
    
    // CRM Integration
    isCopperActive: false,
    sdk: null,
    copperContext: null,
    integrationMode: 'standalone',
    hasEntityContext: false,
    contextEntity: null,
    
    // User management
    currentUser: null,
    isAdmin: false,
    
    // Configuration
    currentConfig: null,
    configVersion: '1.0.0'
};

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
        <!-- Main Calculator Container with Tailwind -->
        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-kanva-light p-4" id="mainCalculator">
            
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-kanva-green">
                    <h1 class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-kanva-dark to-kanva-green bg-clip-text text-transparent mb-4">
                        🌿 Kanva Botanicals Quote Calculator
                    </h1>
                    <p class="text-lg text-gray-600 mb-4">Instantly generate professional quotes with accurate pricing</p>
                    ${isAdmin ? `
                        <button onclick="showAdminPanel()" 
                                class="px-6 py-3 bg-gradient-to-r from-kanva-dark to-gray-700 hover:from-gray-700 hover:to-kanva-dark text-white font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-kanva-dark/50">
                            ⚙️ Admin Settings
                        </button>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    <!-- Customer Information Section -->
                    <div class="xl:col-span-1">
                        <section class="bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6 mb-6">
                            <h3 class="text-2xl font-bold text-kanva-dark mb-6 pb-3 border-b-2 border-kanva-green">
                                👤 Customer Information
                            </h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label for="quoteName" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Quote Name:
                                    </label>
                                    <input type="text" 
                                           id="quoteName" 
                                           placeholder="Product Quote for Company Name"
                                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                </div>
                                
                                <div>
                                    <label for="companyName" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Company Name:
                                    </label>
                                    <input type="text" 
                                           id="companyName" 
                                           placeholder="ABC Distribution"
                                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                </div>
                                
                                <div>
                                    <label for="segment" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Customer Segment:
                                    </label>
                                    <input type="text" 
                                           id="segment" 
                                           placeholder="smoke and vape shops"
                                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                </div>
                                
                                <div>
                                    <label for="customerState" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        State:
                                    </label>
                                    <select id="customerState" 
                                            onchange="updateShippingZone()"
                                            class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300">
                                        <option value="">Select State...</option>
                                        <option value="AL">AL</option>
                                        <option value="AK">AK</option>
                                        <option value="AZ">AZ</option>
                                        <option value="AR">AR</option>
                                        <option value="CA">CA</option>
                                        <option value="CO">CO</option>
                                        <option value="CT">CT</option>
                                        <option value="DE">DE</option>
                                        <option value="DC">DC</option>
                                        <option value="FL">FL</option>
                                        <option value="GA">GA</option>
                                        <option value="HI">HI</option>
                                        <option value="ID">ID</option>
                                        <option value="IL">IL</option>
                                        <option value="IN">IN</option>
                                        <option value="IA">IA</option>
                                        <option value="KS">KS</option>
                                        <option value="KY">KY</option>
                                        <option value="LA">LA</option>
                                        <option value="ME">ME</option>
                                        <option value="MD">MD</option>
                                        <option value="MA">MA</option>
                                        <option value="MI">MI</option>
                                        <option value="MN">MN</option>
                                        <option value="MS">MS</option>
                                        <option value="MO">MO</option>
                                        <option value="MT">MT</option>
                                        <option value="NE">NE</option>
                                        <option value="NV">NV</option>
                                        <option value="NH">NH</option>
                                        <option value="NJ">NJ</option>
                                        <option value="NM">NM</option>
                                        <option value="NY">NY</option>
                                        <option value="NC">NC</option>
                                        <option value="ND">ND</option>
                                        <option value="OH">OH</option>
                                        <option value="OK">OK</option>
                                        <option value="OR">OR</option>
                                        <option value="PA">PA</option>
                                        <option value="RI">RI</option>
                                        <option value="SC">SC</option>
                                        <option value="SD">SD</option>
                                        <option value="TN">TN</option>
                                        <option value="TX">TX</option>
                                        <option value="UT">UT</option>
                                        <option value="VT">VT</option>
                                        <option value="VA">VA</option>
                                        <option value="WA">WA</option>
                                        <option value="WV">WV</option>
                                        <option value="WI">WI</option>
                                        <option value="WY">WY</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label for="emailDomain" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Email Domain:
                                    </label>
                                    <input type="text" 
                                           id="emailDomain" 
                                           placeholder="company.com"
                                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                </div>
                                
                                <div>
                                    <label for="phone" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Phone Number:
                                    </label>
                                    <input type="tel" 
                                           id="phone" 
                                           placeholder="(555) 123-4567"
                                           class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                </div>
                            </div>
                            
                            <!-- Shipping Zone Display -->
                            <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                                <h4 class="text-lg font-bold text-blue-900 mb-2">📦 Shipping Zone</h4>
                                <div id="shippingZoneDisplay" class="text-blue-800">
                                    Select a state to see shipping zone
                                </div>
                            </div>
                            
                            <!-- Tax Information -->
                            <div class="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                                <h4 class="text-lg font-bold text-green-900 mb-4">🏛️ Tax Information</h4>
                                
                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label for="stateTaxRate" class="block text-xs font-bold text-green-900 uppercase tracking-wide mb-1">
                                            State Tax (%):
                                        </label>
                                        <input type="number" 
                                               id="stateTaxRate" 
                                               step="0.01" 
                                               placeholder="0.00"
                                               class="w-full p-2 border-2 border-green-300 rounded-md text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300" />
                                    </div>
                                    
                                    <div>
                                        <label for="countyTaxRate" class="block text-xs font-bold text-green-900 uppercase tracking-wide mb-1">
                                            County Tax (%):
                                        </label>
                                        <input type="number" 
                                               id="countyTaxRate" 
                                               step="0.01" 
                                               placeholder="0.00"
                                               class="w-full p-2 border-2 border-green-300 rounded-md text-green-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300" />
                                    </div>
                                </div>
                                
                                <button type="button" 
                                        onclick="autoDetectTaxRate()"
                                        class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300">
                                    🎯 Auto-Detect Tax Rate
                                </button>
                            </div>
                        </section>
                    </div>

                    <!-- Product & Order Details Section -->
                    <div class="xl:col-span-2">
                        <section class="bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6 mb-6">
                            
                            <!-- Product Mode Toggle -->
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <h3 class="text-2xl font-bold text-kanva-dark mb-4 sm:mb-0">
                                    📦 Product & Order Details
                                </h3>
                                <div class="flex bg-gray-100 rounded-lg p-1">
                                    <button type="button" 
                                            id="singleProductBtn" 
                                            onclick="switchToSingleProduct()"
                                            class="px-4 py-2 rounded-md font-bold text-sm transition-all duration-300 bg-kanva-green text-kanva-dark shadow-sm">
                                        Single Product
                                    </button>
                                    <button type="button" 
                                            id="multiProductBtn" 
                                            onclick="switchToMultiProduct()"
                                            class="px-4 py-2 rounded-md font-bold text-sm transition-all duration-300 text-gray-600 hover:text-kanva-dark">
                                        Multiple Products
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Single Product Mode -->
                            <div id="singleProductMode" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label for="primaryProduct" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                            Primary Product:
                                        </label>
                                        <select id="primaryProduct" 
                                                onchange="updateCalculation()"
                                                class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300">
                                            <!-- Populated by JavaScript -->
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label for="masterCases" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                            Master Cases:
                                        </label>
                                        <input type="number" 
                                               id="masterCases" 
                                               value="28" 
                                               min="1" 
                                               max="500" 
                                               onchange="updateCalculation()"
                                               class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                    </div>
                                    
                                    <div>
                                        <label for="maxRetail" class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                            Max Retail Price:
                                        </label>
                                        <div class="relative">
                                            <span class="absolute left-3 top-3 text-kanva-dark font-bold">$</span>
                                            <input type="number" 
                                                   id="maxRetail" 
                                                   value="5.00" 
                                                   step="0.01" 
                                                   min="0"
                                                   class="w-full p-3 pl-8 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Shipping Override Section -->
                                <div class="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                                    <label class="flex items-center text-gray-700 font-medium">
                                        <input type="checkbox" 
                                               id="shippingOverride" 
                                               onchange="toggleShippingOverride()"
                                               class="mr-3 w-5 h-5 text-kanva-green border-2 border-kanva-green rounded focus:ring-kanva-green focus:ring-2" />
                                        Manual Shipping Override
                                    </label>
                                    <div id="shippingOverrideSection" class="mt-3 hidden">
                                        <label for="manualShipping" class="block text-sm font-bold text-gray-700 mb-2">
                                            Shipping Amount:
                                        </label>
                                        <div class="relative">
                                            <span class="absolute left-3 top-3 text-gray-600 font-bold">$</span>
                                            <input type="number" 
                                                   id="manualShipping" 
                                                   step="0.01" 
                                                   placeholder="0.00"
                                                   onchange="updateCalculation()"
                                                   class="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg text-gray-700 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Multiple Product Mode -->
                            <div id="multiProductMode" class="hidden space-y-6">
                                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-kanva-light to-kanva-accent rounded-lg border-2 border-kanva-green/30">
                                    <button type="button" 
                                            onclick="addProductLine()"
                                            class="mb-4 sm:mb-0 px-6 py-3 bg-gradient-to-r from-kanva-green to-green-400 hover:from-green-400 hover:to-kanva-green text-kanva-dark font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-kanva-green/50">
                                        ➕ Add Product Line
                                    </button>
                                    
                                    <label class="flex items-center text-kanva-dark font-medium">
                                        <input type="checkbox" 
                                               id="creditCardFee" 
                                               onchange="calculateMultiProductTotal()"
                                               class="mr-3 w-5 h-5 text-kanva-green border-2 border-kanva-green rounded focus:ring-kanva-green focus:ring-2" />
                                        Add 3% Credit Card Fee
                                    </label>
                                </div>
                                
                                <div id="productLines" class="space-y-4">
                                    <!-- Product lines populated by MultiProductCalculator -->
                                </div>
                                
                                <div id="multiProductResults" class="bg-gradient-to-r from-kanva-light to-kanva-accent p-6 rounded-lg border-2 border-kanva-green">
                                    <!-- Results populated by MultiProductCalculator -->
                                </div>
                            </div>
                        </section>

                        <!-- Calculation Results Section -->
                        <section class="bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6 mb-6" id="resultsSection">
                            <h3 class="text-2xl font-bold text-kanva-dark mb-6 pb-3 border-b-2 border-kanva-green">
                                🧮 Order Calculation
                            </h3>
                            
                            <div id="orderResults" class="bg-gradient-to-r from-kanva-light to-kanva-accent p-6 rounded-lg border-2 border-kanva-green/30 mb-4">
                                <!-- Populated by Calculator -->
                            </div>
                            
                            <div id="tierInfo" class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300 text-green-900">
                                <!-- Populated by Calculator -->
                            </div>
                        </section>

                        <!-- Action Buttons Section -->
                        <section class="bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6">
                            <div class="flex flex-wrap gap-4 justify-center">
                                <button onclick="generateEmail()" 
                                        class="flex-1 min-w-[250px] px-6 py-4 bg-gradient-to-r from-kanva-green to-green-400 hover:from-green-400 hover:to-kanva-green text-kanva-dark font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-kanva-green/50">
                                    📧 Generate Professional Quote Email
                                </button>
                                
                                ${appState.isCopperActive ? `
                                    <button onclick="saveQuoteToCRM()" 
                                            class="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300">
                                        💾 Save to CRM
                                    </button>
                                    
                                    <button onclick="createOpportunity()" 
                                            class="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300">
                                        🎯 Create Opportunity
                                    </button>
                                ` : ''}
                            </div>
                        </section>
                    </div>
                </div>

                ${isLeftNav ? this.generateProductReferenceSection() : ''}
            </div>
        </div>

        <!-- Email Template Display -->
        <div id="emailTemplate" class="hidden max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6">
            <h3 class="text-2xl font-bold text-kanva-dark mb-6 pb-3 border-b-2 border-kanva-green">
                📧 Generated Quote Email
            </h3>
            
            <div class="flex flex-wrap gap-3 mb-6">
                <button onclick="copyEmail()" 
                        class="px-4 py-2 bg-gradient-to-r from-kanva-green to-green-400 hover:from-green-400 hover:to-kanva-green text-kanva-dark font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                    📋 Copy Email
                </button>
                <button onclick="exportEmail('text')" 
                        class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                    📄 Export as Text
                </button>
                <button onclick="exportEmail('html')" 
                        class="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                    🌐 Export as HTML
                </button>
                ${appState.isCopperActive ? `
                    <button onclick="sendEmailViaCRM()" 
                            class="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                        📧 Log in CRM
                    </button>
                ` : ''}
            </div>
            
            <div id="emailOutput" class="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                <!-- Generated email content -->
            </div>
            
            <!-- Email Template Options -->
            <div class="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300">
                <h4 class="text-lg font-bold text-gray-800 mb-3">📝 Quick Templates</h4>
                <div class="flex flex-wrap gap-3">
                    <button onclick="generateFollowUpEmail()" 
                            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-all duration-300">
                        Follow-up Email
                    </button>
                    <button onclick="generateNegotiationEmail()" 
                            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-all duration-300">
                        Negotiation Email
                    </button>
                    <button onclick="generateClosingEmail()" 
                            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-all duration-300">
                        Closing Email
                    </button>
                </div>
            </div>
        </div>

        ${isAdmin ? this.generateAdminPanel() : ''}
    `;
},

    // Generate product reference section for left nav mode
    generateProductReferenceSection: function() {
        return `
            <!-- Product Reference Section -->
            <section class="mt-8 mx-auto max-w-7xl">
                <div class="bg-white rounded-2xl shadow-lg border-2 border-kanva-green p-6">
                    <h3 class="text-2xl font-bold text-kanva-dark mb-6 pb-3 border-b-2 border-kanva-green">
                        📚 Quick Product Reference
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-gradient-to-br from-kanva-light to-green-50 p-5 rounded-xl border-2 border-kanva-green/30 hover:border-kanva-green hover:shadow-lg transition-all duration-300">
                            <h4 class="text-xl font-bold text-kanva-dark mb-4">🥤 2oz Wellness Shots</h4>
                            <div class="space-y-2 text-sm">
                                <p class="flex justify-between items-center">
                                    <span class="font-semibold">Focus + Flow:</span>
                                    <span class="text-gray-600">$4.50 → $9.99 MSRP</span>
                                </p>
                                <p class="text-xs text-kanva-green font-bold">Best Seller • Kava + Kratom</p>
                                
                                <p class="flex justify-between items-center pt-2">
                                    <span class="font-semibold">Release + Relax:</span>
                                    <span class="text-gray-600">$4.50 → $9.99 MSRP</span>
                                </p>
                                <p class="text-xs text-blue-600 font-bold">Kanna + Kava</p>
                                
                                <p class="flex justify-between items-center pt-2">
                                    <span class="font-semibold">Raw + Releaf:</span>
                                    <span class="text-gray-600">$4.50 → $9.99 MSRP</span>
                                </p>
                                <p class="text-xs text-orange-600 font-bold">New Product</p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-300 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                            <h4 class="text-xl font-bold text-blue-900 mb-4">⚡ Energy & Extract Shots</h4>
                            <div class="space-y-2 text-sm">
                                <p class="flex justify-between items-center">
                                    <span class="font-semibold">Kanva Zoom:</span>
                                    <span class="text-gray-600">$3.10 → $6.99 MSRP</span>
                                </p>
                                <p class="text-xs text-blue-600 font-bold">Energy Boost</p>
                                
                                <p class="flex justify-between items-center pt-2">
                                    <span class="font-semibold">Mango Extract:</span>
                                    <span class="text-gray-600">$4.25 → $11.99 MSRP</span>
                                </p>
                                <p class="text-xs text-purple-600 font-bold">Premium Extract</p>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-300 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                            <h4 class="text-xl font-bold text-purple-900 mb-4">💰 High-Margin Products</h4>
                            <div class="space-y-2 text-sm">
                                <p class="font-semibold text-purple-700">Kratom Capsules: 49-58% margins</p>
                                <p class="font-semibold text-purple-700">Kratom Powders: 49-56% margins</p>
                                <p class="text-xs text-gray-600 italic mt-3">Perfect add-ons for experienced customers</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Volume Tier Reference -->
                    <div class="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">📊 Volume Pricing Tiers</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div class="text-center">
                                <p class="font-bold text-gray-700">Tier 1 (0-55 MC)</p>
                                <p class="text-gray-600">Standard Pricing</p>
                            </div>
                            <div class="text-center">
                                <p class="font-bold text-orange-600">Tier 2 (56-111 MC)</p>
                                <p class="text-gray-600">3.3% Discount</p>
                            </div>
                            <div class="text-center">
                                <p class="font-bold text-purple-600">Tier 3 (112+ MC)</p>
                                <p class="text-gray-600">5.6% Discount</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    // Generate admin panel HTML
   generateAdminPanel: function() {
    return `
        <!-- Admin Panel Modal - Tailwind Version -->
        <div id="adminPanel" 
             class="hidden fixed inset-0 bg-kanva-dark/95 backdrop-blur-sm z-50 overflow-y-auto">
            
            <!-- Admin Content Container -->
            <div class="bg-white mx-4 my-8 lg:mx-auto lg:my-8 p-0 rounded-2xl max-w-6xl border-3 border-kanva-green shadow-2xl transform transition-all duration-300">
                
                <!-- Admin Header -->
                <div class="flex justify-between items-center bg-gradient-to-r from-kanva-light to-kanva-accent p-6 rounded-t-2xl border-b-3 border-kanva-green">
                    <h2 class="text-3xl font-bold text-kanva-dark flex items-center gap-3">
                        ⚙️ Admin Settings
                    </h2>
                    <button onclick="hideAdminPanel()" 
                            class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-bold text-xl transition-all duration-300 hover:rotate-90 hover:scale-110 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300">
                        ×
                    </button>
                </div>
                
                <!-- Admin Sections Container -->
                <div class="max-h-[70vh] overflow-y-auto p-6 space-y-6">
                    
                    <!-- Product Pricing Section -->
                    <section class="bg-white border-2 border-kanva-green rounded-xl hover:border-kanva-dark hover:shadow-lg transition-all duration-300 group">
                        <h3 class="bg-gradient-to-r from-kanva-green to-green-400 text-kanva-dark font-bold text-xl p-4 rounded-t-xl -mb-px">
                            💰 Product Pricing
                        </h3>
                        
                        <div class="p-6 space-y-6">
                            ${Object.keys(adminConfig.products).map(key => {
                                const product = adminConfig.products[key];
                                return `
                                    <div class="bg-white border-2 border-kanva-green rounded-lg p-5 hover:border-kanva-dark hover:shadow-md transition-all duration-300">
                                        <h4 class="bg-gradient-to-r from-kanva-light to-kanva-accent text-kanva-dark font-bold text-lg p-3 rounded-t-md -mx-5 -mt-5 mb-4 border-b-2 border-kanva-green">
                                            ${product.name}
                                        </h4>
                                        
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                                    Wholesale Price:
                                                </label>
                                                <input type="number" 
                                                       id="admin_${key}_price" 
                                                       value="${product.price}"
                                                       step="0.01"
                                                       class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                                                       placeholder="$0.00" />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                                    MSRP:
                                                </label>
                                                <input type="number" 
                                                       id="admin_${key}_msrp"
                                                       value="${product.msrp}" 
                                                       step="0.01"
                                                       class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                                                       placeholder="$0.00" />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                                    Units per Case:
                                                </label>
                                                <input type="number" 
                                                       id="admin_${key}_units"
                                                       value="${product.unitsPerCase}"
                                                       class="w-full p-3 border-2 border-kanva-green rounded-lg text-kanva-dark font-medium focus:border-kanva-dark focus:ring-4 focus:ring-kanva-green/30 focus:outline-none transition-all duration-300"
                                                       placeholder="12" />
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </section>

                    <!-- Volume Pricing Tiers Section -->
                    <section class="bg-white border-2 border-kanva-green rounded-xl hover:border-kanva-dark hover:shadow-lg transition-all duration-300">
                        <h3 class="bg-gradient-to-r from-kanva-green to-green-400 text-kanva-dark font-bold text-xl p-4 rounded-t-xl -mb-px">
                            📊 Volume Pricing Tiers
                        </h3>
                        
                        <div class="p-6 space-y-6">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Tier 2 -->
                                <div class="bg-orange-50 border-2 border-orange-300 rounded-lg p-5 hover:border-orange-400 hover:shadow-md transition-all duration-300">
                                    <h4 class="bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 font-bold text-lg p-3 rounded-t-md -mx-5 -mt-5 mb-4 border-b-2 border-orange-400">
                                        🥈 Tier 2 Pricing
                                    </h4>
                                    
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-bold text-orange-900 uppercase tracking-wide mb-2">
                                                Threshold (cases):
                                            </label>
                                            <input type="number" 
                                                   id="admin_tier2_threshold"
                                                   value="${adminConfig.tiers.tier2.threshold}"
                                                   class="w-full p-3 border-2 border-orange-300 rounded-lg text-orange-900 font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-200 focus:outline-none transition-all duration-300" />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-bold text-orange-900 uppercase tracking-wide mb-2">
                                                Discount (%):
                                            </label>
                                            <input type="number" 
                                                   id="admin_tier2_discount"
                                                   value="${(adminConfig.tiers.tier2.discount * 100).toFixed(1)}" 
                                                   step="0.1"
                                                   class="w-full p-3 border-2 border-orange-300 rounded-lg text-orange-900 font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-200 focus:outline-none transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tier 3 -->
                                <div class="bg-purple-50 border-2 border-purple-300 rounded-lg p-5 hover:border-purple-400 hover:shadow-md transition-all duration-300">
                                    <h4 class="bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900 font-bold text-lg p-3 rounded-t-md -mx-5 -mt-5 mb-4 border-b-2 border-purple-400">
                                        🥇 Tier 3 Pricing
                                    </h4>
                                    
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-bold text-purple-900 uppercase tracking-wide mb-2">
                                                Threshold (cases):
                                            </label>
                                            <input type="number" 
                                                   id="admin_tier3_threshold"
                                                   value="${adminConfig.tiers.tier3.threshold}"
                                                   class="w-full p-3 border-2 border-purple-300 rounded-lg text-purple-900 font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300" />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-bold text-purple-900 uppercase tracking-wide mb-2">
                                                Discount (%):
                                            </label>
                                            <input type="number" 
                                                   id="admin_tier3_discount"
                                                   value="${(adminConfig.tiers.tier3.discount * 100).toFixed(1)}" 
                                                   step="0.1"
                                                   class="w-full p-3 border-2 border-purple-300 rounded-lg text-purple-900 font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Shipping & Payment Section -->
                    <section class="bg-white border-2 border-kanva-green rounded-xl hover:border-kanva-dark hover:shadow-lg transition-all duration-300">
                        <h3 class="bg-gradient-to-r from-kanva-green to-green-400 text-kanva-dark font-bold text-xl p-4 rounded-t-xl -mb-px">
                            🚚 Shipping & Payment
                        </h3>
                        
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        Free Shipping Threshold:
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-3 text-blue-600 font-bold">$</span>
                                        <input type="number" 
                                               id="admin_free_shipping"
                                               value="${adminConfig.shipping.freeThreshold}"
                                               class="w-full p-3 pl-8 border-2 border-blue-300 rounded-lg text-blue-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-300" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold text-kanva-dark uppercase tracking-wide mb-2">
                                        ACH Required Over:
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-3 text-blue-600 font-bold">$</span>
                                        <input type="number" 
                                               id="admin_ach_threshold"
                                               value="${adminConfig.payment.achThreshold}"
                                               class="w-full p-3 pl-8 border-2 border-blue-300 rounded-lg text-blue-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-4 justify-center p-6 border-t-2 border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button onclick="saveAdminSettings()" 
                            class="flex-1 min-w-[200px] px-8 py-4 bg-gradient-to-r from-kanva-green to-green-400 hover:from-green-400 hover:to-kanva-green text-kanva-dark font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-kanva-green/50 uppercase tracking-wide">
                        💾 Save Settings
                    </button>
                    
                    <button onclick="resetAdminSettings()" 
                            class="flex-1 min-w-[200px] px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 uppercase tracking-wide">
                        🔄 Reset to Defaults
                    </button>
                    
                    <button onclick="exportAdminConfig()" 
                            class="flex-1 min-w-[200px] px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 uppercase tracking-wide">
                        📤 Export Config
                    </button>
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
            'customerState': 'State for shipping zone calculation',
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
        
        // Get state for shipping calculation
        const state = document.getElementById('customerState')?.value || 'CA';
        const shipping = ShippingManager.calculateShipping(displayBoxes, masterCases, state);
        
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
                        <span class="quick-value">${unitPrice.toFixed(2)} (${tierInfo.name})</span>
                    </div>
                    <div class="quick-item total">
                        <span class="quick-label">Total:</span>
                        <span class="quick-value">${total.toLocaleString()}</span>
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

// NEW: Toggle shipping override
function toggleShippingOverride() {
    const checkbox = document.getElementById('shippingOverride');
    const section = document.getElementById('shippingOverrideSection');
    
    if (checkbox && section) {
        if (checkbox.checked) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            // Clear manual shipping value
            const manualInput = document.getElementById('manualShipping');
            if (manualInput) {
                manualInput.value = '';
            }
        }
        App.triggerCalculation();
    }
}

// NEW: Update shipping zone display
function updateShippingZone() {
    const state = document.getElementById('customerState')?.value;
    const display = document.getElementById('shippingZoneDisplay');
    
    if (state && display) {
        const zoneInfo = ShippingManager.getZoneForState(state);
        display.innerHTML = `
            <div class="text-sm">
                <p class="font-bold">${zoneInfo.name}</p>
                <p class="text-xs mt-1">Rates: ${zoneInfo.rates['1-3boxes']} (1-3 boxes), ${zoneInfo.rates['4-8boxes']} (4-8 boxes), ${zoneInfo.rates['9-11boxes']} (9-11 boxes), ${zoneInfo.rates.mastercase}/MC</p>
            </div>
        `;
    } else {
        display.innerHTML = 'Select a state to see shipping zone';
    }
    
    App.triggerCalculation();
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
