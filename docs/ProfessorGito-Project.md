> Historical planning reference. For the implemented campaign, see README.md and docs/ROADMAP.md.

# ProfessorGito

*A browser hacking thriller where getting in is only the beginning.*

Status: revised concept; validation pending  
Revision: 19 September 2026  
Format: single-player narrative game inside a simulated operating system  
Core delivery: static browser application; no backend required for gameplay  
Basis: original ProfessorGito-Project.md, assessed using ProfessorGito-Idea-Evaluation.md

This document completes the concept and records a preliminary evaluation. New design decisions are recommendations, not claims of owner approval. No prototype, player interviews, domain clearance, or demand validation has been completed during this review.

## 1. Assessment and recommendation

The idea is worth testing, but its original production scope is too large to commit to now. Its strongest element is the transition from an authorized security assessment into an investigation of an existing intrusion. That transition can make the player care about the systems they have just learned to navigate.

The original plan combines a 20–25-hour story, multiple endings, several modes, a skill tree, reporting, mod support, and timed defense. Each might work separately; together they obscure the first question: is investigating and responding enjoyable for ten minutes?

Using the supplied scorecard conservatively, the original proposal receives **51/100 in a single desk review**. Under its existing thresholds this means **Stop or pivot for the original scope**, not approval to produce the campaign. The recommended pivot is a ten-minute text prototype followed, only if validation supports it, by a 30–45-minute playable case. The revised version has not earned a higher score merely because its specification is better.

The defining promise should be: **understand what happened, prove it with evidence, and choose a response that protects the client.** Browser access supports that promise but is not a unique feature.

## 2. Testable pitch

**Two-sentence pitch:** ProfessorGito is a browser hacking thriller for people who enjoy technical mysteries, including players with no security background. Inside a fictional operating system, you test a client's network, discover another intruder, and use evidence to stop them without shutting down the business.

**Core loop:** Accept a scoped assignment, inspect the system, form and test a hypothesis, preserve evidence, choose an action, and see its consequences in the case report and story.

**Differentiation hypothesis:** A compact story that lets players investigate and defend the same network they assessed, with consequences based on evidence quality and service continuity, could appeal to players who want both mystery and practical reasoning.

**Player reward:** An earned discovery, a visible consequence, a new investigative capability, and one new story question. Avoid repetitive task completion solely to fill an experience bar.

**How to play:** Open a link on a desktop or laptop and select Start Case; no account for the core game. The domain is undecided. Mobile reading can be supported later, but phone play is not an initial acceptance requirement.

## 3. Audience and first-player plan

Primary audience: puzzle and narrative-game players who like investigating technical systems. Security beginners are a closely related audience; experts provide accuracy feedback and can enjoy optional deductions.

Recruit a validation group of ten outsiders: four hacking/puzzle-game fans, four security beginners, and two experienced CTF/security participants. At least three should not be close friends. These are recruitment targets, not people already recruited.

Reach the first testers through university or security communities and hacking-game communities where invitations are allowed. For public discovery, prioritize an itch.io demo and relevant community posts. Existing personal reach is a possible recruitment advantage, not proof of demand or a promise of 100 or 500 players.

Design rules:

- Teach every required concept inside the game before testing it.
- Accept equivalent valid solutions rather than one exact command sequence.
- Let experts skip explanations and attempt optional deductions.
- Separate being unfamiliar with terminal syntax from being bad at the puzzle.
- Do not describe the game as a professional qualification or replacement for practical labs.

## 4. What makes a mission fun

Each mission needs a question, incomplete information, at least two plausible explanations, and a decision with observable consequences. Typing a provided command and waiting for an animation is not enough.

Use a repeating rhythm: observe an anomaly, make a prediction, test it, and revise the explanation. Alternate reading with actions that change the simulated world. Early clues should produce useful discoveries within the first few minutes.

Three design pillars:

1. **Evidence before certainty.** An unusual connection is a lead, not proof of compromise.
2. **Actions leave consequences.** A broad shutdown can stop the intrusion while harming legitimate operations.
3. **Reasoning over memorization.** Help and syntax completion remain available; the challenge is choosing what to inspect and why.

Original additions that reinforce those pillars:

- An attack-to-defense transition within the first substantial case.
- A small evidence notebook linking claims to source records and timestamps.
- A post-case timeline showing which actions changed the outcome.
- A short verification step after containment, including a legitimate service check.
- An optional transfer question with different names and timestamps to test understanding beyond memorizing the solution.

These additions replace scope where necessary; they are not extra systems to build on top of the original feature list.

## 5. Scope by release

| Stage | Included | Explicitly deferred |
|---|---|---|
| Text prototype | One 10–15-minute incident, five investigative actions, one response choice, short debrief | Full terminal, save system, animations, large story |
| Vertical slice | 30–45 minutes: short Cold Boot, compact Bakery training case, Halden Freight incident; notebook, structured report, hints, saves | Six-act campaign, skill tree, daily challenges, public mods, leaderboards |
| First complete release | A self-contained 2–3-hour case arc, provisional target; reuse validated mechanics and give the mystery a resolution | Promise of 20–25 hours, multiple standalone modes, online competition |
| Later expansion | Additional acts and deeper mechanics when audience and production capacity justify them | No automatic commitment to every original feature |

The 20–25-hour story remains a long-term ambition, not a release requirement. Duration targets need playtesting. A satisfying short game is preferable to stretching the same interactions across many contracts.

## 6. Story, identity, and characters

Keep the title **ProfessorGito**. Test whether unfamiliar players expect a classroom app from the name; use the short descriptor “a browser hacking thriller” in the pitch. Name, handle, and domain availability remain unverified.

**Recommended opening change:** Iva Marlow is present during the onboarding call and asks the player to check a discrepancy in a client case. Her disappearance becomes a later complication, rather than starting with a vanished mentor's laptop. This helps reduce resemblance to familiar hacking-game openings while giving players a relationship before creating a mystery.

Proposed character functions:

| Character or entity | Story function |
|---|---|
| Player | New operator at Cinder; learns the work and decides what evidence supports |
| Iva Marlow | Mentor who teaches careful investigation and later withholds information |
| Cinder | Small security collective balancing client trust, evidence, and limited resources |
| Halden Freight | First client whose normal operations matter during containment |
| Quillsoft | Shared vendor whose update trail connects apparently separate incidents |
| TALLOW | In-world label for the observed intrusion activity; not an attribution proven by one clue |
| Halcyon Group | Proposed commercial actor implicated later; motives must be revealed through evidence |
| Port Kalder | Later setting for a higher-stakes operational incident |

The original campaign structure is retained as an expansion outline:

| Chapter | Narrative purpose | Learning focus |
|---|---|---|
| Cold Boot | Establish Cinder, Iva, and a concrete first assignment | Navigation, help, reading evidence |
| Legit Work | Build trust through scoped work; uncover another intruder | Permissions, exposure, responsible reporting |
| Someone Else's Footprints | Reconstruct the incident | Timelines, persistence, distinguishing signal from noise |
| The Supply Chain | Connect incidents through Quillsoft | Update provenance, secret handling, trust boundaries |
| Blackout | Defend Port Kalder while preserving operations | Segmentation and containment tradeoffs |
| Inside | Reassess Iva and insider access | Corroboration, access history, uncertainty |
| Null Route | Resolve the evidence and choose what to do with it | Accountability and consequences |

Proposed endings: **Disclosure** releases a corroborated account through the story's disclosure path; **The Offer** trades independence for access and protection; **Null Route** prioritizes severing the harmful infrastructure at a lasting cost. These are narrative choices, not professional advice. Final outcomes should reflect evidence preserved and earlier decisions, not only the last button pressed.

Avoid identifying a culprit from a single IP address, dramatic filename, or logo. Include plausible uncertainty and reveal contradictions fairly. The first short release must resolve its own case even if it leaves a larger thread open.

## 7. Detailed vertical-slice mission: Halden Freight

Working title: **Someone Was Here First**. Target duration: 15–25 minutes after onboarding. All organizations, files, addresses, and events are fictional; commands affect simulation state only.

### Brief and scope

Halden authorizes assessment of its dispatch application and designated maintenance host. The office workstation is outside scope. The player finds an unexpected scheduled task and must preserve the finding, request a scripted incident-response scope extension, then investigate. The client approves containment of the maintenance host but asks that dispatch remain available.

### Small network

| Node | Role | Important clue |
|---|---|---|
| Dispatch application | Legitimate business service | Successful health checks establish what must keep working |
| Maintenance host | Updates and scheduled jobs | Task creation outside the maintenance window |
| Log archive | Read-only event history | A new recurring destination after the update |
| Office workstation | Out-of-scope background node | Demonstrates that reachable does not mean authorized |

### Evidence and hypotheses

Evidence items: approved maintenance schedule, task record, connection history, vendor update manifest, dispatch health check. Each has a stable ID, source, simulation timestamp, and short description.

Two hypotheses initially fit: a legitimate vendor task running at a surprising time, or an unauthorized task introduced around the update. Correlating the task and traffic raises suspicion; comparing them against the approved manifest provides the missing distinction. Timing alone does not prove the vendor's intent.

### Intended route

1. Read scope and identify the authorized nodes.
2. Inspect the maintenance host and preserve the unexpected task record.
3. Request and receive the incident-response scope extension.
4. Compare connection history with the task timeline and approved manifest.
5. Preserve supporting evidence before making a state-changing response.
6. Disable the unauthorized task and block its simulated destination.
7. Verify that suspicious traffic stops and dispatch still works.
8. Submit a concise report identifying what is known and what remains uncertain.

Alternate route: start with anomalous traffic, map it back to the task, then check the manifest. Both routes must satisfy the same evidence and verification goals. The player is not required to discover clues in a particular order.

### Response consequences

| Action | Simulated result | Feedback |
|---|---|---|
| Targeted containment after evidence collection | Suspicious activity stops; dispatch continues | Strong outcome if verification succeeds |
| Isolate the entire maintenance host | Suspicious activity stops; some support work is interrupted | Acceptable fallback with documented impact |
| Disconnect the whole network | Stops traffic but interrupts dispatch | Partial success with service-impact consequences |
| Delete the task before preserving it | Removes useful evidence from the live system | Explain loss; allow checkpoint retry |
| Ignore the activity | Additional suspicious events appear | Escalation prompts a renewed investigation |

No permanent campaign lockout in the slice. Explain failure and offer retry from a checkpoint. Do not silently reset the case or fabricate evidence the player destroyed.

### Three-level hints

1. “Was this task expected during the approved maintenance window?”
2. “Compare the task's creation time and destination with the maintenance schedule and connection log.”
3. Identify the specific evidence records to open and the next comparison to make.

Hints are hand-authored, optional, and carry no punishment in guided mode.

### Debrief

Show the causal chain, the evidence used, the response's impact, and what the simulation simplified. Explain that real incidents require corroboration and organization-specific procedures. Add ATT&CK mappings only where applicable after checking official definitions; do not force every concept into an ATT&CK technique.

Transfer question: present a different timeline with a legitimate scheduled connection and an unrelated anomaly. Ask which extra evidence would distinguish them. Do not claim that finishing the mission proves real-world competence.

## 8. Gameplay systems and interface

The initial screen needs a terminal, a clear current objective, a small network list, and an evidence notebook. Optional panels must not obscure the next decision.

Terminal requirements: command history, completion, useful errors, help, readable wrapping, and consistent quoting/path behavior. A misspelled command should suggest a correction. Unsupported commands should explain the simulation boundary.

Use an explicit command registry and simulated action handlers. No real shell, remote scanning, arbitrary JavaScript, or operating-system execution is needed. Exact command grammar is an implementation decision; mission completion must depend on state and evidence, not matching a transcript.

Replace the universal heat meter with contextual consequences:

- Authorized tutorial activity has no artificial trace countdown.
- Noisy behavior can create alerts when the case explains why.
- Incident escalation depends on specific scenario events.
- Real-time pressure is deferred until playtests show it improves decisions.
- Pause simulation timers when the game is paused; do not punish reading help or accessibility use.

For progression, unlock useful tools through cases. Defer the six-branch skill tree; mandatory clues must never become inaccessible because a player chose the wrong upgrade.

## 9. Reporting and evidence

Reports should take about one or two minutes, not become an essay assignment. Use structured fields: finding, affected asset, supporting evidence, impact, action taken, verification, and uncertainty. Optional free text can be saved but need not be automatically graded.

Proposed transparent rubric:

| Dimension | Points |
|---|---:|
| Correct finding supported by the required corroboration | 30 |
| Preserved evidence linked to its source | 25 |
| Appropriate response and explanation of impact | 20 |
| Verification of containment and legitimate operation | 15 |
| Scope compliance and honest uncertainty | 10 |
| Total | 100 |

This scores authored evidence and choices, not literary style. Missing evidence should produce actionable feedback. Never reward an unsupported accusation just because it matches the hidden story. An AI grader is not required.

## 10. Learning, accessibility, and tone

Each case has one primary learning objective and at most two supporting concepts. Debriefs are short and expandable, with an optional reference link. Clearly distinguish real concepts, simplified mechanics, and fictional tools.

Accessibility requirements for the slice: adjustable text size, high contrast, keyboard navigation, visible focus, non-color-only status indicators, reduced motion, independently muted audio, and a readable text-log alternative. Decorative CRT effects are optional and off where they harm readability. Verify the actual terminal and panels with assistive technology before claiming full screen-reader support.

English is the first content language. Externalize player-facing text and reserve room for longer translations; Albanian is a proposed next language after the writing stabilizes. Do not make translation a blocker for testing the English prototype.

Tone: grounded, tense, and occasionally human. Avoid constant glitching, miracle hacking buttons, and walls of unexplained jargon. Sound supports the mood but never carries essential information alone.

## 11. Technical design boundaries

Recommended architecture, subject to a small compatibility spike:

| Area | Proposed choice or responsibility |
|---|---|
| Application | TypeScript, Vite, React; choose one UI framework |
| Terminal rendering | xterm.js, with game-owned parser and state |
| Simulation | Pure state transitions for nodes, services, files, permissions, and events |
| Mission content | Versioned JSON with schema validation |
| Saves | IndexedDB for progress; local storage only for small preferences if useful |
| Audio and visual effects | Minimal browser audio and CSS; no extra effects engine initially |
| Testing | Parser edge cases, evidence integrity, alternate routes, triggers, and save recovery |

These are proposed implementation choices, not a dependency-version audit. Select maintained compatible versions and inspect licenses when implementation starts.

Keep presentation separate from simulation. Model objective transitions explicitly and make repeated commands safe to handle. Use a scenario seed where randomness is required so saved cases remain reproducible. An in-memory filesystem is not a real Linux machine; document the supported subset.

Mission schema should cover ID, schema/content version, prerequisites, scope, initial network/files, evidence records, objectives, event conditions, state effects, hints, report rubric, consequences, and debrief. Conditions use an allowlisted declarative format, never evaluated script strings. Validate missing IDs, invalid references, unreachable objectives, and duplicate rewards.

Save schema should include application/save version, content version, mission ID, scenario seed, state, evidence, decisions, and progress. Write checkpoints before major irreversible case actions. Validate imports, impose size limits, keep the previous valid save until the new one loads successfully, and handle unsupported versions with a clear message. Export/import remains available because browser data can be cleared.

Future custom missions are untrusted data: render content as text, reject executable markup and scripts, restrict external assets, and validate resource limits. Public mod distribution requires a separate design; internal data-driven authoring does not automatically make public mods safe.

Players can inspect downloaded content and answers. Accept that for single-player. Do not promise hidden client-side answers, anti-cheat, or trustworthy global scores. Competitive features would require a separate backend and validation model.

## 12. Hosting, ownership, and budget assumptions

A static deployment is the proposed default. Cloudflare Pages is an option with GitHub integration and a free starting route; confirm applicable limits and terms before deployment. A purchased domain is optional for validation. No hosting account, domain, or deployment was created during this review. [Cloudflare Pages](https://www.cloudflare.com/products/pages/)

Keep the source private or public according to the owner's preference; either way, delivered browser code remains inspectable. Avoid maintaining multiple hosting options in the implementation plan until one is selected.

Recommended business approach: free validation prototype and demo; reconsider donations, pay-what-you-want, or paid story packs after observing actual return play. No revenue projection is justified yet. The main initial cost is production time, with optional domain and asset costs kept separate from hosting.

Before public release, record who owns code, writing, art, audio, and contributed missions; choose appropriate licenses and keep attribution records. Original setting and assets remain required. Name and ownership questions remain open, not legally cleared by this document. No accounts, newsletter, or telemetry collection is necessary for the prototype.

## 13. Feasibility and production gates

Working assumption: one part-time developer handles integration and content, with optional outside accuracy review. Actual team size and weekly availability are unknown.

Illustrative vertical-slice effort budget, not a quotation or delivery promise:

| Work package | Focused hours |
|---|---:|
| Terminal, parser, and small filesystem | 20–30 |
| Network state and mission transitions | 20–30 |
| Three short content segments and hints | 20–30 |
| Notebook, reports, saves, and basic interface | 20–30 |
| Playtesting, accessibility review, and fixes | 20–30 |
| Subtotal | 100–150 |
| Contingency, about 30% | 30–45 |
| Planning range | 130–195 |

At ten focused hours per week this is roughly 13–20 weeks; at twenty, roughly 7–10 weeks. The ten-minute text prototype is separate and should be timeboxed to roughly 8–12 hours. If that is already too expensive, simplify the scene rather than starting an engine.

Measure how long one mission takes to write, validate, and revise before estimating a campaign. Data files reduce repeated engine work; they do not remove writing, puzzle design, or QA.

| Gate | Required evidence | Next action |
|---|---|---|
| Concept validation | Pitch, interviews, and text-prototype observations | Rescore using the original rubric |
| Slice approval | Go threshold met, no unresolved kill criterion, feasible time commitment | Build the bounded slice |
| Slice completion | Both routes work; evidence/report/save behavior verified; observed player feedback | Decide whether the short release is justified |
| Campaign expansion | Repeat engagement and measured content-production capacity | Estimate one next chapter, not all remaining acts |

A useful technical prototype is not automatically a successful game. If the first case requires repeated instructor intervention, revise it before producing more content.

## 14. Preliminary evaluation using the supplied framework

Evaluator: AI-assisted desk review; one perspective, not the requested 2–4 independent human evaluators. Date: 19 September 2026. Scores apply to the original proposal, informed by the current-source scan below. They are judgments under the supplied anchors, not measured player outcomes.

| Criterion | Weight | Score / 5 | Weighted | Evidence and limitation |
|---|---:|---:|---:|---|
| Concept appeal | 15 | 3 | 9 | Clear technical mystery and role reversal; stranger pitch comprehension untested |
| Audience and demand | 15 | 3 | 9 | Adjacent games have substantial positive review histories; demand for this game untested |
| Core loop and fun | 15 | 2 | 6 | Relevant actions listed, but no observed moment-to-moment play |
| Differentiation | 10 | 2 | 4 | Browser access, modding, and defensive learning overlap with existing products |
| Educational value | 10 | 3 | 6 | Concrete concepts and debriefs are specified; learning transfer unmeasured |
| Story and theme | 10 | 3 | 6 | Coherent escalating mystery; character appeal and originality need testing |
| Feasibility | 15 | 2 | 6 | Static simulation is plausible; original content scope lacks a team/time budget |
| Reach and distribution | 5 | 3 | 3 | Named channels fit the audience; no measured acquisition results |
| Sustainability and risk | 5 | 2 | 2 | Scope and ownership questions remain; no demonstrated production cadence |
| **Total** | **100** | | **51** | **Preliminary; not a team average** |

The supplied thresholds are retained: 75+ with mostly passed tests and no kill criterion means Go; 55–74 or mixed tests means Refine; below 55 means Stop or pivot. The original scope falls in Stop or pivot. The recommended smaller case is the pivot to evaluate next. It is not a full-production Go and has not been rescored speculatively.

Strongest reasons to investigate further: a coherent mystery, a useful attack-to-defense transition, and a browser-delivered simulation that can be tested cheaply.

Strongest reasons not to commit yet: no evidence the loop is fun, an oversized content commitment, and differentiation that is weaker than the original wording suggests.

## 15. Current competitor scan

Checked 19 September 2026 using the linked product pages. Product facts are sourced; “opportunity” is an inference for ProfessorGito, not a proven competitor defect. Review labels are a snapshot, not estimates of active users or market size.

| Product | Type and verified strengths | Player evidence available in this review | Opportunity or lesson for ProfessorGito |
|---|---|---|---|
| [Hacknet](https://store.steampowered.com/app/365450/Hacknet/) | Terminal narrative game with a mystery and campaign mod tools | Steam English review summary was Very Positive; individual complaint themes not sampled | Story and modding already exist here; distinguish the opening and evidence/response loop |
| [Uplink](https://store.steampowered.com/app/1510/Uplink/) | Contract-based hacking game with upgrades, risk, and faction choices | Steam overall review summary was Very Positive; detailed sentiment not sampled | Make decisions consequential; contracts and branching alone are not new |
| [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/) | Programming-based incremental game with JavaScript automation and a web version | Steam English review summary was Very Positive; detailed sentiment not sampled | Browser hacking is established; emphasize compact authored investigations instead of incremental progression |
| [TryHackMe](https://tryhackme.com/) | Guided practical learning, browser tools, offensive and defensive material | Homepage testimonials are curated and not independent demand evidence | Do not claim browser convenience or blue-team learning is unique |
| [Hack The Box](https://www.hackthebox.com/) | Academy, labs, competitions, and red/blue/purple-team offerings | No independent player sample collected | Compete on narrative pacing and accessibility, not training breadth |
| [OverTheWire](https://overthewire.org/wargames/) | Progressive security wargames; Linux, web, cryptography, and exploitation tracks | No player sample collected | Teach through small discoveries; reduce onboarding friction within a fictional OS |
| [picoCTF / CyLab Security Academy](https://picoctf.org/) | The checked picoCTF page directs learners to CMU's free CyLab Security Academy | No player sample collected | Free educational challenges already exist; narrative consequences must justify attention |

Conclusion: there is an established adjacent audience, but the proposed market gap is a hypothesis. No recurring complaint pattern has been established. Recent review activity is not an update date; current pages and historical review totals are not active-community counts.

Before the formal decision gate, sample recent positive and negative reviews for the closest games and record dates, repeated themes, and sample sizes. Check their official update histories and relevant closer competitors. Avoid claiming a complete market scan from these seven pages alone.

## 16. Validation plan and current results

Use the original tests A, B, and C first. D, E, and F are optional follow-ups, not prerequisites to buying a domain or building a large site. No messages have been sent and no participants have been recruited during this review.

| Test | Procedure and threshold | Current result |
|---|---|---|
| A: Pitch | Ten outsiders; at least seven restate it correctly and six say they would try it | Not run |
| B: Interviews | 8–12 people; retain the original five open questions and exact responses | Not run |
| C: Text prototype | Five observed players; at least four finish and three want another mission | Not run |
| D: Landing page | Optional; original suggested 5% relevant-visitor signup rate; report denominator and traffic source | Not run |
| E: Community response | Optional; record specific questions, voluntary tester offers, and return interest | Not run |
| F: One-puzzle test | Optional; record completion, time, and voluntary continuation | Not run |

For C, also record where hints were needed, whether players can justify their containment choice, and whether they actually begin an optional follow-up scene. These add behavioral evidence; they do not silently replace the original pass thresholds.

Proposed operational definition of “mostly passed” for the next gate: A and C meet their stated thresholds, interviews show no unresolved recurring blocker, and no kill criterion is hit. Core evaluators should adopt this interpretation before collecting results. Interview B has no invented numerical pass mark.

Run order over about two weeks: finalize pitch and text scene; recruit and interview; observe play; summarize evidence; have 2–4 core evaluators score independently; then discuss and decide. Calendar dates depend on availability. Do not count the AI desk review as several independent evaluators.

| Risk assumption | Evidence needed | Response if unsupported |
|---|---|---|
| Players enjoy investigation and defense | Observed engagement and voluntary continuation | Simplify the loop or pivot to a narrower puzzle game |
| Reporting improves the experience | Players understand consequences without feeling interrupted | Shorten to evidence selection and a brief summary |
| Beginners can reason without outside help | Completion and hint-use observations | Improve teaching, clues, and syntax support |
| The slice fits available time | Actual prototype hours and committed weekly capacity | Cut content before cutting clarity |
| The identity is memorable | Pitch restatement and delayed name recall | Revise descriptor or revisit branding |

Keep an evidence log with date, participant segment, recruitment source, task, behavior, exact quote when available, affected criterion, and follow-up. Label observations separately from interpretations. Do not invent missing quotes or mark unrun tests as failed.

## 17. Risks and unresolved decisions

| Risk or open decision | Current treatment |
|---|---|
| Scope creep | Enforce the release table; one substantial incident before more acts |
| Unproven fun | Text prototype before engine investment |
| Derivative story | Change the opening and test the evidence-driven identity |
| Content production burden | Measure one full mission's authoring and revision effort |
| Unfair failure or timer pressure | Checkpoints, readable feedback, no timer during onboarding |
| Simulation teaches misleading certainty | Corroboration, explicit simplifications, accuracy review |
| Save loss | Versioned checkpoints, validated import/export, recovery behavior |
| Name, rights, and team ownership | Unresolved; check before public release and substantial branding spend |
| Monetization | Free prototype recommended; later model undecided |
| Team and time | Owner must establish actual availability before production commitment |

Kill-criterion status: the loop is now expressible; boredom, return interest, and perceived differentiation remain untested. Available production time and rights questions remain unresolved. Do not label them passed simply because this document proposes mitigations.

## 18. Immediate next steps and definition of done

1. Establish the actual people and weekly hours available for validation.
2. Write only the ten-minute Halden text scene and its evidence records.
3. Prepare the pitch and original interview questions; recruit the outsider sample.
4. Run A, B, and C and keep exact counts and observed behavior.
5. Rescore independently and apply the existing decision thresholds.
6. If Go, start the bounded vertical slice; if Refine, retest the weakest two areas; if Stop, reduce to a standalone investigation or Dead Drop before reconsidering.

The slice is done when a new player can begin without an account, complete a taught investigation, choose a justified response, submit an evidence-backed report, understand the consequences, and resume reliably from a save. Both authored routes must work; a mistaken action must produce understandable recovery; core play must not depend on external targets or paid APIs.

## 19. Revision record

This revision preserves the name, Cinder setting, principal organizations, campaign ambition, simulated-only approach, browser delivery, and three proposed endings. It adds a sharper loop, a concrete incident design, structured reporting, an evidence standard, release boundaries, an effort model, sourced competitor checks, and a preliminary scorecard.

It revises the opening, reduces the initial scope, defers the skill tree and extra modes, makes timers contextual, replaces vague grading with a transparent rubric, and treats all market/learning claims as hypotheses until tested. ProfessorGito-Idea-Evaluation.md remains the unchanged evaluation procedure; this project file contains its preliminary application and the next validation plan.
