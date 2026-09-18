"""
Consolidate the local service list and the remote skill list into SEO-ready files
with NO source attribution (attribution is kept separately in SOURCES.md).

Inputs come from the private research folder (git-ignored):
  - local_services.txt      local service slugs
  - local_state_cities.txt  "state<TAB>city" pairs
  - remote_categories.txt   remote category paths

Outputs go to src/data/taxonomy/, which IS tracked - the sitemap generator and
src/data/services.ts are built from them, so a fresh clone can regenerate the
sitemaps without the research folder.
  - skills.json     consolidated skills: { slug, name, scope, category }
  - locations.json  consolidated state/city pairs: { state, city }
  - skills.md       readable summary
"""
import os
import json
import re
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
# Private research inputs (git-ignored).
TAX = os.path.abspath(os.path.join(HERE, "..", "..", "docs", "research", "taxonomy"))
# Tracked build outputs.
OUT = os.path.abspath(os.path.join(HERE, "..", "..", "src", "data", "taxonomy"))

ARTIFACTS = {"chico", "lakewood", "-tampa-bay-and-all-surrendering-areas"}


def read_lines(name):
    path = os.path.join(TAX, name)
    if not os.path.exists(path):
        print("missing:", path)
        return []
    with open(path, encoding="utf-8") as f:
        return [ln.strip() for ln in f if ln.strip()]


def titleize(slug):
    return re.sub(r"[-_]+", " ", slug).strip().title()


skills = {}


def add(slug, scope, category=""):
    slug = slug.strip().lower()
    if not slug or slug in ARTIFACTS or slug.startswith("-"):
        return
    entry = skills.setdefault(slug, {"slug": slug, "name": titleize(slug), "scope": scope, "category": category})
    if scope == "remote" and entry["scope"] == "local":
        entry["scope"] = "both"
    elif scope == "local" and entry["scope"] == "remote":
        entry["scope"] = "both"
    if category and not entry["category"]:
        entry["category"] = category


# Local (city-based) services
for slug in read_lines("local_services.txt"):
    add(slug, "local")

# Remote (freelance) skills â€” path may be "top" or "top/sub"
for path in read_lines("remote_categories.txt"):
    parts = path.split("/")
    top = parts[0]
    if len(parts) > 1:
        add(parts[-1], "remote", category=top)
    else:
        add(top, "remote")

out = sorted(skills.values(), key=lambda s: s["slug"])

with open(os.path.join(OUT, "skills.json"), "w", encoding="utf-8") as f:
    json.dump({"generated": date.today().isoformat(), "count": len(out), "skills": out}, f, indent=2, ensure_ascii=False)

# Locations (state -> city)
locations = []
seen = set()
for line in read_lines("local_state_cities.txt"):
    parts = line.split("\t")
    if len(parts) >= 2:
        state, city = parts[0].strip(), parts[1].strip()
        key = (state, city)
        if city and key not in seen:
            seen.add(key)
            locations.append({"state": state, "city": city})

with open(os.path.join(OUT, "locations.json"), "w", encoding="utf-8") as f:
    json.dump({"generated": date.today().isoformat(), "count": len(locations), "locations": locations}, f, indent=2, ensure_ascii=False)

counts = {}
for e in out:
    counts[e["scope"]] = counts.get(e["scope"], 0) + 1

with open(os.path.join(OUT, "skills.md"), "w", encoding="utf-8") as f:
    f.write("# Consolidated skills (local + remote)\n\n")
    f.write(f"Generated: {date.today().isoformat()} Â· total: {len(out)}\n\n")
    f.write("Scope: `local` = city landing pages Â· `remote` = no city pages (zip hidden in search) Â· `both`.\n")
    f.write("Source attribution: see SOURCES.md.\n\n")
    f.write(f"- local: {counts.get('local', 0)}\n- remote: {counts.get('remote', 0)}\n- both: {counts.get('both', 0)}\n\n")
    f.write("| slug | name | scope | category |\n|---|---|---|---|\n")
    for e in out:
        f.write(f"| {e['slug']} | {e['name']} | {e['scope']} | {e['category']} |\n")

print("skills:", len(out), counts)
print("locations:", len(locations))
