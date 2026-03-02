// Table Manager - Handles table display and interactions
class TableManager {
    constructor() {
        this.currentWeek = null;
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Chart toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-toggle-btn')) {
                this.toggleChart(e.target.getAttribute('data-chart'));
            }
        });

        // Week selection
        const weekSelect = document.getElementById('weekSelect');
        if (weekSelect) {
            weekSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.displayWeekData(e.target.value);
                }
            });
        }

        // Show all weeks button
        const showAllWeeksBtn = document.getElementById('showAllWeeksBtn');
        if (showAllWeeksBtn) {
            showAllWeeksBtn.addEventListener('click', () => {
                this.displayAllWeeksComparison();
            });
        }
    }

    // Update week selection dropdown
    updateWeekSelection() {
        const weekSelect = document.getElementById('weekSelect');
        const week1Select = document.getElementById('week1Select');
        const week2Select = document.getElementById('week2Select');
        
        if (!weekSelect) return;

        const weeks = dataManager.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        
        // Clear existing options
        weekSelect.innerHTML = '<option value="">Select a week...</option>';
        
        if (week1Select) {
            week1Select.innerHTML = '<option value="">Select Week 1...</option>';
        }
        if (week2Select) {
            week2Select.innerHTML = '<option value="">Select Week 2...</option>';
        }

        // Add week options
        sortedWeeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = week;
            weekSelect.appendChild(option);

            if (week1Select) {
                const option1 = option.cloneNode(true);
                week1Select.appendChild(option1);
            }
            if (week2Select) {
                const option2 = option.cloneNode(true);
                week2Select.appendChild(option2);
            }
        });

        // Select the latest week by default
        if (sortedWeeks.length > 0) {
            const latestWeek = sortedWeeks[sortedWeeks.length - 1];
            weekSelect.value = latestWeek;
            this.displayWeekData(latestWeek);
        }
    }

    // Display data for a specific week
    displayWeekData(weekNumber) {
        this.currentWeek = weekNumber;
        const weekData = dataManager.getWeekData(weekNumber);
        
        if (!weekData) {
            Utils.showNotification(`No data found for week ${weekNumber}`, 'error');
            return;
        }

        // Display each table
        this.displayTable('cdynTable', weekData.cdynTable || [], CONFIG.TABLE_HEADERS.cdynTable);
        this.displayTable('previousRollupTable', weekData.previousRollup || [], CONFIG.TABLE_HEADERS.previousRollup);
        this.displayTable('oldPdkTable', weekData.oldPdkRollup || [], CONFIG.TABLE_HEADERS.oldPdkRollup);

        // Update section title
        this.updateSectionTitle(`Data for Week ${weekNumber}`);
        
        // Show data section and hide others
        this.showSection('data-section');
        this.hideSection('trendsSection');
        this.hideSection('comparisonSection');

        Utils.showNotification(`Loaded data for week ${weekNumber}`, 'success');
    }

    // Display a table with data
    displayTable(tableId, data, headers) {
        const table = document.getElementById(tableId);
        if (!table) return;

        // Clear existing content
        table.innerHTML = '';

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

        // Create body
        const tbody = document.createElement('tbody');
        
        if (data && data.length > 0) {
            data.forEach(row => {
                const tr = document.createElement('tr');
                
                // Add highlight class for geomean rows or total rows
                if (this.isHighlightRow(row, headers)) {
                    tr.classList.add('highlight');
                }

                headers.forEach(header => {
                    const td = document.createElement('td');
                    const value = row[header];
                    
                    // Format the value based on its type
                    td.textContent = this.formatCellValue(value, header);
                    
                    // Add alignment classes
                    if (typeof value === 'number') {
                        td.style.textAlign = 'right';
                    }
                    
                    tr.appendChild(td);
                });
                
                tbody.appendChild(tr);
            });
        } else {
            // Show no data message
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = headers.length;
            td.textContent = 'No data available';
            td.style.textAlign = 'center';
            td.style.fontStyle = 'italic';
            td.style.color = '#999';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
    }

    // Check if row should be highlighted
    isHighlightRow(row, headers) {
        const firstCol = headers[0];
        const firstValue = row[firstCol];
        
        if (typeof firstValue === 'string') {
            return firstValue.includes('geomean') || 
                   firstValue.includes('Grand Total') || 
                   firstValue.includes('All_Scenario');
        }
        
        return false;
    }

    // Format cell values for display
    formatCellValue(value, header) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        
        if (typeof value === 'number') {
            // Handle percentage columns
            if (header.includes('%') || header.includes('diff')) {
                return Utils.formatPercentage(value);
            }
            
            // Format other numbers
            return Utils.formatNumber(value);
        }
        
        return value.toString();
    }

    // Display all weeks comparison
    displayAllWeeksComparison() {
        const weeks = dataManager.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        
        if (sortedWeeks.length === 0) {
            Utils.showNotification('No data available for comparison', 'error');
            return;
        }

        // Create comparison table for CDYN geomean values
        this.createGeomeanComparisonTable(sortedWeeks);
        
        // Show comparison section
        this.showSection('comparisonSection');
        this.hideSection('data-section');
        this.hideSection('trendsSection');

        Utils.showNotification(`Showing comparison for ${sortedWeeks.length} weeks`, 'success');
    }

    // Create geomean comparison table across all weeks
    createGeomeanComparisonTable(weeks) {
        const comparisonSection = document.getElementById('comparisonSection');
        if (!comparisonSection) return;

        // Clear existing content
        const existingTable = comparisonSection.querySelector('.comparison-table');
        if (existingTable) {
            existingTable.remove();
        }

        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container comparison-table';
        
        const title = document.createElement('h3');
        title.textContent = 'Geomean CDYN Comparison Across All Weeks';
        tableContainer.appendChild(title);

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';
        
        const table = document.createElement('table');
        table.className = 'data-table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Week', 'Geomean (3plus7)', 'Geomean (no roms & gcc)', 'Change from Previous'];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body with data
        const tbody = document.createElement('tbody');
        let prevGeomean = null;

        weeks.forEach((week, index) => {
            const weekData = dataManager.getWeekData(week);
            if (!weekData || !weekData.cdynTable) return;

            const geomeanRow = weekData.cdynTable.find(row => 
                row['Test Name'] && row['Test Name'].includes('geomean (3plus7)'));
            const geomeanNoRomsRow = weekData.cdynTable.find(row => 
                row['Test Name'] && row['Test Name'].includes('geomean(no roms & gcc)'));

            const tr = document.createElement('tr');
            
            // Week
            const td1 = document.createElement('td');
            td1.textContent = week;
            tr.appendChild(td1);

            // Geomean (3plus7)
            const td2 = document.createElement('td');
            const geomean3plus7 = geomeanRow ? geomeanRow['Cdyn'] : null;
            td2.textContent = geomean3plus7 !== null ? Utils.formatNumber(geomean3plus7) : '-';
            td2.style.textAlign = 'right';
            tr.appendChild(td2);

            // Geomean (no roms & gcc)
            const td3 = document.createElement('td');
            const geomeanNoRoms = geomeanNoRomsRow ? geomeanNoRomsRow['Cdyn'] : null;
            td3.textContent = geomeanNoRoms !== null ? Utils.formatNumber(geomeanNoRoms) : '-';
            td3.style.textAlign = 'right';
            tr.appendChild(td3);

            // Change from previous
            const td4 = document.createElement('td');
            if (prevGeomean !== null && geomean3plus7 !== null) {
                const change = ((geomean3plus7 - prevGeomean) / prevGeomean) * 100;
                td4.textContent = (change >= 0 ? '+' : '') + Utils.formatPercentage(change);
                td4.style.textAlign = 'right';
                
                // Color code the change
                if (change > 0) {
                    td4.style.color = '#f56565'; // Red for increase
                } else if (change < 0) {
                    td4.style.color = '#48bb78'; // Green for decrease
                }
            } else {
                td4.textContent = '-';
                td4.style.textAlign = 'center';
            }
            tr.appendChild(td4);

            tbody.appendChild(tr);
            
            if (geomean3plus7 !== null) {
                prevGeomean = geomean3plus7;
            }
        });

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);

        // Insert after the comparison controls
        const comparisonResults = document.getElementById('comparisonResults');
        if (comparisonResults) {
            comparisonResults.innerHTML = '';
            comparisonResults.appendChild(tableContainer);
        }
    }

    // Toggle chart display
    toggleChart(chartId) {
        const chartContainer = document.getElementById(chartId);
        if (!chartContainer) return;

        if (chartContainer.classList.contains('hidden')) {
            chartContainer.classList.remove('hidden');
            
            // Initialize chart if needed
            if (this.currentWeek) {
                this.renderChart(chartId, this.currentWeek);
            }
        } else {
            chartContainer.classList.add('hidden');
        }
    }

    // Render chart for current week data
    renderChart(chartId, weekNumber) {
        const weekData = dataManager.getWeekData(weekNumber);
        if (!weekData) return;

        const canvasId = chartId.replace('Chart', 'Canvas');
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Determine chart type and data
        let chartData = null;
        let chartOptions = {};

        switch (chartId) {
            case 'cdynChart':
                chartData = this.prepareCdynChartData(weekData.cdynTable);
                chartOptions = this.getBarChartOptions('CDYN Values');
                break;
            case 'previousRollupChart':
                chartData = this.prepareRollupChartData(weekData.previousRollup, 'Sum of rlp_cdyn_pf');
                chartOptions = this.getBarChartOptions('Previous Rollup CDYN');
                break;
            case 'oldPdkChart':
                chartData = this.preparePercentageChartData(weekData.oldPdkRollup, '%Diff_Cdyn');
                chartOptions = this.getBarChartOptions('% Change from OLD PDK');
                break;
        }

        if (chartData) {
            // Destroy existing chart if exists
            if (canvas.chartInstance) {
                canvas.chartInstance.destroy();
            }

            // Create new chart
            canvas.chartInstance = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: chartData,
                options: chartOptions
            });
        }
    }

    // Prepare CDYN chart data
    prepareCdynChartData(data) {
        if (!data || data.length === 0) return null;

        // Filter out geomean rows for cleaner display
        const filteredData = data.filter(row => 
            row['Test Name'] && !row['Test Name'].includes('geomean'));

        const labels = filteredData.map(row => row['Test Name'] || '');
        const cdynValues = filteredData.map(row => row['Cdyn'] || 0);
        const adjustedValues = filteredData.map(row => row['PNC Adjusted Cdyn'] || 0);

        return {
            labels: labels,
            datasets: [
                {
                    label: 'CDYN',
                    data: cdynValues,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '80',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 1
                },
                {
                    label: 'PNC Adjusted CDYN',
                    data: adjustedValues,
                    backgroundColor: CONFIG.CHART_COLORS.secondary + '80',
                    borderColor: CONFIG.CHART_COLORS.secondary,
                    borderWidth: 1
                }
            ]
        };
    }

    // Prepare rollup chart data
    prepareRollupChartData(data, valueField) {
        if (!data || data.length === 0) return null;

        // Filter out total rows
        const filteredData = data.filter(row => 
            row['Partition Name'] && 
            !row['Partition Name'].includes('Grand Total') &&
            !row['Partition Name'].includes('All_Scenario'));

        const labels = filteredData.map(row => 
            (row['Partition Name'] || '').replace('par_', ''));
        const values = filteredData.map(row => row[valueField] || 0);

        return {
            labels: labels,
            datasets: [{
                label: valueField,
                data: values,
                backgroundColor: CONFIG.COLOR_PALETTE.map(color => color + '80'),
                borderColor: CONFIG.COLOR_PALETTE,
                borderWidth: 1
            }]
        };
    }

    // Prepare percentage chart data
    preparePercentageChartData(data, valueField) {
        if (!data || data.length === 0) return null;

        // Filter out total rows
        const filteredData = data.filter(row => 
            row['Partition Name'] && 
            !row['Partition Name'].includes('All_Scenario'));

        const labels = filteredData.map(row => 
            (row['Partition Name'] || '').replace('par_', ''));
        const values = filteredData.map(row => row[valueField] || 0);

        return {
            labels: labels,
            datasets: [{
                label: valueField.replace('_', ' '),
                data: values,
                backgroundColor: values.map(val => 
                    val >= 0 ? CONFIG.CHART_COLORS.danger + '80' : CONFIG.CHART_COLORS.success + '80'),
                borderColor: values.map(val => 
                    val >= 0 ? CONFIG.CHART_COLORS.danger : CONFIG.CHART_COLORS.success),
                borderWidth: 1
            }]
        };
    }

    // Get bar chart options
    getBarChartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        };
    }

    // Utility methods
    updateSectionTitle(title) {
        const dataSection = document.querySelector('.data-section h2');
        if (dataSection) {
            dataSection.textContent = title;
        }
    }

    showSection(sectionIdOrClass) {
        const section = document.getElementById(sectionIdOrClass) || 
                       document.querySelector('.' + sectionIdOrClass);
        if (section) {
            section.classList.remove('hidden');
        }
    }

    hideSection(sectionIdOrClass) {
        const section = document.getElementById(sectionIdOrClass) || 
                       document.querySelector('.' + sectionIdOrClass);
        if (section) {
            section.classList.add('hidden');
        }
    }

    // Initialize tables on page load
    initialize() {
        this.updateWeekSelection();
        
        // Update last updated time
        const stats = dataManager.getSummaryStats();
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement && stats.lastUpdated) {
            const date = new Date(stats.lastUpdated);
            lastUpdatedElement.textContent = date.toLocaleString();
        }
    }

    // Clear all tables
    clearAllTables() {
        const tables = ['cdynTable', 'previousRollupTable', 'oldPdkTable'];
        tables.forEach(tableId => {
            const table = document.getElementById(tableId);
            if (table) {
                const thead = table.querySelector('thead');
                const tbody = table.querySelector('tbody');
                if (thead) thead.innerHTML = '';
                if (tbody) tbody.innerHTML = '';
            }
        });

        // Hide charts
        const charts = ['cdynChart', 'previousRollupChart', 'oldPdkChart'];
        charts.forEach(chartId => {
            const chart = document.getElementById(chartId);
            if (chart) {
                chart.classList.add('hidden');
            }
        });

        // Reset week selection
        const weekSelect = document.getElementById('weekSelect');
        if (weekSelect) {
            weekSelect.innerHTML = '<option value="">Select a week...</option>';
        }

        this.currentWeek = null;
    }
}

// Initialize global table manager
const tableManager = new TableManager();