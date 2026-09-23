> Historical planning reference. For the implemented campaign, see README.md and docs/ROADMAP.md.

# ProfessorGito: Idea Evaluation Process

Purpose: decide whether the ProfessorGito idea is worth building, and what to change before we commit time to it.

Scope: this process evaluates the **idea only**. It does not judge code quality, art, or how well something is built. It answers one question: *is this a good game idea, for a real audience, that we can realistically make?*

---

## 1. Principles

1. **Test the riskiest assumptions first.** Start with what would kill the idea, not what is fun to polish.
2. **Get evidence, not compliments.** Friends and teammates are kind. Prefer what people do (click, sign up, play twice, share) over what they say.
3. **Score before discussing.** Each evaluator scores alone first, then we compare. This avoids one loud opinion steering everyone.
4. **Decide in advance what "good enough" means.** Thresholds are set in this document before we see results.
5. **Ignore sunk cost.** The planning already done is not a reason to say yes.

## 2. Who evaluates

- **Core evaluators (2 to 4 people):** the people making the game. They score the full scorecard.
- **Outside evaluators (8 to 12 people):** a mix of the three target groups: hacking-game and puzzle fans, security beginners or students, and CTF players or security professionals. They answer the interview questions in section 6.
- **At least 3 outsiders should be people we do not know well**, for example from a community post or a student club.

## 3. The process at a glance

| Stage | What we do | Output | Time |
|---|---|---|---|
| 1 | Write the idea clearly (pitch and core loop) | One-page pitch | 1 day |
| 2 | Independent scorecard by core evaluators | Weighted score | 1 day |
| 3 | Competition and market scan | Comparison table | 2 days |
| 4 | Cheap validation tests | Evidence from real people | 5 to 7 days |
| 5 | Review and decision gate | Go, Refine or Stop | 1 day |

Total: about two weeks. If a stage fails a kill criterion (section 9), we can stop early.

## 4. Stage 1: Write the idea in a testable form

Before evaluating, the idea must fit in a small space. If we cannot do this, that is already a finding.

Fill in:
- **Two-sentence pitch:** what the game is and who it is for.
- **Core loop in one sentence:** what the player does over and over (for example: scan a network, find a weakness, get in, find evidence, escape before the trace ends).
- **Why it is different in one sentence:** the thing a player cannot get elsewhere (for example: playable blue team, real technique debriefs, runs instantly in the browser).
- **The player's reward:** what makes them want to continue (story reveal, new tools, mastery, reputation).
- **Where players find it and how they play:** the link, the domain, the platform.

## 5. Stage 2: Scorecard

Each core evaluator scores every criterion from 0 to 5 using the anchors below, writes one sentence of evidence, then we average.

**Weighted score = (score / 5) x weight, summed. Total is out of 100.**

| # | Criterion | Weight | What we are judging |
|---|---|---|---|
| 1 | Concept appeal | 15 | Is the premise exciting at first hearing? Would someone click? |
| 2 | Audience and demand | 15 | Is there a real group that wants this, and can we name them? |
| 3 | Core loop and fun | 15 | Is the moment to moment play enjoyable and replayable? |
| 4 | Differentiation | 10 | Is it clearly different from existing games and learning platforms? |
| 5 | Educational value | 10 | Do players actually learn something real, without a lecture? |
| 6 | Story and theme | 10 | Is the narrative a reason to keep playing? |
| 7 | Feasibility | 15 | Can our team build the first playable version in a reasonable time? |
| 8 | Reach and distribution | 5 | Do we have a believable way to get it in front of players? |
| 9 | Sustainability and risk | 5 | Can we keep motivation and manage legal, scope and hosting risks? |

### Scoring anchors (use for every criterion)

- **0:** No evidence, or evidence against.
- **1:** Weak. Mostly opinion, and there are serious doubts.
- **2:** Some promise, but big open questions.
- **3:** Decent. Reasonable evidence, some risks remain.
- **4:** Strong. Clear evidence from more than one source.
- **5:** Excellent. Strong evidence from real people or real tests.

### Guiding questions per criterion

**1. Concept appeal**
- Can a stranger repeat the pitch back correctly after hearing it once?
- Does the name and premise make people curious?
- Is there a single memorable hook?

**2. Audience and demand**
- Who exactly are the first 100 players, and where do they gather?
- Do people already spend time on similar games, puzzles or CTF platforms?
- Is the browser, no-install format an advantage for them?

**3. Core loop and fun**
- Is the core loop fun in the first 10 minutes without the story?
- Is there a clear goal, risk and reward in every mission?
- Will experts feel challenged and beginners feel guided?

**4. Differentiation**
- What can this offer that Hacknet, Uplink, Bitburner, TryHackMe, Hack The Box, OverTheWire or picoCTF do not?
- Is that difference something players care about, not just something we like?
- Would someone who already owns a similar game still want this?

**5. Educational value**
- Can we name the real concepts each act teaches?
- Do debriefs feel rewarding rather than preachy?
- Is the game accurate enough for professionals to respect it and simple enough for beginners?

**6. Story and theme**
- Is there a mystery the player wants solved?
- Do the characters and the three endings create real choices?
- Would the story still work if the puzzles were average?

**7. Feasibility**
- How long for a vertical slice with the people and hours we truly have?
- Is the content pipeline (data-driven missions) realistic for the amount of writing needed?
- Which parts of the scope could be cut without breaking the idea?

**8. Reach and distribution**
- Do we have any audience already (followers, community, events, company channels)?
- Which two channels could bring the first 500 players?
- Is there a natural moment to launch (a conference, a CTF, a school term)?

**9. Sustainability and risk**
- Is there a plan for the first six months of work?
- Are the legal points covered (original assets, simulated content only, licenses)?
- What happens if it takes twice as long as planned?

## 6. Stage 3: Competition and market scan

Make a simple table and fill it in from real research, checking the current state of each product rather than relying on memory.

| Product | Type | Strengths | Weaknesses or gaps | What players say | What we can learn |
|---|---|---|---|---|---|
| Hacknet | Hacking game | | | | |
| Uplink | Hacking game | | | | |
| Bitburner | Browser hacking game | | | | |
| TryHackMe | Learning platform | | | | |
| Hack The Box | Learning platform | | | | |
| OverTheWire | Wargames | | | | |
| picoCTF | CTF for learners | | | | |
| (add others found) | | | | | |

Questions to answer from the scan:
- Which player complaints show up over and over? Do we solve any of them?
- Which features do fans praise most? Do we have an equal or better version?
- Is there a gap between "fun hacking game" and "serious learning platform" that we can fill?
- How recently were these products updated, and how large are their communities?

## 7. Stage 4: Cheap validation tests

Run at least three of the following. Each one should take days, not weeks.

### Test A: The pitch test
Show the two-sentence pitch to 10 outsiders. Ask them to say it back in their own words and tell us whether they would play.
- **Pass:** at least 7 of 10 restate it correctly and at least 6 say they would try it.

### Test B: Interviews
Use 15 minutes per person, five open questions:
1. What hacking, puzzle or terminal games have you played, and what did you like or dislike?
2. When did you last play something like this, and how did you find it?
3. Which part of this idea excites you most? Which part worries you?
4. What would make you stop playing after 10 minutes?
5. Who would you send this to, and what would you say when you send it?

Record exact quotes. Do not defend the idea during the interview.

### Test C: Text prototype
Create a small text-only scene, for example the Bakery contract as a terminal-style script in a document or a very small web page with five commands. Watch 5 people play it while they think out loud.
- **Watch for:** confusion, boredom, excitement, "aha" moments.
- **Pass:** at least 4 of 5 finish it, and at least 3 want another mission.

### Test D: Landing page
Publish a one-page site with the name, a short description, a mock terminal screenshot or animation, and an email or Discord signup.
- **Measure:** visitors, signups, clicks on "play the demo".
- **Suggested target:** a signup rate of 5 percent or more among visitors who come from relevant communities.

### Test E: Community post
Post the concept and a screenshot or short clip in one or two relevant communities, following each community's rules.
- **Measure:** engagement quality (specific questions, offers to test, requests for release), not just upvotes.

### Test F: One-puzzle test
Write a single Dead Drop puzzle (for example a simple cipher plus a hidden clue in a file) and share it with a few players.
- **Measure:** completion rate, time to solve, and whether people want more.

## 8. Stage 5: Decision gate

Combine the scorecard and the test results.

| Result | What it means | Next step |
|---|---|---|
| Weighted score 75 or higher, tests mostly passed, no kill criterion hit | **Go** | Build the vertical slice |
| Weighted score 55 to 74, or mixed test results | **Refine** | Fix the weakest two criteria, run a second round of the tests that failed |
| Weighted score below 55, or any kill criterion hit and not fixable | **Stop or pivot** | Consider a smaller idea (for example, only Dead Drops puzzles) or a different concept |

The thresholds above are suggestions. Agree on the final numbers before Stage 2 starts and do not change them afterward.

## 9. Kill criteria (any one of these needs a serious answer)

- We cannot explain the core loop in two sentences.
- Most testers are bored or confused within the first 10 minutes, even with help.
- Nobody outside our circle would share it or return to it.
- The only differentiator is one that players do not care about.
- The realistic time to a playable slice is more than we can commit, and we cannot cut scope.
- A key legal or ownership issue is unresolved (assets, name, or team ownership).

## 10. Riskiest assumptions to test first for ProfessorGito

These are the beliefs the idea depends on. Try to prove each one wrong early.

| Assumption | How to test it |
|---|---|
| People want a Hacknet-style game in the browser | Tests A, D, E |
| A playable blue team side is exciting, not just a feature we like | Interviews (Test B), text prototype with a defense scene |
| Real technique debriefs feel rewarding, not preachy | Test C followed by a question about the debrief |
| A 20 to 25 hour story is realistic for our team | Feasibility scoring and a time estimate for the vertical slice |
| The scope is worth it for a first release | Compare the vertical slice cost against the expected audience |
| A domain plus Cloudflare Pages or paid GitHub Pages is enough hosting | Quick technical check with a placeholder page |
| The name ProfessorGito is memorable and available | Pitch test (does the name stick?) and availability check |

## 11. Bias checklist

Before the decision gate, ask honestly:
- Did we mostly hear from people who like us? If yes, find more outsiders.
- Are we ignoring negative feedback because it hurts?
- Are we counting compliments as demand?
- Are we scoring the idea as we imagine it finished, not as it will exist in the first slice?
- Would we start this idea today if we had already spent no time on it?

## 12. Scorecard template

Copy this for each evaluator.

```
Evaluator:
Date:

| # | Criterion | Weight | Score (0-5) | Weighted | One sentence of evidence |
|---|-----------|--------|-------------|----------|--------------------------|
| 1 | Concept appeal | 15 | | | |
| 2 | Audience and demand | 15 | | | |
| 3 | Core loop and fun | 15 | | | |
| 4 | Differentiation | 10 | | | |
| 5 | Educational value | 10 | | | |
| 6 | Story and theme | 10 | | | |
| 7 | Feasibility | 15 | | | |
| 8 | Reach and distribution | 5 | | | |
| 9 | Sustainability and risk | 5 | | | |
| | TOTAL | 100 | | | |

Biggest strength:
Biggest risk:
One change that would raise the score the most:
Go / Refine / Stop (my vote):
```

## 13. Evidence log template

```
Date:
Test (A to F):
Who (type of person, not name):
What we saw or heard (exact quotes where possible):
Which criterion it affects:
Effect on score (up, down, none):
Follow-up needed:
```

## 14. Final evaluation report (one page)

At the end, write:
1. Final weighted score and each evaluator's score.
2. Test results in one table (pass or fail for each test).
3. The three strongest reasons to build it.
4. The three strongest reasons not to.
5. Changes we agree to make to the idea.
6. The decision (Go, Refine or Stop), the date, and who agreed.
7. If Go: the scope of the vertical slice and the first milestone date.
