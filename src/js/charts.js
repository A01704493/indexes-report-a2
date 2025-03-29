/**
 * Charts.js - Visualization components for Stock Market Indices Analysis
 * 
 * This file handles all chart rendering using Chart.js
 * With enhanced styling, animations and interactivity
 */

// Color palette for consistent styling across charts - more vibrant colors
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

// Global chart styling
Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#555555';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 15;

// Grid line configuration for better readability
const gridLineConfig = {
    color: 'rgba(0, 0, 0, 0.05)',
    zeroLineColor: 'rgba(0, 0, 0, 0.1)'
};

// Animation configuration
const animationConfig = {
    duration: 2000,
    easing: 'easeOutQuart'
};

// Function to initialize all charts
const initializeCharts = (data, bestPerformers, worstPerformers) => {
    // Create main performance comparison chart
    createMainPerformanceChart(data);
    
    // Create charts for best performers
    createPerformerChart('bestChart1', bestPerformers[0], 'rgba(40, 167, 69, 1)', 'rgba(40, 167, 69, 0.2)');
    createPerformerChart('bestChart2', bestPerformers[1], 'rgba(32, 201, 151, 1)', 'rgba(32, 201, 151, 0.2)');
    
    // Create charts for worst performers
    createPerformerChart('worstChart1', worstPerformers[0], 'rgba(220, 53, 69, 1)', 'rgba(220, 53, 69, 0.2)');
    createPerformerChart('worstChart2', worstPerformers[1], 'rgba(253, 126, 20, 1)', 'rgba(253, 126, 20, 0.2)');
    
    // Create volatility comparison chart
    createVolatilityChart(data);
};

// Function to create the main performance comparison chart
const createMainPerformanceChart = (data) => {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // Add gradient background
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(54, 162, 235, 0.1)');
    gradientFill.addColorStop(1, 'rgba(54, 162, 235, 0)');
    
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
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            hidden: !visible,
            pointStyle: 'circle',
            pointBackgroundColor: CHART_COLORS[i % CHART_COLORS.length],
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            fill: i === 0 ? { target: 'origin', above: gradientFill } : false
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
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear',
                    from: 0,
                    to: 0.4,
                    loop: false
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
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: gridLineConfig
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Return (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}%`
                    },
                    grid: gridLineConfig
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '10-Year Performance Comparison (2013-2023)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    },
                    usePointStyle: true
                },
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        padding: 20
                    },
                    onHover: (event, legendItem, legend) => {
                        document.body.style.cursor = 'pointer';
                    },
                    onLeave: (event, legendItem, legend) => {
                        document.body.style.cursor = 'default';
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    }
                }
            }
        }
    });
};

// Function to create individual performer charts
const createPerformerChart = (canvasId, indexData, lineColor, fillColor) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Add gradient background
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 250);
    gradientFill.addColorStop(0, fillColor);
    gradientFill.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Calculate percentage change from start
    const normalizedData = indexData.monthlyData.map(d => {
        return {
            x: d.date,
            y: (d.value / indexData.startValue - 1) * 100
        };
    });
    
    // Create annotations for important events
    const annotations = {
        covidCrash: {
            type: 'line',
            xMin: '2020-03',
            xMax: '2020-03',
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                content: 'COVID-19',
                enabled: true,
                position: 'top',
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                font: {
                    size: 11
                }
            }
        }
    };
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: indexData.name,
                data: normalizedData,
                borderColor: lineColor,
                backgroundColor: gradientFill,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: animationConfig,
            plugins: {
                title: {
                    display: true,
                    text: `${indexData.name} Performance (2013-2023)`,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 15
                    },
                    color: '#333'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Return: ${context.parsed.y.toFixed(2)}%`;
                        }
                    },
                    usePointStyle: true
                },
                legend: {
                    display: false
                },
                annotation: {
                    annotations: annotations
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
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Return (%)',
                        font: {
                            weight: 'bold',
                            size: 11
                        }
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}%`,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
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
            totalReturn: index.totalReturn * 100,
            r: 10 + Math.abs(index.totalReturn * 20) // Size based on total return
        };
    });
    
    // Create efficient frontier curve data (simplified)
    const minX = Math.min(...scatterData.map(point => point.x)) - 2;
    const maxX = Math.max(...scatterData.map(point => point.x)) + 2;
    const efficientFrontierPoints = [];
    
    for (let x = minX; x <= maxX; x += 0.5) {
        // Simplified efficient frontier: y = sqrt(x) * 1.5 - 3
        // This is just for visualization purposes
        const y = Math.sqrt(x) * 1.5 - 3;
        efficientFrontierPoints.push({x, y});
    }
    
    // Create the chart
    const volatilityChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [
                {
                    label: 'Indices',
                    data: scatterData,
                    backgroundColor: CHART_COLORS,
                    hoverBackgroundColor: CHART_COLORS.map(color => color.replace('1)', '0.8)')),
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointStyle: 'circle'
                },
                {
                    label: 'Efficient Frontier',
                    type: 'line',
                    data: efficientFrontierPoints,
                    borderColor: 'rgba(120, 120, 120, 0.5)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: {
                radius: {
                    duration: 1500,
                    easing: 'easeOutElastic',
                    from: 0,
                    delay: (context) => {
                        return context.dataIndex * 100;
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Risk-Return Profile of Global Indices (2013-2023)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
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
                    },
                    bodyFont: {
                        size: 12
                    },
                    boxPadding: 5
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                annotation: {
                    annotations: {
                        optimalLabel: {
                            type: 'label',
                            xValue: maxX - 1,
                            yValue: Math.sqrt(maxX - 1) * 1.5 - 3,
                            content: ['Optimal', 'Risk/Return'],
                            backgroundColor: 'rgba(120, 120, 120, 0.3)',
                            font: {
                                size: 11
                            },
                            padding: 5,
                            borderRadius: 3
                        }
                    }
                },
                quadrants: {
                    topLeft: {
                        label: 'High Return, Low Risk',
                        color: 'rgba(40, 167, 69, 0.1)'
                    },
                    bottomRight: {
                        label: 'High Risk, Low Return',
                        color: 'rgba(220, 53, 69, 0.1)'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Volatility (Annualized Standard Deviation, %)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(1)}%`
                    },
                    grid: gridLineConfig,
                    min: minX
                },
                y: {
                    title: {
                        display: true,
                        text: 'Annualized Return (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: (value) => `${value.toFixed(1)}%`
                    },
                    grid: gridLineConfig
                }
            }
        }
    });
};
