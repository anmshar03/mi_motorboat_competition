# Reference review and unresolved decisions

## Evidence status (updated)

The workbook was supplied after the initial empty-workspace inspection. Its 10 worksheets, formula dependencies, normalization approach, fractional score examples, and Engineer's Award discrepancy are now documented in [workbook-findings.md](workbook-findings.md). The initial missing-file blocker is resolved. New-edition rules still require organizer decisions.

The project brief supplied these initial reference examples; the findings document now records independently inspected evidence:

- Historical award examples include Best Team Spirit, All Hands On Deck, Most Aesthetically Pleasing Boat, Most Innovative Design, Maneuverability Award (AM Race), Head-to-Head PM Race, and Engineer's Award.
- The brief describes four Team Spirit criteria with equal 25% weights and a 1–5 scale.
- The brief supplies a historical placement example: `((totalTeams - placement + 1) / totalTeams) * 100`.
- The Engineer's Award disagreement is confirmed: `Catagory Descriptions!A27` excludes races; each team-sheet B9 averages B3:B8, including both races.

None of these examples should seed a live competition automatically.

## Workbook review procedure

The original was inspected read-only. The review procedure is retained for subsequent revisions and the new guideline:

1. Inventory every worksheet, including hidden sheets, dimensions, tables, named ranges, and external references.
2. Map category descriptions to criterion rows, scale bounds, weights, judge/team input sheets, summary formulas, and rankings.
3. Record representative formulas with exact worksheet and cell references. Trace all referenced inputs rather than relying on cached totals.
4. Check treatment of blank inputs, zero, minimum scores, partial evaluations, excluded teams, and unequal judge counts.
5. Reconcile category totals and race scores against representative workbook examples. Identify hardcoded totals and team-count denominators.
6. Compare written guidelines against formulas, particularly Engineer's Award composition, normalization, and weighting.
7. Report formula errors, broken references, ambiguous rules, and assignments separately from confirmed scoring behavior.
8. Classify each finding as observed historical behavior, proposed configurable capability, or organizer decision. Preserve historical personal data privately.

## Decisions for organizers

These decisions can be collected progressively; they need not delay basic layouts or authentication.

| Decision | Why it matters | Proposed behavior until resolved |
| --- | --- | --- |
| Upcoming year, title, date, venue, stages | Public content and competition setup | Leave unset; do not invent schedule information |
| New guideline and changed categories | Rubric configuration | Do not activate a live rubric |
| Criterion normalization for nonzero minimum scales | Historical workbook divides by maximum; subtracting minimum produces different results | Require an explicit selection for each upcoming rubric |
| Optional unanswered criteria | Exclusion, reweighting, and missing-value behavior differ | Preserve null; require a configured policy |
| Judge averaging and assignment completeness | Different teams may have different judges | Track all expected assignments; block complete status when required submissions are absent |
| Judge weighting or minimum judge count | Changes aggregation and completeness | No inferred unequal weights or minimum count |
| Rounding and tie ranking | Can change standings and award recipients | Require configuration before publishing rankings |
| Engineer's Award categories and formula | Brief reports conflicting historical rules | Keep award inactive until explicitly configured |
| Overall leaderboard | Individual awards need not define an overall winner | No overall result until an explicit composition is configured |
| Race format and advancement | Head-to-head may require heats, brackets, or rounds | Model events/rounds; defer advancement automation until specified |
| Race denominator | Registered, started, and finished team counts can differ | Require explicit definition |
| Ties, disqualifications, DNS, and DNF | Placement alone does not determine points | Record status separately; require point policies |
| Submission editing and reopening | Judges may or may not revise submitted evaluations | Propose admin-controlled reopening, with revision history |
| Incomplete publication authority | Exceptions must be deliberate | Block publication unless an authorized admin records an override and reason |
| Identity provisioning and admin scope | Invitation method and who manages competitions | Propose invitation-only judges and per-competition memberships |
| Public team information and branding | Student privacy and institutional requirements | Publish only explicitly approved profile fields; use no unapproved logos |
| Data retention, hosting, backup ownership | Institutional operating requirements | No hosting deployment or retention schedule assumed |

## Immediate inputs

The historical workbook audit is documented. The additional rubric/guideline is still needed before configuring its scoring behavior. Historical team and judge lists remain historical reference data. Basic layouts, authentication integration, and competition information management do not depend on resolving the scoring decisions.
