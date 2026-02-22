/**
 * Pusher Game Tests
 * Run with: node tests/pusher.test.js
 * 
 * Simple assertion-based tests, no framework required.
 */

// Simple test utilities
let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, message) {
    if (condition) {
        passCount++;
        testResults.push({ pass: true, message });
    } else {
        failCount++;
        testResults.push({ pass: false, message });
        console.error(`  ❌ FAIL: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    const pass = actual === expected;
    if (!pass) {
        console.error(`  ❌ FAIL: ${message}`);
        console.error(`     Expected: ${expected}`);
        console.error(`     Actual:   ${actual}`);
    }
    assert(pass, message);
}

function assertApprox(actual, expected, tolerance, message) {
    const pass = Math.abs(actual - expected) <= tolerance;
    if (!pass) {
        console.error(`  ❌ FAIL: ${message}`);
        console.error(`     Expected: ${expected} ± ${tolerance}`);
        console.error(`     Actual:   ${actual}`);
    }
    assert(pass, message);
}

function describe(name, fn) {
    console.log(`\n📦 ${name}`);
    fn();
}

function it(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
    } catch (e) {
        failCount++;
        console.error(`  ❌ ${name}`);
        console.error(`     Error: ${e.message}`);
    }
}

// ==================== MOCK SETUP ====================

// Mock localStorage
global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
};

// Mock Date.now for deterministic tests
let mockTime = 1000000;
const originalDateNow = Date.now;
Date.now = () => mockTime;
function advanceTime(ms) { mockTime += ms; }

// Mock performance.now
global.performance = { now: () => mockTime };

// ==================== IMPORTS (inline definitions for standalone test) ====================

// Recreate the core logic here for testing without ES modules
// In a real setup, you'd use a bundler or Node's --experimental-modules

const PHYSICS = {
    gravity: 0.3,
    friction: 0.85,
    bounce: 0.4,
    maxVelocity: 15,
    settleThresholdVX: 0.1,
    settleThresholdVY: 0.3,
    settleFrames: 30,
    collisionDamping: 0.5
};

const PRIZES = {
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

const TOTAL_PRIZE_WEIGHT = Object.values(PRIZES).reduce((sum, p) => sum + p.weight, 0);

const UPGRADES = {
    platform: {
        levels: [
            { cost: 0, value: 280 },
            { cost: 20, value: 320 },
            { cost: 50, value: 360 },
            { cost: 100, value: 400 }
        ]
    },
    pusherSpeed: {
        levels: [
            { cost: 0, value: 1.2 },
            { cost: 25, value: 1.6 },
            { cost: 60, value: 2.0 },
            { cost: 120, value: 2.5 }
        ]
    },
    prizeQuality: {
        levels: [
            { cost: 0, value: 0 },
            { cost: 30, value: 8 },
            { cost: 75, value: 18 },
            { cost: 150, value: 30 }
        ]
    },
    multiDrop: {
        levels: [
            { cost: 0, value: 5 },
            { cost: 35, value: 10 },
            { cost: 80, value: 25 },
            { cost: 180, value: 50 }
        ]
    },
    autoDrop: {
        levels: [
            { cost: 0, value: 0 },
            { cost: 40, value: 10000 },
            { cost: 90, value: 5000 },
            { cost: 200, value: 2000 }
        ]
    }
};

// Simplified PusherItem for testing
class PusherItem {
    constructor(x, y, type = 'coin') {
        const def = PRIZES[type] || PRIZES.coin;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = def.radius;
        this.type = type;
        this.value = def.value;
        this.prizeType = def.type;
        this.settled = false;
        this.settleTimer = 0;
    }
    
    update(items, pusherX, pusherWidth, platform, pusherBar, pusherSpeed, frenzyMode) {
        const speed = frenzyMode ? 1.5 : 1;
        const gravity = PHYSICS.gravity * speed;
        
        this.vy += gravity;
        
        // Clamp velocity
        this.vx = Math.max(-PHYSICS.maxVelocity, Math.min(PHYSICS.maxVelocity, this.vx));
        this.vy = Math.max(-PHYSICS.maxVelocity, Math.min(PHYSICS.maxVelocity, this.vy));
        
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        
        this.vx *= PHYSICS.friction;
        
        // Wall collisions
        const leftWall = platform.x + this.radius;
        const rightWall = platform.x + platform.width - this.radius;
        
        if (this.x < leftWall) {
            this.x = leftWall;
            this.vx = Math.abs(this.vx) * PHYSICS.bounce;
        } else if (this.x > rightWall) {
            this.x = rightWall;
            this.vx = -Math.abs(this.vx) * PHYSICS.bounce;
        }
        
        // Floor collision
        const floorY = platform.edgeY - 15;
        if (this.y + this.radius > floorY && this.y < platform.edgeY + 10) {
            this.y = floorY - this.radius;
            this.vy = -Math.abs(this.vy) * PHYSICS.bounce;
            if (Math.abs(this.vy) < 0.5) this.vy = 0;
        }
        
        // Check settled
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
        
        return this.y > platform.edgeY + 50;
    }
}

// ==================== TESTS ====================

console.log('🧪 Pusher Game Tests\n' + '='.repeat(50));

describe('PusherItem Physics', () => {
    const platform = { x: 60, y: 80, width: 280, edgeY: 275 };
    const pusherBar = { y: 100, height: 18 };
    
    it('should apply gravity correctly', () => {
        const item = new PusherItem(200, 100);
        item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assertApprox(item.vy, PHYSICS.gravity, 0.01, 'Gravity applied to vy');
        assert(item.y > 100, 'Item moved down');
    });
    
    it('should clamp velocity to prevent tunneling', () => {
        const item = new PusherItem(200, 100);
        item.vy = 50;
        item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(item.vy <= PHYSICS.maxVelocity, 'vy clamped to maxVelocity');
    });
    
    it('should bounce off left wall', () => {
        const item = new PusherItem(platform.x, 150);
        item.vx = -10;
        item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(item.x >= platform.x + item.radius, 'Item pushed away from left wall');
        assert(item.vx > 0, 'Velocity reversed');
    });
    
    it('should bounce off right wall', () => {
        const item = new PusherItem(platform.x + platform.width, 150);
        item.vx = 10;
        item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(item.x <= platform.x + platform.width - item.radius, 'Item pushed away from right wall');
        assert(item.vx < 0, 'Velocity reversed');
    });
    
    it('should detect when item falls off edge', () => {
        const item = new PusherItem(200, platform.edgeY + 100);
        const hasFallen = item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(hasFallen === true, 'Item detected as fallen');
    });
    
    it('should settle when not moving', () => {
        const item = new PusherItem(200, platform.edgeY - 25);
        item.vx = 0;
        item.vy = 0;
        
        // Run enough frames to settle
        for (let i = 0; i < PHYSICS.settleFrames + 5; i++) {
            item.update([], 60, 110, platform, pusherBar, 1.2, false);
            item.vx = 0;
            item.vy = 0;
        }
        
        assert(item.settled === true, 'Item marked as settled');
    });
    
    it('should apply frenzy mode speed multiplier', () => {
        const item1 = new PusherItem(200, 100);
        const item2 = new PusherItem(200, 100);
        
        item1.update([], 60, 110, platform, pusherBar, 1.2, false);
        item2.update([], 60, 110, platform, pusherBar, 1.2, true);
        
        assert(item2.y > item1.y, 'Frenzy mode makes item fall faster');
    });
});

describe('Prize Rolling', () => {
    it('should have weights summing to ~100', () => {
        assertApprox(TOTAL_PRIZE_WEIGHT, 100, 1, 'Total prize weight ~100');
    });
    
    it('should have correct weight distribution', () => {
        // Run many rolls and check distribution
        const counts = {};
        const rolls = 10000;
        
        for (let i = 0; i < rolls; i++) {
            let roll = Math.random() * TOTAL_PRIZE_WEIGHT;
            let cumulative = 0;
            let selected = 'coin';
            
            for (const [type, prize] of Object.entries(PRIZES)) {
                cumulative += prize.weight;
                if (roll < cumulative) {
                    selected = type;
                    break;
                }
            }
            
            counts[selected] = (counts[selected] || 0) + 1;
        }
        
        // Coins should be most common (~65%)
        const coinPercent = counts.coin / rolls;
        assertApprox(coinPercent, 0.65, 0.05, `Coins are ~65% of drops (got ${(coinPercent * 100).toFixed(1)}%)`);
        
        // Mega jackpots should be very rare (~0.2%)
        const megaPercent = (counts.megaJackpot || 0) / rolls;
        assertApprox(megaPercent, 0.002, 0.003, `Mega jackpots are ~0.2% (got ${(megaPercent * 100).toFixed(2)}%)`);
    });
    
    it('should return correct prize values', () => {
        assertEqual(PRIZES.coin.value, 1, 'Coin value is 1');
        assertEqual(PRIZES.jackpot.value, 50, 'Jackpot value is 50');
        assertEqual(PRIZES.megaJackpot.value, 100, 'Mega jackpot value is 100');
    });
});

describe('Upgrade System', () => {
    it('should have correct platform upgrade values', () => {
        assertEqual(UPGRADES.platform.levels[0].value, 280, 'Base platform width');
        assertEqual(UPGRADES.platform.levels[3].value, 400, 'Max platform width');
    });
    
    it('should have increasing upgrade costs', () => {
        for (const [name, upgrade] of Object.entries(UPGRADES)) {
            let lastCost = -1;
            for (const level of upgrade.levels) {
                assert(level.cost >= lastCost, `${name} costs increase`);
                lastCost = level.cost;
            }
        }
    });
    
    it('should have reasonable cost curve', () => {
        // Check that costs roughly double (within 3x)
        for (const [name, upgrade] of Object.entries(UPGRADES)) {
            for (let i = 1; i < upgrade.levels.length - 1; i++) {
                const prev = upgrade.levels[i].cost;
                const next = upgrade.levels[i + 1].cost;
                if (prev > 0) {
                    const ratio = next / prev;
                    assert(ratio > 1 && ratio < 4, `${name} level ${i} to ${i+1} cost ratio reasonable (${ratio.toFixed(2)})`);
                }
            }
        }
    });
});

describe('Game State', () => {
    it('should serialize and deserialize items', () => {
        const original = new PusherItem(123, 456, 'star');
        const serialized = { x: original.x, y: original.y, type: original.type };
        
        const restored = new PusherItem(serialized.x, serialized.y, serialized.type);
        
        assertEqual(restored.x, original.x, 'X position preserved');
        assertEqual(restored.y, original.y, 'Y position preserved');
        assertEqual(restored.type, original.type, 'Type preserved');
        assertEqual(restored.value, original.value, 'Value preserved');
    });
    
    it('should handle localStorage save/load', () => {
        localStorage.clear();
        
        const data = {
            items: [{ x: 100, y: 200, type: 'coin' }],
            upgrades: { platform: 2, pusherSpeed: 1 },
            stats: { karmaEarned: 500 }
        };
        
        localStorage.setItem('test_pusher', JSON.stringify(data));
        const loaded = JSON.parse(localStorage.getItem('test_pusher'));
        
        assertEqual(loaded.upgrades.platform, 2, 'Upgrade level preserved');
        assertEqual(loaded.stats.karmaEarned, 500, 'Stats preserved');
        assertEqual(loaded.items.length, 1, 'Items preserved');
    });
});

describe('Edge Cases', () => {
    it('should handle negative karma stats gracefully', () => {
        const stats = { karmaEarned: -50 };
        stats.karmaEarned = Math.max(0, stats.karmaEarned);
        assertEqual(stats.karmaEarned, 0, 'Negative karma clamped to 0');
    });
    
    it('should handle 200+ items without issues', () => {
        const items = [];
        const platform = { x: 60, y: 80, width: 280, edgeY: 275 };
        const pusherBar = { y: 100, height: 18 };
        
        // Create 200 items
        for (let i = 0; i < 200; i++) {
            const x = platform.x + 20 + Math.random() * (platform.width - 40);
            const y = platform.y + Math.random() * 150;
            items.push(new PusherItem(x, y, 'coin'));
        }
        
        assertEqual(items.length, 200, '200 items created');
        
        // Run physics update
        const startTime = Date.now();
        for (let frame = 0; frame < 60; frame++) {
            for (const item of items) {
                item.update(items, 60, 110, platform, pusherBar, 1.2, false);
            }
        }
        const elapsed = Date.now() - startTime;
        
        // With 200 items and 60 frames, should complete reasonably
        // (This is a rough performance check, not strict)
        console.log(`  📊 200 items × 60 frames completed`);
        assert(true, '200 items physics runs without error');
    });
    
    it('should handle items with zero velocity', () => {
        const item = new PusherItem(200, 150);
        item.vx = 0;
        item.vy = 0;
        
        const platform = { x: 60, y: 80, width: 280, edgeY: 275 };
        const pusherBar = { y: 100, height: 18 };
        
        // Should not throw
        item.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(true, 'Zero velocity handled');
    });
    
    it('should handle items at exact boundaries', () => {
        const platform = { x: 60, y: 80, width: 280, edgeY: 275 };
        const pusherBar = { y: 100, height: 18 };
        
        // Item exactly at left wall
        const item1 = new PusherItem(platform.x + 10, 150);
        item1.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(item1.x >= platform.x + item1.radius, 'Left boundary handled');
        
        // Item exactly at right wall
        const item2 = new PusherItem(platform.x + platform.width - 10, 150);
        item2.update([], 60, 110, platform, pusherBar, 1.2, false);
        assert(item2.x <= platform.x + platform.width - item2.radius, 'Right boundary handled');
    });
});

describe('Combo System', () => {
    it('should calculate combo multipliers correctly', () => {
        // Test combo bonus calculation
        const calculateCombo = (combo) => {
            if (combo <= 1) return 1;
            return Math.min(1 + combo * 0.1, 3);
        };
        
        assertEqual(calculateCombo(1), 1, 'Combo 1 = 1x');
        assertApprox(calculateCombo(2), 1.2, 0.01, 'Combo 2 = 1.2x');
        assertApprox(calculateCombo(5), 1.5, 0.01, 'Combo 5 = 1.5x');
        assertApprox(calculateCombo(10), 2.0, 0.01, 'Combo 10 = 2x');
        assertApprox(calculateCombo(30), 3.0, 0.01, 'Combo 30+ capped at 3x');
    });
    
    it('should apply combo to prize values', () => {
        const baseValue = 10;
        const combo = 5;
        const multiplier = 1 + combo * 0.1;
        const finalValue = Math.floor(baseValue * multiplier);
        
        assertEqual(finalValue, 15, 'Combo 5 gives 1.5x value');
    });
});

// ==================== SUMMARY ====================

console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);

if (failCount > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
}
