// Configuration and constants
const CONFIG = {
    // Admin authentication (in production, this should be handled server-side)
    ADMIN_PASSWORD: 'PowerVerification2026!',
    
    // Data storage key for localStorage
    STORAGE_KEY: 'powerVerificationData',
    
    // Default chart colors
    CHART_COLORS: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#48bb78',
        warning: '#ed8936',
        danger: '#f56565',
        info: '#4299e1',
        light: '#a0aec0',
        dark: '#2d3748'
    },
    
    // Chart color palette for multiple data series
    COLOR_PALETTE: [
        '#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565',
        '#4299e1', '#9f7aea', '#38b2ac', '#f093fb', '#f5576c',
        '#4facfe', '#43e97b', '#fa709a', '#fee140', '#a8edea'
    ],
    
    // Animation settings
    ANIMATION_DURATION: 300,
    
    // Data validation patterns
    WEEK_PATTERN: /^\d{2}ww\d{2}$/,
    
    // Default table headers
    TABLE_HEADERS: {
        cdynTable: [
            'Test Name', 'Cdyn', 'PNC Adjusted Cdyn', 'PNC DMR IPC',
            'LNC IPC', 'PNC POR IPC', 'External Cdyn Target', 'LNC Cdyn'
        ],
        previousRollup: [
            'Partition Name', 'Sum of rlp_cdyn_pf', 'Sum of Diff',
            'Sum of prev_rlp_cdyn', '%diff'
        ],
        oldPdkRollup: [
            'Partition Name', 'Sum of rlp_cdyn_pf', 'Sum of Diff',
            'Sum of prev_rlp_cdyn', '%Diff_Cdyn'
        ]
    }
};

// Utility functions
const Utils = {
    // Format numbers with appropriate decimal places
    formatNumber: (num, decimals = 2) => {
        if (typeof num !== 'number') return num;
        return num.toFixed(decimals);
    },
    
    // Format percentage values
    formatPercentage: (num) => {
        if (typeof num === 'string' && num.includes('%')) return num;
        if (typeof num !== 'number') return num;
        return num.toFixed(2) + '%';
    },
    
    // Parse week string to date
    weekToDate: (weekStr) => {
        const match = weekStr.match(/^(\d{2})ww(\d{2})$/);
        if (!match) return null;
        const year = 2000 + parseInt(match[1]);
        const week = parseInt(match[2]);
        // Approximate date calculation (week 1 = first week of January)
        const date = new Date(year, 0, 1 + (week - 1) * 7);
        return date;
    },
    
    // Sort weeks chronologically
    sortWeeks: (weeks) => {
        return weeks.sort((a, b) => {
            const dateA = Utils.weekToDate(a);
            const dateB = Utils.weekToDate(b);
            if (!dateA || !dateB) return 0;
            return dateA - dateB;
        });
    },
    
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Show loading overlay
    showLoading: () => {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },
    
    // Hide loading overlay
    hideLoading: () => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },
    
    // Show notification (basic implementation)
    showNotification: (message, type = 'info') => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Utils };
}