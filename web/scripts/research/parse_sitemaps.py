"""
Sitemap Parser - Extract Geographic Locations from Competitor Sitemaps

This script downloads and parses sitemaps from competitor lead gen sites
to understand their geographic targeting strategy.

Usage:
    python parse_sitemaps.py
"""

import requests
import gzip
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from collections import Counter
import json
import re

def download_sitemap(url):
    """Download sitemap (handles both regular and gzipped)"""
    print(f"Downloading: {url}")
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    if url.endswith('.gz'):
        content = gzip.decompress(response.content)
        return content.decode('utf-8')
    return response.text

def parse_sitemap_index(xml_content):
    """Parse sitemap index and return list of child sitemaps"""
    root = ET.fromstring(xml_content)
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    sitemaps = []
    for sitemap in root.findall('.//ns:sitemap', namespace):
        loc = sitemap.find('ns:loc', namespace)
        if loc is not None:
            sitemaps.append(loc.text)
    
    return sitemaps

def parse_sitemap_urls(xml_content):
    """Parse sitemap and return list of URLs"""
    root = ET.fromstring(xml_content)
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    urls = []
    for url in root.findall('.//ns:url', namespace):
        loc = url.find('ns:loc', namespace)
        if loc is not None:
            urls.append(loc.text)
    
    return urls

def extract_cities_from_urls(urls):
    """Extract city/state patterns from URLs"""
    cities = []
    
    # Common patterns:
    # - /city-state/
    # - /service/city-state/
    # - /category/city/state/
    
    patterns = [
        r'/([a-z-]+)-([a-z]{2})/?',  # city-state format
        r'/([a-z-]+)/([a-z]{2})/?',   # city/state format
        r'/in/([a-z-]+)-([a-z]{2})/?', # in/city-state format
    ]
    
    for url in urls:
        for pattern in patterns:
            match = re.search(pattern, url.lower())
            if match:
                city = match.group(1).replace('-', ' ').title()
                state = match.group(2).upper()
                cities.append(f"{city}, {state}")
                break
    
    return cities

def analyze_thumbtack():
    """Analyze Thumbtack's geographic targeting"""
    print("\n=== THUMBTACK ANALYSIS ===")
    
    try:
        # Download main sitemap
        sitemap_index = download_sitemap("https://www.thumbtack.com/sitemap.xml")
        child_sitemaps = parse_sitemap_index(sitemap_index)
        
        print(f"Found {len(child_sitemaps)} child sitemaps")
        
        # Find the citystate sitemap
        citystate_sitemap = [s for s in child_sitemaps if 'citystate' in s.lower()]
        
        if citystate_sitemap:
            print(f"Processing: {citystate_sitemap[0]}")
            content = download_sitemap(citystate_sitemap[0])
            urls = parse_sitemap_urls(content)
            cities = extract_cities_from_urls(urls)
            
            print(f"\nTotal city pages: {len(cities)}")
            print(f"Unique cities: {len(set(cities))}")
            
            # Save results
            with open('docs/research/thumbtack_cities.json', 'w') as f:
                json.dump(sorted(set(cities)), f, indent=2)
            
            return cities
    
    except Exception as e:
        print(f"Error: {e}")
        return []

def analyze_angi():
    """Analyze Angi's geographic targeting"""
    print("\n=== ANGI ANALYSIS ===")
    
    try:
        # Download geo sitemap index
        sitemap_index = download_sitemap("https://www.angi.com/geo-sitemap-index.xml")
        child_sitemaps = parse_sitemap_index(sitemap_index)
        
        print(f"Found {len(child_sitemaps)} geo sitemaps")
        
        all_cities = []
        
        # Process first few sitemaps (to avoid overwhelming)
        for sitemap_url in child_sitemaps[:5]:  # Limit to first 5
            print(f"Processing: {sitemap_url}")
            content = download_sitemap(sitemap_url)
            urls = parse_sitemap_urls(content)
            cities = extract_cities_from_urls(urls)
            all_cities.extend(cities)
        
        print(f"\nTotal city pages (sample): {len(all_cities)}")
        print(f"Unique cities (sample): {len(set(all_cities))}")
        
        # Save results
        with open('docs/research/angi_cities_sample.json', 'w') as f:
            json.dump(sorted(set(all_cities)), f, indent=2)
        
        return all_cities
    
    except Exception as e:
        print(f"Error: {e}")
        return []

def analyze_homeguide():
    """Analyze HomeGuide's geographic targeting"""
    print("\n=== HOMEGUIDE ANALYSIS ===")
    
    try:
        all_cities = []
        
        # Process both sitemap lists
        for i in range(2):
            url = f"https://homeguide.com/city_service_sitemap_list_{i}.xml"
            print(f"Processing: {url}")
            
            content = download_sitemap(url)
            urls = parse_sitemap_urls(content)
            cities = extract_cities_from_urls(urls)
            all_cities.extend(cities)
        
        print(f"\nTotal city pages: {len(all_cities)}")
        print(f"Unique cities: {len(set(all_cities))}")
        
        # Save results
        with open('docs/research/homeguide_cities.json', 'w') as f:
            json.dump(sorted(set(all_cities)), f, indent=2)
        
        return all_cities
    
    except Exception as e:
        print(f"Error: {e}")
        return []

def compare_coverage(thumbtack_cities, angi_cities, homeguide_cities):
    """Compare city coverage across competitors"""
    print("\n=== COVERAGE COMPARISON ===")
    
    all_competitors = {
        'Thumbtack': set(thumbtack_cities),
        'Angi': set(angi_cities),
        'HomeGuide': set(homeguide_cities)
    }
    
    # Find common cities
    common = all_competitors['Thumbtack'] & all_competitors['Angi'] & all_competitors['HomeGuide']
    print(f"\nCities targeted by all three: {len(common)}")
    
    # Most common cities
    all_cities = thumbtack_cities + angi_cities + homeguide_cities
    city_counts = Counter(all_cities)
    
    print("\nTop 20 most commonly targeted cities:")
    for city, count in city_counts.most_common(20):
        print(f"  {city}: {count}/3 competitors")
    
    # Save comparison
    with open('docs/research/coverage_comparison.json', 'w') as f:
        json.dump({
            'common_to_all': sorted(list(common)),
            'top_cities': [{'city': city, 'count': count} for city, count in city_counts.most_common(50)]
        }, f, indent=2)

if __name__ == "__main__":
    print("Starting sitemap analysis...")
    print("This may take a few minutes...\n")
    
    # Analyze each competitor
    thumbtack_cities = analyze_thumbtack()
    angi_cities = analyze_angi()
    homeguide_cities = analyze_homeguide()
    
    # Compare coverage
    if thumbtack_cities or angi_cities or homeguide_cities:
        compare_coverage(thumbtack_cities, angi_cities, homeguide_cities)
    
    print("\n✅ Analysis complete! Check docs/research/ for results.")
