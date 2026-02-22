// Karma Pusher - Meta Layer
// Coin pusher physics and persistence

const PUSHER_KEY = 'karma_simulator_pusher';

// Physics constants
const GRAVITY = 0.3;
const FRICTION = 0.85;
const BOUNCE = 0.4;
const COIN_RADIUS = 12;
const PUSHER_SPEED = 1.5;

// Platform dimensions (relative to canvas)
const PLATFORM = {
    x: 50,
    y: 100,
    width: 300,
    height: 200,
    edgeY: 280 // Where coins fall off
};

const PUSHER_BAR = {
    y: 120,
    height: 15,
    minX: PLATFORM.x,
    maxX: PLATFORM.x + 80
};

// Prize definitions
export const PRIZES = {
    coin: { icon: '🪙', value: 1, type: 'karma', weight: 70, radius: 10 },
    token: { icon: '🎫', value: 1, type: 'token', weight: 15, radius: 12 },
    statBoost: { icon: '⬆️', value: 1, type: 'boost', weight: 6, radius: 14 },
    karmaGem: { icon: '💎', value: 10, type: 'karma', weight: 4, radius: 14 },
    reroll: { icon: '🔄', value: 1, type: 'reroll', weight: 3, radius: 16 },
    trophy: { icon: '🏆', value: 1, type: 'trophy', weight: 1.5, radius: 18 },
    jackpot: { icon: '🌟', value: 25, type: 'jackpot', weight: 0.5, radius: 20 }
};

// Coin/Prize class
export class PusherItem {
    constructor(x, y, type = 'coin') {
        const def = PRIZES[type] || PRIZES.coin;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.radius = def.radius;
        this.type = type;
        this.icon = def.icon;
        this.value = def.value;
        this.prizeType = def.type;
        this.settled = false;
        this.settleTimer = 0;
        this.wobble = 0;
        this.flash = 0;
    }

    update(items, pusherX) {
        if (this.flash > 0) this.flash -= 0.1;
        
        // Apply gravity
        this.vy += GRAVITY;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Friction
        this.vx *= FRICTION;
        
        // Platform boundaries
        if (this.x - this.radius < PLATFORM.x) {
            this.x = PLATFORM.x + this.radius;
            this.vx = Math.abs(this.vx) * BOUNCE;
        }
        if (this.x + this.radius > PLATFORM.x + PLATFORM.width) {
            this.x = PLATFORM.x + PLATFORM.width - this.radius;
            this.vx = -Math.abs(this.vx) * BOUNCE;
        }
        
        // Pusher bar collision
        if (this.y + this.radius > PUSHER_BAR.y && 
            this.y - this.radius < PUSHER_BAR.y + PUSHER_BAR.height &&
            this.x > pusherX && 
            this.x < pusherX + 100) {
            // Push forward
            this.vy = -Math.abs(this.vy) * 0.3;
            this.vx += PUSHER_SPEED * 0.5;
            this.y = PUSHER_BAR.y - this.radius;
            this.flash = 1;
        }
        
        // Platform floor
        if (this.y + this.radius > PLATFORM.edgeY - 20 && this.y < PLATFORM.edgeY) {
            this.y = PLATFORM.edgeY - 20 - this.radius;
            this.vy = -Math.abs(this.vy) * BOUNCE;
            if (Math.abs(this.vy) < 0.5) this.vy = 0;
        }
        
        // Collision with other items
        for (const other of items) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.radius + other.radius;
            
            if (dist < minDist && dist > 0) {
                // Separate
                const overlap = (minDist - dist) / 2;
                const nx = dx / dist;
                const ny = dy / dist;
                
                this.x -= nx * overlap;
                this.y -= ny * overlap;
                other.x += nx * overlap;
                other.y += ny * overlap;
                
                // Transfer momentum
                const dvx = this.vx - other.vx;
                const dvy = this.vy - other.vy;
                const dot = dvx * nx + dvy * ny;
                
                this.vx -= dot * nx * 0.5;
                this.vy -= dot * ny * 0.5;
                other.vx += dot * nx * 0.5;
                other.vy += dot * ny * 0.5;
            }
        }
        
        // Check if settled
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.5) {
            this.settleTimer++;
            if (this.settleTimer > 30) this.settled = true;
        } else {
            this.settleTimer = 0;
            this.settled = false;
        }
        
        // Wobble near edge
        if (this.y + this.radius > PLATFORM.edgeY - 40) {
            this.wobble = Math.sin(Date.now() / 100) * 2;
        } else {
            this.wobble = 0;
        }
        
        // Check if fallen off
        return this.y > PLATFORM.edgeY + 50;
    }

    serialize() {
        return {
            x: this.x,
            y: this.y,
            type: this.type
        };
    }

    static deserialize(data) {
        return new PusherItem(data.x, data.y, data.type);
    }
}

// Main Pusher Game State
export class PusherGame {
    constructor() {
        this.items = [];
        this.pusherX = PUSHER_BAR.minX;
        this.pusherDirection = 1;
        this.collectedPrizes = [];
        this.stats = {
            coinsDropped: 0,
            prizesCollected: 0,
            karmaEarned: 0,
            jackpots: 0
        };
        this.load();
    }

    update() {
        // Move pusher bar
        this.pusherX += PUSHER_SPEED * this.pusherDirection;
        if (this.pusherX >= PUSHER_BAR.maxX) {
            this.pusherDirection = -1;
        } else if (this.pusherX <= PUSHER_BAR.minX) {
            this.pusherDirection = 1;
        }

        // Update all items
        const fallen = [];
        this.items = this.items.filter(item => {
            const hasFallen = item.update(this.items, this.pusherX);
            if (hasFallen) {
                fallen.push(item);
                return false;
            }
            return true;
        });

        return fallen; // Return collected prizes
    }

    dropCoin(xPosition, type = null) {
        // xPosition: 0-1 relative position
        const x = PLATFORM.x + 20 + xPosition * (PLATFORM.width - 40);
        const y = PLATFORM.y - 30;
        
        // Determine type (mostly coins, sometimes prizes)
        let itemType = type;
        if (!itemType) {
            const roll = Math.random() * 100;
            let cumulative = 0;
            for (const [key, prize] of Object.entries(PRIZES)) {
                cumulative += prize.weight;
                if (roll < cumulative) {
                    itemType = key;
                    break;
                }
            }
        }
        
        const item = new PusherItem(x, y, itemType || 'coin');
        this.items.push(item);
        this.stats.coinsDropped++;
        
        // Auto-save
        this.save();
        
        return item;
    }

    spawnPrize(type) {
        // Spawn a specific prize type in a random position
        const x = PLATFORM.x + 50 + Math.random() * (PLATFORM.width - 100);
        const y = PLATFORM.y + 20 + Math.random() * 60;
        const item = new PusherItem(x, y, type);
        this.items.push(item);
        this.save();
        return item;
    }

    collectPrize(item) {
        this.collectedPrizes.push({
            type: item.type,
            icon: item.icon,
            value: item.value,
            prizeType: item.prizeType,
            timestamp: Date.now()
        });
        this.stats.prizesCollected++;
        
        if (item.prizeType === 'karma') {
            this.stats.karmaEarned += item.value;
        }
        if (item.type === 'jackpot') {
            this.stats.jackpots++;
        }
        
        this.save();
    }

    getRecentCollections() {
        // Get prizes collected in last 5 seconds
        const cutoff = Date.now() - 5000;
        return this.collectedPrizes.filter(p => p.timestamp > cutoff);
    }

    clearRecentCollections() {
        const cutoff = Date.now() - 5000;
        this.collectedPrizes = this.collectedPrizes.filter(p => p.timestamp > cutoff);
    }

    save() {
        try {
            const data = {
                items: this.items.map(i => i.serialize()),
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
                this.stats = { ...this.stats, ...data.stats };
            } else {
                // Initialize with some coins
                this.initializeBoard();
            }
        } catch (e) {
            console.warn('Failed to load pusher state:', e);
            this.initializeBoard();
        }
    }

    initializeBoard() {
        // Start with a spread of coins
        for (let i = 0; i < 25; i++) {
            const x = PLATFORM.x + 30 + Math.random() * (PLATFORM.width - 60);
            const y = PLATFORM.y + 40 + Math.random() * 100;
            const item = new PusherItem(x, y, 'coin');
            item.settled = true;
            this.items.push(item);
        }
        // Add a few prizes
        this.spawnPrize('token');
        this.spawnPrize('karmaGem');
        this.save();
    }

    reset() {
        this.items = [];
        this.collectedPrizes = [];
        this.stats = {
            coinsDropped: 0,
            prizesCollected: 0,
            karmaEarned: 0,
            jackpots: 0
        };
        this.initializeBoard();
    }

    getPlatformBounds() {
        return PLATFORM;
    }

    getPusherBounds() {
        return {
            x: this.pusherX,
            y: PUSHER_BAR.y,
            width: 100,
            height: PUSHER_BAR.height
        };
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
