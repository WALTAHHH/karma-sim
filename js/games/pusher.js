// Karma Pusher - Meta Layer
// Coin pusher physics, upgrades, special events

const PUSHER_KEY = 'karma_simulator_pusher';
const UPGRADES_KEY = 'karma_simulator_pusher_upgrades';

// Base physics constants
const BASE_GRAVITY = 0.3;
const BASE_FRICTION = 0.85;
const BASE_BOUNCE = 0.4;

// Upgrade definitions
export const UPGRADES = {
    platform: {
        name: 'Platform Width',
        icon: '📐',
        description: 'Wider platform holds more coins',
        levels: [
            { cost: 0, value: 280, label: 'Standard' },
            { cost: 20, value: 320, label: 'Wide' },
            { cost: 50, value: 360, label: 'Extra Wide' },
            { cost: 100, value: 400, label: 'Maximum' }
        ]
    },
    pusherSpeed: {
        name: 'Pusher Speed',
        icon: '⚡',
        description: 'Faster cycles = more action',
        levels: [
            { cost: 0, value: 1.2, label: 'Normal' },
            { cost: 25, value: 1.6, label: 'Quick' },
            { cost: 60, value: 2.0, label: 'Fast' },
            { cost: 120, value: 2.5, label: 'Turbo' }
        ]
    },
    prizeQuality: {
        name: 'Prize Quality',
        icon: '💎',
        description: 'Better prizes appear more often',
        levels: [
            { cost: 0, value: 0, label: 'Basic' },
            { cost: 30, value: 8, label: 'Good' },
            { cost: 75, value: 18, label: 'Great' },
            { cost: 150, value: 30, label: 'Amazing' }
        ]
    },
    multiDrop: {
        name: 'Multi-Drop',
        icon: '🌧️',
        description: 'Drop more coins at once',
        levels: [
            { cost: 0, value: 5, label: '×5' },
            { cost: 35, value: 10, label: '×10' },
            { cost: 80, value: 25, label: '×25' },
            { cost: 180, value: 50, label: '×50' }
        ]
    },
    autoDrop: {
        name: 'Auto-Dropper',
        icon: '🤖',
        description: 'Automatically drops coins over time',
        levels: [
            { cost: 0, value: 0, label: 'Off' },
            { cost: 40, value: 10000, label: 'Slow (10s)' },
            { cost: 90, value: 5000, label: 'Medium (5s)' },
            { cost: 200, value: 2000, label: 'Fast (2s)' }
        ]
    }
};

// Prize definitions
export const PRIZES = {
    coin: { icon: '🪙', value: 1, type: 'karma', weight: 65, radius: 10, color: '#fbbf24' },
    smallGem: { icon: '💠', value: 2, type: 'karma', weight: 12, radius: 11, color: '#60a5fa' },
    token: { icon: '🎫', value: 3, type: 'token', weight: 8, radius: 12, color: '#4ade80' },
    mediumGem: { icon: '💎', value: 5, type: 'karma', weight: 6, radius: 13, color: '#c084fc' },
    star: { icon: '⭐', value: 8, type: 'karma', weight: 4, radius: 14, color: '#fbbf24' },
    trophy: { icon: '🏆', value: 12, type: 'karma', weight: 2.5, radius: 15, color: '#fbbf24' },
    crystal: { icon: '🔮', value: 20, type: 'karma', weight: 1.5, radius: 16, color: '#c084fc' },
    jackpot: { icon: '🌟', value: 50, type: 'jackpot', weight: 0.5, radius: 18, color: '#fbbf24' },
    megaJackpot: { icon: '👑', value: 100, type: 'megajackpot', weight: 0.2, radius: 20, color: '#fbbf24' }
};

// Special events
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

// Coin/Prize class
export class PusherItem {
    constructor(x, y, type = 'coin') {
        const def = PRIZES[type] || PRIZES.coin;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = 0;
        this.radius = def.radius;
        this.type = type;
        this.icon = def.icon;
        this.value = def.value;
        this.prizeType = def.type;
        this.color = def.color;
        this.settled = false;
        this.settleTimer = 0;
        this.wobble = 0;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.flash = 0;
        this.glow = 0;
        this.age = 0;
    }

    update(items, pusherX, pusherWidth, platform, pusherBar, pusherSpeed, frenzyMode) {
        this.age++;
        if (this.flash > 0) this.flash -= 0.08;
        if (this.glow > 0) this.glow -= 0.02;
        
        const speed = frenzyMode ? 1.5 : 1;
        const gravity = BASE_GRAVITY * speed;
        const friction = BASE_FRICTION;
        
        // Apply gravity
        this.vy += gravity;
        
        // Apply velocity
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        
        // Friction
        this.vx *= friction;
        
        // Platform boundaries (walls)
        if (this.x - this.radius < platform.x) {
            this.x = platform.x + this.radius;
            this.vx = Math.abs(this.vx) * BASE_BOUNCE;
        }
        if (this.x + this.radius > platform.x + platform.width) {
            this.x = platform.x + platform.width - this.radius;
            this.vx = -Math.abs(this.vx) * BASE_BOUNCE;
        }
        
        // Pusher bar collision
        if (this.y + this.radius > pusherBar.y && 
            this.y - this.radius < pusherBar.y + pusherBar.height &&
            this.x > pusherX && 
            this.x < pusherX + pusherWidth) {
            // Push forward
            this.vy = -Math.abs(this.vy) * 0.3;
            this.vx += pusherSpeed * 0.6;
            this.y = pusherBar.y - this.radius;
            this.flash = 1;
            this.glow = 1;
        }
        
        // Platform floor
        if (this.y + this.radius > platform.edgeY - 15) {
            if (this.y < platform.edgeY + 10) {
                this.y = platform.edgeY - 15 - this.radius;
                this.vy = -Math.abs(this.vy) * BASE_BOUNCE;
                if (Math.abs(this.vy) < 0.5) this.vy = 0;
            }
        }
        
        // Collision with other items
        for (const other of items) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.radius + other.radius;
            
            if (dist < minDist && dist > 0) {
                const overlap = (minDist - dist) / 2;
                const nx = dx / dist;
                const ny = dy / dist;
                
                this.x -= nx * overlap;
                this.y -= ny * overlap;
                other.x += nx * overlap;
                other.y += ny * overlap;
                
                const dvx = this.vx - other.vx;
                const dvy = this.vy - other.vy;
                const dot = dvx * nx + dvy * ny;
                
                this.vx -= dot * nx * 0.5;
                this.vy -= dot * ny * 0.5;
                other.vx += dot * nx * 0.5;
                other.vy += dot * ny * 0.5;
                
                // Small flash on collision
                if (Math.abs(dot) > 1) {
                    this.flash = Math.min(this.flash + 0.3, 1);
                }
            }
        }
        
        // Check if settled
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.3) {
            this.settleTimer++;
            if (this.settleTimer > 30) this.settled = true;
        } else {
            this.settleTimer = 0;
            this.settled = false;
        }
        
        // Wobble near edge (tension!)
        if (this.y + this.radius > platform.edgeY - 35) {
            this.wobble = Math.sin(Date.now() / 80 + this.wobblePhase) * 2.5;
        } else {
            this.wobble *= 0.9;
        }
        
        // Check if fallen off
        return this.y > platform.edgeY + 50;
    }

    serialize() {
        return { x: this.x, y: this.y, type: this.type };
    }

    static deserialize(data) {
        const item = new PusherItem(data.x, data.y, data.type);
        item.settled = true;
        item.vy = 0;
        item.vx = 0;
        return item;
    }
}

// Main Pusher Game State
export class PusherGame {
    constructor() {
        this.items = [];
        this.pusherX = 0;
        this.pusherDirection = 1;
        this.pusherExtension = 0; // For mega push
        this.upgrades = { platform: 0, pusherSpeed: 0, prizeQuality: 0, multiDrop: 0, autoDrop: 0 };
        this.stats = {
            coinsDropped: 0,
            prizesCollected: 0,
            karmaEarned: 0,
            jackpots: 0,
            totalPlays: 0,
            bestSingleWin: 0
        };
        
        // Special events
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventCooldown = 0;
        
        // Auto-drop
        this.lastAutoDrop = 0;
        
        // Combo tracking
        this.combo = 0;
        this.comboTimer = 0;
        
        this.load();
    }

    getPlatform() {
        const width = UPGRADES.platform.levels[this.upgrades.platform].value;
        return {
            x: (400 - width) / 2,
            y: 80,
            width: width,
            edgeY: 275
        };
    }

    getPusherBar() {
        const platform = this.getPlatform();
        return {
            y: 100,
            height: 18,
            minX: platform.x,
            maxX: platform.x + 90 + this.pusherExtension
        };
    }

    getPusherSpeed() {
        const base = UPGRADES.pusherSpeed.levels[this.upgrades.pusherSpeed].value;
        return this.activeEvent?.type === 'frenzy' ? base * 1.5 : base;
    }

    getPusherWidth() {
        return 110 + (this.activeEvent?.type === 'megaPush' ? 40 : 0);
    }

    getMultiDropCount() {
        return UPGRADES.multiDrop.levels[this.upgrades.multiDrop].value;
    }

    update(currentKarma, addKarmaFn) {
        const platform = this.getPlatform();
        const pusherBar = this.getPusherBar();
        const speed = this.getPusherSpeed();
        const pusherWidth = this.getPusherWidth();
        const frenzyMode = this.activeEvent?.type === 'frenzy';
        
        // Move pusher bar
        this.pusherX += speed * this.pusherDirection;
        if (this.pusherX >= pusherBar.maxX) {
            this.pusherDirection = -1;
        } else if (this.pusherX <= pusherBar.minX) {
            this.pusherDirection = 1;
        }
        
        // Prize rain event
        if (this.activeEvent?.type === 'prizeRain' && Math.random() < 0.05) {
            const x = platform.x + 20 + Math.random() * (platform.width - 40);
            this.items.push(new PusherItem(x, platform.y - 30, this.rollPrizeType()));
        }
        
        // Update event timer
        if (this.activeEvent) {
            this.eventTimer -= 16; // ~60fps
            if (this.eventTimer <= 0) {
                this.activeEvent = null;
            }
        }
        
        // Event cooldown
        if (this.eventCooldown > 0) {
            this.eventCooldown -= 16;
        }
        
        // Random event trigger
        if (!this.activeEvent && this.eventCooldown <= 0 && Math.random() < 0.0003) {
            this.triggerRandomEvent();
        }
        
        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= 16;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
        
        // Auto-drop
        const autoDropInterval = UPGRADES.autoDrop.levels[this.upgrades.autoDrop].value;
        if (autoDropInterval > 0 && currentKarma >= 1) {
            const now = Date.now();
            if (now - this.lastAutoDrop >= autoDropInterval) {
                this.lastAutoDrop = now;
                return { autoDrop: true };
            }
        }

        // Update all items
        const fallen = [];
        this.items = this.items.filter(item => {
            const hasFallen = item.update(
                this.items, 
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

        return { fallen, autoDrop: false };
    }

    triggerRandomEvent() {
        const events = Object.keys(SPECIAL_EVENTS);
        const eventType = events[Math.floor(Math.random() * events.length)];
        const event = SPECIAL_EVENTS[eventType];
        
        this.activeEvent = { type: eventType, ...event };
        this.eventTimer = event.duration;
        this.eventCooldown = 30000; // 30 second cooldown between events
        
        return this.activeEvent;
    }

    rollPrizeType() {
        const qualityBonus = UPGRADES.prizeQuality.levels[this.upgrades.prizeQuality].value;
        let roll = Math.random() * 100;
        
        // Quality bonus shifts rolls toward better prizes
        roll = Math.max(0, roll - qualityBonus);
        
        let cumulative = 0;
        for (const [type, prize] of Object.entries(PRIZES)) {
            cumulative += prize.weight;
            if (roll < cumulative) {
                return type;
            }
        }
        return 'coin';
    }

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

    collectPrize(item) {
        let value = item.value;
        
        // Gold rush doubles value
        if (this.activeEvent?.type === 'goldRush') {
            value *= 2;
        }
        
        // Combo bonus
        this.combo++;
        this.comboTimer = 2000; // 2 second combo window
        if (this.combo > 1) {
            value = Math.floor(value * (1 + this.combo * 0.1)); // 10% per combo
        }
        
        this.stats.prizesCollected++;
        this.stats.karmaEarned += value;
        
        if (value > this.stats.bestSingleWin) {
            this.stats.bestSingleWin = value;
        }
        
        if (item.prizeType === 'jackpot' || item.prizeType === 'megajackpot') {
            this.stats.jackpots++;
        }
        
        this.save();
        
        return { value, combo: this.combo, isGoldRush: this.activeEvent?.type === 'goldRush' };
    }

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

    applyUpgrade(upgradeType) {
        this.upgrades[upgradeType] = (this.upgrades[upgradeType] || 0) + 1;
        this.save();
    }

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
            nextCost: isMaxed ? null : upgrade.levels[currentLevel + 1].cost,
            nextLabel: isMaxed ? null : upgrade.levels[currentLevel + 1].label,
            isMaxed
        };
    }

    save() {
        try {
            const data = {
                items: this.items.map(i => i.serialize()),
                upgrades: this.upgrades,
                stats: this.stats,
                savedAt: Date.now()
            };
            localStorage.setItem(PUSHER_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save pusher state:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem(PUSHER_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.items = (data.items || []).map(i => PusherItem.deserialize(i));
                this.upgrades = { ...this.upgrades, ...data.upgrades };
                this.stats = { ...this.stats, ...data.stats };
                
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

    initializeBoard() {
        const platform = this.getPlatform();
        
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
        for (let i = 0; i < 3; i++) {
            const x = platform.x + 40 + Math.random() * (platform.width - 80);
            const y = platform.y + 50 + Math.random() * 80;
            const types = ['smallGem', 'token', 'mediumGem'];
            const item = new PusherItem(x, y, types[i]);
            item.settled = true;
            item.vy = 0;
            item.vx = 0;
            this.items.push(item);
        }
        
        this.pusherX = this.getPusherBar().minX;
        this.save();
    }

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
        // Keep upgrades on reset
        this.initializeBoard();
    }

    fullReset() {
        this.upgrades = { platform: 0, pusherSpeed: 0, prizeQuality: 0, multiDrop: 0, autoDrop: 0 };
        this.reset();
    }
}

// Singleton instance
let pusherInstance = null;

export function getPusherGame() {
    if (!pusherInstance) {
        pusherInstance = new PusherGame();
    }
    return pusherInstance;
}

export function resetPusherGame() {
    if (pusherInstance) {
        pusherInstance.reset();
    }
}
