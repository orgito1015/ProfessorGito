# Mission authoring

Missions live in `src/content/missions.js` as JavaScript data objects. They are bundled trusted content, not external executable mods. The small `record` helper creates evidence objects; the mission format is JSON-compatible after helper expansion.

Required mission fields: id, title, chapter, client, minutes, summary, brief, next (ID or null), extension, initialScope, nodes, objectives, actions, findings, correctFinding, requiredEvidence, hints, debrief, transfer.

A node defines id, label, address, role, and files. A file defines id, path, title, text, time. Evidence IDs must be unique within a case. Node addresses are fictional labels; no networking function consumes them.

An objective uses `kind` and either `value` or `values`: `flag`, `evidence`, `action`, `responded`, `verified`, `reported`. Each action defines id, label, node, required evidence IDs, impact text, service availability boolean, and quality points (0–20). Use one primary finding and plausible alternatives. Describe uncertainty rather than rewarding unsupported attribution.

Add the mission, update the previous mission's `next`, and add a playable campaign entry. The current campaign UI uses previous-entry completion to unlock the next case; preserve that sequence or update unlock logic for branching.

## Deduction and scope fields

For a response extension, set `extension: true`, an existing evidence ID in `scopeLead`, and the approval text in `scopeApproval`. The player must preserve the lead before authorization.

An optional `puzzle` object defines `prompt`, lowercase accepted `answers`, required evidence IDs in `requires`, and a `success` explanation. Response actions are gated on solving it. Hexadecimal records can be read with `decode <id>`; decoded output is plain text.

Use `{username}` in authored text where the active operator name belongs. Avoid hardcoded player identities. Do not include the long-dash character removed at the user's request; a test enforces this.

## Current limitations

Service verification and response effects remain discrete authored outcomes. There is no arbitrary executable mission scripting or live network/process simulation. New mechanics may require engine changes. Update the ending gate and campaign tests if adding or removing cases; it currently requires completion of every authored mission.

## Authoring checklist

- All objectives, action prerequisites, findings, and evidence references resolve.
- Scope and examples teach required commands before they are needed.
- Evidence order can vary without blocking progress.
- The intended response preserves a legitimate service.
- An alternate response has understandable tradeoffs.
- Hints progress from a question to a specific next action.
- A report can explain what is known and what remains unproven.
- Debriefs distinguish simulation simplifications from real practice.
- Tests cover the intended route, reverse clue order, and a plausible failure.

Run `npm run validate` and `npm test`, then play the case in a browser. Validation checks references, not whether a puzzle is enjoyable or every possible authored graph is solvable.
