"""
Extract Angi service (skill) slugs from:
  - sitemap/statecat-sitemap.xml   (/companylist/us/{state}/{service}.htm)
  - sitemap/nearme-sitemap.xml     (/nearme/{service}/)
  - sitemap/geo-sitemap-index.xml  (angi-geocat-{service}.xml filenames)

Output: docs/research/taxonomy/angi_services.txt
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

services = set()
state_service = set()

# statecat
d = get("https://www.angi.com/sitemap/statecat-sitemap.xml")
for st, svc in re.findall(r"/companylist/us/([a-z]{2})/([a-z0-9-]+)\.htm", d):
    services.add(svc)
    state_service.add((st, svc))
print(f"statecat services so far: {len(services)}")

# nearme
d = get("https://www.angi.com/sitemap/nearme-sitemap.xml")
for svc in re.findall(r"/nearme/([a-z0-9-]+)/", d):
    services.add(svc)
print(f"after nearme: {len(services)}")

# geo index filenames
d = get("https://www.angi.com/sitemap/geo-sitemap-index.xml")
for svc in re.findall(r"angi-geocat-([a-z0-9-]+)\.xml", d):
    services.add(svc)
print(f"after geo index: {len(services)}")

with open(os.path.join(OUT_DIR, "angi_services.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(services)) + "\n")

with open(os.path.join(OUT_DIR, "angi_state_service_pairs.txt"), "w", encoding="utf-8") as f:
    for st, svc in sorted(state_service):
        f.write(f"{st}\t{svc}\n")

print(f"unique Angi services: {len(services)}")
print(f"state/service pairs: {len(state_service)}")
