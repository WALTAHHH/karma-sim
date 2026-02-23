# Karma Simulator

A systemic life simulation exploring how birth circumstances, institutions, and choices shape outcomes across many lives.

## 🎮 Play

- **Live**: [karma.always-scheming.com](https://karma.always-scheming.com)
- **Local**: Open `index.html` in a browser (no build step required)

## 📁 Project Structure

```
karma-sim/
├── index.html          # Main game
├── editor.html         # Content editor for events
├── qa.html             # QA testing dashboard
├── css/
│   └── gacha.css       # Mini-game styles
├── js/
│   ├── main.js         # Game entry point
│   ├── life.js         # Life simulation logic
│   ├── events.js       # Event definitions & outcomes
│   ├── karma.js        # Karma system
│   ├── gacha.js        # Gacha/pull mechanics
│   ├── gachaUI.js      # Gacha UI
│   ├── unlocks.js      # Country/era/job unlocks
│   ├── achievements.js # Achievement system
│   ├── debug.js        # Debug panel
│   └── games/          # Mini-games
│       ├── gameHub.js  # Game hub/launcher
│       ├── shared.js   # Shared utilities
│       ├── slots.js    # Karma Slots logic
│       ├── slotsUI.js  # Karma Slots UI
│       ├── pull.js     # Pull game logic
│       ├── pullUI.js   # Pull game UI
│       ├── wheel.js    # Wheel game logic
│       ├── wheelUI.js  # Wheel game UI
│       ├── plinko.js   # Plinko game logic
│       ├── plinkoUI.js # Plinko game UI
│       ├── scratch.js  # Scratch card logic
│       ├── scratchUI.js# Scratch card UI
│       ├── claw.js     # Claw machine logic
│       ├── clawUI.js   # Claw machine UI
│       ├── pusher.js   # Coin pusher logic
│       └── pusherUI.js # Coin pusher UI
└── tests/              # Test suites
```

## 🎰 Mini-Games

Access via the **Game Hub** (🎮 button in main game):

| Game | Description |
|------|-------------|
| **Karma Slots** | Slot machine with gacha mechanics |
| **Pull** | Gacha pull with anticipation animations |
| **Wheel** | Spin-to-win with multipliers |
| **Plinko** | Ball drop with physics |
| **Scratch** | Scratch cards with win lines |
| **Claw** | Claw machine with grip mechanics |
| **Pusher** | Coin pusher with physics simulation |

## 🛠️ Tools

### Content Editor (`editor.html`)

Visual editor for game events:
- Browse/search events by stage, type, region
- Edit prompts, options, outcomes, requirements
- JSON export/import
- "Copy as JS" for pasting into events.js

### QA Dashboard (`qa.html`)

Testing tools:
- Debug mode always enabled
- Karma controls
- Quick actions (unlock all, reset)
- State inspector
- Direct game launching

### Debug Panel (in-game)

Press **DBG** button in main game:
- Karma adjustments
- Game state inspection
- Unlock commands
- Reset options

## 🔧 Development

No build step required. Pure HTML/CSS/JS with ES modules.

```bash
# Serve locally
npx http-server .

# Or any static file server
python -m http.server 8000
```

## 📝 License

Private project - Always Scheming
