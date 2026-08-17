"""Assemble the Hostinger blocks into previewable pages.

Dev-only harness. Mirrors what Hostinger does: each self-contained embed block
goes in <body> in filename order (every block already carries its own styles +
runtime, so nothing goes in <head>). Nav and footer are shared across every
page, exactly as they are in the builder. Run build-embeds.py first if you have
edited assets/.

    python build-preview.py

Writes preview.html (homepage) and preview-<page>.html for each inner page.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
SECTIONS = ROOT / "sections"
PAGES = ROOT / "pages"

nav = (SECTIONS / "01-nav.html").read_text(encoding="utf-8")
cta = (SECTIONS / "12-cta.html").read_text(encoding="utf-8")
footer = (SECTIONS / "13-footer.html").read_text(encoding="utf-8")


def wrap(title, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>html,body{{margin:0;padding:0;background:#0A0A0B;}}</style>
</head>
<body>
{body}
</body>
</html>
"""


def join(paths):
    return "\n\n".join(
        f"<!-- ===== {p.name} ===== -->\n{p.read_text(encoding='utf-8')}"
        for p in paths
    )


# ---- homepage: every block in sections/, in order ----
home_blocks = sorted(SECTIONS.glob("*.html"))
(ROOT / "preview.html").write_text(
    wrap("Silstone.AI - home", join(home_blocks)), encoding="utf-8"
)
print(f"preview.html  <- {len(home_blocks)} blocks")

# ---- inner pages: nav + page blocks + shared CTA + footer ----
for page_dir in sorted(d for d in PAGES.iterdir() if d.is_dir()):
    blocks = sorted(page_dir.glob("*.html"))
    if not blocks:
        continue
    body = "\n\n".join([nav, join(blocks), cta, footer])
    out = ROOT / f"preview-{page_dir.name}.html"
    out.write_text(wrap(f"Silstone.AI - {page_dir.name}", body), encoding="utf-8")
    print(f"{out.name}  <- nav + {len(blocks)} blocks + cta + footer")
