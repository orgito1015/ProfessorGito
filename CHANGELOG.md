# Changelog

## 1.3.0 - Comfortable workspace

- Rebalanced the desktop layout around a larger terminal and organized notebook tabs.
- Improved text sizes, spacing, command entry, dialogs, mobile layout, and high-contrast borders.
- Added focus mode, an insert-before-run command guide, a Save & restore menu, and a Latest output button.
- Preserved command drafts, terminal reading position, and notebook scroll positions across interface updates.
- Added three-column tab keyboard navigation and Alt+/ terminal focus.
- Existing campaign content, six themes, checkpoints, and save compatibility are retained.
- All 54 existing automated tests pass; actual browser visual and interaction validation is still pending.

## 1.2.0 (reviewed upload)

- Preserved the user-added checkpoint slots, evidence board, map, three modes, messages, and effects.
- Added automatic pre-response recovery snapshots plus checkpoint rename/export.
- Added seven optional practice exercises with chronology, configuration comparison, and classification mechanics.
- Added visible evidence connections and authored map relationships.
- Added message subjects/read status, local ambient audio, volume, and hidden-tab muting.
- Fixed stale board selections across cases, unbounded notes, comma-separated ordering input, and queued-save status tracking.
- Checkpoint insertion and oldest-slot pruning now share one transaction.
- Expanded coverage from 43 passing uploaded tests to 54 passing tests, including a fixture produced by the untouched uploaded version.

## User additions preserved from uploaded ZIP

- Added named checkpoints (save slots) so a case can be replayed from a saved decision point; stored per browser, up to 12.
- Added an evidence board: link preserved records together and attach personal notes, saved with progress.
- Added an `order` puzzle type to the engine for chronological-sequence deductions, alongside the existing text-answer type.
- Added an interactive network map tab; authorized hosts connect the terminal on click.
- Added Guided / Standard / Expert difficulty modes controlling on-screen guidance, not scoring.
- Added a derived in-game Messages tab and an optional sound cue (off by default).
- Expanded automated coverage to 43 tests covering the new save fields and puzzle/message logic.

## 1.1.0

- Six selectable full-interface themes, including Paper Light.
- Immediate switching in Settings, persistent save/export support, and backward-compatible defaults.
- High contrast respects the selected theme.
- Added palette contrast and theme-persistence checks; 39 automated tests pass.

## 1.0.0

- Added required username onboarding, editable profile, personalized prompts and tutorial records.
- Persisted username and text/contrast preferences across saves and campaign progression.
- Removed the requested long-dash character from authored game text and documentation; imports clean old transcript copies too.
- Completed Supply Chain, Blackout, Inside, and Null Route, bringing the campaign to seven playable cases.
- Added evidence-gated deductions, hexadecimal decoding, and data-driven response-scope extensions.
- Added three saved endings with outcome-dependent epilogues, campaign records, and text export.
- Added original-save migration, replay gating, new-campaign reset, and keyboard tab navigation.
- Expanded automated coverage to full campaigns, all endings, profile persistence, and migration.

## 0.1.0

Initial three-case foundation with simulation, evidence, reports, hints, saves, interface, and developer tools.
