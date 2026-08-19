#!/usr/bin/env python3
"""Generate the web-sized logo derivatives the site loads.

Run this by hand when a new master arrives, not as part of `npm run build` —
the site build stays dependency-free (CLAUDE.md §2) and these outputs are
committed. Pillow is needed only to run this script:

    pip install Pillow
    python3 tools/generate-logo-sizes.py

Sizes are chosen from the CSS widths the marks are actually displayed at, at
1x and 2x. The masters in brand-assets/ are 600 KB to 1.4 MB, which is most of
a 500 KB page budget spent on a header (CLAUDE.md §2).
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTERS = ROOT / "brand-assets"
OUT = ROOT / "src" / "assets" / "logo"

# (master, output stem, target widths) — widths cover 1x and 2x of the CSS size.
JOBS = [
    # Header lockup: 232px on most screens, 296px from 75em up.
    ("horizontal-1200.png", "horizontal", [300, 600]),
    # Seal: 130px in the footer.
    ("seal-1000.png", "seal", [130, 260]),
]

# The simplified sun-over-mountain mark already ships tight-cropped in
# src/assets/logo/, so it is resized in place rather than from a master.
MARK_WIDTHS = [48, 96]


def emit(image: Image.Image, stem: str, width: int) -> None:
    """Write one palette PNG at `width`.

    PNG only, deliberately. These marks are flat illustration with hard edges,
    and a 256-colour palette PNG beats WebP on them by a wide margin — at 600px
    the palette PNG is 41 KB against WebP's 58 KB. A <picture> element offering
    a larger WebP would be pure ceremony. The festival photograph is the
    opposite case and does ship as WebP with a JPEG fallback.
    """
    height = round(image.height * width / image.width)
    resized = image.resize((width, height), Image.LANCZOS)

    png_path = OUT / f"{stem}-{width}.png"
    quantized = resized.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
    quantized.save(png_path, optimize=True)
    print(f"  {png_path.name:22s} {width}x{height}  {png_path.stat().st_size / 1024:6.1f} KB")


def emit_social_card() -> None:
    """Compose the 1200x630 og:image.

    Built rather than cropped so the lockup keeps its clear space and sits on
    an approved brand surface. No text is drawn: the wordmark is already in the
    artwork, and rendering a headline here without Montserrat would put an
    off-brand typeface on the most-shared image the site has.
    """
    width, height = 1200, 630
    card = Image.new("RGB", (width, height), "#F0E8D1")  # Warm Cream

    logo = Image.open(MASTERS / "horizontal-1200.png").convert("RGBA")
    target_width = 820
    logo = logo.resize((target_width, round(logo.height * target_width / logo.width)), Image.LANCZOS)
    card.paste(logo, ((width - logo.width) // 2, (height - logo.height) // 2 - 14), logo)

    # Woven ribbon band across the foot — the textile motif from the logo.
    band, stripe = 18, 26
    colors = ["#D5230C", "#FDCF06", "#125657", "#042B34"]
    for x in range(0, width, stripe):
        for y in range(height - band, height):
            for dx in range(stripe):
                if x + dx < width:
                    card.putpixel((x + dx, y), Image.new("RGB", (1, 1), colors[(x // stripe) % 4]).getpixel((0, 0)))

    path = ROOT / "src" / "assets" / "logo" / "social-card.png"
    card.quantize(colors=256, method=Image.FASTOCTREE).save(path, optimize=True)
    print(f"  {path.name:22s} {width}x{height}  {path.stat().st_size / 1024:6.1f} KB")


def main() -> None:
    for master, stem, widths in JOBS:
        source = Image.open(MASTERS / master).convert("RGBA")
        print(f"{master} ({source.width}x{source.height})")
        for width in widths:
            emit(source, stem, width)

    mark = Image.open(OUT / "mark-512.png").convert("RGBA")
    print(f"mark-512.png ({mark.width}x{mark.height})")
    for width in MARK_WIDTHS:
        emit(mark, "mark", width)

    print("social card")
    emit_social_card()


if __name__ == "__main__":
    main()
