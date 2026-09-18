"""
Extract Fiverr service categories (remote skills) from sitemap_categories.xml.gz.
URL shape: /categories/{top}/{sub}

Outputs (docs/research/taxonomy/):
  - fiverr_categories.txt        full category paths (slug form)
  - fiverr_remote_skills.md      grouped top-level -> subcategories
"""
import urllib.request
import gzip
import re
import os

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs", "taxonomy"))
os.makedirs(OUT_DIR, exist_ok=True)

req = urllib.request.Request("https://www.fiverr.com/sitemap_categories.xml.gz", headers=UA)
raw = urllib.request.urlopen(req, timeout=60).read()
if raw[:2] == b"\x1f\x8b":
    raw = gzip.decompress(raw)
d = raw.decode("utf-8", "ignore")

locs = re.findall(r"<loc>(.*?)</loc>", d)
paths = []
for u in locs:
    m = re.match(r"https://www\.fiverr\.com/categories/(.+)$", u)
    if m:
        paths.append(m.group(1).rstrip("/"))

paths = sorted(set(paths))

# Group by top-level
groups = {}
for p in paths:
    parts = p.split("/")
    top = parts[0]
    groups.setdefault(top, []).append("/".join(parts[1:]) if len(parts) > 1 else "")

with open(os.path.join(OUT_DIR, "fiverr_categories.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(paths) + "\n")

with open(os.path.join(OUT_DIR, "fiverr_remote_skills.md"), "w", encoding="utf-8") as f:
    f.write("# Fiverr categories (remote skills)\n\n")
    f.write("Extracted from Fiverr's category sitemap. Remote/freelance skills — these do **not** need city landing pages.\n\n")
    for top in sorted(groups):
        f.write(f"## {top}\n")
        subs = [s for s in sorted(set(groups[top])) if s]
        if subs:
            for s in subs:
                f.write(f"- {s}\n")
        else:
            f.write("(top-level only)\n")
        f.write("\n")

print("categories:", len(paths))
print("top-level groups:", len(groups))
