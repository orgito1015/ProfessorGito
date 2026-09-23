# Architecture and extension boundaries

## State flow

A UI action passes a string to `execute(state, input)`. The engine clones state, parses a fixed command grammar, checks scope and evidence preconditions, then returns state, output, and an optional panel intent. No command reaches a real network or shell.

State records username, profileSet, saved display preferences, prior caseResults, selected ending, version, contentVersion, missionId, completed cases, active simulated host, working directory, read and preserved evidence IDs, flags, response, verification, report, hint level, simulation step counter, timeline, and bounded transcript. The step counter orders player events; it is not real-world time. Evidence timestamps belong to authored source records.

## Domain modules

The parser supports whitespace, quoted tokens, and normalized virtual paths. Files are authored read-only records; path traversal normalizes inside the virtual root. There is no write/delete/chmod support in this build. Each host has a separate file list and scope membership.

The mission engine supports typed objective predicates: flag, evidence, action, responded, verified, reported. Responses are selected from a fixed list with node, evidence, and authorization prerequisites. The model stores one response per attempt and derives service impact from it. It does not simulate packets, processes, arbitrary vulnerabilities, or a general operating system.

Report grading checks preserved/cited evidence and authored finding IDs. Full finding points require the correct finding plus all required corroboration. Response points vary by impact. Verification receives fewer points when the legitimate service is unavailable. The uncertainty checkbox makes the reporting lesson explicit; it is not NLP evaluation of prose.

## Persistence

Save version 2 / content version 2. The original version-one/content-one format migrates through an explicit allowlisted path. Import validation checks allowed IDs, field types, array/string limits, state prerequisites, and recalculates report scoring. Only a clean allowlisted object is returned. Saves are not cryptographically authenticated. This is integrity validation for accidental corruption, not anti-cheat.

IndexedDB database `professor-gito`, store `saves`, keys `current` and `previous`. Writes use a single transaction and the UI serializes writes. The previous key is updated only from a valid current snapshot. Load tries current, then previous. Import cancellation or rejection does not replace active state. Only the original version-one format migrates; other unsupported versions fail explicitly.

## Presentation and trust

All authored/imported display text goes through textContent/text nodes. No innerHTML, eval, Function constructor, remote asset import, or live command execution. The local server returns a restrictive Content Security Policy. A third-party static host should configure equivalent response headers if desired.

UI: campaign navigation, objectives, terminal, evidence/brief/timeline/report tabs, export/import, saved text-size and contrast controls. Rendering is intentionally simple; the command input is refocused after commands. Audio and animation are absent. Screen-reader transcript announcements and a full assistive-technology audit remain future work.

## Migration to the proposed stack

1. Add types to the state and declarative mission contracts; maintain the existing engine tests.
2. Replace UI rendering with React components without changing state transitions.
3. Add xterm.js only if richer terminal behavior justifies it; retain a plain-text accessible log.
4. Keep IndexedDB behind the adapter and introduce explicit migration functions before changing the save version.
5. Design a validated mission JSON import format separately before offering public mods.

No framework migration is required to add authored cases using the current schema.


## Identity and campaign

Profile input is trimmed and checked by `normalizeUsername`: 2–20 ASCII characters, starting with a letter, then letters/digits/underscore/hyphen. Rendering uses text nodes. The `{username}` token personalizes authored tutorial records. No user account or authentication is created.

`nextCase` and `replayCase` carry profile, preferences, results, and completed IDs. Replay resets the current attempt and ending, then replaces that case's summary on resubmission. `chooseEnding` requires all seven completions and the final report. It accepts only authored ending IDs and rejects choosing twice for the same attempt. Epilogues use stored report quality and service impact, not only the last choice.

`solve` compares an authored normalized identifier after required evidence is preserved. `decode` converts hexadecimal byte text from a read evidence record; it never evaluates code. These are small authored puzzles, not a general scripting language. Later response actions require the deduction flag.

Scope extensions are mission fields (`scopeLead` and `scopeApproval`) rather than Halden-only engine strings. Save validation checks puzzle and extension prerequisites, historical result consistency, username, preferences, and ending availability.

Legacy completed cases had no historical scores. Migration marks those entries as legacy; it retains the current report's known score and does not fabricate the missing ones. Ending averages exclude unknown legacy grades.


## Themes

`src/ui/themes.js` holds six palettes, stable theme IDs, high-contrast transformations, and a shared application function. Components use CSS variables instead of fixed colors. Preferences include `theme`; saves that omit this optional field default to `cinder`. Unknown IDs are rejected before active state is replaced. This additive field does not change the save or content version.


## Reviewed upload extensions

`engine/extensions.js` holds bounded board mutations, recovery snapshots, optional exercise evaluation, and guided next-step selection. `content/extras.js` defines seven optional exercises, relationships, and message introductions. `ui/exercises.js`, `ui/graphs.js`, and `ui/audio.js` separate these views and native audio lifecycle from the controller.

Save version 2/content version 2 are retained. Additive fields (`autoCheckpoint`, `exerciseSolved`, `readMessages`, and ambience/volume preferences) default when absent. An automatic snapshot must have no response/report and no nested checkpoint; it must belong to the same case. The IndexedDB schema remains the uploaded database version 2 with its existing saves/checkpoints stores.
