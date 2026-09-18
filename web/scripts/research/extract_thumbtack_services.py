"""
Extract unique service (skill) slugs and state/city pairs from Thumbtack's
`sitemap_services_*` sitemaps.

URL pattern: https://www.thumbtack.com/{state}/{city}/{service}/{pro}/service/{id}

Outputs (into docs/research/taxonomy/, under the canonical source-neutral names):
  - local_services.txt       unique service slugs (sorted)
  - local_state_cities.txt   unique "state<TAB>city" pairs
"""
import urllib.request
import gzip
import re
import os

UA = {"User-Agent": "Mozilla/5.0"}
OUT_DIR = os.path.join("docs", "research", "taxonomy")
os.makedirs(OUT_DIR, exist_ok=True)

services = set()
pairs = set()

for i in range(8):
    url = f"https://www.thumbtack.com/sitemap_services_{i}.xml.gz"
    try:
        req = urllib.request.Request(url, headers=UA)
        raw = urllib.request.urlopen(req, timeout=120).read()
        d = gzip.decompress(raw).decode("utf-8", "ignore")
        locs = re.findall(r"<loc>(.*?)</loc>", d)
        for u in locs:
            m = re.match(r"https://www\.thumbtack\.com/([a-z]{2})/([a-z0-9-]+)/([a-z0-9-]+)/", u)
            if m:
                pairs.add((m.group(1), m.group(2)))
                services.add(m.group(3))
        print(f"sitemap_services_{i}: {len(locs)} urls")
    except Exception as e:
        print(f"sitemap_services_{i}: ERROR {e}")

with open(os.path.join(OUT_DIR, "local_services.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(services)) + "\n")

with open(os.path.join(OUT_DIR, "local_state_cities.txt"), "w", encoding="utf-8") as f:
    for st, city in sorted(pairs):
        f.write(f"{st}\t{city}\n")

print(f"unique services: {len(services)}")
print(f"unique state/city pairs: {len(pairs)}")
