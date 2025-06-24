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
        
        // Initialize notification manager first
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.initialize();
            console.log('✅ Notification manager initialized');
        }
        
        // Initialize calculator engine
        if (typeof Calculator !== 'undefined') {
            Calculator.initializeEventListeners();
            console.log('✅
