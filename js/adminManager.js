// Admin Manager - Handles authentication and data updates
class AdminManager {
    constructor() {
        this.isAuthenticated = false;
        this.previewData = null;
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Mode switching
        const viewModeBtn = document.getElementById('viewModeBtn');
        const adminModeBtn = document.getElementById('adminModeBtn');
        
        if (viewModeBtn) {
            viewModeBtn.addEventListener('click', () => {
                this.switchToViewMode();
            });
        }
        
        if (adminModeBtn) {
            adminModeBtn.addEventListener('click', () => {
                this.switchToAdminMode();
            });
        }

        // Authentication
        const authenticateBtn = document.getElementById('authenticateBtn');
        if (authenticateBtn) {
            authenticateBtn.addEventListener('click', () => {
                this.authenticate();
            });
        }

        // Admin password field - allow Enter key
        const adminPassword = document.getElementById('adminPassword');
        if (adminPassword) {
            adminPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticate();
                }
            });
        }

        // Admin Tab Navigation
        const uploadTabBtn = document.getElementById('uploadTabBtn');
        const manageTabBtn = document.getElementById('manageTabBtn');
        const bulkTabBtn = document.getElementById('bulkTabBtn');

        if (uploadTabBtn) {
            uploadTabBtn.addEventListener('click', () => this.switchTab('upload'));
        }
        if (manageTabBtn) {
            manageTabBtn.addEventListener('click', () => this.switchTab('manage'));
        }
        if (bulkTabBtn) {
            bulkTabBtn.addEventListener('click', () => this.switchTab('bulk'));
        }

        // Upload Tab - Data parsing
        const parseDataBtn = document.getElementById('parseDataBtn');
        if (parseDataBtn) {
            parseDataBtn.addEventListener('click', () => {
                this.parseAndPreviewData();
            });
        }

        // Upload Tab - Data saving
        const saveDataBtn = document.getElementById('saveDataBtn');
        if (saveDataBtn) {
            saveDataBtn.addEventListener('click', () => {
                this.saveWeekData();
            });
        }

        // Upload Tab - Data input field - auto-resize
        const dataInput = document.getElementById('dataInput');
        if (dataInput) {
            dataInput.addEventListener('input', () => {
                this.autoResizeTextarea(dataInput);
            });
        }

        // Manage Tab - Refresh week list
        const refreshWeekListBtn = document.getElementById('refreshWeekListBtn');
        if (refreshWeekListBtn) {
            refreshWeekListBtn.addEventListener('click', () => {
                this.refreshWeekList();
            });
        }

        // Bulk Operations - Export Operations
        const exportForRepoBtn = document.getElementById('exportForRepoBtn');
        const exportAllBtn = document.getElementById('exportAllBtn');
        const exportSelectedBtn = document.getElementById('exportSelectedBtn');
        const exportBackupBtn = document.getElementById('exportBackupBtn');

        if (exportForRepoBtn) {
            exportForRepoBtn.addEventListener('click', () => this.exportForRepository());
        }
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllData());
        }
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', () => this.showExportOptions());
        }
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => this.createFullBackup());
        }

        // Bulk Operations - Import Operations
        const importDataBtn = document.getElementById('importDataBtn');
        const restoreBackupBtn = document.getElementById('restoreBackupBtn');

        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.importDataFromFile());
        }
        if (restoreBackupBtn) {
            restoreBackupBtn.addEventListener('click', () => this.restoreFromBackup());
        }

        // Bulk Operations - Danger Zone
        const clearAllDataBtn = document.getElementById('clearAllDataBtn');
        const resetDashboardBtn = document.getElementById('resetDashboardBtn');

        if (clearAllDataBtn) {
            clearAllDataBtn.addEventListener('click', () => this.clearAllData());
        }
        if (resetDashboardBtn) {
            resetDashboardBtn.addEventListener('click', () => this.resetDashboard());
        }

        // Export Actions (dynamic buttons)
        this.setupDynamicEventListeners();
    }

    // Setup dynamic event listeners (for buttons created after initialization)
    setupDynamicEventListeners() {
        // Use event delegation for dynamically created buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'executeExportBtn') {
                this.exportSelectedWeeks();
            } else if (e.target.id === 'cancelExportBtn') {
                document.getElementById('exportOptions').classList.add('hidden');
            }
        });
    }

    // Switch to view mode
    switchToViewMode() {
        document.getElementById('viewModeBtn').classList.add('active');
        document.getElementById('adminModeBtn').classList.remove('active');
        document.getElementById('adminPanel').classList.add('hidden');
        
        // Show data section by default
        document.querySelector('.data-section').classList.remove('hidden');
        document.getElementById('trendsSection').classList.add('hidden');
        document.getElementById('comparisonSection').classList.add('hidden');
    }

    // Switch to admin mode
    switchToAdminMode() {
        document.getElementById('viewModeBtn').classList.remove('active');
        document.getElementById('adminModeBtn').classList.add('active');
        document.getElementById('adminPanel').classList.remove('hidden');
        
        // Hide other sections
        document.querySelector('.data-section').classList.add('hidden');
        document.getElementById('trendsSection').classList.add('hidden');
        document.getElementById('comparisonSection').classList.add('hidden');

        // Reset authentication if not already authenticated
        if (!this.isAuthenticated) {
            this.resetAdminForm();
        } else {
            // If already authenticated, show the default tab (upload)
            this.switchTab('upload');
        }
    }

    // Authenticate admin user
    authenticate() {
        const passwordInput = document.getElementById('adminPassword');
        const enteredPassword = passwordInput.value.trim();

        if (enteredPassword === CONFIG.ADMIN_PASSWORD) {
            this.isAuthenticated = true;
            document.getElementById('adminActions').classList.remove('hidden');
            passwordInput.disabled = true;
            document.getElementById('authenticateBtn').textContent = 'Authenticated';
            document.getElementById('authenticateBtn').disabled = true;
            
            Utils.showNotification('Authentication successful', 'success');
            
            // Initialize default tab (upload)
            this.switchTab('upload');
            
            // Focus on week number input
            const weekNumberInput = document.getElementById('weekNumber');
            if (weekNumberInput) {
                weekNumberInput.focus();
            }
        } else {
            Utils.showNotification('Invalid password', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Reset admin form
    resetAdminForm() {
        this.isAuthenticated = false;
        this.previewData = null;
        
        document.getElementById('adminPassword').disabled = false;
        document.getElementById('adminPassword').value = '';
        document.getElementById('authenticateBtn').textContent = 'Authenticate';
        document.getElementById('authenticateBtn').disabled = false;
        document.getElementById('adminActions').classList.add('hidden');
        
        // Reset form fields
        document.getElementById('weekNumber').value = '';
        document.getElementById('dataInput').value = '';
        document.getElementById('saveDataBtn').classList.add('hidden');
    }

    // Parse and preview data
    parseAndPreviewData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Please authenticate first', 'error');
            return;
        }

        const weekNumber = document.getElementById('weekNumber').value.trim();
        const rawData = document.getElementById('dataInput').value.trim();

        // Validate inputs
        if (!weekNumber) {
            Utils.showNotification('Please enter a week number', 'error');
            document.getElementById('weekNumber').focus();
            return;
        }

        if (!CONFIG.WEEK_PATTERN.test(weekNumber)) {
            Utils.showNotification('Invalid week format. Use format like "26ww07"', 'error');
            document.getElementById('weekNumber').focus();
            return;
        }

        if (!rawData) {
            Utils.showNotification('Please paste the table data', 'error');
            document.getElementById('dataInput').focus();
            return;
        }

        // Check if week already exists
        if (dataManager.getWeekData(weekNumber)) {
            const confirmOverwrite = confirm(`Week ${weekNumber} already exists. Do you want to overwrite it?`);
            if (!confirmOverwrite) {
                return;
            }
        }

        try {
            Utils.showLoading();
            
            // Parse the data
            this.previewData = dataManager.parseTableData(rawData);
            
            // Display preview
            this.displayDataPreview(weekNumber, this.previewData);
            
            // Show save button
            document.getElementById('saveDataBtn').classList.remove('hidden');
            
            Utils.hideLoading();
            Utils.showNotification('Data parsed successfully. Review the preview below.', 'success');
            
        } catch (error) {
            Utils.hideLoading();
            Utils.showNotification('Parse error: ' + error.message, 'error');
            console.error('Parse error:', error);
        }
    }

    // Display data preview
    displayDataPreview(weekNumber, parsedData) {
        // Create preview container
        let previewContainer = document.getElementById('dataPreview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'dataPreview';
            previewContainer.className = 'data-preview';
            
            // Add after the upload form
            const uploadForm = document.querySelector('.upload-form');
            uploadForm.parentNode.insertBefore(previewContainer, uploadForm.nextSibling);
        }

        previewContainer.innerHTML = `
            <h3>Data Preview for Week ${weekNumber}</h3>
            <div class="preview-stats">
                <div class="stat-item">
                    <strong>CDYN Table:</strong> ${parsedData.cdynTable.length} rows
                </div>
                <div class="stat-item">
                    <strong>Previous Rollup:</strong> ${parsedData.previousRollup.length} rows
                </div>
                <div class="stat-item">
                    <strong>OLD PDK Rollup:</strong> ${parsedData.oldPdkRollup.length} rows
                </div>
            </div>
        `;

        // Add preview tables
        this.addPreviewTable(previewContainer, 'CDYN Table', parsedData.cdynTable, CONFIG.TABLE_HEADERS.cdynTable);
        this.addPreviewTable(previewContainer, 'Previous Rollup', parsedData.previousRollup, CONFIG.TABLE_HEADERS.previousRollup);
        this.addPreviewTable(previewContainer, 'OLD PDK Rollup', parsedData.oldPdkRollup, CONFIG.TABLE_HEADERS.oldPdkRollup);

        // Add CSS for preview
        if (!document.getElementById('previewStyles')) {
            const style = document.createElement('style');
            style.id = 'previewStyles';
            style.textContent = `
                .data-preview {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    border: 2px solid #48bb78;
                    border-radius: 10px;
                    background: rgba(72, 187, 120, 0.05);
                }
                .data-preview h3 {
                    color: #38a169;
                    margin-bottom: 1rem;
                }
                .preview-stats {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                .stat-item {
                    padding: 0.5rem 1rem;
                    background: rgba(72, 187, 120, 0.1);
                    border-radius: 5px;
                    border: 1px solid #48bb78;
                }
                .preview-table {
                    margin-bottom: 1.5rem;
                }
                .preview-table h4 {
                    color: #4a5568;
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }
                .preview-table-wrapper {
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #e2e8f0;
                    border-radius: 5px;
                }
                .preview-table table {
                    width: 100%;
                    font-size: 0.8rem;
                    border-collapse: collapse;
                }
                .preview-table th {
                    background: #f7fafc;
                    padding: 0.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    font-size: 0.75rem;
                }
                .preview-table td {
                    padding: 0.4rem 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .preview-table tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add preview table
    addPreviewTable(container, title, data, headers) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'preview-table';
        
        const tableTitle = document.createElement('h4');
        tableTitle.textContent = title;
        tableDiv.appendChild(tableTitle);

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'preview-table-wrapper';

        const table = document.createElement('table');
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body (show only first 5 rows for preview)
        const tbody = document.createElement('tbody');
        const previewRows = data.slice(0, 5);
        
        previewRows.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header];
                td.textContent = this.formatPreviewValue(value, header);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Add "more rows" indicator if needed
        if (data.length > 5) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = headers.length;
            td.textContent = `... and ${data.length - 5} more rows`;
            td.style.textAlign = 'center';
            td.style.fontStyle = 'italic';
            td.style.color = '#666';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        tableDiv.appendChild(tableWrapper);
        container.appendChild(tableDiv);
    }

    // Format preview values
    formatPreviewValue(value, header) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        
        if (typeof value === 'number') {
            if (header.includes('%')) {
                return Utils.formatPercentage(value);
            }
            return Utils.formatNumber(value);
        }
        
        return value.toString();
    }

    // Save week data
    saveWeekData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Please authenticate first', 'error');
            return;
        }

        if (!this.previewData) {
            Utils.showNotification('Please parse data first', 'error');
            return;
        }

        const weekNumber = document.getElementById('weekNumber').value.trim();

        try {
            Utils.showLoading();
            
            // Save the data
            const success = dataManager.addWeekData(weekNumber, this.previewData);
            
            if (success) {
                // Update UI
                tableManager.updateWeekSelection();
                
                // Clear form
                this.clearForm();
                
                // Switch to view mode and show the new data
                this.switchToViewMode();
                setTimeout(() => {
                    document.getElementById('weekSelect').value = weekNumber;
                    tableManager.displayWeekData(weekNumber);
                }, 100);
                
                Utils.hideLoading();
                Utils.showNotification(`Week ${weekNumber} data saved successfully!`, 'success');
                
            } else {
                throw new Error('Failed to save data');
            }
            
        } catch (error) {
            Utils.hideLoading();
            Utils.showNotification('Save error: ' + error.message, 'error');
            console.error('Save error:', error);
        }
    }

    // Clear form after successful save
    clearForm() {
        document.getElementById('weekNumber').value = '';
        document.getElementById('dataInput').value = '';
        document.getElementById('saveDataBtn').classList.add('hidden');
        
        // Remove preview
        const previewContainer = document.getElementById('dataPreview');
        if (previewContainer) {
            previewContainer.remove();
        }
        
        this.previewData = null;
    }

    // Auto resize textarea
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px';
    }

    // Export data functionality
    exportData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for data export', 'error');
            return;
        }

        try {
            const exportData = dataManager.exportData();
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `power-verification-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Utils.showNotification('Data exported successfully', 'success');
            
        } catch (error) {
            Utils.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    // Import data functionality
    importData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for data import', 'error');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const success = dataManager.importData(event.target.result);
                    if (success) {
                        tableManager.updateWeekSelection();
                        Utils.showNotification('Data imported successfully', 'success');
                    } else {
                        throw new Error('Import failed');
                    }
                } catch (error) {
                    Utils.showNotification('Import failed: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Delete week data
    deleteWeekData(weekNumber) {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required to delete data', 'error');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete data for week ${weekNumber}? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            const success = dataManager.deleteWeekData(weekNumber);
            if (success) {
                tableManager.updateWeekSelection();
                Utils.showNotification(`Week ${weekNumber} data deleted successfully`, 'success');
            } else {
                throw new Error('Failed to delete week data');
            }
        } catch (error) {
            Utils.showNotification('Delete failed: ' + error.message, 'error');
        }
    }

    // Tab Switching Methods
    switchTab(tabName) {
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // Remove active class from all tab content
        const tabContents = document.querySelectorAll('.admin-tab');
        tabContents.forEach(tab => tab.classList.remove('active'));

        // Add active class to selected tab button and content
        document.getElementById(`${tabName}TabBtn`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Initialize tab-specific content
        if (tabName === 'manage') {
            this.initializeManageTab();
        } else if (tabName === 'bulk') {
            this.initializeBulkTab();
        }
    }

    // Initialize Manage Tab
    initializeManageTab() {
        this.updateWeekStats();
        this.refreshWeekList();
    }

    // Update week statistics
    updateWeekStats() {
        const stats = dataManager.getSummaryStats();
        
        document.getElementById('totalWeeksCount').textContent = stats.totalWeeks;
        document.getElementById('latestWeekNumber').textContent = stats.latestWeek || '-';
        document.getElementById('totalDataSize').textContent = this.formatBytes(stats.dataSize || 0);
    }

    // Refresh week list
    refreshWeekList() {
        const weekList = document.getElementById('weekList');
        const weeks = dataManager.getAllWeekNumbers();

        if (weeks.length === 0) {
            weekList.innerHTML = '<div class="no-weeks-message">No weeks found. Upload some data first.</div>';
            return;
        }

        weekList.innerHTML = weeks.map(weekNumber => {
            const weekData = dataManager.getWeekData(weekNumber);
            const totalRows = (weekData.cdynTable?.length || 0) + 
                            (weekData.previousRollup?.length || 0) + 
                            (weekData.oldPdkRollup?.length || 0);
            
            return `
                <div class="week-item">
                    <div class="week-info">
                        <div class="week-number">Week ${weekNumber}</div>
                        <div class="week-details">${totalRows} total rows • Created: ${new Date(weekData.timestamp || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div class="week-actions">
                        <button class="btn edit small" onclick="adminManager.editWeekData('${weekNumber}')">📝 Edit</button>
                        <button class="btn danger small" onclick="adminManager.deleteWeekData('${weekNumber}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Edit week data
    editWeekData(weekNumber) {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required to edit data', 'error');
            return;
        }

        const weekData = dataManager.getWeekData(weekNumber);
        if (!weekData) {
            Utils.showNotification('Week data not found', 'error');
            return;
        }

        // Switch to upload tab
        this.switchTab('upload');

        // Populate form fields with existing data
        document.getElementById('weekNumber').value = weekNumber;
        
        // Convert data back to text format for editing
        const rawText = this.convertDataToText(weekData);
        document.getElementById('dataInput').value = rawText;

        // Auto-resize textarea
        this.autoResizeTextarea(document.getElementById('dataInput'));

        Utils.showNotification(`Loaded data for week ${weekNumber} for editing`, 'info');
    }

    // Convert structured data back to text format
    convertDataToText(weekData) {
        let text = '';
        
        // CDYN Table
        if (weekData.cdynTable?.length > 0) {
            text += 'ADJUSTED CDYN TABLE\n';
            text += CONFIG.TABLE_HEADERS.cdynTable.join('\t') + '\n';
            weekData.cdynTable.forEach(row => {
                text += CONFIG.TABLE_HEADERS.cdynTable.map(header => row[header] || '').join('\t') + '\n';
            });
            text += '\n';
        }

        // Previous Rollup Table
        if (weekData.previousRollup?.length > 0) {
            text += 'PNC DMR Cdyn changes w.r.t previous Rollup\n';
            text += CONFIG.TABLE_HEADERS.previousRollup.join('\t') + '\n';
            weekData.previousRollup.forEach(row => {
                text += CONFIG.TABLE_HEADERS.previousRollup.map(header => row[header] || '').join('\t') + '\n';
            });
            text += '\n';
        }

        // OLD PDK Rollup Table
        if (weekData.oldPdkRollup?.length > 0) {
            text += 'PNC DMR Cdyn changes w.r.t OLD PDK Rollup (25ww16)\n';
            text += CONFIG.TABLE_HEADERS.oldPdkRollup.join('\t') + '\n';
            weekData.oldPdkRollup.forEach(row => {
                text += CONFIG.TABLE_HEADERS.oldPdkRollup.map(header => row[header] || '').join('\t') + '\n';
            });
        }

        return text;
    }

    // Initialize Bulk Tab
    initializeBulkTab() {
        this.updateExportWeekSelection();
    }

    // Show export options
    showExportOptions() {
        const exportOptions = document.getElementById('exportOptions');
        if (exportOptions.classList.contains('hidden')) {
            exportOptions.classList.remove('hidden');
            this.updateExportWeekSelection();
        } else {
            exportOptions.classList.add('hidden');
        }
    }

    // Update export week selection grid
    updateExportWeekSelection() {
        const container = document.getElementById('exportWeekSelection');
        const weeks = dataManager.getAllWeekNumbers();

        if (!container || weeks.length === 0) {
            if (container) container.innerHTML = '<p>No weeks available to export</p>';
            return;
        }

        container.innerHTML = weeks.map(weekNumber => `
            <div class="week-checkbox">
                <input type="checkbox" id="export-${weekNumber}" value="${weekNumber}">
                <label for="export-${weekNumber}">Week ${weekNumber}</label>
            </div>
        `).join('');
    }

    // Export all data
    exportAllData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for export', 'error');
            return;
        }

        try {
            const allData = dataManager.exportAllData();
            this.downloadFile(allData, `power-verification-all-data-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            Utils.showNotification('All data exported successfully', 'success');
        } catch (error) {
            Utils.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    // Export selected weeks
    exportSelectedWeeks() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for export', 'error');
            return;
        }

        const selectedWeeks = Array.from(document.querySelectorAll('#exportWeekSelection input:checked'))
            .map(input => input.value);

        if (selectedWeeks.length === 0) {
            Utils.showNotification('Please select at least one week to export', 'warning');
            return;
        }

        const format = document.getElementById('exportFormat').value;

        try {
            let data, filename, mimeType;
            
            if (format === 'json') {
                data = dataManager.exportSelectedWeeks(selectedWeeks);
                filename = `power-verification-selected-weeks-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (format === 'csv') {
                data = this.exportWeeksAsCSV(selectedWeeks);
                filename = `power-verification-selected-weeks-${new Date().toISOString().split('T')[0]}.zip`;
                mimeType = 'application/zip';
            }

            this.downloadFile(data, filename, mimeType);
            Utils.showNotification(`${selectedWeeks.length} weeks exported successfully as ${format.toUpperCase()}`, 'success');
            
            // Hide export options
            document.getElementById('exportOptions').classList.add('hidden');
            
        } catch (error) {
            Utils.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    // Create full backup
    createFullBackup() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for backup', 'error');
            return;
        }

        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: dataManager.exportAllData(),
                metadata: {
                    totalWeeks: dataManager.getAllWeekNumbers().length,
                    createdBy: 'Power Verification Dashboard',
                    generator: 'AdminManager'
                }
            };

            const filename = `power-verification-backup-${new Date().toISOString().split('T')[0]}.json`;
            this.downloadFile(JSON.stringify(backupData, null, 2), filename, 'application/json');
            Utils.showNotification('Full backup created successfully', 'success');
            
        } catch (error) {
            Utils.showNotification('Backup failed: ' + error.message, 'error');
        }
    }

    // Export data for shared repository update
    exportForRepository() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for repository export', 'error');
            return;
        }

        try {
            const sharedData = {
                version: '1.0',
                lastUpdated: new Date().toISOString(),
                metadata: {
                    latestWeek: dataManager.data.metadata.latestWeek,
                    totalWeeks: dataManager.getAllWeekNumbers().length,
                    lastModified: new Date().toISOString(),
                    updatedBy: 'Power Verification Team'
                },
                weeks: dataManager.data.weeks
            };

            const filename = 'sharedData.json';
            this.downloadFile(JSON.stringify(sharedData, null, 2), filename, 'application/json');
            Utils.showNotification('Repository data file created! Upload this to GitHub data/ folder', 'success');
            
            // Show instructions
            this.showRepositoryUpdateInstructions();
            
        } catch (error) {
            Utils.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    // Show instructions for updating repository
    showRepositoryUpdateInstructions() {
        const instructions = `
        <div class="repository-instructions">
            <h4>📤 Update Shared Repository Data</h4>
            <p><strong>Step 1:</strong> Downloaded file: <code>sharedData.json</code></p>
            <p><strong>Step 2:</strong> Go to your GitHub repository</p>
            <p><strong>Step 3:</strong> Navigate to <code>data/</code> folder</p>
            <p><strong>Step 4:</strong> Upload/replace <code>sharedData.json</code></p>
            <p><strong>Step 5:</strong> All team members will see new data!</p>
            <div class="instruction-actions">
                <button onclick="window.open('https://github.com', '_blank')" class="btn primary">🌐 Open GitHub</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn secondary">Close</button>
            </div>
        </div>
        `;

        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'instruction-modal';
        modal.innerHTML = instructions;
        document.body.appendChild(modal);

        // Auto remove after 30 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 30000);
    }

    // Import data from file
    importDataFromFile() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for import', 'error');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate data structure
                    if (!this.validateImportData(importedData)) {
                        throw new Error('Invalid data format');
                    }

                    const confirmImport = confirm(`Import data for ${Object.keys(importedData).length} weeks? This will overwrite existing weeks with the same numbers.`);
                    if (!confirmImport) return;

                    // Import the data
                    const result = dataManager.importData(importedData);
                    
                    // Update UI
                    tableManager.updateWeekSelection();
                    this.refreshWeekList();
                    this.updateWeekStats();
                    
                    Utils.showNotification(`Successfully imported ${result.imported} weeks (${result.overwritten} overwritten)`, 'success');
                    
                } catch (error) {
                    Utils.showNotification('Import failed: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Restore from backup
    restoreFromBackup() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required for restore', 'error');
            return;
        }

        const confirmed = confirm('Restore from backup? This will replace ALL existing data. This action cannot be undone.');
        if (!confirmed) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // Validate backup structure
                    if (!backupData.data || !backupData.timestamp) {
                        throw new Error('Invalid backup file format');
                    }

                    // Clear existing data and restore from backup
                    localStorage.removeItem(CONFIG.STORAGE_KEY);
                    const result = dataManager.importData(backupData.data);
                    
                    // Update UI
                    tableManager.updateWeekSelection();
                    this.refreshWeekList();
                    this.updateWeekStats();
                    
                    Utils.showNotification(`Backup restored successfully! ${result.imported} weeks restored from ${new Date(backupData.timestamp).toLocaleDateString()}`, 'success');
                    
                } catch (error) {
                    Utils.showNotification('Restore failed: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Clear all data
    clearAllData() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required to clear data', 'error');
            return;
        }

        const confirmed = confirm('Clear ALL data? This will permanently delete all weeks and cannot be undone. Consider creating a backup first.');
        if (!confirmed) return;

        const doubleConfirm = confirm('Are you absolutely sure? Type "DELETE ALL" to confirm this action.');
        if (!doubleConfirm) return;

        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            
            // Update UI
            tableManager.updateWeekSelection();
            this.refreshWeekList();
            this.updateWeekStats();
            
            // Clear current display
            tableManager.clearAllTables();
            
            Utils.showNotification('All data cleared successfully', 'success');
            
        } catch (error) {
            Utils.showNotification('Clear failed: ' + error.message, 'error');
        }
    }

    // Reset dashboard
    resetDashboard() {
        if (!this.isAuthenticated) {
            Utils.showNotification('Authentication required to reset dashboard', 'error');
            return;
        }

        const confirmed = confirm('Reset dashboard to initial state? This will clear all data and settings.');
        if (!confirmed) return;

        try {
            // Clear all localStorage data
            localStorage.clear();
            
            // Reset authentication
            this.resetAdminForm();
            
            // Reload page to reset state
            location.reload();
            
        } catch (error) {
            Utils.showNotification('Reset failed: ' + error.message, 'error');
        }
    }

    // Helper Methods
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check if it has week data structure
        for (const key in data) {
            const weekData = data[key];
            if (!weekData || typeof weekData !== 'object') continue;
            
            // Should have at least one of the expected tables
            if (weekData.cdynTable || weekData.previousRollup || weekData.oldPdkRollup) {
                return true;
            }
        }
        
        return false;
    }

    exportWeeksAsCSV(weekNumbers) {
        // This would create a ZIP file with CSV files for each week
        // For now, return JSON format as CSV export would require additional libraries
        return JSON.stringify(dataManager.exportSelectedWeeks(weekNumbers), null, 2);
    }

    // Get admin statistics
    getAdminStats() {
        return dataManager.getSummaryStats();
    }
}

// Initialize global admin manager
const adminManager = new AdminManager();