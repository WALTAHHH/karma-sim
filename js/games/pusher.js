// Karma Pusher - Meta Layer
// Coin pusher physics, upgrades, special events

const PUSHER_KEY = 'karma_simulator_pusher';

/**
 * Physics constants - can be tuned via debug tools
 * Tuned for satisfying "push" feel and natural coin behavior
 * @type {Object}
 */
export const PHYSICS = {
    gravity: 0.35,           // Slightly stronger gravity for weight
    friction: 0.92,          // Higher friction = coins slow down more naturally
    bounce: 0.35,            // Slightly less bouncy = more controlled
    maxVelocity: 18,         // Higher cap for dramatic pushes
    settleThresholdVX: 0.08, // Stricter settle = coins rest more naturally
    settleThresholdVY: 0.25,
    settleFrames: 25,
    collisionDamping: 0.6,   // More energy transfer in collisions
    pusherForce: 1.2,        // NEW: Multiplier for pusher impact
    pusherLift: 0.4,         // NEW: Upward lift when pushed
    edgeTension: 40,         // NEW: Distance from edge where tension kicks in
    cascadeBonus: 0.15       // NEW: Extra force when coins hit other moving coins
};

/**
 * @typedef {Object} UpgradeLevel
 * @property {number} cost - Karma cost to unlock
 * @property {number} value - Gameplay value at this level
 * @property {string} label - Display label
 */

/**
 * @typedef {Object} Upgrade
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Help text
 * @property {UpgradeLevel[]} levels - Available levels
 */

/**
 * Upgrade definitions with balanced progression curve
 * Cost curve: Accessible early game, satisfying power growth
 * Rebalanced for better feel and clearer impact
 * @type {Object.<string, Upgrade>}
 */
export const UPGRADES = {
    platform: {
        name: 'Platform Width',
        icon: '📐',
        description: 'Wider platform = more coins = bigger cascades',
        levels: [
            { cost: 0, value: 260, label: 'Standard' },
            { cost: 15, value: 310, label: 'Wide' },
            { cost: 45, value: 360, label: 'Extra Wide' },
            { cost: 100, value: 420, label: 'Maximum' }
        ]
    },
    pusherSpeed: {
        name: 'Pusher Speed',
        icon: '⚡',
        description: 'Faster cycles = more action & combos',
        levels: [
            { cost: 0, value: 1.0, label: 'Normal' },
            { cost: 18, value: 1.4, label: 'Quick' },
            { cost: 50, value: 1.9, label: 'Fast' },
            { cost: 110, value: 2.5, label: 'Turbo' }
        ]
    },
    prizeQuality: {
        name: 'Prize Quality',
        icon: '💎',
        description: 'Better prizes appear more often',
        levels: [
            { cost: 0, value: 0, label: 'Basic' },
            { cost: 25, value: 10, label: 'Good' },
            { cost: 65, value: 22, label: 'Great' },
            { cost: 140, value: 38, label: 'Amazing' }
        ]
    },
    multiDrop: {
        name: 'Multi-Drop',
        icon: '🌧️',
        description: 'Rain coins for epic cascades',
        levels: [
            { cost: 0, value: 5, label: '×5' },
            { cost: 30, value: 12, label: '×12' },
            { cost: 75, value: 30, label: '×30' },
            { cost: 175, value: 60, label: '×60' }
        ]
    },
    autoDrop: {
        name: 'Auto-Dropper',
        icon: '🤖',
        description: 'Hands-free karma farming',
        levels: [
            { cost: 0, value: 0, label: 'Off' },
            { cost: 35, value: 8000, label: 'Slow (8s)' },
            { cost: 85, value: 4000, label: 'Medium (4s)' },
            { cost: 190, value: 1500, label: 'Fast (1.5s)' }
        ]
    }
};

/**
 * @typedef {Object} PrizeDef
 * @property {string} icon - Emoji
 * @property {number} value - Karma value
 * @property {string} type - karma|token|jackpot|megajackpot
 * @property {number} weight - Spawn weight (higher = more common)
 * @property {number} radius - Physics radius
 * @property {string} color - Glow color
 */

/**
 * Prize definitions - weights sum to ~100 for easy probability math
 * @type {Object.<string, PrizeDef>}
 */
export const PRIZES = {
    coin:       { icon: '🪙', value: 1,   type: 'karma',       weight: 65,   radius: 10, color: '#fbbf24' },
    smallGem:   { icon: '💠', value: 2,   type: 'karma',       weight: 12,   radius: 11, color: '#60a5fa' },
    token:      { icon: '🎫', value: 3,   type: 'token',       weight: 8,    radius: 12, color: '#4ade80' },
    mediumGem:  { icon: '💎', value: 5,   type: 'karma',       weight: 6,    radius: 13, color: '#c084fc' },
    star:       { icon: '⭐', value: 8,   type: 'karma',       weight: 4,    radius: 14, color: '#fbbf24' },
    trophy:     { icon: '🏆', value: 12,  type: 'karma',       weight: 2.5,  radius: 15, color: '#fbbf24' },
    crystal:    { icon: '🔮', value: 20,  type: 'karma',       weight: 1.5,  radius: 16, color: '#c084fc' },
    jackpot:    { icon: '🌟', value: 50,  type: 'jackpot',     weight: 0.5,  radius: 18, color: '#fbbf24' },
    megaJackpot:{ icon: '👑', value: 100, type: 'megajackpot', weight: 0.2,  radius: 20, color: '#fbbf24' }
};

// Calculate total weight once
const TOTAL_PRIZE_WEIGHT = Object.values(PRIZES).reduce((sum, p) => sum + p.weight, 0);

/**
 * @typedef {Object} SpecialEvent
 * @property {string} name - Display name with emoji
 * @property {number} duration - Duration in ms
 * @property {string} effect - Description of effect
 */

/**
 * Special events with balanced durations
 * @type {Object.<string, SpecialEvent>}
 */
export const SPECIAL_EVENTS = {
    goldRush: {
        name: '🌟 GOLD RUSH!',
        duration: 15000,
        effect: 'All coins worth 2×'
    },
    prizeRain: {
        name: '🌧️ PRIZE RAIN!',
        duration: 10000,
        effect: 'Prizes rain from above'
    },
    megaPush: {
        name: '💪 MEGA PUSH!',
        duration: 8000,
        effect: 'Pusher goes extra far'
    },
    frenzy: {
        name: '🔥 FRENZY MODE!',
        duration: 12000,
        effect: 'Everything moves faster'
    }
};

// Event configuration
const EVENT_CONFIG = {
    triggerChance: 0.0003,  // Per frame chance (~1.8% per second at 60fps)
    cooldownMs: 30000,      // 30 seconds between events
    prizeRainSpawnRate: 0.05 // 5% chance per frame during prize rain
};

/**
 * Physics item in the pusher game
 */
export class PusherItem {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {string} type - Prize type key from PRIZES
     */
    constructor(x, y, type = 'coin') {
        const def = PRIZES[type] || PRIZES.coin;
        
        // Position
        this.x = x;
        this.y = y;
        
        // Velocity with slight random horizontal spread
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = 0;
        
        // Prize properties (copied from definition)
        this.radius = def.radius;
        this.type = type;
        this.icon = def.icon;
        this.value = def.value;
        this.prizeType = def.type;
        this.color = def.color;
        
        // State tracking
        this.settled = false;
        this.settleTimer = 0;
        this.age = 0;
        
        // Visual effects
        this.wobble = 0;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.flash = 0;
        this.glow = 0;
    }

    /**
     * Update physics for this item (no collision - handled at game level)
     * @param {number} pusherX - Pusher bar X position
     * @param {number} pusherWidth - Pusher bar width
     * @param {Object} platform - Platform bounds
     * @param {Object} pusherBar - Pusher bar bounds
     * @param {number} pusherSpeed - Current pusher speed
     * @param {boolean} frenzyMode - Is frenzy event active
     * @returns {boolean} True if item has fallen off the edge
     */
    updatePhysics(pusherX, pusherWidth, platform, pusherBar, pusherSpeed, frenzyMode) {
        this.age++;
        
        // Decay visual effects
        if (this.flash > 0) this.flash -= 0.08;
        if (this.glow > 0) this.glow -= 0.02;
        
        const speed = frenzyMode ? 1.5 : 1;
        const gravity = PHYSICS.gravity * speed;
        
        // Apply gravity
        this.vy += gravity;
        
        // Clamp velocity to prevent tunneling
        this.vx = Math.max(-PHYSICS.maxVelocity, Math.min(PHYSICS.maxVelocity, this.vx));
        this.vy = Math.max(-PHYSICS.maxVelocity, Math.min(PHYSICS.maxVelocity, this.vy));
        
        // Apply velocity
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        
        // Apply friction
        this.vx *= PHYSICS.friction;
        
        // Wall collisions (left/right platform boundaries)
        const leftWall = platform.x + this.radius;
        const rightWall = platform.x + platform.width - this.radius;
        
        if (this.x < leftWall) {
            this.x = leftWall;
            this.vx = Math.abs(this.vx) * PHYSICS.bounce;
        } else if (this.x > rightWall) {
            this.x = rightWall;
            this.vx = -Math.abs(this.vx) * PHYSICS.bounce;
        }
        
        // Pusher bar collision - THIS IS THE MONEY SHOT
        const pusherRight = pusherX + pusherWidth;
        const pusherTop = pusherBar.y;
        const pusherBottom = pusherBar.y + pusherBar.height;
        
        if (this.y + this.radius > pusherTop && 
            this.y - this.radius < pusherBottom &&
            this.x > pusherX && 
            this.x < pusherRight) {
            // Calculate impact based on pusher movement
            const impactForce = pusherSpeed * PHYSICS.pusherForce;
            
            // Push forward with real force
            this.vx += impactForce * 0.9;
            
            // Lift coins slightly (satisfying "pop" feeling)
            this.vy = -Math.abs(this.vy) * PHYSICS.pusherLift - (impactForce * 0.3);
            
            // Add slight randomness for natural feel
            this.vx += (Math.random() - 0.5) * impactForce * 0.3;
            
            // Position correction
            this.y = pusherTop - this.radius - 1;
            
            // Visual feedback - stronger flash on hard hits
            this.flash = Math.min(1, impactForce / 2);
            this.glow = 1;
            this.justPushed = true; // Track for cascade effects
        }
        
        // Platform floor collision (but allow falling off edge)
        const floorY = platform.edgeY - 15;
        if (this.y + this.radius > floorY && this.y < platform.edgeY + 10) {
            this.y = floorY - this.radius;
            this.vy = -Math.abs(this.vy) * PHYSICS.bounce;
            if (Math.abs(this.vy) < 0.5) this.vy = 0;
        }
        
        // Check if settled (not moving much)
        if (Math.abs(this.vx) < PHYSICS.settleThresholdVX && 
            Math.abs(this.vy) < PHYSICS.settleThresholdVY) {
            this.settleTimer++;
            if (this.settleTimer > PHYSICS.settleFrames) {
                this.settled = true;
            }
        } else {
            this.settleTimer = 0;
            this.settled = false;
        }
        
        // Enhanced edge tension - coins near the edge feel "about to fall"
        const edgeDist = platform.edgeY - (this.y + this.radius);
        if (edgeDist < PHYSICS.edgeTension) {
            // Tension increases as coin gets closer to edge
            const tensionFactor = 1 - (edgeDist / PHYSICS.edgeTension);
            
            // Faster, more intense wobble as coin approaches edge
            const wobbleSpeed = 80 - tensionFactor * 40; // 80ms -> 40ms
            const wobbleAmount = 2 + tensionFactor * 4;   // 2 -> 6 pixels
            this.wobble = Math.sin(Date.now() / wobbleSpeed + this.wobblePhase) * wobbleAmount;
            
            // Track edge proximity for visual effects
            this.edgeTension = tensionFactor;
            
            // Add slight "pull" toward edge when very close (gravity assist)
            if (tensionFactor > 0.7 && !this.settled) {
                this.vy += 0.05 * tensionFactor;
            }
        } else {
            this.wobble *= 0.9;
            this.edgeTension = 0;
        }
        
        // Return true if fallen off (collected!)
        return this.y > platform.edgeY + 50;
    }

    /**
     * Serialize for localStorage
     * @returns {Object}
     */
    serialize() {
        return { x: this.x, y: this.y, type: this.type };
    }

    /**
     * Deserialize from saved data
     * @param {Object} data - Serialized item
     * @returns {PusherItem}
     */
    static deserialize(data) {
        const item = new PusherItem(data.x, data.y, data.type);
        item.settled = true;
        item.vy = 0;
        item.vx = 0;
        return item;
    }
}

/**
 * Main Pusher Game State Manager
 */
export class PusherGame {
    constructor() {
        /** @type {PusherItem[]} */
        this.items = [];
        
        // Pusher state
        this.pusherX = 0;
        this.pusherDirection = 1;
        this.pusherExtension = 0;
        
        // Upgrades (level indices)
        this.upgrades = { 
            platform: 0, 
            pusherSpeed: 0, 
            prizeQuality: 0, 
            multiDrop: 0, 
            autoDrop: 0 
        };
        
        // Statistics
        this.stats = {
            coinsDropped: 0,
            prizesCollected: 0,
            karmaEarned: 0,
            jackpots: 0,
            totalPlays: 0,
            bestSingleWin: 0
        };
        
        // Event state
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventCooldown = 0;
        
        // Auto-drop timing
        this.lastAutoDrop = 0;
        
        // Combo tracking
        this.combo = 0;
        this.comboTimer = 0;
        
        // Debug state
        this.debugMode = false;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        
        this.load();
    }

    /**
     * Get current platform dimensions
     * @returns {Object} Platform bounds
     */
    getPlatform() {
        const width = UPGRADES.platform.levels[this.upgrades.platform].value;
        return {
            x: (400 - width) / 2,
            y: 80,
            width: width,
            edgeY: 275
        };
    }

    /**
     * Get pusher bar dimensions
     * @returns {Object} Pusher bar bounds
     */
    getPusherBar() {
        const platform = this.getPlatform();
        return {
            y: 100,
            height: 18,
            minX: platform.x,
            maxX: platform.x + 90 + this.pusherExtension
        };
    }

    /**
     * Get current pusher speed (affected by upgrades and events)
     * @returns {number}
     */
    getPusherSpeed() {
        const base = UPGRADES.pusherSpeed.levels[this.upgrades.pusherSpeed].value;
        return this.activeEvent?.type === 'frenzy' ? base * 1.5 : base;
    }

    /**
     * Get current pusher width (affected by events)
     * @returns {number}
     */
    getPusherWidth() {
        return 110 + (this.activeEvent?.type === 'megaPush' ? 40 : 0);
    }

    /**
     * Get multi-drop count from upgrade
     * @returns {number}
     */
    getMultiDropCount() {
        return UPGRADES.multiDrop.levels[this.upgrades.multiDrop].value;
    }

    /**
     * Main game update loop
     * @param {number} currentKarma - Player's current karma
     * @param {Function} addKarmaFn - Callback to add karma
     * @returns {Object} Update result with fallen items and auto-drop flag
     */
    update(currentKarma, addKarmaFn) {
        // FPS tracking for debug
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.fps = 0.9 * this.fps + 0.1 * (1000 / Math.max(delta, 1));
        this.lastFrameTime = now;
        
        const platform = this.getPlatform();
        const pusherBar = this.getPusherBar();
        const speed = this.getPusherSpeed();
        const pusherWidth = this.getPusherWidth();
        const frenzyMode = this.activeEvent?.type === 'frenzy';
        
        // Mega push extension
        this.pusherExtension = this.activeEvent?.type === 'megaPush' ? 30 : 0;
        
        // Move pusher bar
        this.pusherX += speed * this.pusherDirection;
        if (this.pusherX >= pusherBar.maxX) {
            this.pusherDirection = -1;
        } else if (this.pusherX <= pusherBar.minX) {
            this.pusherDirection = 1;
        }
        
        // Prize rain event spawning
        if (this.activeEvent?.type === 'prizeRain' && Math.random() < EVENT_CONFIG.prizeRainSpawnRate) {
            const x = platform.x + 20 + Math.random() * (platform.width - 40);
            this.items.push(new PusherItem(x, platform.y - 30, this.rollPrizeType()));
        }
        
        // Update event timer
        if (this.activeEvent) {
            this.eventTimer -= 16; // ~60fps assumption
            if (this.eventTimer <= 0) {
                this.activeEvent = null;
            }
        }
        
        // Event cooldown
        if (this.eventCooldown > 0) {
            this.eventCooldown -= 16;
        }
        
        // Random event trigger (only if not in event and cooldown expired)
        if (!this.activeEvent && this.eventCooldown <= 0 && Math.random() < EVENT_CONFIG.triggerChance) {
            this.triggerRandomEvent();
        }
        
        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= 16;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
        
        // Auto-drop check
        const autoDropInterval = UPGRADES.autoDrop.levels[this.upgrades.autoDrop].value;
        if (autoDropInterval > 0 && currentKarma >= 1) {
            if (now - this.lastAutoDrop >= autoDropInterval) {
                this.lastAutoDrop = now;
                return { fallen: [], autoDrop: true };
            }
        }

        // Update all items (physics only, no collision)
        const fallen = [];
        this.items = this.items.filter(item => {
            const hasFallen = item.updatePhysics(
                this.pusherX, 
                pusherWidth,
                platform, 
                pusherBar, 
                speed,
                frenzyMode
            );
            if (hasFallen) {
                fallen.push(item);
                return false;
            }
            return true;
        });
        
        // Single collision pass - check each pair only ONCE (O(n²/2) instead of O(n²))
        const items = this.items;
        const len = items.length;
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                this.resolveCollision(items[i], items[j]);
            }
        }

        return { fallen, autoDrop: false };
    }
    
    /**
     * Resolve collision between two items (called once per pair)
     * Enhanced for satisfying "domino effect" cascades
     */
    resolveCollision(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;
        
        if (distSq >= minDist * minDist || distSq === 0) return;
        
        const dist = Math.sqrt(distSq);
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Separate items with slight extra push
        const separation = overlap * 1.05;
        a.x -= nx * separation;
        a.y -= ny * separation;
        b.x += nx * separation;
        b.y += ny * separation;
        
        // Exchange velocity with improved physics
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        
        // Only process if items moving toward each other
        if (dot <= 0) return;
        
        const damping = PHYSICS.collisionDamping;
        
        // Cascade bonus: if one item was just pushed, transfer more energy
        let cascadeMultiplier = 1;
        if (a.justPushed || b.justPushed) {
            cascadeMultiplier = 1 + PHYSICS.cascadeBonus;
            // Clear the flag after transfer
            a.justPushed = false;
            b.justPushed = false;
            // Mark receiver as "pushed" for chain reaction
            if (a.justPushed) b.justPushed = true;
            if (b.justPushed) a.justPushed = true;
        }
        
        const force = dot * damping * cascadeMultiplier;
        a.vx -= force * nx;
        a.vy -= force * ny;
        b.vx += force * nx;
        b.vy += force * ny;
        
        // Small flash on significant collision
        const impactStrength = Math.abs(dot);
        if (impactStrength > 1.5) {
            a.flash = Math.min(0.5, impactStrength * 0.1);
            b.flash = Math.min(0.5, impactStrength * 0.1);
        }
    }

    /**
     * Trigger a random special event
     * @returns {Object} The triggered event
     */
    triggerRandomEvent() {
        const events = Object.keys(SPECIAL_EVENTS);
        const eventType = events[Math.floor(Math.random() * events.length)];
        return this.triggerEvent(eventType);
    }

    /**
     * Trigger a specific event by type
     * @param {string} eventType - Event key from SPECIAL_EVENTS
     * @returns {Object|null} The triggered event or null if invalid
     */
    triggerEvent(eventType) {
        const event = SPECIAL_EVENTS[eventType];
        if (!event) return null;
        
        this.activeEvent = { type: eventType, ...event };
        this.eventTimer = event.duration;
        this.eventCooldown = EVENT_CONFIG.cooldownMs;
        
        return this.activeEvent;
    }

    /**
     * Roll for a prize type based on weights and quality bonus
     * @returns {string} Prize type key
     */
    rollPrizeType() {
        const qualityBonus = UPGRADES.prizeQuality.levels[this.upgrades.prizeQuality].value;
        let roll = Math.random() * TOTAL_PRIZE_WEIGHT;
        
        // Quality bonus shifts rolls toward better (rarer) prizes
        roll = Math.max(0, roll - qualityBonus);
        
        let cumulative = 0;
        for (const [type, prize] of Object.entries(PRIZES)) {
            cumulative += prize.weight;
            if (roll < cumulative) {
                return type;
            }
        }
        return 'coin'; // Fallback
    }

    /**
     * Drop a coin/prize at the specified position
     * @param {number} xPosition - Normalized X position (0-1)
     * @param {string|null} forcedType - Force a specific prize type
     * @returns {PusherItem} The dropped item
     */
    dropCoin(xPosition, forcedType = null) {
        const platform = this.getPlatform();
        const x = platform.x + 15 + xPosition * (platform.width - 30);
        const y = platform.y - 40;
        
        const type = forcedType || this.rollPrizeType();
        const item = new PusherItem(x, y, type);
        this.items.push(item);
        
        this.stats.coinsDropped++;
        this.stats.totalPlays++;
        
        this.save();
        return item;
    }

    /**
     * Process a collected prize and return rewards
     * @param {PusherItem} item - The collected item
     * @returns {Object} Collection result with value, combo, and bonus info
     */
    collectPrize(item) {
        let value = item.value;
        
        // Gold rush doubles value
        const isGoldRush = this.activeEvent?.type === 'goldRush';
        if (isGoldRush) {
            value *= 2;
        }
        
        // Combo bonus (10% per combo level, capped at 200%)
        this.combo++;
        this.comboTimer = 2000; // 2 second combo window
        
        let comboMultiplier = 1;
        if (this.combo > 1) {
            comboMultiplier = Math.min(1 + this.combo * 0.1, 3); // Cap at 3x
            value = Math.floor(value * comboMultiplier);
        }
        
        // Update stats
        this.stats.prizesCollected++;
        this.stats.karmaEarned += value;
        
        if (value > this.stats.bestSingleWin) {
            this.stats.bestSingleWin = value;
        }
        
        if (item.prizeType === 'jackpot' || item.prizeType === 'megajackpot') {
            this.stats.jackpots++;
        }
        
        this.save();
        
        return { 
            value, 
            combo: this.combo, 
            comboMultiplier,
            isGoldRush 
        };
    }

    /**
     * Check if an upgrade can be purchased
     * @param {string} upgradeType - Upgrade key
     * @returns {Object} Purchase info with success status and cost
     */
    purchaseUpgrade(upgradeType) {
        const currentLevel = this.upgrades[upgradeType] || 0;
        const upgrade = UPGRADES[upgradeType];
        
        if (!upgrade || currentLevel >= upgrade.levels.length - 1) {
            return { success: false, error: 'Max level' };
        }
        
        const nextLevel = upgrade.levels[currentLevel + 1];
        return { 
            success: true, 
            cost: nextLevel.cost,
            newLevel: currentLevel + 1,
            label: nextLevel.label
        };
    }

    /**
     * Apply an upgrade (assumes cost already spent)
     * @param {string} upgradeType - Upgrade key
     */
    applyUpgrade(upgradeType) {
        this.upgrades[upgradeType] = (this.upgrades[upgradeType] || 0) + 1;
        this.save();
    }

    /**
     * Max out all upgrades (debug tool)
     */
    maxAllUpgrades() {
        for (const key of Object.keys(UPGRADES)) {
            this.upgrades[key] = UPGRADES[key].levels.length - 1;
        }
        this.save();
    }

    /**
     * Get detailed upgrade info for UI
     * @param {string} upgradeType - Upgrade key
     * @returns {Object} Upgrade display info
     */
    getUpgradeInfo(upgradeType) {
        const currentLevel = this.upgrades[upgradeType] || 0;
        const upgrade = UPGRADES[upgradeType];
        const isMaxed = currentLevel >= upgrade.levels.length - 1;
        
        return {
            name: upgrade.name,
            icon: upgrade.icon,
            description: upgrade.description,
            currentLevel,
            currentLabel: upgrade.levels[currentLevel].label,
            currentValue: upgrade.levels[currentLevel].value,
            nextCost: isMaxed ? null : upgrade.levels[currentLevel + 1].cost,
            nextLabel: isMaxed ? null : upgrade.levels[currentLevel + 1].label,
            isMaxed
        };
    }

    /**
     * Get debug information
     * @returns {Object} Debug stats
     */
    getDebugInfo() {
        return {
            fps: Math.round(this.fps),
            itemCount: this.items.length,
            settledCount: this.items.filter(i => i.settled).length,
            activeEvent: this.activeEvent?.type || 'none',
            eventTimer: Math.round(this.eventTimer / 1000),
            eventCooldown: Math.round(this.eventCooldown / 1000),
            combo: this.combo,
            comboTimer: Math.round(this.comboTimer / 1000),
            pusherX: Math.round(this.pusherX),
            pusherDir: this.pusherDirection > 0 ? '→' : '←'
        };
    }

    /**
     * Save state to localStorage
     */
    save() {
        try {
            const data = {
                items: this.items.map(i => i.serialize()),
                upgrades: this.upgrades,
                stats: this.stats,
                savedAt: Date.now()
            };
            const json = JSON.stringify(data);
            
            // Check for localStorage quota (rough estimate)
            if (json.length > 4 * 1024 * 1024) {
                console.warn('Pusher save data too large, trimming items');
                // Keep only recent items if too large
                data.items = data.items.slice(-100);
            }
            
            localStorage.setItem(PUSHER_KEY, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('localStorage full, clearing old pusher data');
                // Try to save with minimal items
                try {
                    const minData = {
                        items: [],
                        upgrades: this.upgrades,
                        stats: this.stats,
                        savedAt: Date.now()
                    };
                    localStorage.setItem(PUSHER_KEY, JSON.stringify(minData));
                } catch (e2) {
                    console.error('Failed to save pusher state:', e2);
                }
            } else {
                console.warn('Failed to save pusher state:', e);
            }
        }
    }

    /**
     * Load state from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(PUSHER_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.items = (data.items || []).map(i => PusherItem.deserialize(i));
                this.upgrades = { ...this.upgrades, ...data.upgrades };
                this.stats = { ...this.stats, ...data.stats };
                
                // Clamp karma stats to non-negative
                this.stats.karmaEarned = Math.max(0, this.stats.karmaEarned);
                
                // Initialize pusher position
                const pusherBar = this.getPusherBar();
                this.pusherX = pusherBar.minX;
            } else {
                this.initializeBoard();
            }
        } catch (e) {
            console.warn('Failed to load pusher state:', e);
            this.initializeBoard();
        }
    }

    /**
     * Initialize a fresh board with starter items
     */
    initializeBoard() {
        const platform = this.getPlatform();
        this.items = [];
        
        // Start with a spread of coins
        for (let i = 0; i < 30; i++) {
            const x = platform.x + 20 + Math.random() * (platform.width - 40);
            const y = platform.y + 30 + Math.random() * 120;
            const item = new PusherItem(x, y, 'coin');
            item.settled = true;
            item.vy = 0;
            item.vx = 0;
            this.items.push(item);
        }
        
        // Add some starter prizes
        const starterTypes = ['smallGem', 'token', 'mediumGem'];
        for (let i = 0; i < 3; i++) {
            const x = platform.x + 40 + Math.random() * (platform.width - 80);
            const y = platform.y + 50 + Math.random() * 80;
            const item = new PusherItem(x, y, starterTypes[i]);
            item.settled = true;
            item.vy = 0;
            item.vx = 0;
            this.items.push(item);
        }
        
        this.pusherX = this.getPusherBar().minX;
        this.save();
    }

    /**
     * Soft reset (keep upgrades)
     */
    reset() {
        this.items = [];
        this.stats = {
            coinsDropped: 0,
            prizesCollected: 0,
            karmaEarned: 0,
            jackpots: 0,
            totalPlays: 0,
            bestSingleWin: 0
        };
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventCooldown = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.initializeBoard();
    }

    /**
     * Full reset (including upgrades)
     */
    fullReset() {
        this.upgrades = { platform: 0, pusherSpeed: 0, prizeQuality: 0, multiDrop: 0, autoDrop: 0 };
        this.reset();
    }

    /**
     * Clear all items (debug tool)
     */
    clearItems() {
        this.items = [];
        this.save();
    }

    /**
     * Spawn test items (debug tool)
     * @param {number} count - Number of items to spawn
     * @param {string} type - Prize type (optional)
     */
    spawnTestItems(count = 50, type = null) {
        const platform = this.getPlatform();
        for (let i = 0; i < count; i++) {
            const x = platform.x + 20 + Math.random() * (platform.width - 40);
            const y = platform.y - 40 - Math.random() * 50;
            const itemType = type || this.rollPrizeType();
            this.items.push(new PusherItem(x, y, itemType));
        }
    }
}

// Singleton instance
let pusherInstance = null;

/**
 * Get the singleton pusher game instance
 * @returns {PusherGame}
 */
export function getPusherGame() {
    if (!pusherInstance) {
        pusherInstance = new PusherGame();
    }
    return pusherInstance;
}

/**
 * Reset the pusher game (soft reset)
 */
export function resetPusherGame() {
    if (pusherInstance) {
        pusherInstance.reset();
    }
}

/**
 * Get the physics constants (for tuning UI)
 * @returns {Object}
 */
export function getPhysics() {
    return PHYSICS;
}

/**
 * Update physics constants
 * @param {Object} newPhysics - Partial physics object to merge
 */
export function setPhysics(newPhysics) {
    Object.assign(PHYSICS, newPhysics);
}
