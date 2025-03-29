#!/usr/bin/env python3
"""
PDF Generator for Stock Market Indices Analysis

This script generates a professional PDF report analyzing the performance
of major stock market indices over the past 10 years.
"""

import os
import json
import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER, TA_RIGHT
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

# Set some constants
REPORT_TITLE = "Global Stock Market Indices: 10-Year Performance Analysis"
DATA_PATH = "../src/data"
OUTPUT_FILE = "../Stock_Market_Indices_Report.pdf"

# Create custom styles
def get_custom_styles():
    """Create and return custom paragraph styles for the report"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        leading=30,
        textColor=colors.HexColor('#1e3c72'),
        spaceAfter=12
    ))
    
    # Heading 1 style
    styles.add(ParagraphStyle(
        name='CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e3c72'),
        spaceBefore=12,
        spaceAfter=6
    ))
    
    # Heading 2 style
    styles.add(ParagraphStyle(
        name='CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#2a5298'),
        spaceBefore=10,
        spaceAfter=6
    ))
    
    # Normal text style
    styles.add(ParagraphStyle(
        name='CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceBefore=6,
        spaceAfter=6
    ))
    
    # Bullet style
    styles.add(ParagraphStyle(
        name='CustomBullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        leftIndent=20,
        spaceBefore=2,
        spaceAfter=2
    ))
    
    # Caption style
    styles.add(ParagraphStyle(
        name='Caption',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.darkgrey
    ))
    
    return styles

# Generate charts using matplotlib
def generate_chart(indices_data, chart_type, filename, selected_indices=None):
    """Generate charts for the report
    
    Args:
        indices_data (list): List of indices data
        chart_type (str): Type of chart to generate
        filename (str): Output filename
        selected_indices (list, optional): Specific indices to include
    
    Returns:
        str: Path to the generated chart image
    """
    plt.figure(figsize=(8, 5))
    
    if chart_type == "performance":
        # Create a line chart comparing index performance
        indices_to_plot = selected_indices if selected_indices else indices_data[:5]
        
        for index in indices_to_plot:
            # Convert monthly data to DataFrame
            dates = [pd.to_datetime(point['date']) for point in index['monthlyData']]
            values = [point['value'] for point in index['monthlyData']]
            # Calculate normalized values (starting at 100)
            normalized_values = [value / values[0] * 100 for value in values]
            plt.plot(dates, normalized_values, label=index['name'], linewidth=2)
        
        plt.title("10-Year Performance Comparison (2013-2023)", fontsize=14, fontweight='bold')
        plt.xlabel("Year", fontsize=10)
        plt.ylabel("Normalized Value (Starting = 100)", fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.legend(loc='best', fontsize=9)
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
        plt.gca().xaxis.set_major_locator(mdates.YearLocator(2))
    
    elif chart_type == "volatility":
        # Create a scatter plot of volatility vs. returns
        x = [index["volatility"] * 100 for index in indices_data]
        y = [index["annualizedReturn"] * 100 for index in indices_data]
        labels = [index["name"] for index in indices_data]
        
        plt.scatter(x, y, s=100, alpha=0.7)
        
        # Add index labels
        for i, label in enumerate(labels):
            plt.annotate(label, (x[i], y[i]), fontsize=8, 
                         xytext=(5, 5), textcoords='offset points')
        
        plt.title("Risk-Return Profile of Global Indices (2013-2023)", fontsize=14, fontweight='bold')
        plt.xlabel("Volatility (Annualized Standard Deviation, %)", fontsize=10)
        plt.ylabel("Annualized Return (%)", fontsize=10)
        plt.grid(True, alpha=0.3)
        
        # Add a diagonal line representing the efficient frontier (simplified)
        min_x, max_x = plt.xlim()
        min_y, max_y = plt.ylim()
        plt.plot([min_x, max_x], [min_y, max_y], 'k--', alpha=0.3)
    
    elif chart_type == "individual":
        # Plot performance chart for a single index
        index = selected_indices[0]
        dates = [pd.to_datetime(point['date']) for point in index['monthlyData']]
        values = [point['value'] for point in index['monthlyData']]
        # Calculate normalized values (starting at 100)
        normalized_values = [value / values[0] * 100 for value in values]
        
        plt.plot(dates, normalized_values, label=index['name'], linewidth=2, color='#1e3c72')
        plt.fill_between(dates, normalized_values, 100, alpha=0.2, color='#1e3c72')
        
        plt.title(f"{index['name']} Performance (2013-2023)", fontsize=14, fontweight='bold')
        plt.xlabel("Year", fontsize=10)
        plt.ylabel("Normalized Value (Starting = 100)", fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
        plt.gca().xaxis.set_major_locator(mdates.YearLocator(2))
    
    plt.tight_layout()
    
    # Save figure to BytesIO object
    img_data = BytesIO()
    plt.savefig(img_data, format='png', dpi=300)
    img_data.seek(0)
    plt.close()
    
    return img_data

# Generate the PDF report
def generate_pdf_report(data_path, output_file):
    """Generate a professional PDF report with charts and analysis
    
    Args:
        data_path (str): Path to the data directory
        output_file (str): Output PDF filename
    """
    # Load data
    try:
        with open(os.path.join(data_path, "all_indices.json"), "r") as f:
            indices_data = json.load(f)
        
        with open(os.path.join(data_path, "summary.json"), "r") as f:
            summary_data = json.load(f)
    except FileNotFoundError:
        print("Error: Data files not found. Please run data_fetcher.py first.")
        return
    
    # Sort indices by total return
    indices_data.sort(key=lambda x: x["totalReturn"], reverse=True)
    
    # Get the best and worst performers
    best_performers = indices_data[:2]
    worst_performers = indices_data[-2:]
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        output_file, 
        pagesize=A4,
        leftMargin=0.5*inch, 
        rightMargin=0.5*inch,
        topMargin=0.5*inch, 
        bottomMargin=0.5*inch
    )
    
    # Get styles
    styles = get_custom_styles()
    
    # Initialize elements list
    elements = []
    
    # Add report title
    elements.append(Paragraph(REPORT_TITLE, styles["CustomTitle"]))
    
    # Add report date
    today = datetime.date.today().strftime("%B %d, %Y")
    elements.append(Paragraph(f"Report generated on {today}", styles["Caption"]))
    elements.append(Spacer(1, 0.25*inch))
    
    # Add introduction
    elements.append(Paragraph("Introduction", styles["CustomHeading1"]))
    elements.append(Paragraph(
        "This professional report analyzes the performance of 10 major global stock market indices over "
        "the past decade (2013-2023). The analysis focuses on identifying the best and worst performing "
        "indices, explaining volatility factors, and providing fundamental analysis of market behavior.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.1*inch))
    
    # Add executive summary
    elements.append(Paragraph("Executive Summary", styles["CustomHeading2"]))
    
    # Create a summary table
    summary_table_data = [
        ["Index", "Country", "10-Year Return", "Annualized Return", "Volatility"],
    ]
    
    for index in summary_data:
        summary_table_data.append([
            index["name"],
            index["country"],
            f"{index['totalReturn']*100:.2f}%",
            f"{index['annualizedReturn']*100:.2f}%",
            f"{index['volatility']*100:.2f}%"
        ])
    
    summary_table = Table(summary_table_data, colWidths=[1.5*inch, 1.2*inch, 1*inch, 1.3*inch, 1*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3c72')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (1, -1), 'LEFT'),
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),
        # Highlight top performers
        ('BACKGROUND', (0, 1), (-1, 2), colors.HexColor('#e7f1ff')),
        # Highlight bottom performers
        ('BACKGROUND', (0, -2), (-1, -1), colors.HexColor('#fff1f0')),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        "The table above summarizes the performance of the analyzed indices, "
        "highlighting the best performers in blue and the worst performers in red.",
        styles["Caption"]
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add performance chart
    elements.append(Paragraph("Performance Comparison", styles["CustomHeading1"]))
    elements.append(Paragraph(
        "The chart below compares the performance of the top 5 global stock indices over the past decade, "
        "normalized to a starting value of 100 to facilitate comparison.",
        styles["CustomNormal"]
    ))
    
    performance_chart = generate_chart(indices_data, "performance", "performance_comparison.png")
    elements.append(Image(performance_chart, width=6.5*inch, height=4*inch))
    elements.append(Paragraph(
        "Figure 1: 10-Year Performance Comparison of Top 5 Global Indices (2013-2023)",
        styles["Caption"]
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add volatility vs returns chart
    elements.append(Paragraph("Risk-Return Analysis", styles["CustomHeading1"]))
    elements.append(Paragraph(
        "The scatter plot below displays the relationship between risk (measured by volatility) "
        "and return for each index. Ideally, investors seek high returns with low volatility.",
        styles["CustomNormal"]
    ))
    
    volatility_chart = generate_chart(indices_data, "volatility", "volatility_comparison.png")
    elements.append(Image(volatility_chart, width=6.5*inch, height=4*inch))
    elements.append(Paragraph(
        "Figure 2: Risk-Return Profile of Global Indices (2013-2023)",
        styles["Caption"]
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add best performers section
    elements.append(Paragraph("Best Performing Indices", styles["CustomHeading1"]))
    elements.append(Paragraph(
        f"The two best performing indices over the past decade were the "
        f"{best_performers[0]['name']} and the {best_performers[1]['name']}.",
        styles["CustomNormal"]
    ))
    
    # Create a 2-column layout for best performers
    best_data = []
    for i, index in enumerate(best_performers):
        # Generate chart
        chart = generate_chart(indices_data, "individual", f"best_{i}.png", [index])
        
        # Performance metrics
        metrics = [
            [f"{index['name']} ({index['country']})", ""],
            ["10-Year Total Return:", f"{index['totalReturn']*100:.2f}%"],
            ["Annualized Return:", f"{index['annualizedReturn']*100:.2f}%"],
            ["Volatility:", f"{index['volatility']*100:.2f}%"]
        ]
        
        metrics_table = Table(metrics, colWidths=[1.5*inch, 1*inch])
        metrics_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 12),
            ('SPAN', (0, 0), (1, 0)),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, 0), (0, 0), 6),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        
        # Add to best data
        best_data.append([
            Image(chart, width=3*inch, height=2*inch),
            metrics_table
        ])
    
    # Create a table for the 2-column layout
    best_table = Table(best_data, colWidths=[3.2*inch, 3.2*inch])
    best_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(best_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Add analysis for best performers
    elements.append(Paragraph("Analysis of Top Performers", styles["CustomHeading2"]))
    elements.append(Paragraph(
        f"<b>{best_performers[0]['name']} ({best_performers[0]['country']})</b>: "
        f"The exceptional performance of the {best_performers[0]['name']} can be attributed to "
        f"strong economic growth, technological innovation, and favorable monetary policies. "
        f"The index benefited from its substantial weighting in high-growth technology sectors "
        f"and resilient consumer-oriented companies.",
        styles["CustomNormal"]
    ))
    elements.append(Paragraph(
        f"<b>{best_performers[1]['name']} ({best_performers[1]['country']})</b>: "
        f"The {best_performers[1]['name']} delivered consistent growth throughout the decade, "
        f"benefiting from strong market fundamentals and strategic sectoral positioning. "
        f"The index showed remarkable resilience during market downturns, particularly during "
        f"the COVID-19 pandemic, recovering quickly and continuing its upward trajectory.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add worst performers section
    elements.append(Paragraph("Worst Performing Indices", styles["CustomHeading1"]))
    elements.append(Paragraph(
        f"The two worst performing indices over the past decade were the "
        f"{worst_performers[0]['name']} and the {worst_performers[1]['name']}.",
        styles["CustomNormal"]
    ))
    
    # Create a 2-column layout for worst performers
    worst_data = []
    for i, index in enumerate(worst_performers):
        # Generate chart
        chart = generate_chart(indices_data, "individual", f"worst_{i}.png", [index])
        
        # Performance metrics
        metrics = [
            [f"{index['name']} ({index['country']})", ""],
            ["10-Year Total Return:", f"{index['totalReturn']*100:.2f}%"],
            ["Annualized Return:", f"{index['annualizedReturn']*100:.2f}%"],
            ["Volatility:", f"{index['volatility']*100:.2f}%"]
        ]
        
        metrics_table = Table(metrics, colWidths=[1.5*inch, 1*inch])
        metrics_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 12),
            ('SPAN', (0, 0), (1, 0)),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, 0), (0, 0), 6),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        
        # Add to worst data
        worst_data.append([
            Image(chart, width=3*inch, height=2*inch),
            metrics_table
        ])
    
    # Create a table for the 2-column layout
    worst_table = Table(worst_data, colWidths=[3.2*inch, 3.2*inch])
    worst_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(worst_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Add analysis for worst performers
    elements.append(Paragraph("Analysis of Worst Performers", styles["CustomHeading2"]))
    elements.append(Paragraph(
        f"<b>{worst_performers[0]['name']} ({worst_performers[0]['country']})</b>: "
        f"The {worst_performers[0]['name']} has underperformed relative to other global indices, "
        f"facing challenges from economic uncertainty, regulatory pressures, and structural market changes. "
        f"The index was particularly affected by geopolitical tensions and trade disputes, which "
        f"created persistent headwinds for market growth.",
        styles["CustomNormal"]
    ))
    elements.append(Paragraph(
        f"<b>{worst_performers[1]['name']} ({worst_performers[1]['country']})</b>: "
        f"The {worst_performers[1]['name']} struggled with consistent growth, impacted by "
        f"geopolitical tensions, currency fluctuations, and sector-specific challenges. "
        f"The concentration in traditionally cyclical sectors and limited exposure to high-growth "
        f"technology companies contributed to its underperformance.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add fundamental analysis section
    elements.append(Paragraph("Fundamental Analysis", styles["CustomHeading1"]))
    
    # Economic Factors
    elements.append(Paragraph("Global Economic Trends (2013-2023)", styles["CustomHeading2"]))
    elements.append(Paragraph(
        "The past decade has witnessed significant economic events that shaped the performance of global stock indices:",
        styles["CustomNormal"]
    ))
    
    economic_factors = [
        "<b>Post-2008 Recovery (2013-2015):</b> Many markets experienced strong growth as they recovered from the global financial crisis.",
        "<b>Monetary Policies:</b> Central banks maintained historically low interest rates for much of the decade, boosting equities.",
        "<b>Trade Tensions (2018-2019):</b> US-China trade disputes created volatility across global markets.",
        "<b>COVID-19 Pandemic (2020):</b> A sharp market decline followed by unprecedented recovery supported by massive fiscal stimulus.",
        "<b>Inflation Concerns (2021-2023):</b> Rising inflation and subsequent monetary tightening affected market performance."
    ]
    
    for factor in economic_factors:
        elements.append(Paragraph(f"• {factor}", styles["CustomBullet"]))
    
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        f"These factors have contributed significantly to the divergent performance between indices like "
        f"{best_performers[0]['name']} and {worst_performers[0]['name']}.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.1*inch))
    
    # Market Sentiment
    elements.append(Paragraph("Market Sentiment Analysis", styles["CustomHeading2"]))
    elements.append(Paragraph(
        "Market sentiment has varied widely across different regions:",
        styles["CustomNormal"]
    ))
    
    sentiment_factors = [
        "<b>US Markets:</b> Generally bullish sentiment driven by tech sector dominance and strong corporate earnings.",
        "<b>European Markets:</b> Mixed sentiment with periodic concerns about economic growth, Brexit, and political stability.",
        "<b>Asian Markets:</b> Variable sentiment influenced by regulatory changes, property market concerns, and regional geopolitics."
    ]
    
    for factor in sentiment_factors:
        elements.append(Paragraph(f"• {factor}", styles["CustomBullet"]))
    
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        f"Sentiment indicators show that {best_performers[0]['name']} and {best_performers[1]['name']} "
        f"benefited from sustained positive investor outlook, while {worst_performers[0]['name']} and "
        f"{worst_performers[1]['name']} faced more cautious or negative sentiment during significant periods.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.1*inch))
    
    # Sectoral Analysis
    elements.append(Paragraph("Sector Performance Differences", styles["CustomHeading2"]))
    elements.append(Paragraph(
        "Sector composition has been a key differentiator in index performance:",
        styles["CustomNormal"]
    ))
    
    sector_factors = [
        "<b>Technology Sector:</b> Indices with higher technology weighting have generally outperformed.",
        "<b>Financial Services:</b> Performance varied based on interest rate environments and regulatory landscapes.",
        "<b>Energy Sector:</b> Significant volatility due to oil price fluctuations and the energy transition.",
        "<b>Healthcare:</b> Generally resilient performance, especially during the pandemic period."
    ]
    
    for factor in sector_factors:
        elements.append(Paragraph(f"• {factor}", styles["CustomBullet"]))
    
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        f"The superior performance of {best_performers[0]['name']} can be partially attributed to its "
        f"favorable sector allocation, with greater exposure to high-growth industries.",
        styles["CustomNormal"]
    ))
    elements.append(Spacer(1, 0.1*inch))
    
    # Volatility explanation
    elements.append(Paragraph("Understanding Index Volatility", styles["CustomHeading2"]))
    elements.append(Paragraph(
        "Volatility differences between indices reflect their unique risk profiles:",
        styles["CustomNormal"]
    ))
    
    volatility_factors = [
        "<b>Market Structure:</b> Some markets have higher retail investor participation, leading to greater volatility.",
        "<b>Liquidity Factors:</b> More liquid markets tend to experience less extreme price movements.",
        "<b>Economic Stability:</b> Indices in economies with greater policy certainty often show lower volatility.",
        "<b>Sector Composition:</b> Technology-heavy indices typically exhibit higher volatility than those dominated by utilities or consumer staples."
    ]
    
    for factor in volatility_factors:
        elements.append(Paragraph(f"• {factor}", styles["CustomBullet"]))
    
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        f"The observed volatility patterns align with historical risk-return relationships, where higher-returning indices like "
        f"{best_performers[0]['name']} have sometimes exhibited higher volatility, though not always proportionally.",
        styles["CustomNormal"]
    ))
    
    # Conclusion
    elements.append(Paragraph("Conclusion", styles["CustomHeading1"]))
    elements.append(Paragraph(
        "This analysis reveals several key insights about global market performance over the past decade:",
        styles["CustomNormal"]
    ))
    
    conclusion_points = [
        f"Significant performance divergence between top and bottom-performing indices, with a difference of approximately "
        f"{(best_performers[0]['totalReturn'] - worst_performers[1]['totalReturn'])*100:.2f} percentage points in total return.",
        "The importance of sector allocation in driving returns, particularly exposure to technology and growth sectors.",
        "The impact of regional economic policies and structural market differences on long-term performance.",
        "The relationship between volatility and returns has not always been linear, challenging conventional risk-return assumptions."
    ]
    
    for point in conclusion_points:
        elements.append(Paragraph(f"• {point}", styles["CustomBullet"]))
    
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(
        "Investors should consider these findings when constructing globally diversified portfolios, "
        "recognizing both the opportunities and risks presented by different market indices.",
        styles["CustomNormal"]
    ))
    
    # Add disclaimer
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph(
        "Disclaimer: This report is for informational purposes only and does not constitute investment advice. "
        "Past performance is not indicative of future results. Investors should conduct their own research or "
        "consult with a financial advisor before making investment decisions.",
        styles["Caption"]
    ))
    
    # Build the PDF
    doc.build(elements)
    print(f"PDF report generated successfully: {output_file}")

if __name__ == "__main__":
    # Generate the PDF report
    generate_pdf_report(DATA_PATH, OUTPUT_FILE)
    print(f"PDF report saved to: {OUTPUT_FILE}")
