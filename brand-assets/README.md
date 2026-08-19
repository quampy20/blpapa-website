# Brand assets — not deployed

Approved BLPAPA marks that belong in version control but do not belong on a
web page. They live outside `src/assets/` so the build never copies them into
`dist/` — together they are roughly 4 MB against a 500 KB page budget
(CLAUDE.md §2).

| File | Use |
|---|---|
| `crest-800.*` | Vertical crest — stationery, PDFs, posters, merch, portrait layouts |
| `seal-1000.*` | Round seal at full size — social avatars, stamps, certificates |
| `horizontal-1200.*` | Horizontal lockup at full size — print and large-format source |

The web-sized derivatives the site actually uses (`horizontal-760`, `seal-180`,
`seal-512`, and the `mark-*` icon set) are in `src/assets/logo/`.

Reproduce all of these exactly as supplied. Do not recolor, stretch, or edit
the artwork — including the "Association" spelling in the wordmark, which
differs from the legal name on purpose (CLAUDE.md §5.6).
