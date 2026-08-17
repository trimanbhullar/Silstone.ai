"""Bake the shared styles + runtime into every section and page IN PLACE.

After running this, every file in sections/ and pages/ is a complete, self-
contained Hostinger "Embed code" element: the global <style> + runtime sits at
the top of the file (between the SIL:GLOBAL markers), followed by the block's
own markup. Paste any file straight into its Embed element -- nothing else
needed, no global code, no separate folder.

    python build-embeds.py

The stylesheet + runtime still live in ONE place -- assets/silstone.css and
assets/silstone.js -- so you never edit CSS in 28 files. Change the design there
(or the block markup below the markers), re-run this, and the baked block in
every file is replaced in place. Everything between the markers is generated;
edit only OUTSIDE them.

Safe to stack many blocks on one page: the runtime is guarded by
window.__silstoneInit (initialises once) and the identical :root variables
dedupe in the browser.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
SECTIONS = ROOT / "sections"
PAGES = ROOT / "pages"

CSS = (ROOT / "assets" / "silstone.css").read_text(encoding="utf-8").strip()
JS = (ROOT / "assets" / "silstone.js").read_text(encoding="utf-8").strip()

START = ("<!-- SIL:GLOBAL START -- generated from assets/ by build-embeds.py. "
         "Everything between these markers is baked in; edit assets/silstone.css "
         "or assets/silstone.js and re-run, not here. -->")
END = "<!-- SIL:GLOBAL END -->"
BLOCK = f"{START}\n<style>\n{CSS}\n</style>\n<script>\n{JS}\n</script>\n{END}"


def bake(path: pathlib.Path) -> None:
    text = path.read_text(encoding="utf-8")
    if START in text and END in text:
        # Replace the previously baked block in place, leave the rest untouched.
        pre = text[: text.index(START)]
        post = text[text.index(END) + len(END):]
        text = pre + BLOCK + post
    else:
        # First bake: prepend, keeping the file's own markup below.
        text = BLOCK + "\n\n" + text.lstrip()
    path.write_text(text, encoding="utf-8")


files = sorted(SECTIONS.glob("*.html")) + sorted(PAGES.rglob("*.html"))
for f in files:
    bake(f)
print(f"Baked shared styles + runtime into {len(files)} self-contained blocks.")
