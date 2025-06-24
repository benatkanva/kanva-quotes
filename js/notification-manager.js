// Notification Manager for Kanva Botanicals Quote Calculator
// Provides sandbox-safe notifications replacing alert() calls

const NotificationManager = {
    // Initialize notification system
    initialize: function() {
        console.log('🔔 Initializing notification manager...');
        
        // Create notification container if it doesn't exist
        this.createNotificationContainer();
        
        // Set up styles
        this.injectStyles();
        
        console.log('✅ Notification manager initialized');
    },

    // Create notification container
    createNotificationContainer: function() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    },

    // Inject notification styles
    injectStyles: function() {
        if (document.getElementById('notificationStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 12px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                border-left: 4px solid;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 400px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: all 0.3s ease;
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left-color: #4caf50;
                background: linear-gradient(135deg, #e8f5e8 0%, #d4f4d4 100%);
                color: #2e7d32;
            }
            
            .notification.error {
                border-left-color: #f44336;
                background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                color: #c62828;
            }
            
            .notification.warning {
                border-left-color: #ff9800;
                background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
                color: #f57c00;
            }
            
            .notification.info {
                border-left-color: #2196f3;
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                color: #1976d2;
            }
            
            .notification-icon {
                font-size: 18px;
                min-width: 18px;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .notification-message {
                opacity: 0.9;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 18px;
                opacity: 0.5;
                transition: opacity 0.2s ease;
                min-width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 0 0 8px 8px;
                transform-origin: left;
                animation: progressBar linear;
            }
            
            @keyframes progressBar {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .notification {
                    max-width: none;
                    margin-bottom: 8px;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .notification {
                    border-width: 3px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .notification {
                    transition: none;
                    animation: none;
                }
                
                .notification-progress {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },

    // Show notification
    show: function(message, type = 'info', title = null, duration = 5000) {
        const container = this.createNotificationContainer();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Get icon for type
        const icon = this.getIcon(type);
        
        // Create content
        const contentHTML = `
            <span class="notification-icon">${icon}</span>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
            ${duration > 0 ? `<div class="notification-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
        `;
        
        notification.innerHTML = contentHTML;
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 50);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        // Limit number of notifications
        this.limitNotifications(container);
        
        return notification;
    },

    // Remove notification with animation
    remove: function(notification) {
        if (notification && notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    },

    // Limit number of visible notifications
    limitNotifications: function(container, maxCount = 5) {
        const notifications = container.querySelectorAll('.notification');
        if (notifications.length > maxCount) {
            // Remove oldest notifications
            for (let i = 0; i < notifications.length - maxCount; i++) {
                this.remove(notifications[i]);
            }
        }
    },

    // Get icon for notification type
    getIcon: function(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    // Convenience methods
    showSuccess: function(message, title = null, duration = 4000) {
        return this.show(message, 'success', title, duration);
    },

    showError: function(message, title = null, duration = 6000) {
        return this.show(message, 'error', title, duration);
    },

    showWarning: function(message, title = null, duration = 5000) {
        return this.show(message, 'warning', title, duration);
    },

    showInfo: function(message, title = null, duration = 4000) {
        return this.show(message, 'info', title, duration);
    },

    // Show persistent notification (no auto-dismiss)
    showPersistent: function(message, type = 'info', title = null) {
        return this.show(message, type, title, 0);
    },

    // Clear all notifications
    clearAll: function() {
        const container = document.getElementById('notificationContainer');
        if (container) {
            const notifications = container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.remove(notification);
            });
        }
    },

    // Show confirmation dialog (replacement for confirm())
    showConfirm: function(message, title = 'Confirm', onConfirm = null, onCancel = null) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                text-align: center;
            `;
            
            dialog.innerHTML = `
                <h3 style="margin: 0 0 16px 0; color: #17351A;">${title}</h3>
                <p style="margin: 0 0 24px 0; color: #4D5358; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="confirmCancel" style="
                        background: #f5f5f5;
                        border: 1px solid #ddd;
                        color: #666;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Cancel</button>
                    <button id="confirmOk" style="
                        background: linear-gradient(135deg, #93D500 0%, #7ab300 100%);
                        border: none;
                        color: #17351A;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">Confirm</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            const handleResponse = (confirmed) => {
                overlay.remove();
                
                if (confirmed) {
                    if (onConfirm) onConfirm();
                    resolve(true);
                } else {
                    if (onCancel) onCancel();
                    resolve(false);
                }
            };
            
            dialog.querySelector('#confirmOk').onclick = () => handleResponse(true);
            dialog.querySelector('#confirmCancel').onclick = () => handleResponse(false);
            overlay.onclick = (e) => {
                if (e.target === overlay) handleResponse(false);
            };
            
            // Focus the confirm button
            setTimeout(() => {
                dialog.querySelector('#confirmOk').focus();
            }, 100);
        });
    },

    // Show input dialog (replacement for prompt())
    showPrompt: function(message, title = 'Input Required', defaultValue = '', onSubmit = null, onCancel = null) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            `;
            
            dialog.innerHTML = `
                <h3 style="margin: 0 0 16px 0; color: #17351A;">${title}</h3>
                <p style="margin: 0 0 16px 0; color: #4D5358; line-height: 1.5;">${message}</p>
                <input type="text" id="promptInput" value="${defaultValue}" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #93D500;
                    border-radius: 6px;
                    font-size: 14px;
                    margin-bottom: 20px;
                    box-sizing: border-box;
                ">
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="promptCancel" style="
                        background: #f5f5f5;
                        border: 1px solid #ddd;
                        color: #666;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Cancel</button>
                    <button id="promptOk" style="
                        background: linear-gradient(135deg, #93D500 0%, #7ab300 100%);
                        border: none;
                        color: #17351A;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">Submit</button>
                </div>
            `;
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            const input = dialog.querySelector('#promptInput');
            
            const handleResponse = (submitted) => {
                const value = submitted ? input.value : null;
                overlay.remove();
                
                if (submitted && onSubmit) {
                    onSubmit(value);
                } else if (!submitted && onCancel) {
                    onCancel();
                }
                
                resolve(value);
            };
            
            dialog.querySelector('#promptOk').onclick = () => handleResponse(true);
            dialog.querySelector('#promptCancel').onclick = () => handleResponse(false);
            input.onkeydown = (e) => {
                if (e.key === 'Enter') handleResponse(true);
                if (e.key === 'Escape') handleResponse(false);
            };
            overlay.onclick = (e) => {
                if (e.target === overlay) handleResponse(false);
            };
            
            // Focus the input
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);
        });
    },

    // Show loading notification
    showLoading: function(message = 'Loading...', title = null) {
        const notification = this.show(message, 'info', title, 0);
        notification.classList.add('loading');
        
        // Add loading animation
        const icon = notification.querySelector('.notification-icon');
        if (icon) {
            icon.innerHTML = '⏳';
            icon.style.animation = 'pulse 1.5s infinite';
        }
        
        return notification;
    },

    // Hide loading notification
    hideLoading: function(loadingNotification) {
        if (loadingNotification) {
            this.remove(loadingNotification);
        }
    },

    // Show progress notification
    showProgress: function(message, progress = 0, title = null) {
        const notification = this.show(message, 'info', title, 0);
        
        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: #93D500;
            border-radius: 0 0 8px 8px;
            width: ${progress}%;
            transition: width 0.3s ease;
        `;
        
        notification.style.position = 'relative';
        notification.appendChild(progressBar);
        
        // Return function to update progress
        return {
            notification,
            updateProgress: (newProgress, newMessage = null) => {
                progressBar.style.width = `${newProgress}%`;
                if (newMessage) {
                    const messageEl = notification.querySelector('.notification-message');
                    if (messageEl) messageEl.textContent = newMessage;
                }
                
                // Auto-remove when complete
                if (newProgress >= 100) {
                    setTimeout(() => {
                        this.remove(notification);
                    }, 1000);
                }
            }
        };
    }
};

// Global functions to replace alert, confirm, prompt
function showNotification(message, type = 'info') {
    NotificationManager.show(message, type);
}

function showAlert(message, title = 'Alert') {
    NotificationManager.showInfo(message, title);
}

function showConfirm(message, title = 'Confirm') {
    return NotificationManager.showConfirm(message, title);
}

function showPrompt(message, title = 'Input Required', defaultValue = '') {
    return NotificationManager.showPrompt(message, title, defaultValue);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NotificationManager.initialize();
    });
} else {
    NotificationManager.initialize();
}

console.log('✅ Notification manager module loaded successfully');
