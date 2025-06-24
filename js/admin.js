// Kanva Botanicals Quote Calculator - Admin Panel
// Version 2.0 - Fixed admin panel access and functionality

const AdminPanel = {
    isLoggedIn: false,
    
    // Toggle admin panel visibility
    toggle: function() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            
            // Focus password field if opening
            if (!isVisible && !this.isLoggedIn) {
                setTimeout(() => {
                    document.getElementById('adminPassword')?.focus();
                }, 100);
            }
        }
    },
    
    // Login to admin panel
    login: function() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput?.value;
        
        if (password === adminConfig.adminPassword) {
            this.isLoggedIn = true;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminControls').style.display = 'block';
            
            // Update user display
            const userDisplay = document.getElementById('userDisplay');
            if (userDisplay) {
                const currentUser = appState?.currentUser?.email || 'Admin';
                userDisplay.textContent = `User: ${currentUser} | Admin: YES`;
            }
            
            // Clear password field
            passwordInput.value = '';
            
            // Show notification
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showSuccess('Admin access granted');
            }
        } else {
            // Wrong password
            passwordInput.classList.add('error');
            setTimeout(() => passwordInput.classList.remove('error'), 500);
            
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.showError('Invalid password');
            }
        }
    },
    
    // Show product editor
    showProductEditor: function() {
        const content = document.getElementById('editorContent');
        if (!content) return;
        
        let html = '<div class="product-editor">';
        html += '<h4>Product Configuration</h4>';
        html += '<div class="product-list">';
        
        // Group products by category
        const shots = Object.entries(products).filter(([key, p]) => p.category === 'shots');
        const powders = Object.entries(products).filter(([key, p]) => p.category === 'powders');
        
        // Shots section
        html += '<div class="product-category"><h5>Ready-to-Drink Shots</h5>';
        shots.forEach(([key, product]) => {
            html += this.createProductEditRow(key, product);
        });
        html += '</div>';
        
        // Powders section
        html += '<div class="product-category"><h5>Kratom Powders</h5>';
        powders.forEach(([key, product]) => {
            html += this.createProductEditRow(key, product);
        });
        html += '</div>';
        
        html += '</div>';
        html += '<button onclick="AdminPanel.saveProducts()" class="save-btn">Save All Changes</button>';
        html += '</div>';
        
        content.innerHTML = html;
    },
    
    // Create product edit row
    createProductEditRow: function(key, product) {
        return `
            <div class="product-edit-row" data-product-key="${key}">
                <div class="product-header">
                    <strong>${product.name}</strong>
                    <span class="product-meta">${product.unitsPerCase} units/case</span>
                </div>
                <div class="product-fields">
                    <div class="field-group">
                        <label>Wholesale Price:</label>
                        <input type="number" step="0.01" value="${product.wholesalePrice}" 
                               data-field="wholesalePrice" onchange="AdminPanel.updateProduct('${key}', this)">
                    </div>
                    <div class="field-group">
                        <label>MSRP:</label>
                        <input type="number" step="0.01" value="${product.msrp}" 
                               data-field="msrp" onchange="AdminPanel.updateProduct('${key}', this)">
                    </div>
                    <div class="field-group">
                        <label>Margin:</label>
                        <span class="margin-display">${product.margin}%</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Update product in real-time
    updateProduct: function(key, input) {
        const field = input.dataset.field;
        const value = parseFloat(input.value);
        
        if (products[key] && !isNaN(value)) {
            products[key][field] = value;
            
            // Recalculate margin if price changed
            if (field === 'wholesalePrice' || field === 'msrp') {
                const margin = ((products[key].msrp - products[key].wholesalePrice) / products[key].msrp * 100).toFixed(2);
                products[key].margin = parseFloat(margin);
                
                // Update margin display
                const marginDisplay = input.closest('.product-edit-row').querySelector('.margin-display');
                if (marginDisplay) {
                    marginDisplay.textContent = margin + '%';
                }
            }
        }
    },
    
    // Save all product changes
    saveProducts: function() {
        // In a real app, this would save to a backend
        console.log('Saving product configuration:', products);
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Product configuration saved successfully');
        }
        
        // Refresh the calculator if needed
        if (typeof calculateAndUpdate === 'function') {
            calculateAndUpdate();
        }
    },
    
    // Show shipping editor
    showShippingEditor: function() {
        const content = document.getElementById('editorContent');
        if (!content) return;
        
        let html = '<div class="shipping-editor">';
        html += '<h4>Shipping Zone Configuration</h4>';
        html += '<div class="zone-list">';
        
        Object.entries(shippingZones).forEach(([key, zone]) => {
            html += `
                <div class="zone-edit-row" data-zone-key="${key}">
                    <div class="zone-header">
                        <strong>${key.replace('zone', 'Zone ').toUpperCase()}</strong>
                        <span class="zone-percentage">${zone.percentage}% of subtotal</span>
                    </div>
                    <div class="zone-fields">
                        <div class="field-group">
                            <label>Percentage:</label>
                            <input type="number" step="0.5" value="${zone.percentage}" 
                                   data-field="percentage" onchange="AdminPanel.updateZone('${key}', this)">
                        </div>
                        <div class="field-group states-list">
                            <label>States:</label>
                            <span>${zone.states.join(', ')}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        html += `
            <div class="shipping-threshold">
                <label>Free Shipping Threshold:</label>
                <input type="number" id="freeShippingThreshold" value="${shippingConfig.freeShippingThreshold}">
            </div>
        `;
        html += '<button onclick="AdminPanel.saveShipping()" class="save-btn">Save Shipping Configuration</button>';
        html += '</div>';
        
        content.innerHTML = html;
    },
    
    // Update shipping zone
    updateZone: function(key, input) {
        const value = parseFloat(input.value);
        
        if (shippingZones[key] && !isNaN(value)) {
            shippingZones[key].percentage = value;
            
            // Update display
            const percentDisplay = input.closest('.zone-edit-row').querySelector('.zone-percentage');
            if (percentDisplay) {
                percentDisplay.textContent = value + '% of subtotal';
            }
        }
    },
    
    // Save shipping configuration
    saveShipping: function() {
        const thresholdInput = document.getElementById('freeShippingThreshold');
        if (thresholdInput) {
            shippingConfig.freeShippingThreshold = parseFloat(thresholdInput.value) || 2500;
        }
        
        console.log('Saving shipping configuration:', shippingZones, shippingConfig);
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Shipping configuration saved successfully');
        }
        
        // Refresh calculation
        if (typeof calculateAndUpdate === 'function') {
            calculateAndUpdate();
        }
    },
    
    // Show tax editor
    showTaxEditor: function() {
        const content = document.getElementById('editorContent');
        if (!content) return;
        
        let html = '<div class="tax-editor">';
        html += '<h4>Tax Configuration</h4>';
        html += `
            <div class="default-tax">
                <label>Default Tax Rate:</label>
                <input type="number" step="0.1" id="defaultTaxRate" value="${taxConfig.defaultRate}">%
            </div>
        `;
        
        html += '<div class="custom-rates">';
        html += '<h5>Custom State Rates</h5>';
        
        Object.entries(taxConfig.customRates).forEach(([state, rate]) => {
            html += `
                <div class="tax-rate-row">
                    <span class="state-code">${state}</span>
                    <input type="number" step="0.1" value="${rate}" 
                           data-state="${state}" onchange="AdminPanel.updateTaxRate(this)">%
                </div>
            `;
        });
        
        html += '</div>';
        html += '<button onclick="AdminPanel.saveTax()" class="save-btn">Save Tax Configuration</button>';
        html += '</div>';
        
        content.innerHTML = html;
    },
    
    // Update tax rate
    updateTaxRate: function(input) {
        const state = input.dataset.state;
        const rate = parseFloat(input.value);
        
        if (state && !isNaN(rate)) {
            taxConfig.customRates[state] = rate;
        }
    },
    
    // Save tax configuration
    saveTax: function() {
        const defaultInput = document.getElementById('defaultTaxRate');
        if (defaultInput) {
            taxConfig.defaultRate = parseFloat(defaultInput.value) || 8.5;
        }
        
        console.log('Saving tax configuration:', taxConfig);
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Tax configuration saved successfully');
        }
    },
    
    // Export configuration
    exportConfig: function() {
        const config = {
            adminConfig,
            products,
            pricingTiers,
            shippingZones,
            shippingConfig,
            taxConfig
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanva-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.showSuccess('Configuration exported successfully');
        }
    }
};

// Global functions for HTML onclick handlers
function toggleAdminPanel() {
    AdminPanel.toggle();
}

function loginAdmin() {
    AdminPanel.login();
}

function showProductEditor() {
    AdminPanel.showProductEditor();
}

function showShippingEditor() {
    AdminPanel.showShippingEditor();
}

function showTaxEditor() {
    AdminPanel.showTaxEditor();
}

function exportConfig() {
    AdminPanel.exportConfig();
}

// Initialize admin panel on load
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key support for password field
    const passwordField = document.getElementById('adminPassword');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginAdmin();
            }
        });
    }
});

console.log('✅ Admin panel module loaded');
