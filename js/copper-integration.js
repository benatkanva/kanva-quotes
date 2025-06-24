// Copper CRM integration for Kanva Botanicals Quote Calculator
// Handles SDK initialization, context management, and CRM operations

const CopperIntegration = {
    // Initialize Copper SDK and detect environment
    initialize: function() {
        console.log('🔗 Initializing Copper CRM integration...');
        
        try {
            // Check if we're running in Copper environment
            if (typeof window.Copper !== 'undefined') {
                appState.sdk = window.Copper.init();
                console.log('✅ Copper SDK initialized successfully');
                
                // Configure SDK based on mode
                this.configureSdk();
                
                // Get user context
                this.getUserContext();
                
                return true;
            } else {
                console.log('⚠️  Running outside Copper environment - CRM features will be simulated');
                return false;
            }
        } catch (error) {
            console.error('❌ Error initializing Copper SDK:', error);
            return false;
        }
    },

    // Configure SDK settings based on current mode
    configureSdk: function() {
        if (!appState.sdk) return;

        try {
            // Configure modal size if in modal mode
            if (appState.isModalMode) {
                appState.sdk.setAppUI({
                    width: 1200,
                    height: 800,
                    showActionBar: false,
                    disableAddButton: true
                });
                console.log('📐 Configured SDK for modal mode (1200x800)');
            }
        } catch (error) {
            console.error('❌ Error configuring SDK:', error);
        }
    },

    // Get user context and permissions
    getUserContext: function() {
        if (!appState.sdk) return;

        appState.sdk.getContext()
            .then((data) => {
                console.log('👤 Copper context received:', data);
                appState.copperContext = data;
                
                // Set user information
                if (data.user) {
                    AuthManager.setUser(data.user);
                }
                
                // Detect location mode
                this.detectLocationMode(data);
                
                // Trigger UI re-render if needed
                if (typeof UIManager !== 'undefined') {
                    UIManager.onContextReceived(data);
                }
            })
            .catch((error) => {
                console.error('❌ Error getting Copper context:', error);
            });
    },

    // Detect if we're in left navigation vs sidebar
    detectLocationMode: function(context) {
        // Check various indicators for left navigation
        const isLeftNav = context && (
            context.location === 'left_nav' || 
            window.innerWidth > 800 ||
            window.location.search.includes('nav=left')
        );
        
        if (isLeftNav) {
            appState.isLeftNav = true;
            appState.appLocation = 'left_nav';
            document.body.className = 'left-nav-mode';
            console.log('📍 Detected left navigation mode');
        }
    },

    // Open Copper's native modal
    openModal: function() {
        if (appState.sdk && appState.sdk.showModal) {
            try {
                appState.sdk.showModal();
                console.log('🔄 Opened Copper native modal');
            } catch (error) {
                console.error('❌ Error opening Copper modal:', error);
                alert('Failed to open modal. Please try again.');
            }
        } else {
            console.warn('⚠️  Copper SDK not available - modal cannot be opened');
            alert('Copper SDK not available. This feature requires running within Copper CRM.');
        }
    },

    // Save quote to CRM as activity
    saveQuoteToCRM: function() {
        const calc = Calculator.calculateOrder();
        if (!calc.product) {
            alert('Please calculate a quote first');
            return;
        }

        if (appState.sdk && appState.sdk.logActivity) {
            try {
                const details = this.formatQuoteActivity(calc);
                
                // Log activity in Copper (type 0 = note)
                appState.sdk.logActivity(0, details);
                
                console.log('💾 Quote saved to CRM activity log');
                this.showSuccessMessage('Quote saved to CRM activity log!');
                
                // Refresh UI to show the new activity
                this.refreshCopperUI();
                
            } catch (error) {
                console.error('❌ Error saving quote to CRM:', error);
                alert('Failed to save quote to CRM: ' + error.message);
            }
        } else {
            // Simulate CRM save for demo/testing
            console.log('📝 Simulating CRM save (SDK not available)');
            const message = `Quote would be saved to CRM!\n\nProduct: ${calc.product.name}\nCases: ${calc.masterCases}\nTotal: ${calc.total}`;
            alert(message);
        }
    },

    // Create opportunity in Copper
    createOpportunity: function() {
        const calc = Calculator.calculateOrder();
        if (!calc.product) {
            alert('Please calculate a quote first');
            return;
        }

        if (appState.sdk && appState.sdk.createEntity) {
            try {
                const opportunityData = this.formatOpportunityData(calc);
                
                appState.sdk.createEntity('opportunity', opportunityData);
                
                console.log('🎯 Opportunity created in Copper');
                this.showSuccessMessage('Opportunity created in Copper CRM!');
                
                // Refresh UI to show the new opportunity
                this.refreshCopperUI();
                
            } catch (error) {
                console.error('❌ Error creating opportunity:', error);
                alert('Failed to create opportunity: ' + error.message);
            }
        } else {
            // Simulate opportunity creation for demo/testing
            console.log('💼 Simulating opportunity creation (SDK not available)');
            const message = `Opportunity would be created!\n\nValue: ${calc.total}\nProduct: ${calc.product.name}\nStatus: Quote Sent`;
            alert(message);
        }
    },

    // Format quote data for CRM activity
    formatQuoteActivity: function(calc) {
        const timestamp = new Date().toLocaleString();
        const userEmail = appState.currentUser?.email || 'Unknown User';
        
        return `KANVA QUOTE GENERATED

Product: ${calc.product.name}
Quantity: ${calc.masterCases} Master Cases (${calc.displayBoxes} Display Boxes)
Individual Units: ${Calculator.formatNumber(calc.totalUnits)}

Pricing:
• Unit Price: ${calc.unitPrice} (${calc.tierInfo.name})
• Case Price: ${calc.casePrice}
• Subtotal: ${calc.subtotal}
• Shipping: ${calc.freeShipping ? 'FREE' : calc.shipping}
• Total: ${calc.total}

Generated by: ${userEmail}
Generated on: ${timestamp}
Calculator Version: ${adminConfig.metadata.version}`;
    },

    // Format opportunity data for Copper
    formatOpportunityData: function(calc) {
        const opportunityName = `${calc.product.name} - ${calc.masterCases} MC Quote`;
        const monetaryValue = Math.round(calc.raw.total * 100); // Convert to cents
        
        return {
            name: opportunityName,
            monetary_value: monetaryValue,
            details: `Quote: ${calc.masterCases} Master Cases of ${calc.product.name}\nTotal Value: ${calc.total}\nTier: ${calc.tierInfo.name}`,
            status: 'Open',
            close_date: this.getCloseDate(),
            priority: 'Normal',
            // Add custom fields if needed
            custom_fields: [
                {
                    custom_field_definition_id: 'quote_tool_generated',
                    value: true
                }
            ]
        };
    },

    // Get suggested close date (30 days from now)
    getCloseDate: function() {
        const closeDate = new Date();
        closeDate.setDate(closeDate.getDate() + 30);
        return Math.floor(closeDate.getTime() / 1000); // Unix timestamp
    },

    // Refresh Copper UI to show new data
    refreshCopperUI: function() {
        if (appState.sdk && appState.sdk.refreshUI) {
            try {
                // Refresh activity log
                appState.sdk.refreshUI({ name: 'ActivityLog' });
                
                // Refresh related items if in a contact/company context
                if (appState.copperContext?.type) {
                    appState.sdk.refreshUI({ 
                        name: 'Related', 
                        data: { type: appState.copperContext.type } 
                    });
                }
                
                console.log('🔄 Copper UI refreshed');
            } catch (error) {
                console.error('⚠️  Could not refresh Copper UI:', error);
            }
        }
    },

    // Navigate to entity in Copper
    navigateToEntity: function(entityType, entityId) {
        if (appState.sdk && appState.sdk.navigateTo) {
            try {
                appState.sdk.navigateTo(entityType, entityId);
                console.log(`🧭 Navigated to ${entityType} ${entityId}`);
            } catch (error) {
                console.error('❌ Error navigating to entity:', error);
            }
        }
    },

    // Get current context data
    getContextData: function() {
        return {
            user: appState.currentUser,
            context: appState.copperContext,
            isAdmin: appState.isAdmin,
            location: appState.appLocation
        };
    },

    // Check if CRM features are available
    isCrmAvailable: function() {
        return appState.sdk !== null;
    },

    // Show success message (with fallback)
    showSuccessMessage: function(message) {
        // Try to show in admin panel style if available
        if (typeof AdminPanel !== 'undefined' && AdminPanel.showSuccess) {
            AdminPanel.showSuccess(message);
        } else {
            // Fallback to alert
            alert(message);
        }
    },

    // Auto-populate customer information from Copper context
    populateCustomerInfo: function() {
        if (!appState.copperContext) return;

        try {
            const context = appState.copperContext.context;
            if (!context) return;

            // Auto-fill prospect name
            if (context.name && !document.getElementById('prospectName')?.value) {
                const nameInput = document.getElementById('prospectName');
                if (nameInput) nameInput.value = context.name;
            }

            // Auto-fill company name
            if (context.company_name && !document.getElementById('companyName')?.value) {
                const companyInput = document.getElementById('companyName');
                if (companyInput) companyInput.value = context.company_name;
            }

            // Auto-fill email if available
            if (context.email && !document.getElementById('prospectEmail')?.value) {
                const emailInput = document.getElementById('prospectEmail');
                if (emailInput) emailInput.value = context.email;
            }

            console.log('📝 Customer information auto-populated from Copper context');
        } catch (error) {
            console.error('⚠️  Error auto-populating customer info:', error);
        }
    },

    // Check environment and show appropriate UI
    checkEnvironment: function() {
        // Check URL parameters for mode detection
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('location') === 'modal') {
            appState.isModalMode = true;
            appState.appLocation = 'modal';
            document.body.className = 'modal-mode';
            console.log('📍 Modal mode detected from URL parameters');
        }

        // Set up fallback for non-Copper environments
        if (!this.isCrmAvailable()) {
            // Enable demo mode
            appState.isAdmin = true; // Allow admin access for testing
            appState.isLeftNav = true; // Default to left nav for better UX
            appState.appLocation = 'standalone';
            document.body.className = 'left-nav-mode';
            console.log('🔧 Running in standalone demo mode');
        }
    }
};

// Global functions for HTML onclick handlers
function openCopperModal() {
    CopperIntegration.openModal();
}

function saveQuoteToCRM() {
    CopperIntegration.saveQuoteToCRM();
}

function createOpportunity() {
    CopperIntegration.createOpportunity();
}

// Initialize on script load
console.log('✅ Copper integration module loaded successfully');
