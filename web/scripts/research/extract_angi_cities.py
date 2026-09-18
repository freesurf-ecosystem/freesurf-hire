"""
Extract Angi state/city pairs from the per-service geo sitemaps
(sitemap/angi-geocat-{service}.xml -> /companylist/us/{state}/{city}/{service}.htm).

Output: docs/research/taxonomy/angi_state_cities.txt
"""
import urllib.request
import gzip
import re
import os

UA = {"User-Agent": "Mozilla/5.0"}
OUT_DIR = os.path.join("docs", "research", "taxonomy")
os.makedirs(OUT_DIR, exist_ok=True)

def get(u):
    req = urllib.request.Request(u, headers=UA)
    raw = urllib.request.urlopen(req, timeout=60).read()
    if u.endswith(".gz") or raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return raw.decode("utf-8", "ignore")

idx = get("https://www.angi.com/sitemap/geo-sitemap-index.xml")
files = re.findall(r"<loc>(.*?angi-geocat-[a-z0-9-]+\.xml)</loc>", idx)
print(f"geocat files: {len(files)}")

pairs = set()
for i, u in enumerate(files):
    try:
        d = get(u)
        for st, city in re.findall(r"/companylist/us/([a-z]{2})/([a-z0-9-]+)/[a-z0-9-]+\.htm", d):
            pairs.add((st, city))
    except Exception as e:
        print(f"  ERROR {u}: {e}")
    if (i + 1) % 25 == 0:
        print(f"  {i+1}/{len(files)} files, {len(pairs)} pairs")

with open(os.path.join(OUT_DIR, "angi_state_cities.txt"), "w", encoding="utf-8") as f:
    for st, city in sorted(pairs):
        f.write(f"{st}\t{city}\n")

print(f"unique Angi state/city pairs: {len(pairs)}")
