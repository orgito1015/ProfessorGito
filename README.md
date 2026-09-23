# ProfessorGito

## Campaign edition 1.3.0

A complete short, single-player browser campaign: seven playable cases, a resolved mystery, and three endings. Choose your own terminal username on first launch. All systems and operations are fictional simulations.

This release completes the seven-case story implemented here. It is not a 20–25-hour game and does not include every optional mode from the original concept. Duration has not been measured with players. The architecture remains dependency-free browser JavaScript and Node built-ins.

## Run

Install Node.js 20 or newer, extract the ZIP, and open a terminal in the `professor-gito` folder containing `package.json`:

```sh
npm start
```

Open **http://127.0.0.1:4173**. No `npm install`, API key, account, or database service is needed. Stop with Ctrl+C. Serve the app over HTTP; do not double-click index.html.

Windows PowerShell:

```powershell
cd "$HOME\Downloads\professor-gito"
npm.cmd start
```

If port 4173 is occupied, set `PORT` before starting. In PowerShell: `$env:PORT = "4300"`. Changing origin changes browser-local storage; export before switching.

## Your username

The first-launch dialog asks for a username such as `gito`, `Nova_42`, or `Orgito`. Use 2 to 20 characters, starting with a letter. Letters, numbers, underscores, and hyphens are allowed. It appears as `username@host:/path$` in the terminal and in your case records.

Change it through **Settings > Change username**. The profile is saved with progress, exported saves, case retries, and chapter transitions. New Campaign keeps your username and display preferences. No login service or password is involved.

## Color themes

Open **Settings > Color theme** to choose Cinder Green, Crimson, Arctic Blue, Violet, Amber, or Paper Light. The whole interface changes immediately, including terminal, sidebar, reports, dialogs, and controls. High contrast works with every palette. Your choice is saved automatically and included in exports, case changes, retries, and New Campaign. Old saves default to Cinder Green without resetting progress.

## Comfortable workspace

- Larger terminal text, softer borders, more space between outputs, and a distinct command box with a Run button.
- A wider terminal beside a three-column case notebook. On phones, the notebook sits below the terminal and case files scroll horizontally.
- **Focus mode** expands the terminal and hides the notebook and case list. **Exit focus** brings them back. Running `report` automatically opens the full workspace.
- **Commands** opens a categorized guide. Selecting an item inserts it for editing; press Enter or Run to execute it.
- Unfinished commands survive panel changes. Up then Down restores a draft after browsing command history.
- Terminal reading position and each notebook panel's scroll position survive panel changes. **Latest output** returns to the end of the transcript; executing a command also scrolls to its result.
- **Save & restore** contains Checkpoints, Export save, and Import save. **Settings** contains all six themes, text size, contrast, and audio controls.
- **Alt+/** focuses the terminal. Notebook tabs support arrow keys, Home, and End. Up/Down moves between rows; Left/Right moves between tabs.

Focus mode is remembered on this browser separately from campaign saves. Draft commands and reading positions last for the current page session; they are not exported. Existing save formats and game progress remain compatible.

## Campaign

1. **Cold Boot:** identify and revoke obsolete account access.
2. **The Morning Shift:** contain the Bakery's unintended data exposure.
3. **Someone Was Here First:** investigate the Halden implant and contain it with authorization.
4. **The Supply Chain:** prove a signed artifact differs from its approved build.
5. **Blackout:** distinguish a hostile support session from legitimate port safety traffic.
6. **Inside:** decode Iva's dead drop and investigate shared-credential attribution.
7. **Null Route:** seal the cross-case evidence, choose recovery, and decide what happens to the truth.

After the final report, choose **Disclosure**, **The Offer**, or **Null Route**. Earlier report quality and service disruptions affect the epilogue. You can replay the finale to explore other endings. The Record panel shows prior results and can export a plain-text campaign summary.

## Controls

Use `help`, `scope`, `scan`, and `connect <host>` to begin. `ls` lists evidence paths; `cat <path>` reads a record; `collect <id>` preserves it. `actions` lists response options, `respond <id>` applies one, and `verify` checks the outcome. Submit the finding through the Report panel.

Later cases add `solve <answer>` for evidence-backed deductions and `decode <id>` for hexadecimal text. `brief` states the current investigation question. `whoami` shows your username. `hint` provides progressive assistance with no score penalty.

Up/Down recalls commands. Tab completes a uniquely matching command name. Tabs support Left/Right/Home/End. Help/Scope/Scan/Hint buttons run the same engine actions. Settings provide saved text sizing and high contrast. Gameplay does not require sound or animation; an optional sound cue is off by default in Settings.

The case panel has three additional tabs. **Map** shows the mission's hosts as a clickable network diagram; authorized hosts connect the terminal. **Board** lets you link preserved evidence records together and attach personal notes, both saved with your progress. **Messages** shows an in-game inbox drawn from the client's brief, scope approvals, and case outcomes as you reach them.

**Difficulty** (Settings > Difficulty) has three modes: Guided adds a "Next step" tip and extra terminal shortcut buttons; Standard is the default; Expert hides the shortcut row and shows generic objective labels for a harder read. It only changes how much is shown, not scoring.

See `docs/WALKTHROUGH.md` for all routes and answers.

## Saves and compatibility

Progress autosaves in IndexedDB, with a previous-valid-write fallback. Export JSON for portable backups. Imports are size-limited and validated before replacement. Original 0.1.0 saves migrate automatically: the current report's score is retained, but older completed cases whose scores were not stored are marked as legacy, not assigned invented scores. Migrated profiles ask you to choose a username.

Use one active tab per campaign. Multi-tab conflict resolution, cloud sync, and future save migrations are not included. Retry restarts a case from the beginning while retaining campaign history until you submit a replacement result. A new campaign clears case results after confirmation. Browser storage can be cleared or blocked; export important progress.

The **Checkpoints** button (top bar) saves a labeled snapshot of the current case so you can come back to it before a decision. Up to 12 are kept per browser; the oldest is dropped first. Loading a checkpoint replaces your current game, so export first if you want to keep the attempt you're leaving.

## New in this reviewed version

This version builds on the features in your uploaded ZIP. Your board, checkpoint slots, map, three difficulty modes, messages, themes, and optional cue are retained and extended.

- **Automatic recovery:** every authorized response captures its pre-response state. Open Checkpoints > Restore before response to undo the response and its report. The snapshot travels in exported saves. It resets on a new case; named checkpoints remain independent.
- **Checkpoint management:** rename or export individual named snapshots. A single save export includes the current game and automatic snapshot, not the entire browser's named-checkpoint collection. The 12-slot retention rule remains, with atomic writes.
- **Practice tab:** one optional exercise per case. Order events, compare configuration fields, or distinguish expected activity from unsupported conclusions. Preserve supporting records before solving. These do not alter existing case scores or invalidate older progress.
- **Visual board:** connection lines show links between your records. Selecting a graph card focuses its note. Notes autosave after a short pause and are limited to 2000 characters.
- **Map relationships:** edges identify authored dependencies, audit mirrors, and evidence handoffs; they do not represent live network discovery. Host details and response impact appear below the map.
- **Messages:** authored introductions, stable subjects, and saved read/unread status extend the existing event-driven inbox.
- **Sound:** separate optional ambience and effect controls plus volume. Sound is synthesized locally, starts only after interaction, and mutes while the tab is hidden. Everything remains playable silently.
- **Guided mode:** contextual next-command suggestions track actual progress. Standard and Expert keep the original presentation choices; hints are available in every mode.

Existing saves from your upload retain username, theme, board notes/links, difficulty, sound preference, and progress. New fields default safely. See `docs/PROGRESS-REVIEW.md` for findings and validation limits.

## Developer commands

```sh
npm test
npm run validate
npm run build
npm run preview
```

`dist/` is included and can be served directly. Build validates mission references and copies the static app without bundling. Preview serves dist on localhost. The local server exposes runtime paths only. No site has been deployed by this package.

## Structure

- `src/engine/`: parser, simulation, profile, progression, reports, endings gate.
- `src/content/`: seven mission definitions and outcome-dependent epilogues.
- `src/storage/`: save validation, original-save migration, IndexedDB adapter.
- `src/ui/`: text-safe DOM helper and responsive styles.
- `src/main.js`: application controller, username onboarding, panels, preferences.
- `tests/`: gameplay, full campaign, save compatibility, identity, and punctuation checks.
- `scripts/`: development server, content validation, static build.
- `docs/`: walkthrough, architecture, authoring, verification, and historical planning documents.

## Verification and limits

Automated tests cover all seven cases, three endings, alternate response consequences, save validation, and username persistence. See `docs/VERIFICATION.md` for exact results. A real-browser visual/interaction audit was unavailable in the delivery environment, so cross-browser UI behavior is not certified. The game has not been externally playtested.

The terminal is a controlled simulation, not Linux. Files are authored read-only records, network events are fixed scenario data, and response effects are discrete states. There are no real exploit tools, live targets, telemetry, remote assets, paid services, or AI grading. Public mods, multiplayer, daily challenges, a skill tree, and a timed industrial simulation are outside this short campaign release.

No third-party runtime packages or assets are bundled. Public code/content licensing and name clearance remain owner decisions; see `docs/OWNERSHIP.md`.
