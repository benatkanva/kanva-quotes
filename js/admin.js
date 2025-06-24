// Admin panel functionality for Kanva Botanicals Quote Calculator
// Handles all admin configuration, settings management, and UI interactions

const AdminPanel = {
    // Show the admin panel
    show: function() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.populateForm();
            appState.adminPanelOpen = true;
            console.log('🔧 Admin panel opened');
        }
    },

    // Hide the admin panel
    hide: function() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.style.display = 'none';
            document.body.style.overflow = 'auto';
            appState.adminPanelOpen = false;
            console.log('❌ Admin panel closed');
        }
    },

    // Populate form with current configuration
    populateForm: function() {
        try {
            console.log('📝 Populating admin form with current settings...');

            // Populate product settings
            Object.keys(adminConfig.products).forEach(key => {
                const product = adminConfig.products[key];
                this.setInputValue(`admin_${key}_price`, product.price);
                this.setInputValue(`admin_${key}_msrp`, product.msrp);
                this.setInputValue(`admin_${key}_units`, product.unitsPerCase);
            });

            // Populate tier settings
            this.setInputValue('admin_tier2_threshold', adminConfig.tiers.tier2.threshold);
            this.setInputValue('admin_tier2_discount', (adminConfig.tiers.tier2.discount * 100).toFixed(1));
            this.setInputValue('admin_tier3_threshold', adminConfig.tiers.tier3.threshold);
            this.setInputValue('admin_tier3_discount', (adminConfig.tiers.tier3.discount * 100).toFixed(1));

            // Populate shipping settings
            this.setInputValue('admin_shipping_rate', (adminConfig.shipping.rate * 100).toFixed(2));
            this.setInputValue('admin_free_shipping', adminConfig.shipping.freeThreshold);
            this.setInputValue('admin_ach_threshold', adminConfig.payment.achThreshold);

            console.log('✅ Admin form populated successfully');
        } catch (error) {
            console.error('❌ Error populating admin form:', error);
            this.showError('Failed to load current settings');
        }
    },

    // Helper function to set input value safely
    setInputValue: function(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    },

    // Helper function to get input value safely
    getInputValue: function(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : null;
    },

    // Save admin settings
    save: function() {
        try {
            console.log('💾 Saving admin settings...');
            this.showLoading(true);

            // Validate inputs first
            const validation = this.validateInputs();
            if (!validation.isValid) {
                this.showError('Please fix the following errors:\n' + validation.errors.join('\n'));
                this.showLoading(false);
                return;
            }

            // Update product settings
            Object.keys(adminConfig.products).forEach(key => {
                const price = parseFloat(this.getInputValue(`admin_${key}_price`));
                const msrp = parseFloat(this.getInputValue(`admin_${key}_msrp`));
                const units = parseInt(this.getInputValue(`admin_${key}_units`));

                adminConfig.products[key].price = price;
                adminConfig.products[key].msrp = msrp;
                adminConfig.products[key].unitsPerCase = units;
                
                // Update display boxes (12 for 144 units, 8 for 96 units)
                adminConfig.products[key].displayBoxesPerCase = units === 144 ? 12 : 8;
            });

            // Update tier settings
            adminConfig.tiers.tier2.threshold = parseInt(this.getInputValue('admin_tier2_threshold'));
            adminConfig.tiers.tier2.discount = parseFloat(this.getInputValue('admin_tier2_discount')) / 100;
            adminConfig.tiers.tier3.threshold = parseInt(this.getInputValue('admin_tier3_threshold'));
            adminConfig.tiers.tier3.discount = parseFloat(this.getInputValue('admin_tier3_discount')) / 100;

            // Update shipping settings
            adminConfig.shipping.rate = parseFloat(this.getInputValue('admin_shipping_rate')) / 100;
            adminConfig.shipping.freeThreshold = parseFloat(this.getInputValue('admin_free_shipping'));
            adminConfig.payment.achThreshold = parseFloat(this.getInputValue('admin_ach_threshold'));

            // Save to localStorage
            const saveSuccess = ConfigManager.save();
            
            if (saveSuccess) {
                this.showSuccess('Settings saved successfully!');
                
                // Update any displayed calculations
                this.refreshCalculations();
                
                // Hide panel after brief delay
                setTimeout(() => {
                    this.hide();
                }, 1500);
            } else {
                this.showError('Failed to save settings to storage');
            }

        } catch (error) {
            console.error('❌ Error saving admin settings:', error);
            this.showError('An error occurred while saving: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    },

    // Validate admin form inputs
    validateInputs: function() {
        const errors = [];

        // Validate product settings
        Object.keys(adminConfig.products).forEach(key => {
            const price = parseFloat(this.getInputValue(`admin_${key}_price`));
            const msrp = parseFloat(this.getInputValue(`admin_${key}_msrp`));
            const units = parseInt(this.getInputValue(`admin_${key}_units`));

            if (!price || price <= 0) {
                errors.push(`${adminConfig.products[key].name}: Invalid wholesale price`);
            }
            if (!msrp || msrp <= 0) {
                errors.push(`${adminConfig.products[key].name}: Invalid MSRP`);
            }
            if (price >= msrp) {
                errors.push(`${adminConfig.products[key].name}: Wholesale price must be less than MSRP`);
            }
            if (!units || units <= 0) {
                errors.push(`${adminConfig.products[key].name}: Invalid units per case`);
            }
        });

        // Validate tier settings
        const tier2Threshold = parseInt(this.getInputValue('admin_tier2_threshold'));
        const tier3Threshold = parseInt(this.getInputValue('admin_tier3_threshold'));
        const tier2Discount = parseFloat(this.getInputValue('admin_tier2_discount'));
        const tier3Discount = parseFloat(this.getInputValue('admin_tier3_discount'));

        if (!tier2Threshold || tier2Threshold <= 0) {
            errors.push('Tier 2 threshold must be greater than 0');
        }
        if (!tier3Threshold || tier3Threshold <= tier2Threshold) {
            errors.push('Tier 3 threshold must be greater than Tier 2 threshold');
        }
        if (tier2Discount < 0 || tier2Discount > 50) {
            errors.push('Tier 2 discount must be between 0% and 50%');
        }
        if (tier3Discount < 0 || tier3Discount > 50) {
            errors.push('Tier 3 discount must be between 0% and 50%');
        }
        if (tier3Discount <= tier2Discount) {
            errors.push('Tier 3 discount must be greater than Tier 2 discount');
        }

        // Validate shipping settings
        const shippingRate = parseFloat(this.getInputValue('admin_shipping_rate'));
        const freeThreshold = parseFloat(this.getInputValue('admin_free_shipping'));
        const achThreshold = parseFloat(this.getInputValue('admin_ach_threshold'));

        if (shippingRate < 0 || shippingRate > 10) {
            errors.push('Shipping rate must be between 0% and 10%');
        }
        if (freeThreshold < 0) {
            errors.push('Free shipping threshold cannot be negative');
        }
        if (achThreshold < 0) {
            errors.push('ACH threshold cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Reset settings to defaults
    reset: function() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                console.log('🔄 Resetting admin settings to defaults...');
                
                const resetSuccess = ConfigManager.reset();
                
                if (resetSuccess) {
                    this.showSuccess('Settings reset to defaults successfully!');
                    
                    // Reload the page to get fresh defaults
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    this.showError('Failed to reset settings');
                }
            } catch (error) {
                console.error('❌ Error resetting settings:', error);
                this.showError('An error occurred while resetting settings');
            }
        }
    },

    // Refresh all calculations with new settings
    refreshCalculations: function() {
        // Update main calculator if visible
        if (typeof Calculator !== 'undefined') {
            Calculator.updateResults();
            Calculator.updateSidebarResults();
        }
        
        // Update product dropdowns with new pricing
        this.updateProductDropdowns();
        
        console.log('🔄 Calculations refreshed with new settings');
    },

    // Update product dropdowns with current pricing
    updateProductDropdowns: function() {
        const productSelects = ['primaryProduct', 'sidebarProduct'];
        
        productSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                
                // Clear and repopulate options
                select.innerHTML = '';
                Object.entries(adminConfig.products).forEach(([key, product]) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${product.name} ($${product.price})`;
                    select.appendChild(option);
                });
                
                // Restore selected value
                if (currentValue) {
                    select.value = currentValue;
                }
            }
        });
    },

    // Show loading state
    showLoading: function(show) {
        const content = document.querySelector('.admin-content');
        if (content) {
            if (show) {
                content.classList.add('admin-loading');
            } else {
                content.classList.remove('admin-loading');
            }
        }
    },

    // Show success message
    showSuccess: function(message) {
        this.showMessage(message, 'success');
    },

    // Show error message
    showError: function(message) {
        this.showMessage(message, 'error');
    },

    // Show message with type
    showMessage: function(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.admin-success, .admin-error');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-${type}`;
        messageDiv.textContent = message;

        // Insert at top of admin content
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.insertBefore(messageDiv, adminContent.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        } else {
            // Fallback to alert
            alert(message);
        }
    },

    // Export current configuration
    exportConfig: function() {
        try {
            const config = {
                ...adminConfig,
                exportedAt: new Date().toISOString(),
                exportedBy: appState.currentUser?.email || 'Unknown'
            };
            
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `kanva-config-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showSuccess('Configuration exported successfully!');
        } catch (error) {
            console.error('❌ Error exporting configuration:', error);
            this.showError('Failed to export configuration');
        }
    },

    // Initialize admin panel
    initialize: function() {
        console.log('🔧 Initializing admin panel...');
        
        // Set up event listeners for admin panel (will be called from main.js)
        this.setupEventListeners();
        
        console.log('✅ Admin panel initialized');
    },

    // Setup event listeners (to be called after DOM is ready)
    setupEventListeners: function() {
        // Close panel on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && appState.adminPanelOpen) {
                this.hide();
            }
        });
    }
};

// Global functions for HTML onclick handlers
function showAdminPanel() {
    if (appState.isAdmin) {
        AdminPanel.show();
    } else {
        alert('Access denied. Admin privileges required.');
    }
}

function hideAdminPanel() {
    AdminPanel.hide();
}

function saveAdminSettings() {
    AdminPanel.save();
}

function resetAdminSettings() {
    AdminPanel.reset();
}

function exportAdminConfig() {
    AdminPanel.exportConfig();
}

console.log('✅ Admin panel module loaded successfully');
