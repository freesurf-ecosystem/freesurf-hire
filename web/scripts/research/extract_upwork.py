"""Extract Upwork sitemap URLs into JSON for taxonomy review.

Drop the raw Upwork sitemap .xml files into
`web/docs/research/taxonomy/upwork/`, then run:

    python web/scripts/research/extract_upwork.py

Outputs (written next to the raw files):
    upwork_skills.json              -> [{ slug, name, url }]
    upwork_service_categories.json  -> [{ slug, name, url }]
    upwork_skill_cities.json        -> [{ service, city, state, url }]
"""

import json
import re
from pathlib import Path

RESEARCH_DIR = Path(__file__).resolve().parents[2] / "docs" / "research" / "taxonomy" / "upwork"

LOC_RE = re.compile(r"<loc>\s*([^<]+?)\s*</loc>")


def read_locs(path: Path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    return [m.strip() for m in LOC_RE.findall(text)]


def title_case(slug: str) -> str:
    return " ".join(word.capitalize() for word in slug.replace("-", " ").split())


def extract_skills() -> list:
    rows = {}
    for path in RESEARCH_DIR.glob("sitemap-freelance-jobs-skill-*.xml"):
        for url in read_locs(path):
            slug = url.rstrip("/").split("/freelance-jobs/")[-1]
            if slug and slug not in rows:
                rows[slug] = {"slug": slug, "name": title_case(slug), "url": url}
    return sorted(rows.values(), key=lambda r: r["slug"])


def extract_service_categories() -> list:
    rows = {}
    for path in RESEARCH_DIR.glob("sitemap-catalog-services-search-*.xml"):
        for url in read_locs(path):
            slug = url.rstrip("/").split("/services/search/")[-1]
            if slug and slug not in rows:
                rows[slug] = {"slug": slug, "name": title_case(slug), "url": url}
    return sorted(rows.values(), key=lambda r: r["slug"])


CITY_RE = re.compile(r"/hire/([^/]+)/us/([a-z0-9-]+?)-([a-z]{2})/?$")


def extract_skill_cities() -> list:
    rows = {}
    for path in RESEARCH_DIR.glob("sitemap-freelance-jobs-skill-city-*.xml"):
        for url in read_locs(path):
            match = CITY_RE.search(url)
            if not match:
                continue
            service, city, state = match.groups()
            key = f"{service}|{city}-{state}"
            if key not in rows:
                rows[key] = {
                    "service": service,
                    "city": city,
                    "state": state.upper(),
                    "url": url,
                }
    return sorted(rows.values(), key=lambda r: (r["service"], r["city"]))


def write(name: str, rows: list, txt_lines: list):
    out = RESEARCH_DIR / name
    out.write_text(json.dumps(rows, indent=2), encoding="utf-8")
    txt = RESEARCH_DIR / name.replace(".json", ".txt")
    txt.write_text("\n".join(txt_lines) + ("\n" if txt_lines else ""), encoding="utf-8")
    print(f"{name}: {len(rows)} rows")


def main():
    if not RESEARCH_DIR.exists():
        raise SystemExit(f"missing {RESEARCH_DIR}")

    skills = extract_skills()
    write("upwork_skills.json", skills, [r["slug"] for r in skills])

    categories = extract_service_categories()
    write("upwork_service_categories.json", categories, [r["slug"] for r in categories])

    skill_cities = extract_skill_cities()
    write(
        "upwork_skill_cities.json",
        skill_cities,
        [f'{r["service"]}\t{r["state"]}\t{r["city"]}' for r in skill_cities],
    )


if __name__ == "__main__":
    main()
