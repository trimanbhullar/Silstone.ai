"""Generate the REAL, index-friendly static site into dist/  --  the version you
upload to Hostinger Web Hosting (File Manager / FTP / Git), NOT the Website
Builder.

Why this exists
---------------
The Website Builder "Embed code" flow (build-embeds.py + build-preview.py) is
great for pasting blocks into the builder, but every block is sandboxed and the
page's <head> is out of your control -- no per-page <title>, meta description,
canonical, Open Graph or sitemap. That is why the site indexes poorly.

This script takes the SAME single source of truth ...

    assets/silstone.css   assets/silstone.js
    sections/*.html       pages/<slug>/*.html

... and assembles full, standalone HTML documents with a proper SEO + GEO
<head>, ONE shared external stylesheet + script (linked, not inlined 28x), a
sitemap.xml, robots.txt, llms.txt and an .htaccess with the /resources ->
/live-demos redirect. Output goes to dist/ using clean folder URLs
(dist/what-we-build/index.html  ->  https://www.silstone.ai/what-we-build).

    python build-embeds.py   # optional, only if you still paste embed blocks
    python build-site.py      # -> dist/   (upload the CONTENTS of dist/)

Edit design in assets/ and copy in sections/ + pages/ exactly as before, then
re-run. The per-page SEO strings live in the PAGES table below (sourced from
SEO-COPY.md) -- edit them there.
"""
import pathlib
import re
import shutil
import datetime
import html as _html

ROOT = pathlib.Path(__file__).parent
SECTIONS = ROOT / "sections"
PAGES = ROOT / "pages"
DIST = ROOT / "dist"

DOMAIN = "https://www.silstone.ai"
ORG_NAME = "Silstone.AI"
ORG_EMAIL = "sales@silstonegroup.com"
ORG_PHONE = "+1-613-558-5913"
OG_IMAGE = f"{DOMAIN}/assets/og.jpg"
# Favicon: drop a square icon at brand/favicon.png and it is used automatically;
# otherwise we fall back to the wordmark so the build never breaks.
FAVICON_SRC = ROOT / "brand" / "favicon.png"
FAVICON_HREF = "/assets/favicon.png" if FAVICON_SRC.exists() else "/assets/logo-mark.png"
FONTS_HREF = ("https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700"
              "&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500"
              "&display=swap")
TODAY = datetime.date.today().isoformat()

START = "<!-- SIL:GLOBAL START"
END = "<!-- SIL:GLOBAL END -->"

# ---------------------------------------------------------------------------
# Per-page SEO / GEO metadata.  slug "" == homepage.  Order == sitemap order.
# title <=60 chars, description 140-155 chars (mirrors SEO-COPY.md).
# ---------------------------------------------------------------------------
PAGES_META = [
    {
        "slug": "", "dir": None,  # home = sections/
        "title": "AI Agents for Healthcare | Silstone.AI",
        "desc": "Custom AI agents for healthcare practices, built by people who have run healthcare. Live in weeks, no EMR integration, PHI under a full HIPAA BAA.",
        "priority": "1.0",
    },
    {
        "slug": "what-we-build", "dir": "what-we-build",
        "title": "What We Build | Silstone.AI",
        "desc": "A cited knowledge brain your staff can ask anything, plus custom agents that clear the fax pile, chase underpayments and run portals that have no API.",
        "priority": "0.9",
    },
    {
        "slug": "dental-automation", "dir": "dental-automation",
        "title": "Dental Practice AI Automation | Silstone.AI",
        "desc": "AI agents for dental practices: clear the fax pile, chase insurance underpayments and run credentialing portals. Live in weeks, no PMS integration.",
        "priority": "0.9",
    },
    {
        "slug": "aesthetics-automation", "dir": "aesthetics-automation",
        "title": "Aesthetics & Med-Spa AI Automation | Silstone.AI",
        "desc": "AI agents for aesthetic and med-spa clinics that handle inbound enquiries, bookings and back-office admin, so your team sells time instead of chasing it.",
        "priority": "0.9",
    },
    {
        "slug": "live-demos", "dir": "live-demos",
        "title": "Live Demos | Try a Healthcare AI Agent | Silstone.AI",
        "desc": "Run a free, interactive healthcare AI agent right in your browser, no signup. See how a Silstone agent answers questions and handles admin, built on Claude.",
        "priority": "0.8",
    },
    {
        "slug": "why-silstone", "dir": "why-silstone",
        "title": "Why Silstone | Healthcare-Native AI Studio",
        "desc": "Built inside healthcare, not adjacent to it. Years of practice operations plus years shipping healthcare software, in one small and senior team.",
        "priority": "0.7",
    },
    {
        "slug": "pricing", "dir": "pricing",
        "title": "Pricing | Silstone.AI",
        "desc": "Priced in three parts so incentives stay honest: a build fee to stand it up, a monthly subscription to run it, and an outcome slice tied to the result.",
        "priority": "0.7",
    },
    {
        "slug": "trust-and-security", "dir": "trust-and-security",
        "title": "Trust & Security | Silstone.AI",
        "desc": "No EMR integration by design. PHI runs on AWS Bedrock under a full HIPAA BAA, with a human approving every action before anything is filed, sent or paid.",
        "priority": "0.7",
    },
    {
        "slug": "contact", "dir": "contact",
        "title": "Book a Scoping Call | Silstone.AI",
        "desc": "Book a 20 minute scoping call. We will find where your time and money is leaking and tell you honestly whether we can help. No integration, no obligation.",
        "priority": "0.6",
    },
    {
        "slug": "blog", "dir": "blog",
        "title": "Blog | Silstone.AI",
        "desc": "Field notes on healthcare AI, payer underpayment recovery, credentialing and the back-office admin that quietly drains medical and dental practices.",
        "priority": "0.5",
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def strip_global(text: str) -> str:
    """Remove the baked SIL:GLOBAL <style>/<script> block; keep the block's own
    markup (and any block-specific <style>/<script> below the END marker)."""
    if START in text and END in text:
        pre = text[: text.index(START)]
        post = text[text.index(END) + len(END):]
        return (pre + post).strip()
    return text.strip()


def read_block(path: pathlib.Path) -> str:
    return strip_global(path.read_text(encoding="utf-8"))


def clean_dist() -> None:
    """Empty dist/ before a rebuild, but PRESERVE dist/.git and .gitignore so the
    folder can double as the deploy repo Hostinger pulls from (git push = deploy)."""
    keep = {".git", ".gitignore"}
    if not DIST.exists():
        DIST.mkdir()
        return
    for child in DIST.iterdir():
        if child.name in keep:
            continue
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


# ---- perf: swap the repeated inline logo blob for a cacheable file ----
# The wordmark ships as a ~15KB base64 data URI (in the nav, and again in the
# footer) so each embed block is self-contained. On the real site those bytes
# would land in every page and never cache, so we point every copy of the
# wordmark at the one shared /assets/logo-mark.png. Other, page-unique inline
# images are left alone.
def _wordmark_uri() -> str:
    """The exact base64 data URI of the nav wordmark, read from source."""
    nav = (SECTIONS / "01-nav.html").read_text(encoding="utf-8")
    m = re.search(r'class="sil-logo-img" src="(data:image/png;base64,[^"]*)"', nav)
    return m.group(1) if m else ""


WORDMARK_URI = _wordmark_uri()


def deinline_logo(html: str) -> str:
    """Point every copy of the wordmark (nav + footer) at the one cached file."""
    if WORDMARK_URI:
        html = html.replace(WORDMARK_URI, "/assets/logo-mark.png")
    return html


def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)   # drop comments
    css = re.sub(r"\s+", " ", css)                            # collapse ws
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)             # tighten around punctuation
    css = css.replace(";}", "}")
    return css.strip()


def canonical(slug: str) -> str:
    return DOMAIN + "/" + slug if slug else DOMAIN + "/"


def org_jsonld() -> str:
    return (
        '{"@context":"https://schema.org","@type":"Organization",'
        f'"name":"{ORG_NAME}","url":"{DOMAIN}/",'
        f'"logo":"{DOMAIN}/assets/logo-mark.png",'
        '"description":"Healthcare-native AI studio that designs, builds and deploys custom AI agents to automate back-office work for medical and dental practices.",'
        '"contactPoint":{"@type":"ContactPoint","contactType":"sales",'
        f'"email":"{ORG_EMAIL}","telephone":"{ORG_PHONE}"}}}}'
    )


def website_jsonld() -> str:
    return (
        '{"@context":"https://schema.org","@type":"WebSite",'
        f'"name":"{ORG_NAME}","url":"{DOMAIN}/"}}'
    )


def breadcrumb_jsonld(title: str, slug: str) -> str:
    name = title.split("|")[0].strip()
    return (
        '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
        f'{{"@type":"ListItem","position":1,"name":"Home","item":"{DOMAIN}/"}},'
        f'{{"@type":"ListItem","position":2,"name":"{name}","item":"{canonical(slug)}"}}]}}'
    )


def head(meta: dict) -> str:
    slug, title, desc = meta["slug"], meta["title"], meta["desc"]
    url = canonical(slug)
    og_image = meta.get("og_image") or OG_IMAGE
    og_type = meta.get("og_type", "website")
    ld = [org_jsonld()]
    if slug == "":
        ld.append(website_jsonld())
    else:
        ld.append(breadcrumb_jsonld(title, slug))
    ld += meta.get("extra_ld", [])
    ld_tags = "\n".join(
        f'<script type="application/ld+json">{j}</script>' for j in ld
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#08080B">

<!-- Open Graph -->
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{ORG_NAME}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="1440">
<meta property="og:image:height" content="756">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_image}">

<link rel="icon" href="{FAVICON_HREF}">
<link rel="apple-touch-icon" href="{FAVICON_HREF}">

<!-- fonts loaded directly (was a serial @import inside the CSS) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS_HREF}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="{FONTS_HREF}"></noscript>

<style>html,body{{margin:0;padding:0;background:#08080B;}}</style>
<link rel="stylesheet" href="/assets/silstone.css">
{ld_tags}
</head>
<body>
"""


def page_html(meta: dict, body: str) -> str:
    doc = (
        head(meta)
        + body
        + '\n<script src="/assets/silstone.js" defer></script>\n</body>\n</html>\n'
    )
    return deinline_logo(doc)


def write_page(meta: dict, body: str) -> None:
    slug = meta["slug"]
    out_dir = DIST if slug == "" else DIST / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(page_html(meta, body), encoding="utf-8")


# ---------------------------------------------------------------------------
# Blog  --  posts live as Markdown in blog/posts/*.md (edited by the CMS).
# ---------------------------------------------------------------------------
BLOG_SRC = ROOT / "blog" / "posts"


def parse_post(path: pathlib.Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            v = v.strip()
            if len(v) >= 2 and v[0] == '"' and v[-1] == '"':
                v = v[1:-1].replace('\\"', '"')
            fm[k.strip()] = v
    fm["slug"] = path.stem
    fm["body"] = m.group(2).strip()
    return fm


def load_posts() -> list:
    posts = []
    if BLOG_SRC.exists():
        for p in BLOG_SRC.glob("*.md"):
            fm = parse_post(p)
            if fm and str(fm.get("draft", "false")).lower() != "true":
                posts.append(fm)
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)  # newest first
    return posts


def _md_inline(text: str) -> str:
    text = _html.escape(text, quote=False)
    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
                  r'<img src="\2" alt="\1" loading="lazy">', text)  # images before links
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\w)_([^_]+)_(?!\w)", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    return text


def md_to_html(md: str) -> str:
    # merge consecutive list items that the source separated with blank lines,
    # so a run of bullets becomes one <ul> instead of many single-item lists.
    prev = None
    while prev != md:
        prev = md
        md = re.sub(r"(?m)^(- .+)\n\n(?=- )", r"\1\n", md)
        md = re.sub(r"(?m)^(\d+\. .+)\n\n(?=\d+\. )", r"\1\n", md)
    out = []
    for b in re.split(r"\n\s*\n", md.strip()):
        lines = [l for l in b.split("\n") if l.strip()]
        if not lines:
            continue
        if all(l.strip().startswith("- ") for l in lines):
            items = "".join(f"<li>{_md_inline(l.strip()[2:])}</li>" for l in lines)
            out.append(f"<ul>{items}</ul>")
        elif all(re.match(r"\d+\.\s", l.strip()) for l in lines):
            lis = []
            for l in lines:
                txt = re.sub(r"^\d+\.\s", "", l.strip())
                lis.append(f"<li>{_md_inline(txt)}</li>")
            out.append("<ol>" + "".join(lis) + "</ol>")
        elif re.match(r"^#{1,6}\s+", b):
            mh = re.match(r"^(#{1,6})\s+(.*)$", b, re.DOTALL)
            level = len(mh.group(1))
            tag = "h2" if level <= 2 else ("h3" if level == 3 else "h4")
            out.append(f"<{tag}>{_md_inline(mh.group(2).strip())}</{tag}>")
        elif all(l.strip().startswith(">") for l in lines):
            inner = " ".join(_md_inline(l.strip().lstrip(">").strip()) for l in lines)
            out.append(f"<blockquote>{inner}</blockquote>")
        elif re.fullmatch(r"(-{3,}|\*{3,}|_{3,})", b.strip()):
            out.append("<hr>")
        else:
            out.append(f"<p>{_md_inline(b.replace(chr(10), ' '))}</p>")
    return "\n".join(out)


def fmt_date(iso: str) -> str:
    try:
        d = datetime.date.fromisoformat(iso)
    except (ValueError, TypeError):
        return iso or ""
    return f"{d.strftime('%B')} {d.day}, {d.year}"


def blogposting_jsonld(post: dict, url: str) -> str:
    img = DOMAIN + post.get("image", "")
    t = _html.escape(post["title"], quote=True)
    d = _html.escape(post.get("description", ""), quote=True)
    return (
        '{"@context":"https://schema.org","@type":"BlogPosting",'
        f'"headline":"{t}","description":"{d}","image":"{img}",'
        f'"datePublished":"{post.get("date","")}","dateModified":"{post.get("date","")}",'
        '"author":{"@type":"Organization","name":"Silstone.AI"},'
        '"publisher":{"@type":"Organization","name":"Silstone.AI",'
        f'"logo":{{"@type":"ImageObject","url":"{DOMAIN}/assets/logo-mark.png"}}}},'
        f'"mainEntityOfPage":"{url}"}}'
    )


def _blog_card(p: dict, featured: bool = False) -> str:
    title = _html.escape(p["title"])
    desc = _html.escape(p.get("description", ""))
    wrap_cls = "sil-blog-featured-img" if featured else "sil-blog-thumb"
    heading = "h2" if featured else "h3"
    return (
        f'<a class="{"sil-blog-featured" if featured else "sil-blog-card"}" '
        f'href="/blog/{p["slug"]}" target="_top">'
        f'<span class="{wrap_cls}"><img src="{p.get("image","")}" alt="{title}" loading="lazy"></span>'
        f'<div class="sil-blog-card-body">'
        f'<span class="sil-blog-date">{fmt_date(p.get("date",""))}</span>'
        f"<{heading}>{title}</{heading}><p>{desc}</p>"
        f'<span class="sil-blog-more">Read article &rarr;</span>'
        f"</div></a>"
    )


def blog_cards_html(posts: list) -> str:
    if not posts:
        return ""
    featured = _blog_card(posts[0], featured=True)
    rest = "".join(_blog_card(p) for p in posts[1:])
    grid = f'<div class="sil-blog-grid">{rest}</div>' if rest else ""
    return (
        '<div class="sil-root"><section class="sil-blog-wrap">'
        + featured + grid + "</section></div>"
    )


def render_post(post: dict, nav: str, cta: str, footer: str) -> None:
    slug = post["slug"]
    url = f"{DOMAIN}/blog/{slug}"
    title_h = _html.escape(post["title"])
    article = (
        '<div class="sil-root"><article class="sil-article-page">'
        '<div class="sil-article-top">'
        '<a class="sil-article-back" href="/blog" target="_top">&larr; All articles</a>'
        f'<span class="sil-blog-date">{fmt_date(post.get("date",""))}</span>'
        "</div>"
        f'<h1 class="sil-article-title">{title_h}</h1>'
        f'<img class="sil-article-hero-img" src="{post.get("image","")}" alt="{title_h}" width="1440" height="756">'
        f'<div class="sil-article">{md_to_html(post["body"])}</div>'
        "</article></div>"
    )
    body = "\n\n".join([nav, article, cta, footer])
    meta = {
        "slug": f"blog/{slug}",
        "title": f'{post["title"]} | Silstone.AI',
        "desc": post.get("description", ""),
        "og_image": DOMAIN + post.get("image", ""),
        "og_type": "article",
        "extra_ld": [blogposting_jsonld(post, url)],
    }
    out_dir = DIST / "blog" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(page_html(meta, body), encoding="utf-8")


# Blocks kept in the repo but intentionally NOT rendered on a given page.
HOME_SKIP = {"07-what-we-build.html", "09-wedge.html"}   # homepage sections removed
PAGE_SKIP = {"live-demos": {"60-hero.html"}}             # live-demos: drop the hero


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def build() -> None:
    clean_dist()

    nav = read_block(SECTIONS / "01-nav.html")
    cta = read_block(SECTIONS / "12-cta.html")
    footer = read_block(SECTIONS / "13-footer.html")

    # ---- assets (one shared copy) ----
    assets_out = DIST / "assets"
    assets_out.mkdir()
    # served CSS: drop the @import (fonts now load from <head>) + minify.
    css = (ROOT / "assets" / "silstone.css").read_text(encoding="utf-8")
    css = re.sub(r"@import\s+url\([^)]*\);", "", css)
    (assets_out / "silstone.css").write_text(minify_css(css), encoding="utf-8")
    shutil.copy(ROOT / "assets" / "silstone.js", assets_out / "silstone.js")
    shutil.copy(ROOT / "brand" / "hero-still.jpg", assets_out / "og.jpg")
    shutil.copy(ROOT / "brand" / "logo-mark.png", assets_out / "logo-mark.png")
    if FAVICON_SRC.exists():
        shutil.copy(FAVICON_SRC, assets_out / "favicon.png")
    # blog hero images
    blog_img_src = ROOT / "assets" / "blog"
    if blog_img_src.exists():
        shutil.copytree(blog_img_src, assets_out / "blog")

    posts = load_posts()

    count = 0
    for meta in PAGES_META:
        if meta["dir"] is None:
            # homepage: every section block in order (minus HOME_SKIP)
            blocks = [p for p in sorted(SECTIONS.glob("*.html")) if p.name not in HOME_SKIP]
            body = "\n\n".join(read_block(p) for p in blocks)
        elif meta["dir"] == "blog":
            # blog index: designed hero + generated post cards
            hero = "\n\n".join(read_block(p) for p in sorted((PAGES / "blog").glob("*.html")))
            body = "\n\n".join([nav, hero, blog_cards_html(posts), cta, footer])
        else:
            page_dir = PAGES / meta["dir"]
            skip = PAGE_SKIP.get(meta["dir"], set())
            blocks = [p for p in sorted(page_dir.glob("*.html")) if p.name not in skip]
            if not blocks:
                print(f"  ! skip {meta['slug']} (no blocks)")
                continue
            inner = "\n\n".join(read_block(p) for p in blocks)
            body = "\n\n".join([nav, inner, cta, footer])
        write_page(meta, body)
        count += 1
        print(f"  dist/{meta['slug'] or ''}/index.html")

    # individual blog post pages
    for post in posts:
        render_post(post, nav, cta, footer)
        print(f"  dist/blog/{post['slug']}/index.html")

    write_sitemap(posts)
    write_robots()
    write_llms()
    write_htaccess(posts)
    zip_path = make_import_zip()
    print(f"\nBuilt {count} pages + sitemap.xml, robots.txt, llms.txt, .htaccess into dist/")
    print(f"Packaged  ->  {zip_path.name}  (index.html + .htaccess at the archive root)")
    print("Hostinger: Import website / Migrate from backup  ->  select this zip.")


def write_sitemap(posts=None) -> None:
    urls = []
    for meta in PAGES_META:
        urls.append(
            f"  <url><loc>{canonical(meta['slug'])}</loc>"
            f"<lastmod>{TODAY}</lastmod>"
            f"<priority>{meta['priority']}</priority></url>"
        )
    for post in (posts or []):
        urls.append(
            f"  <url><loc>{DOMAIN}/blog/{post['slug']}</loc>"
            f"<lastmod>{post.get('date', TODAY)}</lastmod>"
            f"<priority>0.6</priority></url>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (DIST / "sitemap.xml").write_text(xml, encoding="utf-8")


def write_robots() -> None:
    (DIST / "robots.txt").write_text(
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {DOMAIN}/sitemap.xml\n",
        encoding="utf-8",
    )


def write_llms() -> None:
    """llms.txt -- a plain-text brief for AI crawlers / answer engines (GEO)."""
    lines = [
        "# Silstone.AI",
        "",
        "> Healthcare-native AI studio. We design, build and deploy custom AI",
        "> agents that automate back-office work for medical and dental practices:",
        "> payer underpayment recovery, credentialing portals, denials and appeals,",
        "> prior authorization and inbound fax triage.",
        "",
        "We work from your exports, documents and portals rather than integrating",
        "with your EMR, so most builds are live in weeks. Anything touching PHI runs",
        "on AWS Bedrock under a full HIPAA Business Associate Agreement, with a human",
        "approving every action.",
        "",
        "## Pages",
    ]
    for meta in PAGES_META:
        name = meta["title"].split("|")[0].strip()
        lines.append(f"- [{name}]({canonical(meta['slug'])}): {meta['desc']}")
    lines += [
        "",
        "## Contact",
        f"- Email: {ORG_EMAIL}",
        f"- Phone: {ORG_PHONE}",
    ]
    (DIST / "llms.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def make_import_zip() -> pathlib.Path:
    """Package dist/ into a single archive whose ROOT is the site (index.html and
    .htaccess at top level), ready for Hostinger's 'Import website' / 'Migrate
    website from backup' picker -- you just select this one file. Written to the
    project root, not inside dist/, so a rebuild never zips a stale copy of itself.
    Uses zipfile directly (not shutil) so the hidden .htaccess is included."""
    import zipfile

    zip_path = ROOT / "silstone-site.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(DIST.rglob("*")):
            rel = f.relative_to(DIST)
            if f.is_file() and not any(p.startswith(".git") for p in rel.parts):
                zf.write(f, rel.as_posix())
    return zip_path


def write_htaccess(posts=None) -> None:
    """Apache config for Hostinger shared hosting: HTTPS + www, clean URLs,
    and the /resources -> /live-demos 301 so old links keep their ranking."""
    # Old Builder blog lived at /blog-list and posts at root (/<slug>); 301 them
    # to the new /blog and /blog/<slug> so any existing links/rankings carry over.
    blog_redirects = "RewriteRule ^blog-list/?$ /blog [L,R=301]\n"
    for post in (posts or []):
        blog_redirects += f"RewriteRule ^{re.escape(post['slug'])}/?$ /blog/{post['slug']} [L,R=301]\n"
    (DIST / ".htaccess").write_text(
        "# ---- block access to the deploy repo's .git (Hostinger Git pull leaves it in public_html) ----\n"
        "RedirectMatch 404 /\\.git\n\n"
        "RewriteEngine On\n\n"
        "# ---- canonicalize the PRODUCTION domain to https://www.silstone.ai ----\n"
        "# Scoped to silstone.ai on purpose, so the Hostinger *.hostingersite.com\n"
        "# preview URL (and import 'recognition' check) is NOT redirected away.\n"
        "RewriteCond %{HTTP_HOST} ^silstone\\.ai$ [NC]\n"
        "RewriteRule ^ https://www.silstone.ai%{REQUEST_URI} [L,R=301]\n"
        "RewriteCond %{HTTP_HOST} ^www\\.silstone\\.ai$ [NC]\n"
        "RewriteCond %{HTTPS} off\n"
        "RewriteRule ^ https://www.silstone.ai%{REQUEST_URI} [L,R=301]\n\n"
        "# ---- resources renamed to live-demos ----\n"
        "RewriteRule ^resources/?$ /live-demos [L,R=301]\n\n"
        "# ---- old Builder blog -> new /blog ----\n"
        + blog_redirects + "\n"
        "# ---- clean URLs: /what-we-build -> /what-we-build/index.html ----\n"
        "RewriteCond %{REQUEST_FILENAME} !-f\n"
        "RewriteCond %{REQUEST_FILENAME} !-d\n"
        "RewriteCond %{REQUEST_FILENAME}/index.html -f\n"
        "RewriteRule ^(.*)$ $1/index.html [L]\n\n"
        "# ---- gzip/deflate text responses ----\n"
        "<IfModule mod_deflate.c>\n"
        "  AddOutputFilterByType DEFLATE text/html text/css application/javascript "
        "application/json image/svg+xml text/plain application/xml\n"
        "</IfModule>\n\n"
        "# ---- caching: fingerprint-free, so long cache on assets, short on HTML ----\n"
        "<IfModule mod_expires.c>\n"
        "  ExpiresActive On\n"
        "  ExpiresByType text/css \"access plus 1 year\"\n"
        "  ExpiresByType application/javascript \"access plus 1 year\"\n"
        "  ExpiresByType image/png \"access plus 1 year\"\n"
        "  ExpiresByType image/jpeg \"access plus 1 year\"\n"
        "  ExpiresByType image/svg+xml \"access plus 1 year\"\n"
        "  ExpiresByType text/html \"access plus 1 hour\"\n"
        "</IfModule>\n"
        "<IfModule mod_headers.c>\n"
        "  <FilesMatch \"\\.(css|js|png|jpg|jpeg|svg|woff2)$\">\n"
        "    Header set Cache-Control \"public, max-age=31536000, immutable\"\n"
        "  </FilesMatch>\n"
        "</IfModule>\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    build()
