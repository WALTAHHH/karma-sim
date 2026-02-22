# Karma Simulator

A systemic life simulation game modeling how outcomes emerge from birth circumstances, institutions, and cumulative choices.

## Quick Links

- **Play:** `python -m http.server 8000` then open `http://localhost:8000`
- **QA Dashboard:** `http://localhost:8000/qa.html` (debug mode always on)
- **Test Runner:** `http://localhost:8000/tests/runner.html`

## Core Concepts

The game simulates:
- **Structural inequality** - Birth circumstances heavily influence life outcomes
- **Path dependence** - Early advantages compound across a lifetime
- **Partial agency** - Choices matter, but within constraints
- **Learning through repetition** - Players discover patterns across many lives

## Architecture

### File Structure

```
js/
  main.js       - Game loop, state machine, UI orchestration
  countries.js  - Country dataset with metadata and modifiers
  eras.js       - Era definitions with time periods and modifiers
  jobs.js       - Job categories and jobs data with era availability
  unlocks.js    - Country, era, and job category unlock systems
  life.js       - Life generation and birth context
  events.js     - Event system and outcomes
  karma.js      - Karma persistence and influence calculations
  tags.js       - Decision tag system (character traits)
  achievements.js - Achievement tracking
  data.js       - Distributions, descriptors, utility functions
  ui.js         - DOM rendering, side panels, collections view
  debug.js      - Debug panel functionality
index.html      - Single-page HTML with embedded CSS (three-column layout)
```

### Key Systems

#### Countries (`countries.js`)
Countries are the primary structural unit. Each country has:
- `id` - Unique identifier (e.g., 'UK', 'Japan')
- `name` - Display name
- `incomeLevel` - One of: `low`, `lower-middle`, `upper-middle`, `high`
- `populationScale` - One of: `tiny`, `small`, `medium`, `large`, `massive`
- `baselineModifiers` - Object with `wealth`, `education`, `health`, `connections`, `volatility` (values -0.15 to +0.15)

Population weights for birth selection:
- tiny: 1, small: 5, medium: 15, large: 40, massive: 100

Key functions:
- `selectWeightedCountry(countryList)` - Population-weighted random selection
- `getCountryModifiers(country)` - Combines baseline + income level effects
- `validateCountries()` - Data integrity checks

#### Eras (`eras.js`)
Eras define historical time periods with distinct characteristics. Each era has:
- `id` - Unique identifier (e.g., 'contemporary', 'industrial_revolution')
- `name` - Display name
- `description` - Brief description for UI
- `startYear` / `endYear` - Year range (e.g., 1991-2025)
- `modifiers` - Object with `wealth`, `education`, `health`, `connections`, `volatility`

Available eras:
| Era | Years | Key Characteristics |
|-----|-------|---------------------|
| Pre-Industrial | 1800-1849 | Low education/health, high volatility |
| Industrial Revolution | 1850-1899 | Moderate improvements, still volatile |
| Early Modern | 1900-1945 | World wars, great change |
| Cold War | 1946-1990 | Superpowers, nuclear tension |
| Contemporary | 1991-2025 | Modern world (default unlocked) |

Key functions:
- `selectRandomYear(unlockedEras)` - Picks random era, then random year
- `getEraModifiers(era)` - Returns era's stat modifiers
- `getEraForYear(year)` - Maps year to era object

#### Jobs (`jobs.js`)
Jobs provide occupational choices during gameplay. Each job belongs to a category and has era restrictions.

**Job Categories (12 total):**
| Category | Description | Default |
|----------|-------------|---------|
| Agriculture | Working the land and raising livestock | Yes |
| Labor | Manual and industrial work | Yes |
| Services | Trade, hospitality, domestic work | No |
| Professional | Learned professions requiring formal education | No |
| Creative & Entertainment | Arts, performance, media | No |
| Military & Government | Service to state | No |
| Maritime & Transport | Shipping, sailing, and transportation | No |
| Religious & Spiritual | Religious vocations and spiritual leadership | No |
| Science & Academia | Research, teaching, and scholarship | No |
| Commerce & Finance | Trade, banking, and business | No |
| Healthcare | Medical and healing professions | No |
| Law & Justice | Legal professions and law enforcement | No |

**Job Properties:**
- `id` - Unique identifier
- `name` - Display name
- `category` - Parent category ID
- `eras` - Array of era IDs or `['all']` for all eras
- `requirements` - Stat requirements (e.g., `{ education: '>3' }`)
- `modifiers` - Stat effects when job is selected (e.g., `{ wealth: 0.10 }`)
- `historicalAnalogue` - ID of equivalent job in earlier eras (optional)

**Era-Specific Examples:**
- Software Developer: Contemporary only
- Factory Worker: Industrial Revolution onward
- Traveling Performer: Pre-Industrial and Industrial Revolution only
- Content Creator: Contemporary (analogue: Writer)

Key functions:
- `getAvailableJobs(era, unlockedCategories, life)` - Filters jobs by era, category, and stat requirements
- `getJobById(jobId)` - Lookup function
- `getJobModifiers(jobId)` - Returns stat modifiers for a job
- `getJobsCountByCategory(categoryId)` - Returns count of jobs in a category (for shop display)

#### Unlock System (`unlocks.js`)
Three unlock categories: countries, eras, and job categories.

**Countries:**
- UK is the default unlocked starting country
- Cost: 5 karma per random country unlock
- Players cannot choose which country they unlock

**Eras:**
- Contemporary is the default unlocked starting era
- Cost: 10 karma per era unlock
- Players can see and choose which era to unlock in the shop

**Job Categories:**
- Agriculture and Labor are default unlocked
- Cost: 8 karma per category unlock
- Players can see and choose which career path to unlock in the shop

Key functions:
- `attemptRandomCountryUnlock(karma, spendFn)` - Random country draw (mystery)
- `attemptEraUnlock(eraId, karma, spendFn)` - Direct era unlock (player chooses)
- `attemptJobCategoryUnlock(categoryId, karma, spendFn)` - Direct category unlock (player chooses)
- `getUnlockProgress()` / `getEraUnlockProgress()` / `getJobCategoryUnlockProgress()` - Progress stats
- `getUnlockedCountries()` / `getUnlockedEras()` / `getUnlockedJobCategories()`

#### Life Generation (`life.js`)
Birth context is generated using:
1. Country selection (population-weighted from unlocked pool)
2. Era/year selection (random from unlocked eras)
3. Wealth quintile (karma-biased distribution)
4. Stats (education, health, connections) correlated with wealth
5. **Combined modifiers** from both country AND era applied
6. Job selection during young_adult stage (applies job modifiers)

Key functions:
- `generateLife(country, year, era)` - Creates a new life with all stats
- `applyJob(life, jobId)` - Applies job to life and adjusts stats
- `getStartDescription(life)` - Player-facing birth narrative
- `getEndDescription(life)` - Player-facing death narrative

#### Karma System (`karma.js`)
- Karma persists across lives (-100 to +100)
- Positive karma biases starting conditions upward
- Spent to unlock countries (5 karma) or eras (10 karma)

Key functions:
- `getStartingConditionBias()` - Returns modifier for probability biasing
- `biasWeights(weights, bias)` - Shifts distribution based on karma

#### Decision Tag System (`tags.js`)
Tags are character traits earned through player choices. They provide **double-edged effects** (bonuses AND penalties) and reset each life but are tracked for collections.

**Tag Categories (12 total):**
| Category | Tags | Axis |
|----------|------|------|
| Orientation | Family Oriented, Career Driven | `family_vs_career` |
| Orientation | Wanderer, Rooted | `roots_vs_wings` |
| Social | Extrovert, Introvert | `social_vs_solitary` |
| Social | Generous, Pragmatist | `self_vs_others` |
| Values | Traditionalist, Progressive | `tradition_vs_change` |
| Values | Risk Taker, Cautious | `risk_vs_safety` |

**Tag Effects Example:**
- `Family Oriented`: +25% connections gains, -20% wealth gains
- `Risk Taker`: +30% high-reward outcomes, +25% negative outcomes (variance)

**Two Earning Methods:**
1. **Pivotal Choices** - Direct grant via `outcome.grantsTag = 'tag_id'`
2. **Pattern Recognition** - Accumulated via `outcome.tagAxis = { axis: delta }`
   - When axis reaches ±3 threshold, corresponding tag is granted

**Tag Properties:**
- `id` - Unique identifier (e.g., 'family_oriented')
- `name` - Display name
- `icon` - Emoji for UI display
- `description` - Player-facing description
- `bonuses` - Object with stat bonuses (e.g., `{ connections: 0.25 }`)
- `penalties` - Object with stat penalties (e.g., `{ wealth: 0.20 }`)
- `axis` - Which tracking axis this tag belongs to
- `threshold` - Positive or negative threshold for pattern recognition

**Life Object Extensions:**
```javascript
life.tags = [];           // Active tags this life (array of tag IDs)
life.tagProgress = {      // Axis tracking for pattern recognition
    family_vs_career: 0,
    roots_vs_wings: 0,
    social_vs_solitary: 0,
    self_vs_others: 0,
    tradition_vs_change: 0,
    risk_vs_safety: 0
};
```

Key functions:
- `initializeTagProgress()` - Returns initial axis tracking object
- `checkTagThresholds(tagProgress, existingTags)` - Checks if any tags should be granted
- `applyTagModifiers(life, outcomes)` - Modifies outcome weights based on active tags
- `getTagVarianceModifier(life)` - Returns variance modifier for risk_taker/cautious
- `discoverTag(tagId)` - Saves tag to persistent collection
- `getDiscoveredTags()` - Returns Set of all discovered tag IDs
- `getTagDiscoveryProgress()` - Returns `{ discovered, total }` for collections

### Data Flow

```
startLife()
    -> getUnlockedCountries()
    -> selectWeightedCountry()
    -> getUnlockedEras()
    -> selectRandomYear()
    -> getEraForYear()
    -> generateLife(country, year, era)
        -> getCountryModifiers()
        -> getEraModifiers()
        -> Combine modifiers
        -> biasWeights() with karma
        -> Apply combined modifiers
    -> Display birth narrative

showCareerSelection() (at young_adult stage)
    -> getUnlockedJobCategories()
    -> getAvailableJobs(era, categories, life)
    -> Filter by era and stat requirements
    -> Present up to 4 job choices
    -> applyJob(life, selectedJobId)
        -> Apply job modifiers to stats

resolveEvent() (processing outcomes with tags)
    -> resolveOutcome(option, stage, life)
        -> applyStatModifiers(life, outcomes)
        -> applyTagModifiers(life, outcomes)  // Tag bonuses/penalties
        -> getTagVarianceModifier(life)       // Risk/cautious variance
        -> Select weighted outcome
    -> processTagsFromOutcome(outcome)
        -> If outcome.grantsTag, add to life.tags
        -> If outcome.tagAxis, update life.tagProgress
        -> checkTagThresholds() for pattern recognition
        -> discoverTag() for new tags
        -> showTagNotifications() if new tags earned
```

### UI Components

- **Title screen** - Shows karma, run history, begin button, collections button
- **Event phase** - Events with choices, outcomes affect stats
- **Career selection** - Job choices during young_adult stage (filtered by era/stats)
- **Death/Summary** - Life recap, karma change, character traits earned, achievements
- **Unlock shop** - Three sections: Eras (10 karma), Careers (8 karma), Countries (5 karma)
  - Eras and Careers show selectable cards (player sees what they're buying)
  - Countries remain random/mystery unlock (gambling element)
  - Celebratory overlay with particles on unlock
  - Gold theme for eras, green theme for careers, blue theme for countries
- **Collections view** - Thumbnail grids showing unlock progress for eras, careers, countries, traits
  - Unlocked items show icons and names
  - Locked items show "?" placeholders
  - Hover tooltips on unlocked items
  - Traits section shows discovered character tags across all lives
- **Tag notification** - Purple-themed overlay when a tag is earned mid-life
  - Shows tag icon, name, and description
  - Auto-dismisses after 2 seconds or on click
- **Side panels** - Three-column layout with collapsible panels on desktop (>1100px)
  - **Left panel** - Achievement progress by category (exploration, karma, life, meta)
  - **Right panel** - Context-sensitive info (statistics on title, life stats during gameplay, character traits earned this life, unlock progress in shop)
  - Both panels have collapsible sections (click headers to toggle)
- **Debug panel** - Toggle with DBG button, shows state and controls

### Persistence (localStorage)

| Key | Purpose |
|-----|---------|
| `karma_simulator_karma` | Current karma value |
| `karma_simulator_unlocks` | Unlocked countries and eras |
| `karma_simulator_achievements` | Unlocked achievements |
| `karma_simulator_tracking` | Run history, statistics |
| `karma_simulator_tags` | Discovered character traits (for collections) |

### Tag-Related Achievements

| Achievement | Description | Category |
|-------------|-------------|----------|
| `trait_collector` | Discovered 6 unique character traits | exploration |
| `full_spectrum` | Discovered all 12 character traits | exploration |
| `saint` | Earned the Generous trait | karma |
| `self_made` | Earned the Pragmatist trait | karma |
| `defined_by_choices` | Earned 3 traits in a single life | life |
| `opposite_lives` | Earned both Family Oriented and Career Driven across different lives | life |
| `balanced_soul` | Completed a life without earning any traits | life |

## Design Rules

1. **Countries are primary** - All structural effects flow from country
2. **Eras add historical context** - Earlier eras are harder (lower baselines)
3. **Data-driven** - Avoid hard-coded logic; use modifiers and distributions
4. **No numeric precision** - Use descriptors, not exact values
5. **Favor distributions** - Outcomes are probabilistic, not deterministic
6. **Survive repetition** - Systems must remain engaging across many plays

## Explicit Non-Goals

- Do NOT reintroduce abstract regions
- Do NOT allow players to choose countries directly (countries remain random unlocks)
- Do NOT add political/ideological scoring
- Do NOT optimize for "fun" over coherence

## Debug Commands

The debug panel (click DBG) provides:
- Karma adjustment (+/-)
- Game state inspection
- Era unlock progress
- Career path unlock progress
- Country unlock progress
- Current era/country/job during gameplay
- Instant kill / Skip to death (during gameplay)
- Unlock All Items (countries, eras, careers, achievements)
- Reset Unlocks (returns to defaults)
- Reset Run History
- Full Game Reset

## Testing

Run locally with: `python -m http.server 8000`
Open: `http://localhost:8000`

---

## Mini-Games Architecture

### Overview

The game includes 7 karma-spending mini-games accessible via the Game Hub after completing a life. Each game has its own UI file and logic file.

### File Structure

```
js/games/
  shared.js       - Common utilities (audio, particles, animations, colors)
  gameHub.js      - Central menu, game registration, karma flow
  slots.js        - Slot machine logic
  slotsUI.js      - Slot machine UI
  pull.js         - Card pull logic
  pullUI.js       - Card pull UI
  wheel.js        - Wheel of fortune logic
  wheelUI.js      - Wheel UI
  plinko.js       - Plinko logic
  plinkoUI.js     - Plinko UI (canvas-based)
  scratch.js      - Scratch card logic
  scratchUI.js    - Scratch card UI (canvas-based)
  claw.js         - Claw machine logic
  clawUI.js       - Claw machine UI (canvas-based)
  pusher.js       - Coin pusher logic
  pusherUI.js     - Coin pusher UI (canvas-based)
```

### Game Hub Integration

All games follow the same interface pattern:

```javascript
showGameXXX(
    currentKarma,           // Current karma balance
    spendKarmaFn,          // (amount) => void - deduct karma
    addKarmaFn,            // (amount) => void - add karma
    onCloseFn              // () => void - called when game closes
);

hideGameXXX();             // Clean up and remove UI
```

### shared.js Exports

| Category | Functions |
|----------|-----------|
| **Audio** | `initAudio()`, `playTick()`, `playReelStop()`, `playWinSound()`, `playNearMiss()`, `playChime()`, `playLossSound()`, `playMotorSound()`, `playScratchSound()` |
| **Particles** | `spawnParticles()`, `spawnFireworks()` |
| **Screen Effects** | `screenFlash()`, `shakeScreen()` |
| **Animation** | `sleep()`, `animateNumberChange()`, `easeOutCubic()`, `easeInOutCubic()` |
| **UI** | `updateKarmaDisplay()`, `createGameOverlay()`, `closeOverlay()` |
| **Colors** | `RARITY_COLORS`, `lightenColor()`, `darkenColor()`, `hexToRgba()` |
| **Random** | `randomInt()`, `randomPick()`, `shuffle()`, `clamp()` |
| **Debug** | `isDebugMode()` |

### Karma Flow

1. Player opens Game Hub with current karma balance
2. Hub tracks `currentKarma` internally
3. When spending: calls `spendKarmaFn(amount)` AND decrements `currentKarma`
4. When winning: calls `addKarmaFn(amount)` AND increments `currentKarma`
5. On close: Hub shows updated karma in the summary screen

### Adding a New Game

1. Create `newgame.js` (logic) and `newgameUI.js` (UI)
2. Export `showNewGame(karma, spendFn, addFn, onClose)` and `hideNewGame()`
3. Import in `gameHub.js`
4. Add to `GAMES` array with id, name, icon, description, minKarma, launch function
5. Add launch function that hides hub and shows game
6. Add `hideNewGame()` to `hideAllGames()` function

---

## Test Framework

### Running Tests

1. Start local server: `python -m http.server 8000`
2. Open: `http://localhost:8000/tests/runner.html`
3. Click "Run All Tests"

### Writing Tests

Tests use a Jest-like API (no npm required):

```javascript
describe('Suite Name', () => {
    let setupValue;

    beforeEach(() => {
        setupValue = createFreshState();
    });

    afterEach(() => {
        cleanup();
    });

    it('should do something', () => {
        expect(result).toBe(expected);
        expect(array).toContain(item);
        expect(obj).toHaveProperty('key');
    });

    it('should work async', async () => {
        const result = await asyncOperation();
        expect(result).toBeTruthy();
    });

    it.skip('skip this test', () => {
        // Won't run
    });
});
```

### Available Matchers

- `toBe(value)` - Strict equality
- `toEqual(value)` - Deep equality
- `toBeTruthy()` / `toBeFalsy()`
- `toBeNull()` / `toBeUndefined()` / `toBeDefined()`
- `toContain(value)` - Array/string contains
- `toHaveLength(n)` - Array/string length
- `toHaveProperty(key)` - Object has property
- `toBeGreaterThan(n)` / `toBeLessThan(n)`
- `toMatch(regex)` - String matches regex
- `toThrow([message])` - Function throws
- `.not.*` - Negate any matcher

### Mock Utilities

```javascript
// Create mock function
const fn = TestFramework.mock();
fn.mockReturnValue(42);
fn(1, 2, 3);
expect(fn.calls[0]).toEqual([1, 2, 3]);

// Create mock localStorage
const storage = TestFramework.createMockStorage();
storage.setItem('key', 'value');
expect(storage.getItem('key')).toBe('value');
```

### Test Files

| File | Purpose |
|------|---------|
| `tests/framework.js` | Test framework implementation |
| `tests/runner.html` | Browser-based test runner UI |
| `tests/integration.test.js` | Integration tests for karma, hub, state |

---

## QA Dashboard

### Purpose

The QA Dashboard (`qa.html`) provides a centralized place for testing and debugging:

- **Debug mode always on** - No need to toggle
- **Direct game launching** - Open any game directly
- **Karma controls** - Quick +/- buttons, reset, max
- **State inspection** - View localStorage state
- **Quick actions** - Unlock all, reset, export

### Features

| Section | Description |
|---------|-------------|
| Karma Controls | Adjust karma (-10, -1, reset, +1, +10, max) |
| Quick Actions | Unlock All, Reset Unlocks, Full Reset, Clear Logs |
| State Inspector | View Karma, Unlocks, Tracking, Gacha state as JSON |
| Game Grid | Click to launch any game in new tab |
| Tabs | Switch between Games, Main Game iframe, Tests iframe |
| Activity Log | Real-time log of QA actions |

### Usage

1. Start server: `python -m http.server 8000`
2. Open: `http://localhost:8000/qa.html`
3. Use karma controls to set up test conditions
4. Click any game card to launch it
5. Use state inspector to verify localStorage

---

## Debug Tools Summary

| Tool | Location | Purpose |
|------|----------|---------|
| Debug Panel | Main game (DBG button) | In-game debugging |
| QA Dashboard | `/qa.html` | Comprehensive testing dashboard |
| Test Runner | `/tests/runner.html` | Automated tests |
| Console | Browser DevTools | JS debugging |

### Debug Mode Activation

- **Main game:** Click "DBG" button in corner
- **QA Dashboard:** Always enabled
- **URL parameter:** Add `?debug=true` to any URL
- **Code:** Set `window.debugMode = true`

### Game-Specific Debug

When debug mode is enabled in games:
- **Slots/Pull:** Force specific rarity, set pity, add karma
- **All games:** Check `window.debugMode` for conditional features
