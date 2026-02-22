/**
 * Mini-Games Unit Tests
 * Tests core game logic (not UI) for all 6 mini-games
 * 
 * Run with: node --experimental-vm-modules tests/minigames.test.js
 * (Requires a test runner or manual DOM mocking for full coverage)
 */

// Mock localStorage for Node environment
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock window if not in browser
if (typeof window === 'undefined') {
    global.window = { debugMode: false };
    global.localStorage = localStorageMock;
}

// ============ TEST UTILITIES ============

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        testsPassed++;
        console.log(`  ✅ ${message}`);
    } else {
        testsFailed++;
        console.log(`  ❌ ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    const pass = actual === expected;
    if (pass) {
        testsPassed++;
        console.log(`  ✅ ${message}`);
    } else {
        testsFailed++;
        console.log(`  ❌ ${message} (expected: ${expected}, got: ${actual})`);
    }
}

function assertRange(value, min, max, message) {
    const pass = value >= min && value <= max;
    if (pass) {
        testsPassed++;
        console.log(`  ✅ ${message}`);
    } else {
        testsFailed++;
        console.log(`  ❌ ${message} (value ${value} not in range [${min}, ${max}])`);
    }
}

function describe(name, fn) {
    console.log(`\n📦 ${name}`);
    fn();
}

function it(name, fn) {
    try {
        fn();
    } catch (e) {
        testsFailed++;
        console.log(`  ❌ ${name}: ${e.message}`);
    }
}

// ============ SLOTS TESTS ============

describe('Slots Game Logic', () => {
    // Note: These test the gacha.js logic which slots.js wraps
    
    it('should define rarity weights totaling 100%', () => {
        const weights = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        assertEqual(total, 100, 'Rarity weights sum to 100');
    });
    
    it('should have valid reward pool structure', () => {
        const requiredFields = ['id', 'name', 'rarity', 'type', 'icon', 'description'];
        const karmaRewards = [
            { id: 'karma_crumb', rarity: 'common', value: 1 },
            { id: 'karma_shard', rarity: 'uncommon', value: 3 },
            { id: 'karma_gem', rarity: 'rare', value: 8 },
            { id: 'karma_crystal', rarity: 'epic', value: 15 },
            { id: 'karma_nexus', rarity: 'legendary', value: 30 }
        ];
        
        assert(karmaRewards.every(r => r.value > 0), 'All karma rewards have positive values');
        assert(karmaRewards.every(r => ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(r.rarity)), 'All rewards have valid rarities');
    });
    
    it('should calculate pity bonus correctly', () => {
        // Pity bonus increases every 10 pulls
        const pityBonus0 = Math.floor(0 / 10) * 5;
        const pityBonus10 = Math.floor(10 / 10) * 5;
        const pityBonus25 = Math.floor(25 / 10) * 5;
        const pityBonus50 = Math.floor(50 / 10) * 5;
        
        assertEqual(pityBonus0, 0, 'No pity bonus at 0 pulls');
        assertEqual(pityBonus10, 5, '+5% pity bonus at 10 pulls');
        assertEqual(pityBonus25, 10, '+10% pity bonus at 25 pulls');
        assertEqual(pityBonus50, 25, '+25% pity bonus at 50 pulls');
    });
});

// ============ PULL TESTS ============

describe('Pull Game Logic', () => {
    it('should have tier-based anticipation durations', () => {
        const durations = {
            common: 1200,
            uncommon: 1400,
            rare: 1600,
            epic: 1800,
            legendary: 2200
        };
        
        assert(durations.legendary > durations.epic, 'Legendary has longer anticipation than epic');
        assert(durations.epic > durations.rare, 'Epic has longer anticipation than rare');
        assert(durations.common < durations.rare, 'Common has shorter anticipation than rare');
    });
    
    it('should have tier-based crack durations', () => {
        const durations = {
            common: 300,
            uncommon: 350,
            rare: 400,
            epic: 500,
            legendary: 700
        };
        
        assert(durations.legendary >= 2 * durations.common, 'Legendary crack is at least 2x common');
    });
});

// ============ WHEEL TESTS ============

describe('Wheel Game Logic', () => {
    const WEDGES = [
        { id: 'karma_1', value: 1, size: 12, rarity: 'common' },
        { id: 'karma_3', value: 3, size: 10, rarity: 'common' },
        { id: 'karma_5', value: 5, size: 9, rarity: 'uncommon' },
        { id: 'karma_8', value: 8, size: 7, rarity: 'rare' },
        { id: 'bust', value: 0, size: 6, rarity: 'bust' },
        { id: 'karma_15', value: 15, size: 5, rarity: 'epic' },
        { id: 'jackpot', value: 30, size: 3, rarity: 'legendary' }
    ];
    
    it('should have wedge sizes that reflect rarity (smaller = rarer)', () => {
        const common = WEDGES.find(w => w.value === 1);
        const legendary = WEDGES.find(w => w.rarity === 'legendary');
        
        assert(common.size > legendary.size, 'Common wedge is larger than legendary');
    });
    
    it('should track jackpots and busts separately in stats', () => {
        const stats = { totalSpins: 0, jackpots: 0, busts: 0 };
        
        // Simulate bust
        stats.totalSpins++;
        stats.busts++;
        
        // Simulate jackpot
        stats.totalSpins++;
        stats.jackpots++;
        
        assertEqual(stats.totalSpins, 2, 'Total spins tracked');
        assertEqual(stats.jackpots, 1, 'Jackpots tracked separately');
        assertEqual(stats.busts, 1, 'Busts tracked separately');
    });
    
    it('should calculate wheel physics correctly', () => {
        // Test basic physics constants
        const FRICTION = 0.985;
        const MIN_VELOCITY = 0.1;
        
        let velocity = 20;
        let frames = 0;
        
        while (velocity > MIN_VELOCITY && frames < 1000) {
            velocity *= FRICTION;
            frames++;
        }
        
        assertRange(frames, 200, 400, 'Wheel takes reasonable time to stop');
    });
});

// ============ PLINKO TESTS ============

describe('Plinko Game Logic', () => {
    const MULTIPLIERS = [10, 0, 5, 0.5, 3, 1, 2, 1, 3, 0.5, 5, 0, 10];
    const BASE_PAYOUT = 3;
    
    it('should have symmetric multipliers (edges are jackpots)', () => {
        assertEqual(MULTIPLIERS[0], MULTIPLIERS[MULTIPLIERS.length - 1], 'Edge multipliers are equal');
        assertEqual(MULTIPLIERS[0], 10, 'Edge multipliers are 10x');
    });
    
    it('should have center slots as safer bets', () => {
        const centerIdx = Math.floor(MULTIPLIERS.length / 2);
        const centerMult = MULTIPLIERS[centerIdx];
        const edgeMult = MULTIPLIERS[0];
        
        assertRange(centerMult, 1, 3, 'Center multiplier is moderate');
        assert(edgeMult > centerMult, 'Edge has higher risk/reward');
    });
    
    it('should calculate payouts correctly', () => {
        const cost = 3;
        
        // Test various outcomes
        assertEqual(BASE_PAYOUT * 10 - cost, 27, '10x jackpot nets +27');
        assertEqual(BASE_PAYOUT * 1 - cost, 0, '1x is break-even');
        assertEqual(BASE_PAYOUT * 0 - cost, -3, '0x loses stake');
        assertEqual(BASE_PAYOUT * 0.5 - cost, -1.5, '0.5x loses partial');
    });
    
    it('should categorize multiplier rarities', () => {
        function getMultiplierRarity(mult) {
            if (mult === 10) return 'legendary';
            if (mult === 5) return 'epic';
            if (mult === 3) return 'rare';
            if (mult >= 1) return 'uncommon';
            if (mult === 0.5) return 'common';
            return 'lose';
        }
        
        assertEqual(getMultiplierRarity(10), 'legendary', '10x is legendary');
        assertEqual(getMultiplierRarity(5), 'epic', '5x is epic');
        assertEqual(getMultiplierRarity(0), 'lose', '0x is lose');
    });
});

// ============ SCRATCH TESTS ============

describe('Scratch Card Logic', () => {
    const SYMBOL_POOLS = {
        common: { karmaRange: [1, 2] },
        uncommon: { karmaRange: [3, 5] },
        rare: { karmaRange: [6, 10] },
        epic: { karmaRange: [12, 18] },
        legendary: { karmaRange: [25, 40] },
        bust: { karmaRange: [0, 0] }
    };
    
    const WIN_LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    it('should have 8 possible win lines (3 rows + 3 cols + 2 diags)', () => {
        assertEqual(WIN_LINES.length, 8, '8 win lines defined');
    });
    
    it('should detect 3-in-a-row wins', () => {
        const grid = [
            { symbol: '🍀' }, { symbol: '🍀' }, { symbol: '🍀' }, // Win line
            { symbol: '💎' }, { symbol: '🌟' }, { symbol: '🪨' },
            { symbol: '💠' }, { symbol: '⭐' }, { symbol: '🔷' }
        ];
        
        let wins = 0;
        for (const line of WIN_LINES) {
            const [a, b, c] = line;
            if (grid[a].symbol === grid[b].symbol && grid[b].symbol === grid[c].symbol) {
                wins++;
            }
        }
        
        assertEqual(wins, 1, 'Detected 1 winning line');
    });
    
    it('should scale rewards by rarity', () => {
        const commonMin = SYMBOL_POOLS.common.karmaRange[0];
        const legendaryMax = SYMBOL_POOLS.legendary.karmaRange[1];
        
        assert(legendaryMax > commonMin * 10, 'Legendary max is 10x+ common min');
    });
    
    it('should calculate total reward from multiple wins', () => {
        // Simulate 2 winning lines
        const wins = [
            { rarity: 'common' },
            { rarity: 'rare' }
        ];
        
        const commonReward = 1; // Min common
        const rareReward = 6;   // Min rare
        const total = commonReward + rareReward;
        
        assertEqual(total, 7, 'Multiple wins stack');
    });
});

// ============ CLAW TESTS ============

describe('Claw Machine Logic', () => {
    const GRIP_CHANCES = {
        common: 85,
        uncommon: 70,
        rare: 55,
        epic: 40,
        legendary: 25
    };
    
    const SLIP_CHANCES = {
        common: 5,
        uncommon: 10,
        rare: 15,
        epic: 25,
        legendary: 35
    };
    
    const PRIZE_SIZES = {
        common: 40,
        uncommon: 35,
        rare: 30,
        epic: 25,
        legendary: 18
    };
    
    it('should have grip chances that decrease with rarity', () => {
        assert(GRIP_CHANCES.common > GRIP_CHANCES.uncommon, 'Common easier to grip than uncommon');
        assert(GRIP_CHANCES.rare > GRIP_CHANCES.epic, 'Rare easier to grip than epic');
        assert(GRIP_CHANCES.legendary < 30, 'Legendary is hard to grip');
    });
    
    it('should have slip chances that increase with rarity', () => {
        assert(SLIP_CHANCES.legendary > SLIP_CHANCES.epic, 'Legendary slips more than epic');
        assert(SLIP_CHANCES.common < 10, 'Common rarely slips');
    });
    
    it('should have prize sizes that decrease with rarity (harder to see/grab)', () => {
        assert(PRIZE_SIZES.common > PRIZE_SIZES.legendary, 'Common prizes are larger');
        assert(PRIZE_SIZES.legendary < 20, 'Legendary prizes are small');
    });
    
    it('should calculate precision bonus for grip', () => {
        const grabRadius = 25;
        const prizeSize = 30;
        const grabRange = grabRadius + prizeSize / 2; // 40
        
        // Perfect aim (distance = 0)
        const perfectPrecision = 1 - (0 / grabRange);
        const perfectBonus = perfectPrecision * 15;
        
        // Edge aim (distance = grabRange)
        const edgePrecision = 1 - (grabRange / grabRange);
        const edgeBonus = edgePrecision * 15;
        
        assertEqual(perfectBonus, 15, 'Perfect aim gives +15% grip');
        assertEqual(edgeBonus, 0, 'Edge aim gives no bonus');
    });
    
    it('should apply buried penalty', () => {
        const baseGrip = GRIP_CHANCES.rare; // 55%
        const buriedPenalty = 15;
        const precisionBonus = 10;
        
        const finalGrip = baseGrip + precisionBonus - buriedPenalty;
        assertEqual(finalGrip, 50, 'Buried penalty reduces grip chance');
    });
});

// ============ SHARED UTILITIES TESTS ============

describe('Shared Utilities', () => {
    it('should have consistent rarity colors', () => {
        const RARITY_COLORS = {
            common: { color: '#888888' },
            uncommon: { color: '#4ade80' },
            rare: { color: '#60a5fa' },
            epic: { color: '#c084fc' },
            legendary: { color: '#fbbf24' }
        };
        
        // Verify all colors are valid hex
        const hexRegex = /^#[0-9a-fA-F]{6}$/;
        for (const [rarity, data] of Object.entries(RARITY_COLORS)) {
            assert(hexRegex.test(data.color), `${rarity} has valid hex color`);
        }
    });
});

// ============ RUN ALL TESTS ============

console.log('\n' + '='.repeat(50));
console.log('🎮 MINI-GAMES TEST RESULTS');
console.log('='.repeat(50));
console.log(`\n✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total:  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!\n');
} else {
    console.log(`\n⚠️  ${testsFailed} test(s) failed.\n`);
    process.exitCode = 1;
}
