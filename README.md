# Stock Market Indices Analysis Report

## Overview
This project provides a comprehensive analysis of major stock market indices over the past 10 years, highlighting performance trends, volatility, and fundamental factors affecting the markets.

## Features
- Analysis of 10 major global stock indices
- Detailed focus on the 2 best and 2 worst performing indices
- Interactive web visualization with dynamic charts
- Professionally designed PDF report
- Fundamental analysis from a certified financial analyst perspective

## Project Structure
```
├── index.html              # Main web entry point
├── src/                    # Web application source files
│   ├── js/                 # JavaScript files for web interface
│   ├── css/                # Styling for web interface
│   └── data/               # Processed data for web application
├── python/                 # Python scripts
│   ├── data_fetcher.py     # Script to fetch historical market data
│   ├── pdf_generator.py    # Script to generate PDF report
│   └── requirements.txt    # Python dependencies
└── docs/                   # Additional documentation
```

## Getting Started

### Web Report
1. Open `index.html` in your browser to view the interactive web report.

### PDF Report
1. Install Python dependencies: `pip install -r python/requirements.txt`
2. Run the PDF generation script: `python python/pdf_generator.py`
3. Find the generated report in the project root directory.

## Technical Details
- Web report uses HTML, CSS, and JavaScript with Chart.js for visualizations
- PDF report is generated using Python with libraries like Matplotlib and ReportLab
- Data is fetched from financial APIs using Python
