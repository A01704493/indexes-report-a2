# Global Stock Market Indices Analysis (2013-2023)

[![Deploy to GitHub Pages](https://github.com/inakizamores/indexes-report-a2/actions/workflows/deploy.yml/badge.svg)](https://github.com/inakizamores/indexes-report-a2/actions/workflows/deploy.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)
[![made-with-python](https://img.shields.io/badge/Made%20with-Python-1f425f.svg)](https://www.python.org/)

An interactive analysis of the performance, volatility, and key drivers of the top 10 global stock market indices over the past decade (2013-2023), with a focus on comparative analysis and market insights.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Stock+Market+Indices+Dashboard)

## 🚀 Live Demo

View the live report: [Global Stock Market Indices Analysis](https://inakizamores.github.io/indexes-report-a2/)

## ✨ Features

- **Comprehensive Analysis**: Detailed examination of 10 major global stock indices over a 10-year period
- **Performance Comparison**: Interactive charts showing cumulative returns and relative performance
- **Volatility Analysis**: Risk vs. return assessment with efficient frontier visualization
- **Top Performers**: Deep dive into the best and worst performing indices
- **Fundamental Drivers**: Analysis of economic factors, market sentiment, and sectoral trends
- **Responsive Design**: Modern UI that works on desktop, tablet, and mobile devices
- **Dual Formats**: Interactive web report and downloadable PDF format
- **Dark Mode Support**: Automatic detection of system preferences for dark/light mode

## 🔍 Indices Analyzed

- S&P 500 (USA)
- NASDAQ Composite (USA)
- Dow Jones Industrial Average (USA)
- FTSE 100 (UK)
- DAX (Germany)
- CAC 40 (France)
- Nikkei 225 (Japan)
- Hang Seng (Hong Kong)
- Shanghai Composite (China)
- BSE SENSEX (India)

## 📊 Visualization Techniques

- Line charts for time-series performance tracking
- Bubble charts for risk-return visualization
- Bar charts for comparative analysis
- Heat maps for correlation analysis
- Area charts for market composition

## 🧰 Technical Details

### Web Technologies
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for interactive data visualization
- Bootstrap 5 for responsive layout
- Font Awesome for iconography
- Animations with CSS and JavaScript

### Python Components
- Data analysis with Pandas and NumPy
- PDF generation with ReportLab
- Chart generation with Matplotlib and Seaborn
- Financial calculations with Pandas-datareader

## 📁 Project Structure
```
├── index.html                # Main web entry point
├── .github/workflows/        # GitHub Actions configuration
│   └── deploy.yml            # Auto-deployment to GitHub Pages
├── src/                      # Source files
│   ├── js/                   # JavaScript files
│   │   ├── main.js           # Core application logic
│   │   └── charts.js         # Chart configurations
│   ├── css/                  # Stylesheets
│   │   └── style.css         # Main styling
│   └── data/                 # Data files for the application
├── python/                   # Python scripts
│   ├── data_fetcher.py       # Script to fetch historical market data
│   ├── pdf_generator.py      # Script to generate PDF report
│   └── analysis/             # Analysis modules
├── requirements.txt          # Python dependencies
└── docs/                     # Documentation
```

## 🚀 Getting Started

### Viewing the Web Report
1. Visit [https://username.github.io/indexes-report-a2/](https://username.github.io/indexes-report-a2/) to view the live version
2. Or clone the repository and open `index.html` in your browser

### Generating the PDF Report
1. Clone the repository: `git clone https://github.com/username/indexes-report-a2.git`
2. Install Python dependencies: `pip install -r requirements.txt`
3. Run the PDF generator: `python python/pdf_generator.py`
4. Find the generated PDF report in the `output` directory

### Deploying to Your Own GitHub Pages
1. Fork this repository
2. The repository includes a GitHub Actions workflow that will automatically:
   - Fetch the latest market data using Python scripts
   - Generate the PDF report
   - Deploy everything to GitHub Pages
3. After forking, go to Settings > Pages
4. Verify that the source branch is set to `gh-pages`
5. Your site will be available at `https://[your-username].github.io/indexes-report-a2/`

## 🔄 Data Updates

The analysis covers the period from January 2013 to December 2023. The data was last updated on January 15, 2024.

To update the data with the latest market information:
1. Run `python python/data_fetcher.py --update`
2. The web and PDF reports will reflect the updated data

## 📱 Responsive Design

The web report is designed to work on multiple devices:

- **Desktop**: Full-featured dashboard with all visualizations
- **Tablet**: Optimized layout with scrollable sections
- **Mobile**: Condensed view focusing on key insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or feedback, please open an issue on this repository.

---

<p align="center">
  Made with ❤️ for financial analysis
</p>
