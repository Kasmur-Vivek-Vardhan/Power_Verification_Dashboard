// Main Application - Coordinates all components and initializes the dashboard
class PowerVerificationApp {
    constructor() {
        this.isInitialized = false;
        this.initialize();
    }

    // Initialize the application
    async initialize() {
        try {
            // Show loading
            Utils.showLoading();
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Wait for dataManager to initialize (load shared + local data)
            console.log('Waiting for data manager to initialize...');
            await dataManager.waitForInit();
            console.log('Data manager ready');

            // Initialize sample data if no data exists (after shared data is loaded)
            await this.initializeSampleData();

            // Initialize all managers
            this.initializeManagers();

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Initialize UI
            this.initializeUI();

            // Hide loading
            Utils.hideLoading();

            this.isInitialized = true;
            console.log('Power Verification Dashboard initialized successfully');
            
        } catch (error) {
            Utils.hideLoading();
            Utils.showNotification('Failed to initialize application', 'error');
            console.error('Initialization error:', error);
        }
    }

    // Initialize sample data if no data exists
    async initializeSampleData() {
        const existingData = dataManager.getSummaryStats();
        
        if (existingData.totalWeeks === 0) {
            try {
                // Load sample data from the sample file
                const response = await fetch('./data/sampleData.json');
                if (response.ok) {
                    const sampleData = await response.json();
                    const success = dataManager.importData(JSON.stringify(sampleData));
                    
                    if (success) {
                        console.log('Sample data loaded successfully');
                        Utils.showNotification('Sample data loaded for demonstration', 'info');
                    }
                }
            } catch (error) {
                // Failed to load sample data, but continue anyway
                console.warn('Could not load sample data:', error);
                
                // Create minimal empty structure
                dataManager.data = {
                    weeks: {},
                    lastUpdated: new Date().toISOString(),
                    metadata: {
                        totalWeeks: 0,
                        latestWeek: null
                    }
                };
                dataManager.saveData();
            }
        }
    }

    // Initialize all managers
    initializeManagers() {
        // Managers are already initialized as global instances
        // Just call their initialize methods if they exist
        
        if (typeof tableManager !== 'undefined' && tableManager.initialize) {
            tableManager.initialize();
        }

        if (typeof chartManager !== 'undefined' && chartManager.initialize) {
            chartManager.initialize();
        }

        if (typeof adminManager !== 'undefined' && adminManager.initialize) {
            adminManager.initialize();
        }
    }

    // Set up global event listeners
    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Alt + A for admin mode
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('adminModeBtn').click();
            }
            
            // Escape to close admin mode
            if (e.key === 'Escape' && !document.getElementById('adminPanel').classList.contains('hidden')) {
                document.getElementById('viewModeBtn').click();
            }
        });

        // Handle window resize for charts
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 300);
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });

        // Handle before unload (warn about unsaved changes)
        window.addEventListener('beforeunload', (e) => {
            if (adminManager && adminManager.previewData && !adminManager.isDataSaved) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // Initialize UI components
    initializeUI() {
        // Initialize tables
        if (tableManager) {
            tableManager.initialize();
        }

        // Show welcome message for first-time users
        this.showWelcomeMessage();

        // Update footer information
        this.updateFooterInfo();

        // Set initial mode to view mode
        adminManager.switchToViewMode();
    }

    // Show welcome message for new users
    showWelcomeMessage() {
        const stats = dataManager.getSummaryStats();
        
        if (stats.totalWeeks === 0) {
            const welcomeMessage = `
                Welcome to the Power Verification Dashboard!
                
                This dashboard allows you to:
                • View weekly power verification reports
                • Visualize trends across multiple weeks
                • Compare data between different weeks
                • Update data through the admin interface
                
                To get started:
                1. Switch to Admin Mode
                2. Authenticate with your password
                3. Upload your first week's data
                
                Admin password: PowerVerification2026!
            `;
            
            setTimeout(() => {
                alert(welcomeMessage);
            }, 1000);
        } else {
            Utils.showNotification(`Dashboard loaded with ${stats.totalWeeks} week(s) of data`, 'info');
        }
    }

    // Update footer information
    updateFooterInfo() {
        const stats = dataManager.getSummaryStats();
        const lastUpdatedElement = document.getElementById('lastUpdated');
        
        if (lastUpdatedElement && stats.lastUpdated) {
            const date = new Date(stats.lastUpdated);
            lastUpdatedElement.textContent = date.toLocaleString();
        }
    }

    // Handle window resize
    handleWindowResize() {
        // Resize charts if they exist
        if (typeof Chart !== 'undefined') {
            Chart.instances.forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }

        // Update table responsive behavior
        this.updateTableResponsiveness();
    }

    // Handle page becoming visible
    handlePageVisible() {
        // Refresh data if needed (for future server integration)
        const stats = dataManager.getSummaryStats();
        this.updateFooterInfo();
        
        // Check for data updates (placeholder for future server sync)
        // this.checkForDataUpdates();
    }

    // Update table responsiveness
    updateTableResponsiveness() {
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            const wrapper = table.closest('.table-wrapper');
            if (wrapper) {
                if (window.innerWidth < 768) {
                    wrapper.style.overflowX = 'auto';
                } else {
                    wrapper.style.overflowX = 'visible';
                }
            }
        });
    }

    // Add utility methods for future enhancements
    
    // Method to check for data updates (for server integration)
    async checkForDataUpdates() {
        // Placeholder for future server integration
        // This would check if there are new updates on the server
        return false;
    }

    // Method to sync data with server (for future server integration)
    async syncWithServer() {
        // Placeholder for future server integration
        return true;
    }

    // Method to backup data to server (for future server integration)
    async backupData() {
        // Placeholder for future server integration
        return true;
    }

    // Get application status
    getStatus() {
        const stats = dataManager.getSummaryStats();
        
        return {
            initialized: this.isInitialized,
            totalWeeks: stats.totalWeeks,
            latestWeek: stats.latestWeek,
            lastUpdated: stats.lastUpdated,
            adminAuthenticated: adminManager ? adminManager.isAuthenticated : false
        };
    }

    // Export application data
    exportAllData() {
        if (adminManager) {
            return adminManager.exportData();
        }
        throw new Error('Admin manager not available');
    }

    // Import application data
    importAllData(jsonData) {
        if (adminManager) {
            return adminManager.importData(jsonData);
        }
        throw new Error('Admin manager not available');
    }

    // Clear all application data
    clearAllData() {
        if (adminManager && adminManager.isAuthenticated) {
            const confirmed = confirm('Are you sure you want to clear ALL data? This cannot be undone!');
            if (confirmed) {
                const success = dataManager.clearAllData();
                if (success) {
                    tableManager.updateWeekSelection();
                    Utils.showNotification('All data cleared successfully', 'success');
                    return true;
                }
            }
        } else {
            Utils.showNotification('Admin authentication required', 'error');
        }
        return false;
    }

    // Restart application
    restart() {
        // Clear chart instances
        if (chartManager) {
            chartManager.destroyAllCharts();
        }
        
        // Reset managers
        adminManager.resetAdminForm();
        
        // Reload page
        window.location.reload();
    }
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    Utils.showNotification('An unexpected error occurred', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    Utils.showNotification('An unexpected error occurred', 'error');
});

// Initialize the application when script loads
let app;

// Wait for all scripts to load, then initialize
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all managers are initialized
    setTimeout(() => {
        app = new PowerVerificationApp();
        
        // Make app available globally for debugging
        window.powerVerificationApp = app;
        
    }, 100);
});

// Global utility functions for console debugging
window.debugApp = () => {
    if (app) {
        console.log('Application Status:', app.getStatus());
        console.log('Data Manager:', dataManager);
        console.log('Table Manager:', tableManager);
        console.log('Chart Manager:', chartManager);
        console.log('Admin Manager:', adminManager);
    } else {
        console.log('Application not initialized yet');
    }
};

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PowerVerificationApp };
}