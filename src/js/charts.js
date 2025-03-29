/**
 * Charts.js - Visualization components for Stock Market Indices Analysis
 * 
 * This file handles all chart rendering using Chart.js
 */

// Color palette for consistent styling across charts
const CHART_COLORS = [
    'rgba(54, 162, 235, 1)',      // Blue
    'rgba(255, 99, 132, 1)',      // Red
    'rgba(75, 192, 192, 1)',      // Green
    'rgba(255, 159, 64, 1)',      // Orange
    'rgba(153, 102, 255, 1)',     // Purple
    'rgba(255, 205, 86, 1)',      // Yellow
    'rgba(201, 203, 207, 1)',     // Grey
    'rgba(255, 99, 71, 1)',       // Tomato
    'rgba(46, 139, 87, 1)',       // Sea Green
    'rgba(106, 90, 205, 1)'       // Slate Blue
];

// Transparent versions of the colors for fill areas
const CHART_COLORS_TRANSPARENT = CHART_COLORS.map(color => color.replace('1)', '0.2)'));

// Function to initialize all charts
const initializeCharts = (data, bestPerformers, worstPerformers) => {
    // Create main performance comparison chart
    createMainPerformanceChart(data);
    
    // Create charts for best performers
    createPerformerChart('bestChart1', bestPerformers[0], 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
    createPerformerChart('bestChart2', bestPerformers[1], 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 0.2)');
    
    // Create charts for worst performers
    createPerformerChart('worstChart1', worstPerformers[0], 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.2)');
    createPerformerChart('worstChart2', worstPerformers[1], 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 0.2)');
    
    // Create volatility comparison chart
    createVolatilityChart(data);
};

// Function to create the main performance comparison chart
const createMainPerformanceChart = (data) => {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // Prepare datasets
    const datasets = data.map((index, i) => {
        // Only show first 5 indices by default to avoid overcrowding
        const visible = i < 5;
        
        return {
            label: index.name,
            data: index.monthlyData.map(d => {
                return {
                    x: d.date,
                    y: (d.value / index.startValue - 1) * 100 // Convert to percentage change from start
                };
            }),
            borderColor: CHART_COLORS[i % CHART_COLORS.length],
            backgroundColor: CHART_COLORS_TRANSPARENT[i % CHART_COLORS.length],
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            hidden: !visible
        };
    });
    
    // Create the chart
    const mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Return (%)'
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}%`
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '10-Year Performance Comparison (2013-2023)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
};

// Function to create individual performer charts
const createPerformerChart = (canvasId, indexData, lineColor, fillColor) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Calculate percentage change from start
    const normalizedData = indexData.monthlyData.map(d => {
        return {
            x: d.date,
            y: (d.value / indexData.startValue - 1) * 100
        };
    });
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: indexData.name,
                data: normalizedData,
                borderColor: lineColor,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${indexData.name} Performance (2013-2023)`,
                    font: {
                        size: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Return: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        displayFormats: {
                            year: 'yyyy'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Return (%)'
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}%`
                    }
                }
            }
        }
    });
};

// Function to create the volatility comparison chart
const createVolatilityChart = (data) => {
    const ctx = document.getElementById('volatilityChart').getContext('2d');
    
    // Prepare data for volatility vs return scatter plot
    const scatterData = data.map((index, i) => {
        return {
            x: index.volatility * 100, // Convert to percentage
            y: index.annualizedReturn * 100, // Convert to percentage
            indexName: index.name,
            totalReturn: index.totalReturn * 100
        };
    });
    
    // Create the chart
    const volatilityChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Indices',
                data: scatterData,
                backgroundColor: CHART_COLORS,
                pointRadius: 10,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Risk-Return Profile of Global Indices (2013-2023)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const point = context.raw;
                            return [
                                `Index: ${point.indexName}`,
                                `Annualized Return: ${point.y.toFixed(2)}%`,
                                `Volatility (Risk): ${point.x.toFixed(2)}%`,
                                `Total 10-Year Return: ${point.totalReturn.toFixed(2)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Volatility (Annualized Standard Deviation, %)'
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(1)}%`
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Annualized Return (%)'
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(1)}%`
                    }
                }
            }
        }
    });
};
