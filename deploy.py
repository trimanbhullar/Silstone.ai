"""One command to publish: commit your source changes and push the `source`
branch. GitHub Actions then rebuilds the static site and deploys it to Hostinger
(source -> Actions -> main -> Hostinger, ~1-2 min).

    python deploy.py                 # build-check + commit + push source
    python deploy.py "what changed"  # same, with a custom commit message

The CMS uses the same pipeline: the marketing editor saves a post to the source
branch, which triggers the same Action. You rarely need to run this by hand.
"""
import datetime
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).parent


def git(*args, check=True):
    r = subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=True)
    if check and r.returncode != 0:
        sys.exit(f"git {' '.join(args)} failed:\n{r.stderr.strip()}")
    return r


def main() -> None:
    msg = sys.argv[1] if len(sys.argv) > 1 else (
        "Update " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )

    # Local build as a pre-flight check (catches errors before they hit CI;
    # also refreshes dist/ so you can preview locally). dist/ is gitignored.
    print("Build check ...")
    if subprocess.run([sys.executable, "build-site.py"], cwd=ROOT).returncode != 0:
        sys.exit("build-site.py failed; fix it before deploying.")

    git("add", "-A")
    if not git("status", "--porcelain").stdout.strip():
        print("No source changes — nothing to deploy.")
        return
    git("commit", "-m", msg)
    print(f"Committed: {msg}")
    git("push", "origin", "source")
    print("Pushed source. GitHub Actions will build and deploy to Hostinger (~1-2 min).")


if __name__ == "__main__":
    main()
