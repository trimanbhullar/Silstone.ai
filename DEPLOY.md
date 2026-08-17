# Deploying the real HTML site to Hostinger

This is the guide for publishing the **hand-built HTML** version of silstone.ai
(the `dist/` folder produced by `python build-site.py`) so Google and AI answer
engines can actually index it. It replaces the current Website Builder + embed-
block setup.

---

## 0. First, the honest answer about the Hostinger MCP / API

**No, connecting the Hostinger API/MCP to me will not let me push the site for
you.** Hostinger's official API and MCP server manage **VPS servers, domains,
DNS and billing** — there is **no endpoint for uploading files** to the Website
Builder or to shared/Cloud hosting. File publishing on Hostinger happens through
**hPanel File Manager, FTP/SFTP, or Git** — all of which you drive from your own
logged-in account. So the flow is: **I generate `dist/`, you upload it** (takes
about 5 minutes the first time). I've made that as close to drag-and-drop as
possible.

**Also important:** the **Website Builder cannot host raw HTML.** It is a closed
drag-and-drop product; embed blocks are the only custom-code path, and that
sandboxing is exactly what's hurting your indexing. To serve real HTML you must
publish to **Web Hosting / Cloud Hosting** (which your plan may already include),
not the Builder.

---

## 1. What you're uploading

Run the build:

```bash
python build-site.py
```

This produces two things:
- **`silstone-site.zip`** (project root) — the ready-to-import archive. Its top
  level *is* the site (`index.html` and `.htaccess` at the root), which is exactly
  what Hostinger's importer expects. **This is the file you select** (see §3).
- **`dist/`** — the same files unzipped, if you'd rather upload them by hand.

```
dist/
  index.html                     ->  https://www.silstone.ai/
  what-we-build/index.html       ->  /what-we-build
  dental-automation/index.html   ->  /dental-automation
  aesthetics-automation/…        ->  /aesthetics-automation
  live-demos/index.html          ->  /live-demos          (was /resources)
  why-silstone/…  pricing/…  trust-and-security/…  contact/…  blog/…
  assets/   silstone.css  silstone.js  og.jpg  logo-mark.png
  sitemap.xml   robots.txt   llms.txt   .htaccess
```

Each page is a complete document with its own `<title>`, meta description,
canonical, Open Graph, and JSON-LD. `.htaccess` forces HTTPS + www, gives clean
URLs, 301-redirects `/resources → /live-demos`, and turns on gzip + long-lived
asset caching.

---

## 2. Point the domain at Web Hosting (one-time, the only fiddly part)

Because `silstone.ai` is currently served by the **Website Builder**, you have to
move it to a **hosting plan** first. In **hPanel**:

1. Go to **Websites**. If `silstone.ai` is listed under a Website Builder site,
   you'll create/point it to a **Web Hosting or Cloud** plan instead. If you only
   have a Builder plan, you'll need a hosting plan (Premium/Business/Cloud all
   include File Manager + FTP).
2. Add `silstone.ai` to the hosting plan (**Add website** → enter the domain).
   Hostinger will set the document root, usually `public_html`.
3. If DNS is already at Hostinger, pointing is automatic. If not, set the domain's
   A record to the hosting server IP shown in hPanel.

> Do this on a low-traffic window: there's a brief cutover while the domain stops
> serving the Builder site and starts serving `public_html`.

---

## 3. Upload — pick one method

### A) Import the zip (what you asked for — just select the file)
1. hPanel → **Websites → Dashboard** for `silstone.ai`.
2. Look for **Import Website** (under **Files**), or the **"Migrate website from
   backup"** option in the add-website / dashboard flow.
3. Select **`silstone-site.zip`**. Hostinger extracts it into `public_html` with
   `index.html` and the hidden `.htaccess` already at the root — nothing to move.
4. Visit `https://www.silstone.ai/` to confirm.

> Note on wording: Hostinger has two similarly named things. **"Import Website"**
> takes a plain **.zip of your files** — that's this zip, and it's the one you
> want. A separate **"Migrate website"** onboarding option sometimes means a
> *managed* transfer where they pull from another host using login credentials —
> you don't need that. If the button you find asks for another host's login
> instead of a file, back out and use **Import Website** (or method B below).
> Max import size is ~256 MB; this zip is well under 1 MB.

### B) File Manager (easiest fallback, no software)
1. hPanel → **Files → File Manager** → open **`public_html`**.
2. Delete any placeholder (`default.php`, Builder leftovers) so the folder is empty.
3. **Zip `dist/`'s contents** on your machine (select everything *inside* `dist`,
   not the `dist` folder itself) and **Upload** the zip, then **Extract** it in
   `public_html`. Confirm `index.html` sits directly in `public_html`, not in a
   `dist/` subfolder.
4. Enable **"Show hidden files"** in File Manager and confirm **`.htaccess`** is
   present — it's easy to miss because it's hidden.

### C) FTP / SFTP (best for repeat deploys)
1. hPanel → **Files → FTP Accounts**, note host / username / password.
2. In **FileZilla**, connect, open `public_html`, and drag the **contents** of
   `dist/` in. Ensure `.htaccess` transfers (Server → *Force showing hidden files*).

### D) Git — push to deploy ✅ LIVE (set up 2026-08-17)

**This is now connected and confirmed working.** `dist/` is a clean, site-only git
repo pushed to **https://github.com/trimanbhullar/Silstone.ai** (public, branch
`main`). Hostinger is connected via hPanel → Advanced → GIT ("Connected with
GitHub", install path `public_html`) and **auto-deploys on every push** — verified
with a test marker that went live and was removed automatically.

**Everyday deploy is one command:**
```bash
python deploy.py
```
It rebuilds, commits `dist/`, and pushes; Hostinger deploys within ~1 minute. Add a
message with `python deploy.py "what changed"`.

`.git` is kept out of the import zip and blocked over HTTP by `.htaccess`. Rebuilds
preserve the repo (`build-site.py` does not wipe `.git`).

<details><summary>Original one-time setup (already done — kept for reference)</summary>

**One-time setup:**

1. **Create the GitHub remote** (I couldn't — GitHub login is yours to do):
   ```bash
   gh auth login
   gh repo create silstone-site --private --source=dist --remote=origin --push
   ```
   (Or make an empty repo on github.com, then:
   `cd dist && git remote add origin <url> && git push -u origin main`.)

2. **Connect Hostinger:** hPanel → **Advanced → Git** → **Create repository**:
   - Repository: your `silstone-site` repo (HTTPS URL, or add Hostinger's SSH key
     to GitHub for a private repo).
   - Branch: `main`   ·   Install path: **`public_html`**.
   - Copy the **auto-deployment webhook URL** Hostinger shows and add it in GitHub
     → repo → **Settings → Webhooks**. Now every push auto-deploys.

**From then on, deploying is one command:**
```bash
python deploy.py
```
It rebuilds, commits whatever changed in `dist/`, and pushes — Hostinger deploys
on the webhook. Add a message with `python deploy.py "tweaked pricing copy"`.

</details>

> Note: this repo tracks the **built** site, which is what Hostinger needs. Your
> *source* (`assets/`, `sections/`, `pages/`, the build scripts) currently isn't
> in its own repo — say the word and I'll put the source under version control
> too so your work is backed up, separate from this deploy repo.

---

## 4. After the first upload — SEO/GEO activation

1. **Google Search Console** (search.google.com/search-console): add
   `https://www.silstone.ai`, verify (DNS TXT or the HTML-tag method), then
   **Sitemaps → submit** `https://www.silstone.ai/sitemap.xml`. Use **URL
   Inspection → Request indexing** on the homepage to speed up first crawl.
2. **Bing Webmaster Tools**: same idea; you can import from Search Console.
3. **Favicon**: `assets/logo-mark.png` is the full 768×111 wordmark. Crop it to
   the square teal glyph and re-upload as `assets/logo-mark.png` (or a proper
   `favicon.ico`) so it's legible at 32×32. (Noted in `SEO-COPY.md` too.)
4. **Verify redirects**: visit `https://silstone.ai/resources` — it should 301 to
   `https://www.silstone.ai/live-demos`. Check `http://silstone.ai` → forces
   `https://www.…`.
5. **Blog**: nav/footer still link to your existing `/blog-list`. The generated
   `/blog` page is just a hero. If your blog is a Hostinger Builder/CMS feature,
   decide whether to migrate those posts into this HTML site or keep the blog on a
   subdomain — tell me and I'll wire it up.

---

## 5. Re-deploying after edits

Edit `assets/`, `sections/`, or `pages/` exactly as before, then:

```bash
python build-site.py
```

…which rewrites both `silstone-site.zip` and `dist/`. Re-import the fresh zip
(§3A), or sync `dist/` by FTP / `git push`. The
embed pipeline (`build-embeds.py` / `build-preview.py`) still works if you ever
need a block for the Builder — same source, two outputs.

---

## 6. What was done for SEO/GEO in this pass

- Full per-page `<head>`: title, meta description, canonical, robots, theme-color.
- **Open Graph + Twitter** cards on every page (share image = `assets/og.jpg`).
- **Structured data (JSON-LD):** `Organization` + `WebSite` sitewide,
  `BreadcrumbList` per inner page, plus your existing `FAQPage` blocks.
- **`sitemap.xml`**, **`robots.txt`**, and **`llms.txt`** (a plain-text brief that
  AI answer engines read — the "GEO" part).
- Clean, semantic folder URLs and a 301 from the old `/resources`.

## 7. What was done for speed

- One **external, minified** `silstone.css` (+ `silstone.js` with `defer`),
  cached for a year — instead of the full stylesheet inlined into all 10 pages.
- The **wordmark is now a cached file**, not a ~15 KB base64 blob repeated in the
  nav and footer of every page (home 120 KB → 100 KB, blog 48 KB → 28 KB).
- **Fonts load non-blocking** from `<head>` (was a serial `@import` waterfall
  buried inside the CSS).
- **gzip + far-future caching** for CSS/JS/images via `.htaccess`.
