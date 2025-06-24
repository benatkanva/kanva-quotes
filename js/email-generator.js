// Email generation functionality for Kanva Botanicals Quote Calculator
// Handles creating professional quote emails and managing email templates

const EmailGenerator = {
    // Generate professional quote email
    generateEmail: function() {
        try {
            console.log('📧 Generating professional quote email...');
            
            // Get calculation data
            const calc = Calculator.calculateOrder();
            if (!calc.product) {
                this.showError('Please calculate a quote first before generating an email');
                return;
            }

            // Get customer information from form
            const customerInfo = this.getCustomerInfo();
            
            // Generate the email content
            const emailContent = this.buildEmailContent(calc, customerInfo);
            
            // Display the generated email
            this.displayGeneratedEmail(emailContent);
            
            // Auto-populate customer info from Copper if available
            if (typeof CopperIntegration !== 'undefined') {
                CopperIntegration.populateCustomerInfo();
            }
            
            console.log('✅ Email generated successfully');
            
        } catch (error) {
            console.error('❌ Error generating email:', error);
            this.showError('Failed to generate email: ' + error.message);
        }
    },

    // Get customer information from form inputs
    getCustomerInfo: function() {
        return {
            prospectName: this.getInputValue('prospectName') || '[PROSPECT NAME]',
            companyName: this.getInputValue('companyName') || '[COMPANY NAME]',
            customerBase: this.getInputValue('customerBase') || '[CUSTOMER BASE]',
            maxRetail: this.getInputValue('maxRetail') || '5.00',
            prospectEmail: this.getInputValue('prospectEmail') || '',
            // Additional fields that might be available
            phone: this.getInputValue('prospectPhone') || '',
            address: this.getInputValue('prospectAddress') || ''
        };
    },

    // Helper function to safely get input values
    getInputValue: function(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value.trim() : '';
    },

    // Build the complete email content
    buildEmailContent: function(calc, customerInfo) {
        const timestamp = new Date().toLocaleString();
        const userEmail = appState.currentUser?.email || '[YOUR EMAIL]';
        const userName = appState.currentUser?.name || '[YOUR NAME]';
        
        // Generate subject line
        const subject = this.generateSubject(calc, customerInfo);
        
        // Generate email body
        const body = this.generateEmailBody(calc, customerInfo, timestamp, userName, userEmail);
        
        return {
            subject: subject,
            body: body,
            calc: calc,
            customerInfo: customerInfo,
            timestamp: timestamp
        };
    },

    // Generate email subject line
    generateSubject: function(calc, customerInfo) {
        const companyPart = customerInfo.companyName !== '[COMPANY NAME]' ? 
            ` | ${customerInfo.companyName}` : '';
        
        return `Partnership Proposal - ${calc.masterCases} Master Cases${companyPart}`;
    },

    // Generate the main email body
    generateEmailBody: function(calc, customerInfo, timestamp, userName, userEmail) {
        const paymentSection = this.generatePaymentSection(calc);
        const tierNote = this.generateTierNote(calc);
        const nextStepsSection = this.generateNextStepsSection(calc);
        
        return `Hi ${customerInfo.prospectName},

Thank you for your interest in partnering with Kanva Botanicals! We're excited about the opportunity to work with you.

## Partnership Overview

We'd like to move forward with an initial ${calc.masterCases} Master Case order of ${calc.product.name}. Given your strong customer base in ${customerInfo.customerBase}, we believe this will be an excellent fit for both our businesses.

### Pricing Guidelines
To maintain market stability and ensure fair margins for all partners in your area, we ask that your retail price to customers not exceed **$${customerInfo.maxRetail}** per unit.

## Order Breakdown

**${calc.masterCases} Master Cases Contains:**
- ${calc.masterCases} Master Cases
- ${calc.displayBoxes} Display Boxes  
- ${Calculator.formatNumber(calc.totalUnits)} Individual Units

### ${calc.tierInfo.name} Wholesale Pricing:
- **Per Unit:** ${calc.unitPrice}
- **Per Master Case:** ${calc.casePrice}
- **Subtotal:** ${calc.subtotal}
- **Shipping & Handling:** ${calc.freeShipping ? 'FREE' : calc.shipping}
- **TOTAL:** ${calc.total}

${tierNote}

${paymentSection}

## Additional Product Opportunities

Our complete product line includes high-margin kratom capsules and powders (49-58% margins) that could be excellent additions for your experienced customers. Full catalog available upon request.

## Support Included
✅ **Retail Support** - In-store displays, POS materials, promotional strategies  
✅ **Sales Training** - Staff education and product knowledge support  
✅ **Marketing Assets** - Digital materials, window clings, branded displays  
✅ **Exclusive Offers** - Introductory pricing and promotional bundles  

${nextStepsSection}

We're excited about building a successful partnership with you and supporting your business growth in the functional beverage market.

Please let me know if you have any questions or need any clarification on these terms.

Best regards,

${userName}  
[YOUR TITLE]  
Kanva Botanicals  
[PHONE NUMBER]  
${userEmail}

---
Generated on ${timestamp} using Kanva Quote Calculator v${adminConfig.metadata.version}`;
    },

    // Generate payment section based on order total
    generatePaymentSection: function(calc) {
        const isLargeOrder = calc.raw.total >= adminConfig.payment.achThreshold;
        
        if (isLargeOrder) {
            return `## Payment Information

Since this order exceeds $${Calculator.formatNumber(adminConfig.payment.achThreshold)}, payment will need to be processed via **ACH transfer**. I'll send over a DocuSign agreement that includes the ACH transfer details. Please provide a voided blank check for account verification.`;
        } else {
            return `## Payment Information

Payment options: ACH transfer, wire transfer, or company check.`;
        }
    },

    // Generate tier upgrade note
    generateTierNote: function(calc) {
        if (calc.tierInfo.name === "Tier 3") {
            return '*You\'re already receiving our best volume pricing!*';
        }
        
        const nextThreshold = calc.tierInfo.name === "Tier 1" ? 
            adminConfig.tiers.tier2.threshold : 
            adminConfig.tiers.tier3.threshold;
            
        return `*Note: Future orders of ${nextThreshold}+ Master Cases will qualify for improved pricing.*`;
    },

    // Generate next steps section
    generateNextStepsSection: function(calc) {
        const isLargeOrder = calc.raw.total >= adminConfig.payment.achThreshold;
        
        return `## Next Steps

1. Review this proposal
2. ${isLargeOrder ? 'Complete DocuSign agreement and ACH setup' : 'Set up payment method'}
3. Schedule delivery once payment is processed`;
    },

    // Display the generated email in the UI
    displayGeneratedEmail: function(emailContent) {
        // Update the email output display
        const emailOutput = document.getElementById('emailOutput');
        if (emailOutput) {
            emailOutput.textContent = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
        }

        // Show the email template section
        const emailTemplate = document.getElementById('emailTemplate');
        if (emailTemplate) {
            emailTemplate.style.display = 'block';
            
            // Smooth scroll to the email template
            emailTemplate.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Update any additional displays (like modal or sidebar)
        this.updateAdditionalDisplays(emailContent);
    },

    // Update additional email displays (modal, sidebar, etc.)
    updateAdditionalDisplays: function(emailContent) {
        // Update modal email display if it exists
        const modalEmailOutput = document.getElementById('modalEmailOutput');
        if (modalEmailOutput) {
            modalEmailOutput.textContent = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
        }

        // Update sidebar email preview if it exists
        const sidebarEmailPreview = document.getElementById('sidebarEmailPreview');
        if (sidebarEmailPreview) {
            const preview = emailContent.body.substring(0, 200) + '...';
            sidebarEmailPreview.innerHTML = `
                <div class="email-preview">
                    <strong>Subject:</strong> ${emailContent.subject}<br>
                    <strong>Preview:</strong> ${preview}
                </div>
            `;
        }
    },

    // Copy email to clipboard
    copyEmailToClipboard: function() {
        try {
            const emailOutput = document.getElementById('emailOutput');
            if (!emailOutput || !emailOutput.textContent) {
                this.showError('No email content to copy');
                return;
            }

            // Use the Clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(emailOutput.textContent).then(() => {
                    this.showCopySuccess();
                }).catch(error => {
                    console.error('Clipboard API failed:', error);
                    this.fallbackCopyToClipboard(emailOutput.textContent);
                });
            } else {
                // Fallback for older browsers or non-secure contexts
                this.fallbackCopyToClipboard(emailOutput.textContent);
            }
        } catch (error) {
            console.error('❌ Error copying email:', error);
            this.showError('Failed to copy email to clipboard');
        }
    },

    // Fallback copy method for older browsers
    fallbackCopyToClipboard: function(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showCopySuccess();
            } else {
                this.showError('Failed to copy email to clipboard');
            }
        } catch (error) {
            console.error('Fallback copy failed:', error);
            this.showError('Copy to clipboard not supported in this browser');
        }
    },

    // Show copy success feedback
    showCopySuccess: function() {
        // Update copy button text temporarily
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            if (btn.textContent.includes('Copy')) {
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.style.background = '#4caf50';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        });

        // Show success message if admin panel is available
        if (typeof AdminPanel !== 'undefined' && AdminPanel.showSuccess) {
            AdminPanel.showSuccess('Email copied to clipboard!');
        }

        console.log('✅ Email copied to clipboard successfully');
    },

    // Generate email templates for different scenarios
    generateEmailTemplate: function(templateType = 'standard') {
        const calc = Calculator.calculateOrder();
        if (!calc.product) {
            this.showError('Please calculate a quote first');
            return;
        }

        const customerInfo = this.getCustomerInfo();
        
        switch (templateType) {
            case 'follow-up':
                return this.generateFollowUpTemplate(calc, customerInfo);
            case 'negotiation':
                return this.generateNegotiationTemplate(calc, customerInfo);
            case 'closing':
                return this.generateClosingTemplate(calc, customerInfo);
            default:
                return this.buildEmailContent(calc, customerInfo);
        }
    },

    // Generate follow-up email template
    generateFollowUpTemplate: function(calc, customerInfo) {
        const subject = `Follow-up: ${calc.product.name} Partnership - ${customerInfo.companyName}`;
        
        const body = `Hi ${customerInfo.prospectName},

I wanted to follow up on the partnership proposal we discussed for ${calc.masterCases} Master Cases of ${calc.product.name}.

Just to recap our offer:
- Product: ${calc.product.name}
- Quantity: ${calc.masterCases} Master Cases (${calc.displayBoxes} Display Boxes)
- Total Investment: ${calc.total}
- Pricing Tier: ${calc.tierInfo.name}

I'm here to answer any questions you might have about:
- Product specifications and benefits
- Pricing structure and volume discounts
- Marketing support and retail materials
- Implementation timeline

Would you like to schedule a brief call this week to discuss next steps?

Best regards,
[YOUR NAME]
Kanva Botanicals`;

        return { subject, body };
    },

    // Generate negotiation email template
    generateNegotiationTemplate: function(calc, customerInfo) {
        const subject = `Flexible Options: ${calc.product.name} Partnership - ${customerInfo.companyName}`;
        
        const body = `Hi ${customerInfo.prospectName},

Thank you for your continued interest in partnering with Kanva Botanicals. I understand you'd like to explore some options for the ${calc.product.name} order.

Current Proposal:
- ${calc.masterCases} Master Cases at ${calc.unitPrice} per unit
- Total: ${calc.total}

I'm open to discussing:
- Alternative quantities that might better fit your budget
- Flexible payment terms
- Starter packages with smaller initial orders
- Mixed product bundles

What would work best for your business? I'm confident we can find a solution that works for both of us.

Looking forward to hearing from you.

Best regards,
[YOUR NAME]
Kanva Botanicals`;

        return { subject, body };
    },

    // Generate closing email template
    generateClosingTemplate: function(calc, customerInfo) {
        const subject = `Ready to Move Forward: ${calc.product.name} Partnership - ${customerInfo.companyName}`;
        
        const body = `Hi ${customerInfo.prospectName},

I'm excited to finalize our partnership for ${calc.masterCases} Master Cases of ${calc.product.name}!

Final Details:
- Product: ${calc.product.name}
- Quantity: ${calc.masterCases} Master Cases
- Total Investment: ${calc.total}
- Expected Delivery: [DELIVERY DATE]

To complete the order, I'll need:
1. Signed agreement (I'll send via DocuSign)
2. Payment setup confirmation
3. Delivery address verification

Once we have these items, we can schedule your delivery within [TIMEFRAME].

Thank you for choosing Kanva Botanicals as your partner. I'm confident this will be a very successful relationship!

Best regards,
[YOUR NAME]
Kanva Botanicals`;

        return { subject, body };
    },

    // Validate email content before sending
    validateEmailContent: function(emailContent) {
        const errors = [];

        if (!emailContent.subject || emailContent.subject.trim() === '') {
            errors.push('Email subject is required');
        }

        if (!emailContent.body || emailContent.body.trim() === '') {
            errors.push('Email body is required');
        }

        // Check for placeholder values that should be replaced
        const placeholders = ['[PROSPECT NAME]', '[COMPANY NAME]', '[YOUR NAME]', '[PHONE NUMBER]'];
        placeholders.forEach(placeholder => {
            if (emailContent.body.includes(placeholder)) {
                errors.push(`Please replace placeholder: ${placeholder}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Export email content for external use
    exportEmail: function(format = 'text') {
        try {
            const emailOutput = document.getElementById('emailOutput');
            if (!emailOutput || !emailOutput.textContent) {
                this.showError('No email content to export');
                return;
            }

            const content = emailOutput.textContent;
            const timestamp = new Date().toISOString().split('T')[0];
            
            switch (format) {
                case 'text':
                    this.downloadAsText(content, `kanva-quote-${timestamp}.txt`);
                    break;
                case 'html':
                    this.downloadAsHtml(content, `kanva-quote-${timestamp}.html`);
                    break;
                default:
                    this.downloadAsText(content, `kanva-quote-${timestamp}.txt`);
            }
            
            console.log(`✅ Email exported as ${format}`);
        } catch (error) {
            console.error('❌ Error exporting email:', error);
            this.showError('Failed to export email');
        }
    },

    // Download content as text file
    downloadAsText: function(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },

    // Download content as HTML file
    downloadAsHtml: function(content, filename) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Kanva Botanicals Quote</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <pre>${content}</pre>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },

    // Send email via CRM if integrated
    sendViaCRM: function() {
        try {
            if (typeof CopperIntegration !== 'undefined' && CopperIntegration.isCrmAvailable()) {
                const emailContent = document.getElementById('emailOutput')?.textContent;
                if (!emailContent) {
                    this.showError('No email content to send');
                    return;
                }

                // Save email as activity in CRM
                CopperIntegration.saveQuoteToCRM();
                
                // Log the email generation activity
                console.log('📧 Email sent via CRM integration');
                
                if (typeof AdminPanel !== 'undefined' && AdminPanel.showSuccess) {
                    AdminPanel.showSuccess('Email logged in CRM. Please send manually via your email client.');
                }
            } else {
                this.showError('CRM integration not available. Please copy and send manually.');
            }
        } catch (error) {
            console.error('❌ Error sending via CRM:', error);
            this.showError('Failed to send via CRM: ' + error.message);
        }
    },

    // Show error message
    showError: function(message) {
        console.error('EmailGenerator Error:', message);
        
        // Try to use admin panel messaging if available
        if (typeof AdminPanel !== 'undefined' && AdminPanel.showError) {
            AdminPanel.showError(message);
        } else {
            // Fallback to alert
            alert('Error: ' + message);
        }
    },

    // Initialize email generator
    initialize: function() {
        console.log('📧 Initializing email generator...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Email generator initialized');
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Auto-populate max retail when product changes
        const productSelects = ['primaryProduct', 'sidebarProduct'];
        productSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateMaxRetailPrice();
                });
            }
        });
    },

    // Update max retail price based on selected product
    updateMaxRetailPrice: function() {
        const productKey = this.getInputValue('primaryProduct') || this.getInputValue('sidebarProduct');
        const maxRetailInput = document.getElementById('maxRetail');
        
        if (productKey && maxRetailInput && adminConfig.maxRetailPrices) {
            const maxPrice = adminConfig.maxRetailPrices[productKey] || adminConfig.maxRetailPrices.default;
            maxRetailInput.value = maxPrice.toFixed(2);
        }
    }
};

// Global functions for HTML onclick handlers
function generateEmail() {
    EmailGenerator.generateEmail();
}

function copyEmail() {
    EmailGenerator.copyEmailToClipboard();
}

function exportEmail(format = 'text') {
    EmailGenerator.exportEmail(format);
}

function sendEmailViaCRM() {
    EmailGenerator.sendViaCRM();
}

function generateFollowUpEmail() {
    const template = EmailGenerator.generateEmailTemplate('follow-up');
    EmailGenerator.displayGeneratedEmail(template);
}

function generateNegotiationEmail() {
    const template = EmailGenerator.generateEmailTemplate('negotiation');
    EmailGenerator.displayGeneratedEmail(template);
}

function generateClosingEmail() {
    const template = EmailGenerator.generateEmailTemplate('closing');
    EmailGenerator.displayGeneratedEmail(template);
}

console.log('✅ Email generator module loaded successfully');
