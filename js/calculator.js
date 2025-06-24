// Kanva Botanicals Quote Calculator - Core Calculation Engine
// Version 2.0 - Enhanced with zone-based shipping and all products

const Calculator = {
    // Calculate order with enhanced shipping logic
    calculateOrder: function() {
        try {
            const productKey = document.getElementById('primaryProduct')?.value || 
                            document.getElementById('quickProduct')?.value;
            const displayBoxesInput = document.getElementById('displayBoxes')?.value || 
                                    document.getElementById('quickDisplayBoxes')?.value || "0";
            const masterCasesInput = document.getElementById('masterCases')?.value || 
                                   document.getElementById('quickMasterCases')?.value || "0";
            const customerState = document.getElementById('customerState')?.value || "ID";
            
            // Parse inputs
            const displayBoxes = parseInt(displayBoxesInput) || 0;
            const masterCases = parseInt(masterCasesInput) || 0;
            
            if (!productKey || (!displayBoxes && !masterCases)) {
                console.log('Missing required inputs for calculation');
                return null;
            }
            
            const product = products[productKey];
            if (!product) {
                console.error('Product not found:', productKey);
                return null;
            }
            
            // Calculate total display boxes
            const totalDisplayBoxes = displayBoxes + (masterCases * product.displayBoxesPerCase);
            const totalMasterCases = masterCases + Math.floor(displayBoxes / product.displayBoxesPerCase);
            
            // Calculate units
            const totalUnits = totalDisplayBoxes * product.unitsPerDisplayBox;
            
            // Calculate pricing
            const unitPrice = product.wholesalePrice;
            const subtotal = totalUnits * unitPrice;
            
            // Apply volume discounts
            const tierInfo = this.getApplicableTier(totalMasterCases);
            const discountAmount = subtotal * (tierInfo.discount / 100);
            const discountedSubtotal = subtotal - discountAmount;
            
            // Calculate shipping based on zone
            const shippingInfo = this.calculateShipping(discountedSubtotal, customerState);
            
            // Calculate total
            const total = discountedSubtotal + shippingInfo.cost;
            
            // Format for display
            return {
                product: product,
                displayBoxes: totalDisplayBoxes,
                masterCases: totalMasterCases,
                totalUnits: totalUnits,
                unitPrice: `$${unitPrice.toFixed(2)}`,
                casePrice: `$${(product.wholesalePrice * product.unitsPerCase).toFixed(2)}`,
                subtotal: `$${subtotal.toFixed(2)}`,
                tierInfo: tierInfo,
                discountAmount: discountAmount > 0 ? `$${discountAmount.toFixed(2)}` : null,
                discountedSubtotal: `$${discountedSubtotal.toFixed(2)}`,
                shipping: shippingInfo.cost > 0 ? `$${shippingInfo.cost.toFixed(2)}` : 'FREE',
                shippingZone: shippingInfo.zone,
                freeShipping: shippingInfo.freeShipping,
                total: `$${total.toFixed(2)}`,
                
                // Raw values for further calculations
                raw: {
                    subtotal: subtotal,
                    discountedSubtotal: discountedSubtotal,
                    shipping: shippingInfo.cost,
                    total: total
                }
            };
            
        } catch (error) {
            console.error('Error in calculateOrder:', error);
            return null;
        }
    },
    
    // Get applicable pricing tier based on master cases
    getApplicableTier: function(masterCases) {
        let applicableTier = pricingTiers.tier1;
        
        for (const tier of Object.values(pricingTiers)) {
            if (masterCases >= tier.threshold) {
                applicableTier = tier;
            }
        }
        
        return applicableTier;
    },
    
    // Calculate shipping based on zone and subtotal
    calculateShipping: function(subtotal, state) {
        // Check for free shipping threshold
        if (subtotal >= shippingConfig.freeShippingThreshold) {
            return {
                cost: 0,
                zone: null,
                freeShipping: true,
                message: `Free shipping on orders over $${shippingConfig.freeShippingThreshold}`
            };
        }
        
        // Find zone for state
        let zone = null;
        let zoneKey = null;
        
        for (const [key, zoneData] of Object.entries(shippingZones)) {
            if (zoneData.states.includes(state)) {
                zone = zoneData;
                zoneKey = key;
                break;
            }
        }
        
        // Default to zone 3 if state not found
        if (!zone) {
            zone = shippingZones.zone3;
            zoneKey = 'zone3';
        }
        
        // Calculate shipping cost as percentage of subtotal
        const shippingCost = subtotal * (zone.percentage / 100);
        
        return {
            cost: shippingCost,
            zone: zoneKey.replace('zone', 'Zone '),
            percentage: zone.percentage,
            freeShipping: false,
            message: `Shipping to ${state} (${zoneKey.replace('zone', 'Zone ')}): ${zone.percentage}% of subtotal`
        };
    },
    
    // Calculate multiple products (for multi-product mode)
    calculateMultipleProducts: function(items) {
        if (!items || items.length === 0) return null;
        
        const results = [];
        let totalSubtotal = 0;
        let totalMasterCases = 0;
        
        // Calculate each product
        for (const item of items) {
            const product = products[item.productKey];
            if (!product) continue;
            
            const displayBoxes = parseInt(item.displayBoxes) || 0;
            const masterCases = parseInt(item.masterCases) || 0;
            
            const totalDisplayBoxes = displayBoxes + (masterCases * product.displayBoxesPerCase);
            const totalUnits = totalDisplayBoxes * product.unitsPerDisplayBox;
            const subtotal = totalUnits * product.wholesalePrice;
            
            totalSubtotal += subtotal;
            totalMasterCases += masterCases + Math.floor(displayBoxes / product.displayBoxesPerCase);
            
            results.push({
                product: product,
                displayBoxes: totalDisplayBoxes,
                masterCases: masterCases + Math.floor(displayBoxes / product.displayBoxesPerCase),
                totalUnits: totalUnits,
                subtotal: `$${subtotal.toFixed(2)}`,
                raw: { subtotal: subtotal }
            });
        }
        
        // Apply volume discount to total
        const tierInfo = this.getApplicableTier(totalMasterCases);
        const discountAmount = totalSubtotal * (tierInfo.discount / 100);
        const discountedSubtotal = totalSubtotal - discountAmount;
        
        // Calculate shipping
        const customerState = document.getElementById('customerState')?.value || "ID";
        const shippingInfo = this.calculateShipping(discountedSubtotal, customerState);
        
        // Calculate final total
        const total = discountedSubtotal + shippingInfo.cost;
        
        return {
            items: results,
            summary: {
                subtotal: `$${totalSubtotal.toFixed(2)}`,
                tierInfo: tierInfo,
                discountAmount: discountAmount > 0 ? `$${discountAmount.toFixed(2)}` : null,
                discountedSubtotal: `$${discountedSubtotal.toFixed(2)}`,
                shipping: shippingInfo.cost > 0 ? `$${shippingInfo.cost.toFixed(2)}` : 'FREE',
                shippingZone: shippingInfo.zone,
                total: `$${total.toFixed(2)}`,
                raw: {
                    subtotal: totalSubtotal,
                    discountedSubtotal: discountedSubtotal,
                    shipping: shippingInfo.cost,
                    total: total
                }
            }
        };
    },
    
    // Format currency consistently
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    // Calculate profit margin
    calculateMargin: function(wholesale, msrp) {
        return ((msrp - wholesale) / msrp * 100).toFixed(2);
    },
    
    // Get product by category
    getProductsByCategory: function(category) {
        return Object.entries(products)
            .filter(([key, product]) => product.category === category)
            .map(([key, product]) => ({ key, ...product }));
    },
    
    // Validate order minimum
    validateOrderMinimum: function(total) {
        const minimum = 500; // $500 minimum order
        return {
            valid: total >= minimum,
            minimum: minimum,
            difference: minimum - total
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
