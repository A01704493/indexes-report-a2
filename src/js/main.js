/**
 * Main JavaScript file for Stock Market Indices Analysis Report
 * 
 * This file handles:
 * - Loading market data
 * - Populating tables and text content
 * - Initializing the UI components
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
        alert('The PDF report would be downloaded here. In a real implementation, this would call the server to generate and download the PDF.');
    });
};

// Function to populate the indices table
const populateIndicesTable = (indices) => {
    const tableBody = document.getElementById('indices-table');
    tableBody.innerHTML = '';
    
    indices.forEach(index => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = index.name;
        row.appendChild(nameCell);
        
        const countryCell = document.createElement('td');
        countryCell.textContent = index.country;
        row.appendChild(countryCell);
        
        const returnCell = document.createElement('td');
        const returnValue = (index.totalReturn * 100).toFixed(2);
        returnCell.textContent = `${returnValue}%`;
        returnCell.className = returnValue >= 0 ? 'text-success' : 'text-danger';
        row.appendChild(returnCell);
        
        const volatilityCell = document.createElement('td');
        volatilityCell.textContent = `${(index.volatility * 100).toFixed(2)}%`;
        row.appendChild(volatilityCell);
        
        tableBody.appendChild(row);
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
        <p><strong>10-Year Return:</strong> ${(bestPerformers[0].totalReturn * 100).toFixed(2)}%</p>
        <p><strong>Annualized Return:</strong> ${(bestPerformers[0].annualizedReturn * 100).toFixed(2)}%</p>
        <p><strong>Volatility:</strong> ${(bestPerformers[0].volatility * 100).toFixed(2)}%</p>
        <p>The ${bestPerformers[0].name} has shown exceptional performance over the last decade, driven by strong economic growth, technological innovation, and favorable monetary policies.</p>
    `;
    
    document.getElementById('best-analysis-2').innerHTML = `
        <p><strong>10-Year Return:</strong> ${(bestPerformers[1].totalReturn * 100).toFixed(2)}%</p>
        <p><strong>Annualized Return:</strong> ${(bestPerformers[1].annualizedReturn * 100).toFixed(2)}%</p>
        <p><strong>Volatility:</strong> ${(bestPerformers[1].volatility * 100).toFixed(2)}%</p>
        <p>The ${bestPerformers[1].name} has delivered consistent growth throughout the decade, benefiting from strong market fundamentals and strategic sectoral positioning.</p>
    `;
    
    document.getElementById('worst-analysis-1').innerHTML = `
        <p><strong>10-Year Return:</strong> ${(worstPerformers[0].totalReturn * 100).toFixed(2)}%</p>
        <p><strong>Annualized Return:</strong> ${(worstPerformers[0].annualizedReturn * 100).toFixed(2)}%</p>
        <p><strong>Volatility:</strong> ${(worstPerformers[0].volatility * 100).toFixed(2)}%</p>
        <p>The ${worstPerformers[0].name} has underperformed relative to other global indices, facing challenges from economic uncertainty, regulatory pressures, and structural market changes.</p>
    `;
    
    document.getElementById('worst-analysis-2').innerHTML = `
        <p><strong>10-Year Return:</strong> ${(worstPerformers[1].totalReturn * 100).toFixed(2)}%</p>
        <p><strong>Annualized Return:</strong> ${(worstPerformers[1].annualizedReturn * 100).toFixed(2)}%</p>
        <p><strong>Volatility:</strong> ${(worstPerformers[1].volatility * 100).toFixed(2)}%</p>
        <p>The ${worstPerformers[1].name} has struggled with consistent growth, impacted by geopolitical tensions, currency fluctuations, and sector-specific challenges.</p>
    `;
};

// Function to populate analysis sections
const populateAnalysisSections = (bestPerformers, worstPerformers) => {
    // Economic factors
    document.getElementById('economic-factors').innerHTML = `
        <h4>Global Economic Trends (2013-2023)</h4>
        <p>The past decade has witnessed significant economic events that shaped the performance of global stock indices:</p>
        <ul>
            <li><strong>Post-2008 Recovery (2013-2015):</strong> Many markets experienced strong growth as they recovered from the global financial crisis.</li>
            <li><strong>Monetary Policies:</strong> Central banks maintained historically low interest rates for much of the decade, boosting equities.</li>
            <li><strong>Trade Tensions (2018-2019):</strong> US-China trade disputes created volatility across global markets.</li>
            <li><strong>COVID-19 Pandemic (2020):</strong> A sharp market decline followed by unprecedented recovery supported by massive fiscal stimulus.</li>
            <li><strong>Inflation Concerns (2021-2023):</strong> Rising inflation and subsequent monetary tightening affected market performance.</li>
        </ul>
        <p>These factors have contributed significantly to the divergent performance between indices like ${bestPerformers[0].name} and ${worstPerformers[0].name}.</p>
    `;
    
    // Market sentiment
    document.getElementById('market-sentiment').innerHTML = `
        <h4>Sentiment Analysis</h4>
        <p>Market sentiment has varied widely across different regions:</p>
        <ul>
            <li><strong>US Markets:</strong> Generally bullish sentiment driven by tech sector dominance and strong corporate earnings.</li>
            <li><strong>European Markets:</strong> Mixed sentiment with periodic concerns about economic growth, Brexit, and political stability.</li>
            <li><strong>Asian Markets:</strong> Variable sentiment influenced by regulatory changes, property market concerns, and regional geopolitics.</li>
        </ul>
        <p>Sentiment indicators show that ${bestPerformers[0].name} and ${bestPerformers[1].name} benefited from sustained positive investor outlook, while ${worstPerformers[0].name} and ${worstPerformers[1].name} faced more cautious or negative sentiment during significant periods.</p>
    `;
    
    // Sectoral analysis
    document.getElementById('sectoral-analysis').innerHTML = `
        <h4>Sector Performance Differences</h4>
        <p>Sector composition has been a key differentiator in index performance:</p>
        <ul>
            <li><strong>Technology Sector:</strong> Indices with higher technology weighting (like NASDAQ) have generally outperformed.</li>
            <li><strong>Financial Services:</strong> Performance varied based on interest rate environments and regulatory landscapes.</li>
            <li><strong>Energy Sector:</strong> Significant volatility due to oil price fluctuations and the energy transition.</li>
            <li><strong>Healthcare:</strong> Generally resilient performance, especially during the pandemic period.</li>
        </ul>
        <p>The superior performance of ${bestPerformers[0].name} can be partially attributed to its favorable sector allocation, with greater exposure to high-growth industries.</p>
    `;
    
    // Volatility explanation
    document.getElementById('volatility-explanation').innerHTML = `
        <h4>Understanding Index Volatility</h4>
        <p>Volatility differences between indices reflect their unique risk profiles:</p>
        <ul>
            <li><strong>Market Structure:</strong> Some markets have higher retail investor participation, leading to greater volatility.</li>
            <li><strong>Liquidity Factors:</strong> More liquid markets tend to experience less extreme price movements.</li>
            <li><strong>Economic Stability:</strong> Indices in economies with greater policy certainty often show lower volatility.</li>
            <li><strong>Sector Composition:</strong> Technology-heavy indices typically exhibit higher volatility than those dominated by utilities or consumer staples.</li>
        </ul>
        <p>The observed volatility patterns align with historical risk-return relationships, where higher-returning indices like ${bestPerformers[0].name} have sometimes exhibited higher volatility, though not always proportionally.</p>
    `;
    
    // Conclusion
    document.getElementById('conclusion-content').innerHTML = `
        <p>This analysis reveals several key insights about global market performance over the past decade:</p>
        <ul>
            <li>Significant performance divergence between top and bottom-performing indices, with a difference of approximately ${((bestPerformers[0].totalReturn - worstPerformers[1].totalReturn) * 100).toFixed(2)} percentage points in total return.</li>
            <li>The importance of sector allocation in driving returns, particularly exposure to technology and growth sectors.</li>
            <li>The impact of regional economic policies and structural market differences on long-term performance.</li>
            <li>The relationship between volatility and returns has not always been linear, challenging conventional risk-return assumptions.</li>
        </ul>
        <p>Investors should consider these findings when constructing globally diversified portfolios, recognizing both the opportunities and risks presented by different market indices.</p>
    `;
};

// When the DOM is loaded, initialize the report with mock data
document.addEventListener('DOMContentLoaded', () => {
    // In a real implementation, data would be fetched from an API
    const data = generateMockData();
    initializeReport(data);
});
