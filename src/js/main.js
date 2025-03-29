/**
 * Main JavaScript file for Stock Market Indices Analysis Report
 * 
 * This file handles:
 * - Loading market data
 * - Populating tables and text content
 * - Initializing the UI components
 * - Interactive features and animations
 */

// Configuration for the indices we're analyzing
const INDICES = [
    { symbol: 'SPX', name: 'S&P 500', country: 'United States' },
    { symbol: 'DJIA', name: 'Dow Jones Industrial Average', country: 'United States' },
    { symbol: 'COMP', name: 'NASDAQ Composite', country: 'United States' },
    { symbol: 'FTSE', name: 'FTSE 100', country: 'United Kingdom' },
    { symbol: 'DAX', name: 'DAX', country: 'Germany' },
    { symbol: 'CAC', name: 'CAC 40', country: 'France' },
    { symbol: 'N225', name: 'Nikkei 225', country: 'Japan' },
    { symbol: 'HSI', name: 'Hang Seng Index', country: 'Hong Kong' },
    { symbol: 'SSEC', name: 'Shanghai Composite', country: 'China' },
    { symbol: 'BSESN', name: 'BSE SENSEX', country: 'India' }
];

// Mock data for development purposes
// In a real-world scenario, this would be fetched from an API
const generateMockData = () => {
    const startDate = new Date(2013, 0, 1);
    const endDate = new Date(2023, 0, 1);
    
    // Generate random performance data for each index
    return INDICES.map(index => {
        // Generate a random starting value between 1000 and 5000
        const startValue = Math.floor(Math.random() * 4000) + 1000;
        
        // Generate random yearly returns between -20% and +40%
        const yearlyReturns = Array(10).fill().map(() => Math.random() * 0.6 - 0.2);
        
        // Calculate cumulative returns
        let cumulativeReturn = 1;
        const returns = yearlyReturns.map(ret => {
            cumulativeReturn *= (1 + ret);
            return cumulativeReturn;
        });
        
        // Calculate monthly data points for the 10-year period
        const monthlyData = [];
        let currentValue = startValue;
        
        for (let year = 0; year < 10; year++) {
            const yearReturn = yearlyReturns[year];
            const monthlyReturn = Math.pow(1 + yearReturn, 1/12) - 1;
            
            for (let month = 0; month < 12; month++) {
                // Add some random noise to make it look more realistic
                const noise = (Math.random() - 0.5) * 0.02;
                currentValue *= (1 + monthlyReturn + noise);
                
                const date = new Date(2013 + year, month, 1);
                monthlyData.push({
                    date: date.toISOString().slice(0, 7), // YYYY-MM format
                    value: Math.round(currentValue * 100) / 100
                });
            }
        }
        
        // Calculate volatility (standard deviation of returns)
        const monthlyReturns = monthlyData.slice(1).map((data, i) => 
            (data.value - monthlyData[i].value) / monthlyData[i].value
        );
        const meanReturn = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
        const squaredDiffs = monthlyReturns.map(ret => Math.pow(ret - meanReturn, 2));
        const volatility = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length) * Math.sqrt(12); // Annualized
        
        return {
            ...index,
            startValue,
            endValue: monthlyData[monthlyData.length - 1].value,
            totalReturn: (monthlyData[monthlyData.length - 1].value / startValue) - 1,
            annualizedReturn: Math.pow((monthlyData[monthlyData.length - 1].value / startValue), 1/10) - 1,
            volatility,
            monthlyData
        };
    });
};

// Function to initialize the report
const initializeReport = (data) => {
    // Sort indices by total return
    const sortedIndices = [...data].sort((a, b) => b.totalReturn - a.totalReturn);
    
    // Get best and worst performers
    const bestPerformers = sortedIndices.slice(0, 2);
    const worstPerformers = sortedIndices.slice(-2).reverse();
    
    // Populate overview table
    populateIndicesTable(sortedIndices);
    
    // Initialize charts
    initializeCharts(data, bestPerformers, worstPerformers);
    
    // Populate best/worst performer sections
    populatePerformerSections(bestPerformers, worstPerformers);
    
    // Populate analysis sections
    populateAnalysisSections(bestPerformers, worstPerformers);
    
    // Set up PDF download link
    document.getElementById('download-pdf').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('PDF generation is being processed...', 'info');
        
        // Simulate PDF generation delay
        setTimeout(() => {
            showNotification('The PDF report is ready for download!', 'success');
            // In a real implementation, this would trigger the actual PDF download
            // window.location.href = 'Stock_Market_Indices_Report.pdf';
        }, 2000);
    });
    
    // Initialize UI enhancements
    initializeUIEnhancements();
};

// Function to populate the indices table
const populateIndicesTable = (indices) => {
    const tableBody = document.getElementById('indices-table');
    tableBody.innerHTML = '';
    
    indices.forEach((index, i) => {
        const row = document.createElement('tr');
        
        // Add highlight class for best and worst performers
        if (i < 2) {
            row.classList.add('table-success');
        } else if (i >= indices.length - 2) {
            row.classList.add('table-danger');
        }
        
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `<strong>${index.name}</strong>`;
        row.appendChild(nameCell);
        
        const countryCell = document.createElement('td');
        countryCell.textContent = index.country;
        row.appendChild(countryCell);
        
        const returnCell = document.createElement('td');
        const returnValue = (index.totalReturn * 100).toFixed(2);
        returnCell.innerHTML = `<span class="${returnValue >= 0 ? 'text-success' : 'text-danger'}">${returnValue}%</span>`;
        row.appendChild(returnCell);
        
        const volatilityCell = document.createElement('td');
        volatilityCell.innerHTML = `<span class="text-secondary">${(index.volatility * 100).toFixed(2)}%</span>`;
        row.appendChild(volatilityCell);
        
        tableBody.appendChild(row);
        
        // Add animation delay based on index
        row.style.animationDelay = `${i * 0.1}s`;
    });
};

// Function to populate the performer sections
const populatePerformerSections = (bestPerformers, worstPerformers) => {
    // Best performers
    document.getElementById('best-index-1').textContent = bestPerformers[0].name;
    document.getElementById('best-index-2').textContent = bestPerformers[1].name;
    
    // Worst performers
    document.getElementById('worst-index-1').textContent = worstPerformers[0].name;
    document.getElementById('worst-index-2').textContent = worstPerformers[1].name;
    
    // Add analysis text
    document.getElementById('best-analysis-1').innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">10-Year Return:</span>
                <span class="stat-value text-success">${(bestPerformers[0].totalReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Annualized Return:</span>
                <span class="stat-value text-success">${(bestPerformers[0].annualizedReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Volatility:</span>
                <span class="stat-value">${(bestPerformers[0].volatility * 100).toFixed(2)}%</span>
            </div>
        </div>
        <p class="mt-3">The ${bestPerformers[0].name} has shown exceptional performance over the last decade, driven by strong economic growth, technological innovation, and favorable monetary policies.</p>
    `;
    
    document.getElementById('best-analysis-2').innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">10-Year Return:</span>
                <span class="stat-value text-success">${(bestPerformers[1].totalReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Annualized Return:</span>
                <span class="stat-value text-success">${(bestPerformers[1].annualizedReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Volatility:</span>
                <span class="stat-value">${(bestPerformers[1].volatility * 100).toFixed(2)}%</span>
            </div>
        </div>
        <p class="mt-3">The ${bestPerformers[1].name} has delivered consistent growth throughout the decade, benefiting from strong market fundamentals and strategic sectoral positioning.</p>
    `;
    
    document.getElementById('worst-analysis-1').innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">10-Year Return:</span>
                <span class="stat-value text-danger">${(worstPerformers[0].totalReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Annualized Return:</span>
                <span class="stat-value text-danger">${(worstPerformers[0].annualizedReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Volatility:</span>
                <span class="stat-value">${(worstPerformers[0].volatility * 100).toFixed(2)}%</span>
            </div>
        </div>
        <p class="mt-3">The ${worstPerformers[0].name} has underperformed relative to other global indices, facing challenges from economic uncertainty, regulatory pressures, and structural market changes.</p>
    `;
    
    document.getElementById('worst-analysis-2').innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">10-Year Return:</span>
                <span class="stat-value text-danger">${(worstPerformers[1].totalReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Annualized Return:</span>
                <span class="stat-value text-danger">${(worstPerformers[1].annualizedReturn * 100).toFixed(2)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Volatility:</span>
                <span class="stat-value">${(worstPerformers[1].volatility * 100).toFixed(2)}%</span>
            </div>
        </div>
        <p class="mt-3">The ${worstPerformers[1].name} has struggled with consistent growth, impacted by geopolitical tensions, currency fluctuations, and sector-specific challenges.</p>
    `;
};

// Function to populate analysis sections
const populateAnalysisSections = (bestPerformers, worstPerformers) => {
    // Economic factors
    document.getElementById('economic-factors').innerHTML = `
        <h4 class="analysis-title">Global Economic Trends (2013-2023)</h4>
        <p>The past decade has witnessed significant economic events that shaped the performance of global stock indices:</p>
        <ul class="analysis-list">
            <li><i class="fas fa-chart-line text-success me-2"></i><strong>Post-2008 Recovery (2013-2015):</strong> Many markets experienced strong growth as they recovered from the global financial crisis.</li>
            <li><i class="fas fa-university text-primary me-2"></i><strong>Monetary Policies:</strong> Central banks maintained historically low interest rates for much of the decade, boosting equities.</li>
            <li><i class="fas fa-handshake text-warning me-2"></i><strong>Trade Tensions (2018-2019):</strong> US-China trade disputes created volatility across global markets.</li>
            <li><i class="fas fa-virus-covid text-danger me-2"></i><strong>COVID-19 Pandemic (2020):</strong> A sharp market decline followed by unprecedented recovery supported by massive fiscal stimulus.</li>
            <li><i class="fas fa-money-bill-trend-up text-secondary me-2"></i><strong>Inflation Concerns (2021-2023):</strong> Rising inflation and subsequent monetary tightening affected market performance.</li>
        </ul>
        <p>These factors have contributed significantly to the divergent performance between indices like ${bestPerformers[0].name} and ${worstPerformers[0].name}.</p>
    `;
    
    // Market sentiment
    document.getElementById('market-sentiment').innerHTML = `
        <h4 class="analysis-title">Sentiment Analysis</h4>
        <p>Market sentiment has varied widely across different regions:</p>
        <ul class="analysis-list">
            <li><i class="fas fa-arrow-trend-up text-success me-2"></i><strong>US Markets:</strong> Generally bullish sentiment driven by tech sector dominance and strong corporate earnings.</li>
            <li><i class="fas fa-arrows-up-down text-primary me-2"></i><strong>European Markets:</strong> Mixed sentiment with periodic concerns about economic growth, Brexit, and political stability.</li>
            <li><i class="fas fa-chart-simple text-warning me-2"></i><strong>Asian Markets:</strong> Variable sentiment influenced by regulatory changes, property market concerns, and regional geopolitics.</li>
        </ul>
        <p>Sentiment indicators show that ${bestPerformers[0].name} and ${bestPerformers[1].name} benefited from sustained positive investor outlook, while ${worstPerformers[0].name} and ${worstPerformers[1].name} faced more cautious or negative sentiment during significant periods.</p>
    `;
    
    // Sectoral analysis
    document.getElementById('sectoral-analysis').innerHTML = `
        <h4 class="analysis-title">Sector Performance Differences</h4>
        <p>Sector composition has been a key differentiator in index performance:</p>
        <ul class="analysis-list">
            <li><i class="fas fa-microchip text-info me-2"></i><strong>Technology Sector:</strong> Indices with higher technology weighting (like NASDAQ) have generally outperformed.</li>
            <li><i class="fas fa-building-columns text-primary me-2"></i><strong>Financial Services:</strong> Performance varied based on interest rate environments and regulatory landscapes.</li>
            <li><i class="fas fa-oil-well text-warning me-2"></i><strong>Energy Sector:</strong> Significant volatility due to oil price fluctuations and the energy transition.</li>
            <li><i class="fas fa-kit-medical text-danger me-2"></i><strong>Healthcare:</strong> Generally resilient performance, especially during the pandemic period.</li>
        </ul>
        <p>The superior performance of ${bestPerformers[0].name} can be partially attributed to its favorable sector allocation, with greater exposure to high-growth industries.</p>
    `;
    
    // Volatility explanation
    document.getElementById('volatility-explanation').innerHTML = `
        <h4 class="analysis-title">Understanding Index Volatility</h4>
        <p>Volatility differences between indices reflect their unique risk profiles:</p>
        <ul class="analysis-list">
            <li><i class="fas fa-users text-primary me-2"></i><strong>Market Structure:</strong> Some markets have higher retail investor participation, leading to greater volatility.</li>
            <li><i class="fas fa-water me-2"></i><strong>Liquidity Factors:</strong> More liquid markets tend to experience less extreme price movements.</li>
            <li><i class="fas fa-scale-balanced text-success me-2"></i><strong>Economic Stability:</strong> Indices in economies with greater policy certainty often show lower volatility.</li>
            <li><i class="fas fa-sitemap text-info me-2"></i><strong>Sector Composition:</strong> Technology-heavy indices typically exhibit higher volatility than those dominated by utilities or consumer staples.</li>
        </ul>
        <p>The observed volatility patterns align with historical risk-return relationships, where higher-returning indices like ${bestPerformers[0].name} have sometimes exhibited higher volatility, though not always proportionally.</p>
    `;
    
    // Conclusion
    document.getElementById('conclusion-content').innerHTML = `
        <p>This analysis reveals several key insights about global market performance over the past decade:</p>
        <ul class="analysis-list">
            <li><i class="fas fa-arrow-trend-up text-primary me-2"></i>Significant performance divergence between top and bottom-performing indices, with a difference of approximately ${((bestPerformers[0].totalReturn - worstPerformers[1].totalReturn) * 100).toFixed(2)} percentage points in total return.</li>
            <li><i class="fas fa-chart-pie text-success me-2"></i>The importance of sector allocation in driving returns, particularly exposure to technology and growth sectors.</li>
            <li><i class="fas fa-globe text-info me-2"></i>The impact of regional economic policies and structural market differences on long-term performance.</li>
            <li><i class="fas fa-scales text-warning me-2"></i>The relationship between volatility and returns has not always been linear, challenging conventional risk-return assumptions.</li>
        </ul>
        <p>Investors should consider these findings when constructing globally diversified portfolios, recognizing both the opportunities and risks presented by different market indices.</p>
    `;
};

// Function to initialize UI enhancements
const initializeUIEnhancements = () => {
    // Handle navbar transition on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });
    
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Add CSS for notifications if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .notification {
                background-color: white;
                color: #333;
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                min-width: 300px;
                max-width: 400px;
                transform: translateX(120%);
                transition: transform 0.4s ease;
            }
            
            .notification.visible {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left: 5px solid #28a745;
            }
            
            .notification.error {
                border-left: 5px solid #dc3545;
            }
            
            .notification.info {
                border-left: 5px solid #17a2b8;
            }
            
            .notification.warning {
                border-left: 5px solid #ffc107;
            }
            
            .notification i {
                margin-right: 10px;
                font-size: 20px;
            }
            
            .notification.success i {
                color: #28a745;
            }
            
            .notification.error i {
                color: #dc3545;
            }
            
            .notification.info i {
                color: #17a2b8;
            }
            
            .notification.warning i {
                color: #ffc107;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9rem;
                border-bottom: 1px dotted #eee;
                padding-bottom: 8px;
            }
            
            .stat-label {
                font-weight: 500;
            }
            
            .stat-value {
                font-weight: 600;
            }

            .analysis-title {
                color: var(--primary-color);
                margin-bottom: 15px;
                font-weight: 600;
            }

            .analysis-list li {
                margin-bottom: 10px;
                list-style-type: none;
            }
        `;
        document.head.appendChild(style);
    }
};

// Function to show notifications
const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on notification type
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-circle-check';
            break;
        case 'error':
            icon = 'fa-circle-exclamation';
            break;
        case 'warning':
            icon = 'fa-triangle-exclamation';
            break;
        default:
            icon = 'fa-circle-info';
    }
    
    // Set notification content
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // Add notification to container
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // Make notification visible after a short delay (for animation)
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 5000);
};

// Add these functions to handle dark mode and back-to-top functionality

// Dark mode toggle
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved user preference, or use OS preference
    const currentTheme = localStorage.getItem('theme') || 
                         (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Initial theme application
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Toggle theme on button click
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Update the button icon
        if (document.body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Back to top functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scrolling for all in-page links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#' && this.getAttribute('id') !== 'download-pdf' && this.getAttribute('id') !== 'download-pdf-footer') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Account for fixed navbar
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Reset zoom button for charts
function initZoomReset() {
    const resetZoomButton = document.getElementById('resetZoom');
    if (resetZoomButton) {
        resetZoomButton.addEventListener('click', () => {
            // Assuming there's a global Chart.js instance for the main chart
            const chartInstance = Chart.getChart('mainChart');
            if (chartInstance) {
                chartInstance.resetZoom();
            }
        });
    }
}

// Navbar behavior (shrink on scroll)
function initNavbarBehavior() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Initialize all UI components
function initUI() {
    initDarkModeToggle();
    initBackToTop();
    initSmoothScroll();
    initZoomReset();
    initNavbarBehavior();
}

// When the DOM is loaded, initialize the report with mock data
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    // Simulate loading state
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('loading');
    });
    
    // In a real implementation, data would be fetched from an API
    setTimeout(() => {
        const data = generateMockData();
        initializeReport(data);
        
        // Remove loading state
        sections.forEach(section => {
            section.classList.remove('loading');
        });
        
        // Show welcome notification
        showNotification('Welcome to the Stock Market Indices Analysis Report!', 'info');
    }, 1000);
});
