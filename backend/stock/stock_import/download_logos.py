#!/usr/bin/env python3
"""
Download stock logos and create a ZIP file for import.
Uses multiple fallback sources for logos.
"""

import os
import csv
import requests
import zipfile
from pathlib import Path
from PIL import Image
from io import BytesIO

# Stock symbol to company domain mapping
STOCK_DOMAINS = {
    'AAPL': 'apple.com',
    'GOOGL': 'google.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'TSLA': 'tesla.com',
    'NVDA': 'nvidia.com',
    'META': 'meta.com',
    'BRK.B': 'berkshirehathaway.com',
    'JPM': 'jpmorganchase.com',
    'V': 'visa.com',
    'JNJ': 'jnj.com',
    'UNH': 'unitedhealthgroup.com',
    'HD': 'homedepot.com',
    'PG': 'pg.com',
    'MA': 'mastercard.com',
    'DIS': 'disney.com',
    'NFLX': 'netflix.com',
    'ADBE': 'adobe.com',
    'CRM': 'salesforce.com',
    'PYPL': 'paypal.com',
    'INTC': 'intel.com',
    'AMD': 'amd.com',
    'CSCO': 'cisco.com',
    'PEP': 'pepsico.com',
    'KO': 'coca-cola.com',
    'NKE': 'nike.com',
    'MCD': 'mcdonalds.com',
    'WMT': 'walmart.com',
    'COST': 'costco.com',
    'BA': 'boeing.com',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def download_logo(symbol: str, domain: str, output_dir: Path) -> bool:
    """Try multiple sources to download logo."""
    
    sources = [
        # Google favicon service (high res)
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128",
        # DuckDuckGo icons
        f"https://icons.duckduckgo.com/ip3/{domain}.ico",
        # Favicon grabber
        f"https://favicone.com/{domain}?s=128",
    ]
    
    for url in sources:
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200 and len(response.content) > 100:
                # Try to process as image
                try:
                    img = Image.open(BytesIO(response.content))
                    # Convert to RGBA and resize to 128x128
                    img = img.convert('RGBA')
                    img = img.resize((128, 128), Image.Resampling.LANCZOS)
                    
                    # Save as PNG
                    filepath = output_dir / f"{symbol}.png"
                    img.save(filepath, 'PNG')
                    print(f"✓ Downloaded {symbol}")
                    return True
                except Exception:
                    continue
        except Exception:
            continue
    
    print(f"✗ Failed to download {symbol}")
    return False

def create_zip(output_dir: Path, zip_path: Path):
    """Create ZIP file with CSV and images."""
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add CSV
        csv_path = output_dir / 'stocks.csv'
        if csv_path.exists():
            zf.write(csv_path, 'stocks.csv')
        
        # Add all images
        for img_file in output_dir.glob('*.png'):
            zf.write(img_file, img_file.name)
    
    print(f"\n✓ Created {zip_path}")

def main():
    script_dir = Path(__file__).parent
    
    print("Downloading stock logos...\n")
    
    success_count = 0
    for symbol, domain in STOCK_DOMAINS.items():
        if download_logo(symbol, domain, script_dir):
            success_count += 1
    
    print(f"\nDownloaded {success_count}/{len(STOCK_DOMAINS)} logos")
    
    # Create ZIP
    zip_path = script_dir / 'stocks.zip'
    create_zip(script_dir, zip_path)
    print(f"ZIP file ready: {zip_path}")

if __name__ == '__main__':
    main()
