// Chart Manager - Handles advanced chart visualizations and trends
class ChartManager {
    constructor() {
        this.chartInstances = {};
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const showTrendsBtn = document.getElementById('showTrendsBtn');
        if (showTrendsBtn) {
            showTrendsBtn.addEventListener('click', () => {
                this.showTrendsAnalysis();
            });
        }

        const compareWeeksBtn = document.getElementById('compareWeeksBtn');
        if (compareWeeksBtn) {
            compareWeeksBtn.addEventListener('click', () => {
                this.compareWeeks();
            });
        }
    }

    // Show trends analysis section
    showTrendsAnalysis() {
        const weeks = dataManager.getWeeksList();
        
        if (weeks.length < 2) {
            Utils.showNotification('Need at least 2 weeks of data for trend analysis', 'error');
            return;
        }

        // Show trends section and hide others
        document.getElementById('trendsSection').classList.remove('hidden');
        document.querySelector('.data-section').classList.add('hidden');
        document.getElementById('comparisonSection').classList.add('hidden');

        // Generate trend charts
        this.generateGeomeanTrend();
        this.generatePartitionTrend();
        this.generateIpcTrend();

        Utils.showNotification('Trends analysis loaded', 'success');
    }

    // Generate geomean trend chart
    generateGeomeanTrend() {
        const canvas = document.getElementById('geomeanTrendChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.chartInstances.geomeanTrend) {
            this.chartInstances.geomeanTrend.destroy();
        }

        const trendData = dataManager.getTrendData('geomean', 'cdynTable');
        
        this.chartInstances.geomeanTrend = new Chart(canvas, {
            type: 'line',
            data: trendData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Geomean CDYN Trend Over Time',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'CDYN Value'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Week'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Generate partition trend chart
    generatePartitionTrend() {
        const canvas = document.getElementById('partitionTrendChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.chartInstances.partitionTrend) {
            this.chartInstances.partitionTrend.destroy();
        }

        const trendData = dataManager.getPartitionTrendData();
        
        // Limit to top 6 partitions for readability
        const limitedData = {
            ...trendData,
            datasets: trendData.datasets.slice(0, 6)
        };

        this.chartInstances.partitionTrend = new Chart(canvas, {
            type: 'line',
            data: limitedData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Partition Changes Over Time (% Change from OLD PDK)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatPercentage(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Percentage Change (%)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return Utils.formatPercentage(value);
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Week'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Generate IPC trend chart
    generateIpcTrend() {
        const canvas = document.getElementById('ipcTrendChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.chartInstances.ipcTrend) {
            this.chartInstances.ipcTrend.destroy();
        }

        const ipcTrendData = this.getIpcTrendData();

        this.chartInstances.ipcTrend = new Chart(canvas, {
            type: 'line',
            data: ipcTrendData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'IPC Performance Trends',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatNumber(context.parsed.y, 3);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'IPC Value'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Week'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Get IPC trend data across weeks
    getIpcTrendData() {
        const weeks = dataManager.getWeeksList();
        const sortedWeeks = Utils.sortWeeks(weeks);
        
        const ipcTypes = ['PNC DMR IPC', 'LNC IPC', 'PNC POR IPC'];
        const datasets = [];

        ipcTypes.forEach((ipcType, index) => {
            const data = sortedWeeks.map(week => {
                const weekData = dataManager.getWeekData(week);
                if (weekData && weekData.cdynTable) {
                    // Calculate average IPC for non-geomean rows
                    const validRows = weekData.cdynTable.filter(row => 
                        row['Test Name'] && 
                        !row['Test Name'].includes('geomean') &&
                        row[ipcType] !== null && 
                        row[ipcType] !== undefined);
                    
                    if (validRows.length > 0) {
                        const sum = validRows.reduce((acc, row) => acc + (row[ipcType] || 0), 0);
                        return sum / validRows.length;
                    }
                }
                return null;
            });

            datasets.push({
                label: ipcType,
                data: data,
                borderColor: CONFIG.COLOR_PALETTE[index],
                backgroundColor: CONFIG.COLOR_PALETTE[index] + '20',
                tension: 0.3,
                fill: false
            });
        });

        return {
            labels: sortedWeeks,
            datasets: datasets
        };
    }

    // Compare two specific weeks
    compareWeeks() {
        const week1 = document.getElementById('week1Select').value;
        const week2 = document.getElementById('week2Select').value;

        if (!week1 || !week2) {
            Utils.showNotification('Please select both weeks for comparison', 'error');
            return;
        }

        if (week1 === week2) {
            Utils.showNotification('Please select different weeks for comparison', 'error');
            return;
        }

        const week1Data = dataManager.getWeekData(week1);
        const week2Data = dataManager.getWeekData(week2);

        if (!week1Data || !week2Data) {
            Utils.showNotification('Data not available for one or both selected weeks', 'error');
            return;
        }

        this.generateWeekComparison(week1, week1Data, week2, week2Data);
        
        // Show comparison section
        document.getElementById('comparisonSection').classList.remove('hidden');
        document.querySelector('.data-section').classList.add('hidden');
        document.getElementById('trendsSection').classList.add('hidden');

        Utils.showNotification(`Comparison between ${week1} and ${week2} generated`, 'success');
    }

    // Generate week-to-week comparison
    generateWeekComparison(week1, data1, week2, data2) {
        const comparisonResults = document.getElementById('comparisonResults');
        if (!comparisonResults) return;

        comparisonResults.innerHTML = '';

        // Create comparison charts
        this.createComparisonChart(week1, data1, week2, data2, 'cdyn', 'CDYN Comparison');
        this.createComparisonChart(week1, data1, week2, data2, 'ipc', 'IPC Comparison');
        this.createPartitionComparisonChart(week1, data1, week2, data2);
    }

    // Create comparison chart for CDYN or IPC data
    createComparisonChart(week1, data1, week2, data2, type, title) {
        const container = document.createElement('div');
        container.className = 'comparison-chart';
        
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = `${title}: ${week1} vs ${week2}`;
        container.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        let chartData;
        if (type === 'cdyn') {
            chartData = this.prepareCdynComparisonData(week1, data1, week2, data2);
        } else {
            chartData = this.prepareIpcComparisonData(week1, data1, week2, data2);
        }

        new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: type === 'ipc'
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
            }
        });

        document.getElementById('comparisonResults').appendChild(container);
    }

    // Prepare CDYN comparison data
    prepareCdynComparisonData(week1, data1, week2, data2) {
        const testNames = [];
        const week1Values = [];
        const week2Values = [];

        // Get test names from both datasets (excluding geomean for cleaner view)
        const validTests = new Set();
        
        if (data1.cdynTable) {
            data1.cdynTable.forEach(row => {
                if (row['Test Name'] && !row['Test Name'].includes('geomean')) {
                    validTests.add(row['Test Name']);
                }
            });
        }

        validTests.forEach(testName => {
            testNames.push(testName);
            
            // Get values from week 1
            const week1Row = data1.cdynTable?.find(row => row['Test Name'] === testName);
            week1Values.push(week1Row ? (week1Row['Cdyn'] || 0) : 0);
            
            // Get values from week 2
            const week2Row = data2.cdynTable?.find(row => row['Test Name'] === testName);
            week2Values.push(week2Row ? (week2Row['Cdyn'] || 0) : 0);
        });

        return {
            labels: testNames,
            datasets: [
                {
                    label: week1,
                    data: week1Values,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '80',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 1
                },
                {
                    label: week2,
                    data: week2Values,
                    backgroundColor: CONFIG.CHART_COLORS.secondary + '80',
                    borderColor: CONFIG.CHART_COLORS.secondary,
                    borderWidth: 1
                }
            ]
        };
    }

    // Prepare IPC comparison data
    prepareIpcComparisonData(week1, data1, week2, data2) {
        const testNames = [];
        const week1IPC = [];
        const week2IPC = [];

        // Focus on PNC DMR IPC for comparison
        const validTests = new Set();
        
        if (data1.cdynTable) {
            data1.cdynTable.forEach(row => {
                if (row['Test Name'] && !row['Test Name'].includes('geomean')) {
                    validTests.add(row['Test Name']);
                }
            });
        }

        validTests.forEach(testName => {
            testNames.push(testName);
            
            // Get IPC values from week 1
            const week1Row = data1.cdynTable?.find(row => row['Test Name'] === testName);
            week1IPC.push(week1Row ? (week1Row['PNC DMR IPC'] || 0) : 0);
            
            // Get IPC values from week 2
            const week2Row = data2.cdynTable?.find(row => row['Test Name'] === testName);
            week2IPC.push(week2Row ? (week2Row['PNC DMR IPC'] || 0) : 0);
        });

        return {
            labels: testNames,
            datasets: [
                {
                    label: `${week1} - PNC DMR IPC`,
                    data: week1IPC,
                    backgroundColor: CONFIG.CHART_COLORS.info + '80',
                    borderColor: CONFIG.CHART_COLORS.info,
                    borderWidth: 1
                },
                {
                    label: `${week2} - PNC DMR IPC`,
                    data: week2IPC,
                    backgroundColor: CONFIG.CHART_COLORS.warning + '80',
                    borderColor: CONFIG.CHART_COLORS.warning,
                    borderWidth: 1
                }
            ]
        };
    }

    // Create partition comparison chart
    createPartitionComparisonChart(week1, data1, week2, data2) {
        const container = document.createElement('div');
        container.className = 'comparison-chart';
        
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = `Partition % Changes: ${week1} vs ${week2}`;
        container.appendChild(chartTitle);

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const chartData = this.preparePartitionComparisonData(week1, data1, week2, data2);

        new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Percentage Change (%)'
                        },
                        ticks: {
                            callback: function(value) {
                                return Utils.formatPercentage(value);
                            }
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
            }
        });

        document.getElementById('comparisonResults').appendChild(container);
    }

    // Prepare partition comparison data
    preparePartitionComparisonData(week1, data1, week2, data2) {
        const partitionNames = [];
        const week1Changes = [];
        const week2Changes = [];

        // Get partition names (excluding totals)
        const validPartitions = new Set();
        
        if (data1.oldPdkRollup) {
            data1.oldPdkRollup.forEach(row => {
                if (row['Partition Name'] && !row['Partition Name'].includes('All_Scenario')) {
                    validPartitions.add(row['Partition Name']);
                }
            });
        }

        validPartitions.forEach(partitionName => {
            partitionNames.push(partitionName.replace('par_', ''));
            
            // Get % changes from week 1
            const week1Row = data1.oldPdkRollup?.find(row => row['Partition Name'] === partitionName);
            week1Changes.push(week1Row ? (week1Row['%Diff_Cdyn'] || 0) : 0);
            
            // Get % changes from week 2
            const week2Row = data2.oldPdkRollup?.find(row => row['Partition Name'] === partitionName);
            week2Changes.push(week2Row ? (week2Row['%Diff_Cdyn'] || 0) : 0);
        });

        return {
            labels: partitionNames,
            datasets: [
                {
                    label: `${week1} - % Change`,
                    data: week1Changes,
                    backgroundColor: CONFIG.CHART_COLORS.success + '80',
                    borderColor: CONFIG.CHART_COLORS.success,
                    borderWidth: 1
                },
                {
                    label: `${week2} - % Change`,
                    data: week2Changes,
                    backgroundColor: CONFIG.CHART_COLORS.danger + '80',
                    borderColor: CONFIG.CHART_COLORS.danger,
                    borderWidth: 1
                }
            ]
        };
    }

    // Destroy all chart instances
    destroyAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.chartInstances = {};
    }
}

// Initialize global chart manager
const chartManager = new ChartManager();