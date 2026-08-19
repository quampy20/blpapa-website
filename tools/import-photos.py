#!/usr/bin/env python3
"""Turn photographs supplied by BLPAPA into web-ready site assets.

Two ways in, because this environment cannot reach their website directly
(HANDOFF.md §7.0) and photographs have to arrive some other way:

    # 1. From a folder of files — a zip attached in chat, unpacked anywhere
    python3 tools/import-photos.py --from-dir /path/to/unzipped

    # 2. From Google Drive downloads already saved to disk by the connector
    python3 tools/import-photos.py --from-drive-results

Every photograph is resized to fit the page budget and written twice, as WebP
with a JPEG fallback, matching the rule in tools/optimize-photos.py. Filenames
are slugified from the original so they stay recognizable.

After running, add the new files to the Gallery page and give each one real alt
text describing what is happening in it (CLAUDE.md §6). The script deliberately
does not invent captions.
"""

import argparse
import base64
import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "src" / "assets" / "images"
DRIVE_RESULTS = Path(
    "/root/.claude/projects/-home-user-blpapa-website/"
    "a75ba6d3-8585-5f9d-b71b-fe3f87b26459/tool-results"
)

MAX_WIDTH = 1100
JPEG_QUALITY = 78
WEBP_QUALITY = 74
SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def slugify(name: str) -> str:
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return stem or "photo"


def write_pair(image: Image.Image, slug: str) -> None:
    # EXIF orientation is honoured before anything else — phone photographs
    # otherwise land on their side.
    image = ImageOps.exif_transpose(image).convert("RGB")
    if image.width > MAX_WIDTH:
        image = image.resize(
            (MAX_WIDTH, round(image.height * MAX_WIDTH / image.width)), Image.LANCZOS
        )

    jpeg = IMAGES / f"{slug}.jpg"
    webp = IMAGES / f"{slug}.webp"
    image.save(jpeg, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    image.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)
    print(
        f"  {slug:44s} {image.width}x{image.height}"
        f"  jpg {jpeg.stat().st_size / 1024:6.1f} KB"
        f"  webp {webp.stat().st_size / 1024:6.1f} KB"
    )


def from_dir(source: Path) -> int:
    count = 0
    for path in sorted(source.rglob("*")):
        if path.suffix.lower() not in SUFFIXES or not path.is_file():
            continue
        try:
            write_pair(Image.open(path), slugify(path.name))
            count += 1
        except Exception as error:  # a stray non-image with an image extension
            print(f"  skipped {path.name}: {error}")
    return count


def from_drive_results() -> int:
    """Decode images the Google Drive connector saved as base64 JSON."""
    count = 0
    for path in sorted(DRIVE_RESULTS.glob("*download_file_content*.txt")):
        try:
            payload = json.loads(path.read_text())
        except Exception:
            continue
        if not payload.get("mimeType", "").startswith("image/"):
            continue
        raw = IMAGES / f".raw-{slugify(payload['title'])}"
        raw.write_bytes(base64.b64decode(payload["content"]))
        try:
            write_pair(Image.open(raw), slugify(payload["title"]))
            count += 1
        except Exception as error:
            print(f"  skipped {payload['title']}: {error}")
        finally:
            raw.unlink(missing_ok=True)
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-dir", type=Path, help="folder of image files")
    parser.add_argument("--from-drive-results", action="store_true",
                        help="decode Drive downloads already saved to disk")
    args = parser.parse_args()

    if not args.from_dir and not args.from_drive_results:
        parser.error("choose --from-dir or --from-drive-results")

    IMAGES.mkdir(parents=True, exist_ok=True)
    total = 0
    if args.from_dir:
        print(f"Importing from {args.from_dir}:")
        total += from_dir(args.from_dir)
    if args.from_drive_results:
        print("Importing from saved Drive downloads:")
        total += from_drive_results()

    print(f"\n{total} photograph(s) imported into src/assets/images/.")
    if total:
        print("Next: place them on the pages and write real alt text for each.")


if __name__ == "__main__":
    main()
