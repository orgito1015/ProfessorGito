# Comfortable workspace, version 1.3.0

The interface now prioritizes sustained reading and a clear command workflow.

| Area | Change |
| --- | --- |
| Environment | Quieter borders, rounded panels, subtle themed background, simpler top bar |
| Terminal | Larger text and line spacing, wider desktop surface, separate prompt and input |
| Navigation | Three-column notebook tabs, evidence and unread-message counts, numbered case cards with status |
| Focus | Expand the terminal, hide surrounding panels, return using Exit focus |
| Assistance | Categorized command guide inserts commands for editing before execution |
| Continuity | Keep command drafts and reading positions when the interface updates |
| Small screens | Horizontal case list, stacked terminal and notebook, larger controls |
| Personalization | Existing six themes, high contrast, text size, username and sound remain available |

## Verification

All 54 existing automated tests pass, including all seven cases, all endings, save compatibility, and theme contrast pairs. JavaScript syntax and the static build pass. These tests establish campaign regression coverage, not visual correctness.

No browser executable is available in this environment. Actual rendering, native dialog focus, mobile keyboard behavior, and assistive technology checks must still be verified in a real browser.

## Browser acceptance checklist

1. Open at 1440, 1024, 768, and 390 pixels wide. Confirm no page-wide horizontal overflow, clipped controls, or hidden notebook tabs.
2. Try all six themes, high contrast, and 14, 16, and 22 pixel text sizes. Confirm terminal output and input stay legible.
3. Type an unfinished command, change tabs, and toggle focus mode. Confirm the command remains. Run help, scroll upward, change panels, and confirm the transcript reading position remains.
4. Use Latest output, then run a command. Confirm its result appears at the end and the input is empty.
5. Type a draft, press Up to view history, then Down. Confirm the draft returns. Complete a command name with Tab.
6. Open Commands, choose connect, add a host, and press Enter. Confirm choosing a guide item alone does not run it.
7. Turn focus mode on, reload, and confirm it is remembered. Run report and confirm the notebook becomes visible.
8. Switch notebook panels after scrolling each. Confirm each retains its own reading position. Use all arrow keys, Home, and End on the tab grid.
9. Export and import a save through Save & restore. Load a named checkpoint. Confirm old game progress is retained.
10. Test with a phone keyboard open and with keyboard-only navigation. Verify modal close returns focus to a sensible control.

## Persistence

Focus mode uses the browser-local key `gito-focus-mode`, with a safe fallback if local storage is unavailable. It does not change exported campaign state. Command drafts, history, and panel reading positions are transient and reset with case changes or a page reload.
