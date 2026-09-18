"""
Extract TaskRabbit services (skills), groups, and locations (cities) from:
  - sitemaps/www.taskrabbit.com/marketing_groups.xml.gz      -> /services/{group}/{service}
  - sitemaps/www.taskrabbit.com/geo_marketing_pages.xml.gz   -> /locations/{city} and /locations/{city}/{service}, /near-me/{service}

Outputs (docs/research/taxonomy/):
  - taskrabbit_services.txt       leaf service slugs
  - taskrabbit_groups.txt         top-level service groups
  - taskrabbit_locations.txt      city slugs
  - taskrabbit_city_services.txt  "city<TAB>service" pairs
"""
import urllib.request
import gzip
import re
import os

UA = {"User-Agent": "Mozilla/5.0"}
OUT_DIR = os.path.join("docs", "research", "taxonomy")
os.makedirs(OUT_DIR, exist_ok=True)
BASE = "https://www.taskrabbit.com/sitemaps/www.taskrabbit.com/"

def get(u):
    req = urllib.request.Request(u, headers=UA)
    raw = urllib.request.urlopen(req, timeout=120).read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return raw.decode("utf-8", "ignore")

services = set()
groups = set()
cities = set()
pairs = set()

d = get(BASE + "marketing_groups.xml.gz")
for u in re.findall(r"<loc>(.*?)</loc>", d):
    p = u.replace("https://www.taskrabbit.com", "").strip("/").split("/")
    if p and p[0] == "services":
        if len(p) >= 3:
            groups.add(p[1]); services.add(p[2])
        elif len(p) == 2:
            groups.add(p[1])

d = get(BASE + "geo_marketing_pages.xml.gz")
for u in re.findall(r"<loc>(.*?)</loc>", d):
    p = u.replace("https://www.taskrabbit.com", "").strip("/").split("/")
    if p and p[0] == "locations":
        if len(p) >= 2:
            cities.add(p[1])
        if len(p) >= 3:
            services.add(p[2]); pairs.add((p[1], p[2]))
    elif p and p[0] == "near-me" and len(p) >= 2:
        services.add(p[1])

with open(os.path.join(OUT_DIR, "taskrabbit_services.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(services)) + "\n")
with open(os.path.join(OUT_DIR, "taskrabbit_groups.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(groups)) + "\n")
with open(os.path.join(OUT_DIR, "taskrabbit_locations.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(cities)) + "\n")
with open(os.path.join(OUT_DIR, "taskrabbit_city_services.txt"), "w", encoding="utf-8") as f:
    for city, svc in sorted(pairs):
        f.write(f"{city}\t{svc}\n")

print(f"services: {len(services)}")
print(f"groups: {len(groups)}")
print(f"cities: {len(cities)}")
print(f"city/service pairs: {len(pairs)}")
