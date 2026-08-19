#!/usr/bin/env python3
"""Re-encode site photography to sensible web weights.

Run by hand when a new photograph is added:

    pip install Pillow
    python3 tools/optimize-photos.py

Photographs get WebP with a JPEG fallback — the opposite of the logo marks,
which are flat illustration and ship as palette PNG (see
tools/generate-logo-sizes.py). Photography is what blows a 500 KB page budget
(CLAUDE.md §2), and it is the only asset class on this site heavy enough to
matter.

Sources are BLPAPA's own published images, which are approved for reuse
(CLAUDE.md §3). Anything from elsewhere needs its source confirmed first.
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "src" / "assets" / "images"

# Displayed at most ~700px wide in the hero and gallery, so 1100px covers a 2x
# render with headroom for a wider layout later.
MAX_WIDTH = 1100
JPEG_QUALITY = 78
WEBP_QUALITY = 74


def optimize(source: Path) -> None:
    image = Image.open(source).convert("RGB")
    if image.width > MAX_WIDTH:
        image = image.resize(
            (MAX_WIDTH, round(image.height * MAX_WIDTH / image.width)), Image.LANCZOS
        )

    jpeg = source.with_suffix(".jpg")
    image.save(jpeg, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)

    webp = source.with_suffix(".webp")
    image.save(webp, "WEBP", quality=WEBP_QUALITY, method=6)

    print(f"  {jpeg.name:38s} {image.width}x{image.height}"
          f"  jpg {jpeg.stat().st_size / 1024:6.1f} KB"
          f"  webp {webp.stat().st_size / 1024:6.1f} KB")


def main() -> None:
    sources = sorted(p for p in IMAGES.glob("*.jpg"))
    if not sources:
        print("No photographs found in src/assets/images/.")
        return
    print(f"Optimizing {len(sources)} photograph(s):")
    for source in sources:
        optimize(source)


if __name__ == "__main__":
    main()
