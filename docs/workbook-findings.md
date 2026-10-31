# 2025 workbook findings

Reviewed read-only on 2026-10-31: `reference/2025 Master Judging Rubric.xlsx` (263,574 bytes). Extracted the OOXML worksheets, cached cell values, and formulas using `scripts/inspect-workbook.ps1`. No spreadsheet-authoring runtime is available in this environment, so this is structural/formula analysis; no rendering or Excel recalculation was performed. Cached totals are historical observations, not newly calculated results.

## Worksheet inventory

There are 10 worksheets. All are visible. Preserve the original spelling of worksheet names when locating formulas.

| Worksheet | Nonempty extracted cells | Formula anchors |
| --- | ---: | ---: |
| Catagory Descriptions | 180 | 85 |
| St. Kevins | 572 | 66 |
| MPSH | 578 | 66 |
| Bishop White | 580 | 66 |
| SWA | 580 | 66 |
| Froude Ave | 580 | 66 |
| Clarenville | 580 | 66 |
| Ascension | 580 | 66 |
| Roncalli | 580 | 66 |
| SPJH | 580 | 66 |

The workbook has inflated used-range dimensions (`A1:BJX7353` on the summary and `A1:GJ1594` on team sheets). Import should inspect populated cells rather than assume those dimensions describe meaningful data. No `externalLinks` entries or defined names were found in the inspected workbook package. No cached Excel error cells were found; this is not a recalculation check. Dynamic-array formulas use `_xlfn.ANCHORARRAY`, so a future importer must handle spill formulas and their cached children carefully.

## Organization and dependencies

`Catagory Descriptions` is a guideline and cross-team summary. Four judging categories occupy A1:B24: Team Spirit (A3:B6), All Hands On Deck (A9:B12), Aesthetics (A15:B18), and Innovation (A21:B24). The Engineer's Award description is A27. AM and PM race descriptions are A30 and A33. Summary columns C:K link back to individual team sheets; team-sheet A2 links to the summary's team label. These are historical teams only and are not application fixtures.

Each team sheet has summary totals in A3:B9 and repeated judge-entry blocks to the right. For `St. Kevins`, Team Spirit judge blocks span D:BC, with criteria on rows 4:7 and totals on row 8. All Hands On Deck uses rows 12:15 and totals on row 16. The Aesthetics and Innovation blocks use rows 19:22 and totals on row 23. Race placement inputs are E26 and I26. Historical assignments and names belong to the source workbook; they have not been copied into application data.

## Verified formula examples

| Source | Observed formula/values | Implication |
| --- | --- | --- |
| `St. Kevins!G4:G7` | Array anchor G4: `(F4:F7/100)*(E4:E7*20)` | Historical normalization divides a 1–5 score by 5 and applies percentage weights; minimum 1 becomes 20%, not 0% |
| `St. Kevins!F4:F7` | 25, 25, 25, 25 | Equal weights in this historical block; not an immutable rule |
| `St. Kevins!G8` | `SUM(_xlfn.ANCHORARRAY(G4))` | Judge total sums the weighted criterion spill |
| `St. Kevins!B3` | `AVERAGEIF(D8:BC8,"<>0")` | Excludes zero totals, including unfilled judge blocks; cannot distinguish a real zero from missing work |
| `St. Kevins!B4` | `AVERAGEIF(D16:BC16,"<>0")` | Same averaging pattern for All Hands On Deck |
| `St. Kevins!B5:B6` | `AVERAGEIF(D23:G23,"<>0")`, `AVERAGEIF(H23:K23,"<>0")` | Different category/judge ranges; assignments must be explicit |
| `St. Kevins!E20` | 3.75 | The “Score [1–5]” labels do not imply integer-only input; fractional scores occur |
| `St. Kevins!E27` | `(E25-E26+1)*100/E25`, E25=9, E26=9 | Parameterized denominator within this AM formula; cached result 11.111111111111111 |
| `St. Kevins!I27` | `(9-I26+1)*100/9`, I26=6 | PM formula hardcodes nine teams; cached result 44.444444444444443 |
| Every team sheet, B9 | `AVERAGE(B3:B8)` | Engineer's Award averages four judged categories **and both race scores** |
| `Catagory Descriptions!C27` | Links to `St. Kevins!B9` | Summary inherits the disputed Engineer's Award calculation |

For `St. Kevins`, the six cached category scores are 35, 60, 62.5, 70, 11.111111111111111, and 44.444444444444443. Their arithmetic mean is approximately 47.17592593, matching cached B9. This arithmetic reconciliation does not resolve the intended award policy.

## Confirmed conflict and open rules

`Catagory Descriptions!A27` says the Engineer's Award excludes the race and poster board. In contrast, every team-sheet B9 includes B7 and B8, the race scores. There is no separate poster-board total among the six summary rows B3:B8. Organizers must decide the included awards and combination rule. Do not infer an overall winner from this description.

The workbook's use of zero-filled judge blocks and `AVERAGEIF(...,"<>0")` must not become the new missing-score policy. The application will represent unanswered scores as null and track required assignments independently.

The source examples do not establish upcoming judge counts, fractional score steps, tie ranking, rounding, race disqualification/DNS/DNF points, denominator meaning, incomplete publication permissions, or the new guideline. These remain configuration decisions. Historical normalization is now understood, but administrators must explicitly select it for a new rubric.

## Implementation consequences

- No historical team, judge, score, or award is automatically imported.
- Build versioned scales with explicit numeric steps, weights, normalization, and assignment completeness.
- Keep award composition separate from an optional overall leaderboard.
- Store race placement/status separately from points; team counts and exception policies must be configured.
- Preserve source formulas and exact cell references in any later historical import preview.
