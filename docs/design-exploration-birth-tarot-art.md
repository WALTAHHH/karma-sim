# Karma Sim Design Exploration
## Birth Stats, Tarot Cards, & Art Direction

*Design exploration by the Design Lead — brainstorming, not implementation*

---

# 1. Birth Circumstances Tracking

## The Core Idea

Birth stats create **immediate immersion** — the moment a life begins, you feel the weight of where you landed. It reinforces the game's thesis: your starting point matters enormously.

## What Stats Matter?

### Tier 1: Core Birth Context (Always Visible)
| Stat | Why It Matters | Gameplay Impact |
|------|----------------|-----------------|
| **Wealth Tier** | Already exists — the quintile system | Direct modifier on everything |
| **Family Structure** | Parents married/divorced/single/orphaned | Affects connections, stability events |
| **Siblings** | 0-6+ (era-dependent distribution) | Resource competition, support network |
| **Birth Order** | First / Middle / Youngest / Only | Historical: inheritance, expectations |

### Tier 2: Flavor That Could Affect Events
| Stat | Why It Matters |
|------|----------------|
| **Birth Location** | Urban vs Rural (affects job access, education) |
| **Parents' Occupation** | Sets expectations, opens/closes doors |
| **Health at Birth** | Premature, sickly, robust (modifies health baseline) |
| **Legitimacy** | Historical eras: bastard status matters |

### Tier 3: Pure Flavor (No Mechanics)
- Birth month/season
- Birth order name (firstborn, etc.)
- Parent names
- Family reputation descriptor

## UI Placement Options

### Option A: Character Sheet Panel (Recommended)
**Location:** Right sidebar, persistent during gameplay
```
┌─────────────────────────┐
│  ⚒️ BIRTH CIRCUMSTANCES │
├─────────────────────────┤
│ 🌍 England, 1847        │
│ 💰 Working Class (Q2)   │
│ 👨‍👩‍👦 Parents: Married    │
│ 👶 3rd of 5 children    │
│ 🏠 Rural farming family │
└─────────────────────────┘
```
**Pros:** Always visible, reinforces the "hand you were dealt" feel
**Cons:** Screen real estate, info overload

### Option B: Collapsible Header Badge
**Location:** Below the country/era line, click to expand
```
England, 1847
[📜 Birth: Working class, 3rd of 5, farming family ▼]
```
**Pros:** Compact, progressive disclosure
**Cons:** Players might forget to check it

### Option C: Birth Event Expanded
**Location:** The opening narrative becomes richer
```
You are born in rural England, 1847.

The third child of five in a farming family. Your parents, 
both living, work the land from dawn until dusk. There is 
never quite enough — food, warmth, attention. Your older 
siblings have already claimed what little advantage 
this family offers.

[Continue]
```
**Pros:** Immersive, narrative-driven
**Cons:** Slower start, repetitive on replays

## Recommended Design: Hybrid Approach

1. **Opening narrative** includes birth context naturally (Option C)
2. **Side panel** shows compact birth stats (Option A, simplified)
3. **Stats affect events** — but subtly, through existing modifiers

### Birth Stats Panel Mockup
```
┌──────────────────────────────┐
│ 📜 YOUR ORIGINS              │
├──────────────────────────────┤
│ England · 1847 · Industrial  │
│                              │
│ 💰 Working Class             │
│ 👨‍👩‍👧‍👦 Family: 2 parents, 4 siblings │
│ 📍 Rural · Farming           │
│                              │
│ Birth Order: Third           │
│ "Always competing for scraps"│
└──────────────────────────────┘
```

The quoted tagline changes based on birth circumstances:
- Only child: *"All eyes on you"*
- Eldest: *"Expectations rest heavy"*  
- Middle: *"Easy to overlook"*
- Youngest: *"The baby of the family"*
- Many siblings: *"Lost in the crowd"*

## Gameplay Integration (Optional)

Birth order could unlock exclusive events:
- **Eldest son** in pre-industrial: Inheritance events
- **Only child**: Parental pressure events, but also undivided support
- **Large family**: "Help your siblings" vs "pursue your own path" choices
- **Orphan**: Entirely different event pools in childhood

**Question for Matt:** Do birth stats *affect* the game, or are they flavor? Recommendation: Start with flavor, add mechanical weight later if it feels right.

---

# 2. Tarot Card Choices — THE BIG IDEA

## Why Tarot Cards Work For Karma Sim

The tarot is inherently about:
- **Fate vs. agency** — cards reveal destiny, but interpretation matters
- **Dualities** — every card has upright/reversed meanings
- **Mystical uncertainty** — you can't fully control what appears
- **Visual storytelling** — each card is a narrative capsule

This maps *perfectly* to Karma Sim's themes.

## Core Mechanic: The Reading

### Each Life Event = A Reading
Instead of text options, you're dealt cards:

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Your father offers to apprentice you to a trade. ║
║                                                    ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐           ║
║  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │           ║
║  │ ░░░?░░░ │  │ ░░░?░░░ │  │ ░░░?░░░ │           ║
║  │ ░░░░░░░ │  │ ░░░░░░░ │  │ ░░░░░░░ │           ║
║  └─────────┘  └─────────┘  └─────────┘           ║
║                                                    ║
║           [ Reveal Cards ]                         ║
╚════════════════════════════════════════════════════╝
```

Player clicks "Reveal" (or cards flip automatically with animation):

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║  Your father offers to apprentice you to a trade. ║
║                                                    ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐           ║
║  │  🔨     │  │  📚     │  │  🚪     │           ║
║  │         │  │         │  │         │           ║
║  │ The     │  │ The     │  │ The     │           ║
║  │ Craftsman│  │ Scholar │  │ Wanderer│           ║
║  │         │  │         │  │         │           ║
║  │ Learn a │  │ Pursue  │  │ Run away│           ║
║  │ trade   │  │ books   │  │ from    │           ║
║  │         │  │ instead │  │ home    │           ║
║  └─────────┘  └─────────┘  └─────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

Clicking a card commits to that choice. Card flips, glows, other cards fade.

## Deck Building System

### Starting Deck
Every player starts with a **Fate Deck** of 22 cards (like the Major Arcana):

| Card | Archetype | General Effect |
|------|-----------|----------------|
| The Fool | New beginnings | Start fresh, risk everything |
| The Magician | Skill & will | Make something from nothing |
| The High Priestess | Intuition | Trust your gut |
| The Empress | Nurturing | Family, comfort, growth |
| The Emperor | Authority | Power, structure, ambition |
| The Hierophant | Tradition | Follow the rules |
| The Lovers | Relationships | Choose connection |
| The Chariot | Determination | Push through obstacles |
| Strength | Inner power | Endure hardship |
| The Hermit | Solitude | Withdraw, reflect |
| Wheel of Fortune | Chance | Gamble on fate |
| Justice | Balance | Do the right thing |
| The Hanged Man | Sacrifice | Give up something |
| Death | Transformation | End one thing, begin another |
| Temperance | Moderation | The middle path |
| The Devil | Temptation | Give in to desire |
| The Tower | Disaster | Embrace destruction |
| The Star | Hope | Aim for the ideal |
| The Moon | Illusion | Trust appearances |
| The Sun | Success | Seize joy |
| Judgement | Reckoning | Face consequences |
| The World | Completion | Accept what is |

### How Deck Building Works

**Not all cards appear in every event.** The game presents 2-3 cards *drawn from your deck* that make sense for the situation.

- Some events might offer Chariot, Hermit, or Lovers
- Others might offer Devil, Justice, or Hanged Man
- The specific cards available depend on your deck composition

### Expanding Your Deck (Pre-Run)

Spend **karma** before starting a new life to add cards:

**Card Categories:**

| Category | Cost | Effect Type |
|----------|------|-------------|
| **Fortune** | 5 karma | Increased positive outcomes |
| **Misfortune** | Free | Worse outcomes (why add? See below) |
| **Wild** | 10 karma | Unpredictable — could be great or terrible |
| **Specialty** | 8 karma | Situational but powerful |

**Why Add Misfortune Cards?**
- Unlocks certain achievements
- Required for some story paths
- "The Tower" might destroy your current path but unlock a rare event chain
- Adding darkness to your deck can lead to unexpected light

### Card Rarities

| Rarity | Color | Source |
|--------|-------|--------|
| Common | White | Starting deck |
| Uncommon | Green | Karma shop |
| Rare | Blue | Karma shop (expensive) |
| Legendary | Gold | Achievements only |
| Cursed | Purple | Found, not bought |

### Example Specialty Cards

**The Inheritance** (Rare, 15 karma)
- Only appears in wealth-related events
- Guarantees windfall outcome if chosen
- Can only appear once per life

**The Bastard** (Cursed, free — earned by being born illegitimate)
- Appears when legitimacy matters
- Choosing it: face discrimination, but gain street smarts
- Adds +1 to connections gain when you overcome prejudice

**The Prodigy** (Legendary — "Earn 10+ education by age 20")
- Appears in career events
- Opens locked profession paths
- One-time use per life

## Deck Questions Answered

**How many cards in starting deck?**
22 (Major Arcana)

**Do cards get "used"?**
No — your deck is always available. But legendary/unique cards can only *appear* once per life when their trigger conditions are met.

**What's the karma economy?**
- Basic Fortune cards: 5 karma
- Specialty cards: 8-15 karma  
- Rare cards: 15-25 karma
- Cannot buy Legendary (achievement rewards)
- Cursed cards find you

**Replace current choice system or augment?**
**Replace.** The cards *are* the choices. But the text descriptions that explain each card's meaning in context remain — you're not just clicking blind.

## How This Changes The Game Feel

| Current | With Tarot |
|---------|------------|
| Text menus | Visual, tactile cards |
| Choices feel arbitrary | Choices feel *destined* |
| Pure text | Art + atmosphere |
| Static options | Your deck personalizes options |
| Every run identical options | Deck building adds variety |
| Choices are "picks" | Choices feel like readings |

## The Ritual

Each event becomes a **ritual moment**:

1. **Situation narrated** (text)
2. **Cards dealt face-down** (anticipation)
3. **Cards revealed** with animation (revelation)
4. **Player contemplates** (agency)
5. **Card chosen** — glows, lifts, others fade (commitment)
6. **Outcome unfolds** (consequence)

This transforms clicking buttons into a mystical experience.

## Visual Concept: Card Anatomy

```
┌───────────────────┐
│    ✨ [ICON] ✨    │  <- Symbolic icon
│                   │
│   ═══════════    │  <- Decorative border
│                   │
│    THE HERMIT     │  <- Card name
│                   │
│  "Withdraw from   │  <- Context text
│   the world to    │     (changes per event)
│   find yourself"  │
│                   │
│  ───────────────  │
│  +Wisdom  -Wealth │  <- Mechanical hint
└───────────────────┘
```

## Open Questions

1. **Face-up or face-down first?** Face-down adds mystery but slows gameplay. Maybe a setting?

2. **Reversed cards?** Traditional tarot has upright/reversed meanings. Add this for negative variants?

3. **Reading layouts?** 3 cards is standard, but could some events offer 2? Or a rare 5-card spread?

4. **Card art source?** AI-generated? Commissioned? Pixel art? (See Art Direction below)

---

# 3. Art Style Direction

## Current State

Karma Sim is **minimalist/flat** — dark background, monospace text, functional buttons. It works, but there's no visual identity.

## Option A: Mystical Tarot Illustrated

**Concept:** Lean into the tarot vibe. Rich, symbolic illustrations. Deep purples, golds, midnight blues.

**Visual Reference:** Classic Rider-Waite tarot meets modern mystical illustration

```
Palette:
- Background: Deep indigo (#1a1a2e)  
- Text: Warm gold (#d4af37)
- Accents: Mystic purple (#6c3483)
- Cards: Cream/parchment (#f5f0e1)
```

**Card Style:** Each card is a full illustration:
- The Fool: Figure stepping off cliff, dog at heels
- The Tower: Lightning striking, figures falling
- Richly detailed, but stylized (not photorealistic)

**Pros:**
- Ties directly into tarot mechanic
- Instantly distinctive visual identity
- Evokes mysticism, fate, the cosmic
- Cards become collectible, desirable

**Cons:**
- Requires significant art investment (22+ cards minimum)
- May feel too "serious" for the dark humor
- Harder to modify/iterate

**Implementation Path:**
- Commission core tarot deck (or use CC-licensed base + modify)
- Use subtle card frame for events
- Background could have faint celestial imagery
- Gold foil effects on hover/selection

---

## Option B: Pixel Art Retro

**Concept:** 16-bit RPG aesthetic. Nostalgic, warm, game-y.

**Visual Reference:** Earthbound, Undertale, early Final Fantasy

```
Palette:
- Limited 16-color palette
- CRT-style scanlines optional
- Chunky, readable pixel fonts
```

**Card Style:** Simplified pixel icons:
- The Fool: Small pixel figure on cliff edge
- The Tower: Dramatic but minimalist
- Cards are ~64x96 pixel sprites

**Pros:**
- Faster/cheaper to produce
- Distinctive and charming
- Works well at any scale
- Easier to add new cards
- Indie game cred

**Cons:**
- Might clash with serious themes
- Less "prestigious" feeling
- Pixel art fatigue (many games use this)

**Implementation Path:**
- Create tileset for card components
- Build cards from modular pieces
- Pixel font for all text
- Simple particle effects (8-bit sparkles)

---

## Option C: Hand-Drawn/Sketchy

**Concept:** Like someone's illustrated journal or sketchbook. Personal, intimate, imperfect.

**Visual Reference:** Disco Elysium, Kentucky Route Zero, zine aesthetics

```
Palette:
- Paper texture backgrounds
- Ink black (#1a1a1a) for lines
- Watercolor washes for emphasis
- Limited spot colors
```

**Card Style:** Loose sketches with character:
- The Fool: Wobbly figure, expressive lines
- The Tower: Gestural lightning, rough edges
- Each card feels hand-drawn, unique

**Pros:**
- Highly distinctive
- Emphasizes personal/human themes
- Imperfection fits the "random birth" theme
- Easier to achieve than polished illustration

**Cons:**
- Requires skilled illustrator (hard to fake)
- May read as "rough" rather than "artful"
- Consistency is difficult

**Implementation Path:**
- Commission sketches or develop in-house style
- Scan/digitize for authentic texture
- Use subtle paper backgrounds
- Handwritten fonts for headers

---

## Option D: Collage/Mixed Media (Wildcard)

**Concept:** Combine vintage photography, torn paper, stamps, typography. Dadaist/punk aesthetic.

**Visual Reference:** S.T.A.L.K.E.R. menus, old punk zines, ransom note aesthetic

```
Palette:
- Sepia photographs
- Yellowed paper textures  
- Red/black spot colors
- Newsprint, stamps, handwriting
```

**Card Style:** Assemblage:
- The Fool: Vintage photo of child + hand-drawn elements
- The Tower: Old postcard + lightning drawn over
- Feels found, discovered, mysterious

**Pros:**
- Unique and arresting
- Could use public domain imagery
- Ties into "randomness of history" theme
- Highly memorable

**Cons:**
- Risky — could look amateurish
- Tone is harder to control
- May not match tarot "reverence"

---

## Recommendation: Mystical Tarot (Option A)

**Why:** The tarot card mechanic *demands* visual investment in the cards themselves. If the cards are beautiful, players will want to collect them, linger on them, feel the weight of their choices.

**Compromise Approach:**
1. Start with **stylized minimal tarot** — strong iconography, limited colors
2. Use rich textures (gold foil effects, subtle gradients) for premium feel
3. Expand to full illustrations over time as the game grows
4. Keep UI itself clean and readable

**Minimal Viable Art:**
- Card frames/backs: 1 design
- 22 Major Arcana icons (can be stylized, not full illustrations)
- Background atmosphere (subtle, tiled)
- Typography upgrade (mystical but readable font)

---

# Summary: What To Build

## Phase 1: Birth Stats (Quick Win)
- Add birth circumstances to life generation
- Display in side panel
- Rich opening narrative
- No mechanical impact yet

## Phase 2: Tarot Prototype (Big Bet)
- Design 22-card base deck
- Build card UI component
- Replace choice buttons with cards
- One event as proof of concept

## Phase 3: Art Direction (Investment)
- Commit to mystical tarot aesthetic
- Commission/create card art
- UI polish pass
- Sound design (card shuffle, flip, glow)

---

*This is brainstorming. None of this is implementation-ready — it's meant to spark discussion and clarify direction. The tarot mechanic in particular could be transformative, but it's a significant pivot.*

**Next steps:** Matt reviews, we discuss, then scope actual implementation tickets.
