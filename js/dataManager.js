// Data Manager - Handles all data operations
class DataManager {
    constructor() {
        this.data = {
            version: '1.0',
            weeks: {},
            lastUpdated: null,
            metadata: {
                latestWeek: null
            }
        };
        
        this.sharedDataUrl = 'data/sharedData.json';
        this.isInitialized = false;
        this.initializeData();
    }

    // Initialize data - Load from shared repository first, then merge with localStorage
    async initializeData() {
        try {
            // Load shared data from repository first
            await this.loadSharedData();
            
            // Then load and merge any local data
            this.mergeLocalData();
            
            this.isInitialized = true;
            console.log('Data Manager initialized with shared and local data');
            
            // Notify other components that data is ready
            this.notifyDataReady();
            
        } catch (error) {
            console.warn('Failed to load shared data, using local only:', error);
            // Fallback to local data only
            this.loadLocalDataOnly();
            this.isInitialized = true;
            this.notifyDataReady();
        }
    }

    // Load shared data from repository
    async loadSharedData() {
        try {
            const response = await fetch(this.sharedDataUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch shared data: ${response.status}`);
            }
            
            const sharedData = await response.json();
            console.log('Loaded shared data from repository');
            
            // Use shared data as base
            this.data = {
                ...this.data,
                ...sharedData,
                metadata: {
                    ...this.data.metadata,
                    ...sharedData.metadata,
                    sharedDataLoaded: true,
                    sharedDataTimestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.warn('Could not load shared data:', error);
            throw error;
        }
    }

    // Merge local data with shared data (local takes precedence for newer data)
    mergeLocalData() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!stored) return;
            
            const localData = JSON.parse(stored);
            console.log('Merging local data with shared data');
            
            // Merge weeks - local data takes precedence if it's newer
            if (localData.weeks) {
                for (const weekNumber in localData.weeks) {
                    const localWeek = localData.weeks[weekNumber];
                    const sharedWeek = this.data.weeks[weekNumber];
                    
                    // Use local data if it's newer or if shared doesn't have this week
                    if (!sharedWeek || (localWeek.timestamp && (!sharedWeek.timestamp || localWeek.timestamp > sharedWeek.timestamp))) {
                        this.data.weeks[weekNumber] = localWeek;
                        console.log(`Using local data for week ${weekNumber}`);
                    }
                }
            }
            
            // Update metadata
            this.data.lastUpdated = new Date().toISOString();
            this.updateMetadata();
            
        } catch (error) {
            console.error('Error merging local data:', error);
        }
    }

    // Fallback: Load only local data
    loadLocalDataOnly() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            } else {
                // Initialize with empty data
                this.data = {
                    weeks: {},
                    lastUpdated: new Date().toISOString(),
                    metadata: {
                        totalWeeks: 0,
                        latestWeek: null
                    }
                };
            }
            console.log('Using local data only');
        } catch (error) {
            console.error('Error loading local data:', error);
            // Initialize with empty data as last resort
            this.data = {
                weeks: {},
                lastUpdated: new Date().toISOString(),
                metadata: {
                    totalWeeks: 0,
                    latestWeek: null
                }
            };
        }
    }

    // Notify other components that data is ready
    notifyDataReady() {
        // Update data status indicator
        this.updateDataStatusIndicator();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('dataManagerReady'));
        
        // Update UI components if they exist
        if (window.tableManager) {
            tableManager.updateWeekSelection();
        }
    }

    // Update data status indicator
    updateDataStatusIndicator() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const dataStatus = document.getElementById('dataStatus');
        
        if (!statusIndicator || !statusText || !dataStatus) return;
        
        const hasSharedData = this.data.metadata?.sharedDataLoaded;
        const weekCount = Object.keys(this.data.weeks || {}).length;
        
        // Remove existing status classes
        dataStatus.classList.remove('shared', 'local', 'error');
        
        if (hasSharedData && weekCount > 0) {
            // Shared data loaded successfully
            statusIndicator.textContent = '🌐';
            statusText.textContent = `Shared data (${weekCount} weeks)`;
            dataStatus.classList.add('shared');
        } else if (weekCount > 0) {
            // Local data only
            statusIndicator.textContent = '💻';
            statusText.textContent = `Local data (${weekCount} weeks)`;
            dataStatus.classList.add('local');
        } else {
            // No data
            statusIndicator.textContent = '📭';
            statusText.textContent = 'No data available';
            dataStatus.classList.add('error');
        }
    }

    // Wait for data to be initialized
    async waitForInit() {
        if (this.isInitialized) return;
        
        return new Promise((resolve) => {
            const checkInit = () => {
                if (this.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkInit, 100);
                }
            };
            checkInit();
        });
    }

    // Load data from localStorage (legacy method for compatibility)
    loadData() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading data:', error);
            return {};
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            Utils.showNotification('Error saving data', 'error');
            return false;
        }
    }

    // Add a new week's data
    addWeekData(weekNumber, parsedData) {
        if (!weekNumber || !parsedData) {
            throw new Error('Invalid week number or data');
        }

        // Validate week format
        if (!CONFIG.WEEK_PATTERN.test(weekNumber)) {
            throw new Error('Invalid week format. Use format like "26ww07"');
        }

        // Add the week data
        this.data.weeks[weekNumber] = {
            weekNumber,
            dateAdded: new Date().toISOString(),
            ...parsedData
        };

        // Update metadata
        this.data.metadata.totalWeeks = Object.keys(this.data.weeks).length;
        
        // Update latest week
        const weeks = this.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        this.data.metadata.latestWeek = sortedWeeks[sortedWeeks.length - 1];

        return this.saveData();
    }

    // Get list of all weeks
    getWeeksList() {
        return Object.keys(this.data.weeks || {});
    }

    // Get data for a specific week
    getWeekData(weekNumber) {
        return this.data.weeks[weekNumber] || null;
    }

    // Check if week data exists
    hasWeekData(weekNumber) {
        return this.data.weeks.hasOwnProperty(weekNumber);
    }

    // Get all weeks data
    getAllWeeksData() {
        return this.data.weeks || {};
    }

    // Delete a week's data
    deleteWeekData(weekNumber) {
        if (this.data.weeks[weekNumber]) {
            delete this.data.weeks[weekNumber];
            this.data.metadata.totalWeeks = Object.keys(this.data.weeks).length;
            
            // Update latest week
            const weeks = this.getWeeksList();
            if (weeks.length > 0) {
                const sortedWeeks = Utils.sortWeeks(weeks);
                this.data.metadata.latestWeek = sortedWeeks[sortedWeeks.length - 1];
            } else {
                this.data.metadata.latestWeek = null;
            }
            
            return this.saveData();
        }
        return false;
    }

    // Parse raw table data from text input
    parseTableData(rawText) {
        try {
            const lines = rawText.trim().split('\n').filter(line => line.trim());
            const result = {
                cdynTable: [],
                previousRollup: [],
                oldPdkRollup: []
            };

            let currentSection = null;
            let skipNextLine = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (skipNextLine) {
                    skipNextLine = false;
                    continue;
                }

                // Identify sections
                if (line.includes('ADJUSTED CDYN TABLE')) {
                    currentSection = 'cdynTable';
                    skipNextLine = true; // Skip header line
                    continue;
                } else if (line.includes('PNC DMR Cdyn changes w.r.t previous Rollup')) {
                    currentSection = 'previousRollup';
                    skipNextLine = true; // Skip header line
                    continue;
                } else if (line.includes('PNC DMR Cdyn changes w.r.t OLD PDK Rollup')) {
                    currentSection = 'oldPdkRollup';
                    skipNextLine = true; // Skip header line
                    continue;
                } else if (!line || line.length < 5) {
                    // Skip empty or very short lines
                    continue;
                }

                // Parse data lines
                if (currentSection && line.includes('\t')) {
                    const columns = line.split('\t').map(col => col.trim());
                    
                    if (columns.length > 1) {
                        const rowData = {};
                        
                        if (currentSection === 'cdynTable') {
                            const headers = CONFIG.TABLE_HEADERS.cdynTable;
                            headers.forEach((header, index) => {
                                if (index < columns.length) {
                                    rowData[header] = this.parseValue(columns[index]);
                                }
                            });
                        } else if (currentSection === 'previousRollup') {
                            const headers = CONFIG.TABLE_HEADERS.previousRollup;
                            headers.forEach((header, index) => {
                                if (index < columns.length) {
                                    rowData[header] = this.parseValue(columns[index]);
                                }
                            });
                        } else if (currentSection === 'oldPdkRollup') {
                            const headers = CONFIG.TABLE_HEADERS.oldPdkRollup;
                            headers.forEach((header, index) => {
                                if (index < columns.length) {
                                    rowData[header] = this.parseValue(columns[index]);
                                }
                            });
                        }

                        if (Object.keys(rowData).length > 0) {
                            result[currentSection].push(rowData);
                        }
                    }
                }
            }

            // Validate parsed data
            if (result.cdynTable.length === 0 && result.previousRollup.length === 0 && result.oldPdkRollup.length === 0) {
                throw new Error('No valid data found. Please check the format.');
            }

            return result;
        } catch (error) {
            console.error('Parse error:', error);
            throw new Error('Failed to parse data: ' + error.message);
        }
    }

    // Parse individual values (convert numbers, handle percentages)
    parseValue(value) {
        if (!value || value === '') return '';
        
        // Handle percentages
        if (value.includes('%')) {
            const numValue = parseFloat(value.replace('%', ''));
            return isNaN(numValue) ? value : numValue;
        }
        
        // Handle numbers
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            return numValue;
        }
        
        return value; // Return as string if not a number
    }

    // Get trend data for charts (compares across weeks)
    getTrendData(metric, tableName) {
        const weeks = this.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        
        const trendData = {
            labels: sortedWeeks,
            datasets: []
        };

        if (sortedWeeks.length === 0) return trendData;

        // For geomean trends from CDYN table
        if (tableName === 'cdynTable' && metric === 'geomean') {
            const geomeanData = [];
            const geomeanNoRomsGccData = [];
            
            sortedWeeks.forEach(week => {
                const weekData = this.getWeekData(week);
                if (weekData && weekData.cdynTable) {
                    const geomeanRow = weekData.cdynTable.find(row => 
                        row['Test Name'] && row['Test Name'].includes('geomean (3plus7)'));
                    const geomeanNoRomsRow = weekData.cdynTable.find(row => 
                        row['Test Name'] && row['Test Name'].includes('geomean(no roms & gcc)'));
                    
                    geomeanData.push(geomeanRow ? geomeanRow['Cdyn'] : null);
                    geomeanNoRomsGccData.push(geomeanNoRomsRow ? geomeanNoRomsRow['Cdyn'] : null);
                }
            });

            trendData.datasets = [
                {
                    label: 'Geomean (3plus7)',
                    data: geomeanData,
                    borderColor: CONFIG.CHART_COLORS.primary,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                    tension: 0.3
                },
                {
                    label: 'Geomean (no roms & gcc)',
                    data: geomeanNoRomsGccData,
                    borderColor: CONFIG.CHART_COLORS.secondary,
                    backgroundColor: CONFIG.CHART_COLORS.secondary + '20',
                    tension: 0.3
                }
            ];
        }

        return trendData;
    }

    // Get partition trend data
    getPartitionTrendData() {
        const weeks = this.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        
        if (sortedWeeks.length === 0) return { labels: [], datasets: [] };

        // Get all unique partitions
        const partitions = new Set();
        sortedWeeks.forEach(week => {
            const weekData = this.getWeekData(week);
            if (weekData && weekData.oldPdkRollup) {
                weekData.oldPdkRollup.forEach(row => {
                    if (row['Partition Name'] && row['Partition Name'] !== 'All_Scenario') {
                        partitions.add(row['Partition Name']);
                    }
                });
            }
        });

        const datasets = Array.from(partitions).map((partition, index) => {
            const data = sortedWeeks.map(week => {
                const weekData = this.getWeekData(week);
                if (weekData && weekData.oldPdkRollup) {
                    const partitionRow = weekData.oldPdkRollup.find(row => 
                        row['Partition Name'] === partition);
                    return partitionRow ? partitionRow['%Diff_Cdyn'] : null;
                }
                return null;
            });

            return {
                label: partition.replace('par_', ''),
                data: data,
                borderColor: CONFIG.COLOR_PALETTE[index % CONFIG.COLOR_PALETTE.length],
                backgroundColor: CONFIG.COLOR_PALETTE[index % CONFIG.COLOR_PALETTE.length] + '20',
                tension: 0.3
            };
        });

        return {
            labels: sortedWeeks,
            datasets: datasets
        };
    }

    // Export data as JSON
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = imported;
            return this.saveData();
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Invalid JSON data');
        }
    }

    // Clear all data
    clearAllData() {
        this.data = {
            weeks: {},
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalWeeks: 0,
                latestWeek: null
            }
        };
        return this.saveData();
    }

    // Get summary statistics
    getSummaryStats() {
        const weeks = this.getWeeksList();
        const latestWeek = this.data.metadata.latestWeek;
        let latestGeomean = null;

        if (latestWeek) {
            const latestData = this.getWeekData(latestWeek);
            if (latestData && latestData.cdynTable) {
                const geomeanRow = latestData.cdynTable.find(row => 
                    row['Test Name'] && row['Test Name'].includes('geomean (3plus7)'));
                latestGeomean = geomeanRow ? geomeanRow['Cdyn'] : null;
            }
        }

        // Calculate approximate data size
        const dataString = JSON.stringify(this.data);
        const dataSize = new Blob([dataString]).size;

        return {
            totalWeeks: weeks.length,
            latestWeek: latestWeek,
            latestGeomean: latestGeomean,
            lastUpdated: this.data.lastUpdated,
            dataSize: dataSize
        };
    }

    // Export all data
    exportAllData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Export selected weeks
    exportSelectedWeeks(weekNumbers) {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                exportedWeeks: weekNumbers,
                version: this.data.version
            },
            weeks: {}
        };

        weekNumbers.forEach(weekNumber => {
            const weekData = this.getWeekData(weekNumber);
            if (weekData) {
                exportData.weeks[weekNumber] = weekData;
            }
        });

        return JSON.stringify(exportData, null, 2);
    }

    // Enhanced import data with statistics
    importData(importedData) {
        if (typeof importedData === 'string') {
            importedData = JSON.parse(importedData);
        }

        let imported = 0;
        let overwritten = 0;
        let dataToImport = importedData;

        // Handle different import formats
        if (importedData.weeks) {
            // Export format with metadata
            dataToImport = importedData.weeks;
        } else if (importedData.data && importedData.data.weeks) {
            // Full backup format
            dataToImport = importedData.data.weeks;
        }

        // Import each week
        for (const weekNumber in dataToImport) {
            const weekData = dataToImport[weekNumber];
            const existed = this.hasWeekData(weekNumber);
            
            if (existed) {
                overwritten++;
            } else {
                imported++;
            }

            this.saveWeekData(weekNumber, weekData);
        }

        return {
            imported: imported,
            overwritten: overwritten,
            total: imported + overwritten
        };
    }
}

// Initialize global data manager instance
const dataManager = new DataManager();