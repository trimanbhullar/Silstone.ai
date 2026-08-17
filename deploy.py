"""One command to publish: rebuild the site and push it live.

    python deploy.py                 # rebuild + commit + push
    python deploy.py "what changed"  # same, with a custom commit message

How it works: dist/ is its own git repo (the clean, site-only repo). This script
runs build-site.py, commits whatever changed in dist/, and pushes to 'origin'.
Once Hostinger's Git deployment is connected to that repo with auto-deploy on
(DEPLOY.md 3D), the push IS the deploy.

One-time setup (until 'origin' exists this script stops and prints the exact
commands to run):
    gh auth login                                    # or make the repo on github.com
    gh repo create silstone-site --private --source=dist --remote=origin --push
    # then in hPanel -> Advanced -> Git, connect that repo/branch, install path
    # public_html, and add the deploy webhook to the GitHub repo.
"""
import datetime
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"


def git(*args, check=True):
    r = subprocess.run(["git", *args], cwd=DIST, text=True, capture_output=True)
    if check and r.returncode != 0:
        sys.exit(f"git {' '.join(args)} failed:\n{r.stderr.strip()}")
    return r


def main() -> None:
    msg = sys.argv[1] if len(sys.argv) > 1 else (
        "Deploy " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )

    # 1. rebuild
    print("Building site ...")
    b = subprocess.run([sys.executable, "build-site.py"], cwd=ROOT, text=True)
    if b.returncode != 0:
        sys.exit("build-site.py failed; aborting deploy.")

    if not (DIST / ".git").exists():
        sys.exit("dist/ is not a git repo yet. Run the one-time setup in this file's docstring.")

    # 2. commit whatever changed
    git("add", "-A")
    if not git("status", "--porcelain").stdout.strip():
        print("No changes since last deploy — nothing to push.")
        return
    git("commit", "-m", msg)
    print(f"Committed: {msg}")

    # 3. push (if a remote is configured)
    if not git("remote").stdout.strip():
        print("\nCommitted locally, but no 'origin' remote is set yet.")
        print("Finish the one-time setup (see the top of deploy.py), then run:")
        print("    cd dist && git push -u origin main")
        return
    print("Pushing to origin ...")
    git("push")
    print("Pushed. Hostinger will auto-deploy if Git deployment is connected.")


if __name__ == "__main__":
    main()
