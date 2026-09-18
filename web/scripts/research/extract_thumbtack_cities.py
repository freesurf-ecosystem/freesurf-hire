"""
Extract all unique cities from Thumbtack sitemaps
"""
import requests
import gzip
import re
from collections import Counter

def get_cities_from_sitemap(sitemap_num):
    """Download and parse a single sitemap"""
    url = f"https://www.thumbtack.com/sitemap_lp_{sitemap_num}.xml.gz"
    print(f"Downloading sitemap_lp_{sitemap_num}...")
    
    try:
        response = requests.get(url, timeout=30)
        content = gzip.decompress(response.content).decode('utf-8')
        
        # Pattern: /state/city/service
        # Extract all city names from URLs
        pattern = r'https://www\.thumbtack\.com/[a-z]{2}/([a-z-]+)/'
        matches = re.findall(pattern, content)
        
        print(f"  Found {len(matches)} URLs")
        return matches
    
    except Exception as e:
        print(f"  Error: {e}")
        return []

def main():
    print("Extracting cities from Thumbtack sitemaps...\n")
    
    all_cities = []
    
    # Process all 9 sitemap files (0-8)
    for i in range(9):
        cities = get_cities_from_sitemap(i)
        all_cities.extend(cities)
    
    # Get unique cities and clean up
    unique_cities = set()
    for city in all_cities:
        # Convert kebab-case to title case
        city_name = city.replace('-', ' ').title()
        unique_cities.add(city_name)
    
    # Sort alphabetically
    sorted_cities = sorted(unique_cities)
    
    print(f"\n{'='*60}")
    print(f"TOTAL UNIQUE CITIES: {len(sorted_cities)}")
    print(f"{'='*60}\n")
    
    # Save to file
    with open('docs/research/thumbtack_unique_cities.txt', 'w') as f:
        for city in sorted_cities:
            f.write(f"{city}\n")
    
    print(f"✅ Saved to: docs/research/thumbtack_unique_cities.txt")
    
    # Show some statistics
    city_counts = Counter(all_cities)
    print(f"\nMost frequently appearing cities:")
    for city, count in city_counts.most_common(20):
        city_display = city.replace('-', ' ').title()
        print(f"  {city_display}: {count:,} pages")
    
    # Show sample of cities
    print(f"\nSample of cities (first 50):")
    for city in sorted_cities[:50]:
        print(f"  - {city}")

if __name__ == "__main__":
    main()
