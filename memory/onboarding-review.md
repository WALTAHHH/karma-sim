# First-Time Player Experience Review

**Date:** 2025-01-27
**Reviewer:** Sprint QA (Code Analysis)
**Method:** Traced player flow through code without browser

---

## Player Journey Analysis

### Stage 1: Title Screen
**What happens:** Player sees minimal title screen with:
- ☸ dharma wheel icon
- "KARMA" title with wide letter-spacing
- Tagline: "Lives echo forward"
- "Begin" button
- "Collections" button (even for new players)

**Issues for new players:**
- ❌ **No explanation of what the game is** - cryptic tagline gives no hint
- ❌ **No tutorial or help option** - players are thrown in blind
- ❌ **Collections button shows for new players** but will be empty/confusing
- ❌ **Side panels hidden until first life completed** - no context visible

### Stage 2: Life Generation
**What happens:** 
- Random country selected from UK (only default unlocked)
- Random year from Contemporary era (1991-2025)
- Life generated with wealth, education, health, connections stats
- Birth narrative displayed with ASCII art

**Issues for new players:**
- ❌ **No explanation of stats** - what do wealth/education/health/connections mean?
- ❌ **Stat bars only visible in collapsed side panel** (and panel is hidden for first-timers!)
- ❌ **Country/era system unexplained** - player doesn't know these can be unlocked
- ⚠️ Birth narrative is atmospheric but doesn't explain mechanics

### Stage 3: Gameplay (Events)
**What happens:**
- ~10-14 events across 4 life stages (childhood → young_adult → middle → late)
- Events have 1-4 options
- Single-option events are "forced" (life happens TO you)
- Multi-option events are choices with hidden consequences
- Life arc progress indicator shows dots at bottom

**Issues for new players:**
- ❌ **Consequences are opaque** - no indication what choices actually do
- ❌ **"preview" hints exist in code** but only show vague descriptions
- ❌ **Stats change invisibly** - no feedback when health drops, etc.
- ❌ **Life stages shown only in side panel** which is collapsed/hidden
- ❌ **Crisis events (punishing spirals) can blindside players** without warning low stats
- ⚠️ Life arc visual exists but unlabeled - "Birth" on left, "?" on right

### Stage 4: Career Selection (Young Adult)
**What happens:**
- Special event at young_adult stage
- Shows 1-4 job options based on era and stats
- Jobs have requirements (e.g., education > 3)

**Issues for new players:**
- ❌ **Jobs can be locked with no explanation** - if stats too low, options disappear
- ❌ **Job effects unexplained** - what does being a "Factory Worker" actually do?
- ⚠️ Some jobs only available in certain eras - not communicated

### Stage 5: Tags (Character Traits)
**What happens:**
- Earned through choices (directly via `grantsTag` or accumulated via axes)
- Purple notification overlay when earned
- Tags have bonuses AND penalties (double-edged)

**Issues for new players:**
- ❌ **Tags appear without warning** - no indication they exist before first one
- ❌ **No preview of how to earn them** - discovery is entirely opaque
- ⚠️ Notification says "This will shape your future choices" but doesn't explain how

### Stage 6: Death & Summary
**What happens:**
- Death from health reaching 0 OR completing all events
- Summary shows: birth circumstances, key moments, traits, ending, karma change
- Achievements can unlock here

**Issues for new players:**
- ✅ **Summary is clear and readable** - good recap of the life
- ✅ **Achievement notifications are satisfying**
- ❌ **Karma change shown but karma system never explained**
- ❌ **"Continue as Descendant" appears if had children** - what does this mean?

### Stage 7: Post-Death Options
**What happens:**
- "Continue as Descendant" (if had children)
- "Game Hub" (karma gambling games, if karma > 0)
- "Spend Karma" (unlock shop)
- "Begin again"

**Issues for new players:**
- ❌ **Multiple options with no guidance** on which to pick
- ❌ **Shop system unexplained** - what can you buy? why?
- ❌ **Game Hub is pure gambling** - could feel predatory without explanation
- ⚠️ After first life, side panels appear but player might not notice

---

## What Works Well (Rewarding Elements)

1. **Aesthetic cohesion** - dark theme, monospace font, ASCII art creates atmosphere
2. **Achievement celebrations** - particles, glow effects, satisfying "unlocked" moment
3. **Run history** - collapsible section showing previous lives gives sense of persistence
4. **Collections view** - visual progress tracking with icons and tooltips
5. **Life arc indicator** - subtle progress visualization (birth → ?)
6. **Choice commitment animation** - brief "committing" state adds weight to decisions
7. **Hidden cost reveals** - dramatic "Consequences Unfold" overlay for delayed effects

---

## Top 3 Onboarding Improvements

### 1. Add a "First Life" Tutorial Flow
**Implementation:** Create a `js/tutorial.js` that:
- On first-ever play (check localStorage flag), show brief contextual tooltips
- Before first event: "Your choices shape your karma and stats"
- First stat change: Highlight the stat bar that changed
- First tag earned: Explain what tags do
- End of first life: "Karma carries forward to your next life"

**Effort:** Medium (2-3 hours)
**Impact:** High - prevents confusion, builds understanding

### 2. Show Stats During Events (Not Just in Side Panel)
**Implementation:** Add inline stat indicators:
- Show current stats (or at least health) somewhere in main game area
- After outcomes, briefly flash stat changes: "Health -1" with color coding
- Add tooltips to stat names explaining what they do

**Effort:** Low (1-2 hours for inline display)
**Impact:** High - players can't act on information they don't have

### 3. Add "How to Play" Button on Title Screen
**Implementation:**
- Simple modal or help screen accessible from title
- Cover: karma basics, stats, choices, unlocks, tags
- Keep it short (one screen) with icons
- Optional: Link to it after first death too

**Effort:** Low (1 hour for basic modal)
**Impact:** Medium - players who want help can get it

---

## Additional Recommendations (Lower Priority)

4. **Show karma definition on title screen** - even a one-liner under the tagline
5. **Indicate low stats are dangerous** - color health bar red when low
6. **Explain descendant system** before showing the button
7. **Add "?" help icon** that's always accessible
8. **Progressive disclosure for Collections** - hide until first unlock
9. **Preview choice stakes** - even vague hints like "risky" or "safe" icons
10. **Explain Game Hub is gambling** - set expectations before entering

---

## Code Quality Notes

- UI code is clean and well-organized
- State management is clear (state object with phase, life, etc.)
- Side panels have collapse/expand logic but default to collapsed
- `persistentTracking.totalLives < 1` check hides panels for new players - good intent, but removes helpful context
- Tutorial hooks don't exist yet - would need to add first-run detection

---

## Summary

The game has strong aesthetics and satisfying feedback loops (achievements, unlocks, collections), but **throws new players into the deep end without explanation**. The core loop is discoverable through play, but the karma system, stats, tags, and unlock mechanics are all learned through trial and error.

**Quick wins:** Help button, inline stat display, first-run tooltips
**Bigger investment:** Full tutorial flow, progressive revelation of systems
