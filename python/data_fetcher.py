#!/usr/bin/env python3
"""
Data Fetcher for Stock Market Indices Analysis

This script fetches historical data for major stock market indices
over the past 10 years using the yfinance library.
"""

import os
import json
import datetime
import pandas as pd
import yfinance as yf

# List of major indices to analyze with their Yahoo Finance tickers
INDICES = [
    {"symbol": "^GSPC", "name": "S&P 500", "country": "United States"},
    {"symbol": "^DJI", "name": "Dow Jones Industrial Average", "country": "United States"},
    {"symbol": "^IXIC", "name": "NASDAQ Composite", "country": "United States"},
    {"symbol": "^FTSE", "name": "FTSE 100", "country": "United Kingdom"},
    {"symbol": "^GDAXI", "name": "DAX", "country": "Germany"},
    {"symbol": "^FCHI", "name": "CAC 40", "country": "France"},
    {"symbol": "^N225", "name": "Nikkei 225", "country": "Japan"},
    {"symbol": "^HSI", "name": "Hang Seng Index", "country": "Hong Kong"},
    {"symbol": "^SSEC", "name": "Shanghai Composite", "country": "China"},
    {"symbol": "^BSESN", "name": "BSE SENSEX", "country": "India"}
]

def fetch_indices_data(start_date, end_date, save_path="../src/data"):
    """
    Fetch historical data for all indices and save to JSON files
    
    Args:
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format
        save_path (str): Directory to save the data files
    
    Returns:
        dict: Summary of the fetched data
    """
    # Create data directory if it doesn't exist
    os.makedirs(save_path, exist_ok=True)
    
    # Empty list to store processed data for all indices
    all_indices_data = []
    summary_data = []
    
    for index in INDICES:
        print(f"Fetching data for {index['name']}...")
        
        try:
            # Fetch data from Yahoo Finance
            ticker_data = yf.download(
                index["symbol"],
                start=start_date,
                end=end_date,
                progress=False
            )
            
            # Process monthly data
            monthly_data = ticker_data['Adj Close'].resample('M').last()
            monthly_data_list = []
            
            for date, value in monthly_data.items():
                monthly_data_list.append({
                    "date": date.strftime("%Y-%m"),
                    "value": round(float(value), 2)
                })
            
            # Calculate returns and volatility
            returns = monthly_data.pct_change().dropna()
            total_return = (monthly_data.iloc[-1] / monthly_data.iloc[0]) - 1
            annualized_return = (1 + total_return) ** (1 / (len(monthly_data) / 12)) - 1
            volatility = returns.std() * (12 ** 0.5)  # Annualized
            
            # Create index data object
            index_data = {
                "symbol": index["symbol"],
                "name": index["name"],
                "country": index["country"],
                "startValue": float(monthly_data.iloc[0]),
                "endValue": float(monthly_data.iloc[-1]),
                "totalReturn": float(total_return),
                "annualizedReturn": float(annualized_return),
                "volatility": float(volatility),
                "monthlyData": monthly_data_list
            }
            
            # Save individual index data to JSON file
            with open(f"{save_path}/{index['symbol'].replace('^', '')}.json", 'w') as f:
                json.dump(index_data, f, indent=2)
            
            # Add to all indices data
            all_indices_data.append(index_data)
            
            # Add to summary data
            summary_data.append({
                "symbol": index["symbol"],
                "name": index["name"],
                "country": index["country"],
                "totalReturn": float(total_return),
                "annualizedReturn": float(annualized_return),
                "volatility": float(volatility)
            })
            
            print(f"Successfully processed {index['name']}.")
            
        except Exception as e:
            print(f"Error processing {index['name']}: {str(e)}")
    
    # Save all indices data to a single JSON file
    with open(f"{save_path}/all_indices.json", 'w') as f:
        json.dump(all_indices_data, f, indent=2)
    
    # Create a sorted summary (best to worst performers)
    sorted_summary = sorted(summary_data, key=lambda x: x['totalReturn'], reverse=True)
    
    with open(f"{save_path}/summary.json", 'w') as f:
        json.dump(sorted_summary, f, indent=2)
    
    return {
        "indices_count": len(all_indices_data),
        "date_range": f"{start_date} to {end_date}",
        "best_performer": sorted_summary[0]["name"] if sorted_summary else "N/A",
        "worst_performer": sorted_summary[-1]["name"] if sorted_summary else "N/A"
    }

if __name__ == "__main__":
    # Calculate dates for the past 10 years
    end_date = datetime.date.today().strftime("%Y-%m-%d")
    start_date = (datetime.date.today() - datetime.timedelta(days=365*10)).strftime("%Y-%m-%d")
    
    print(f"Fetching data for date range: {start_date} to {end_date}")
    
    # Fetch and save data
    summary = fetch_indices_data(start_date, end_date)
    
    print("\nData Fetching Complete!")
    print(f"Number of indices processed: {summary['indices_count']}")
    print(f"Date range: {summary['date_range']}")
    print(f"Best performing index: {summary['best_performer']}")
    print(f"Worst performing index: {summary['worst_performer']}")
