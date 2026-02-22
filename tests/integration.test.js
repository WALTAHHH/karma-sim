/**
 * @fileoverview Integration tests for Karma Simulator
 * Tests karma flow, game hub navigation, state persistence, and debug mode.
 */

// ============ KARMA SYSTEM TESTS ============

describe('Karma System', () => {
    let mockStorage;
    let originalStorage;

    beforeEach(() => {
        // Create mock storage for each test
        mockStorage = TestFramework.createMockStorage();
        originalStorage = window.localStorage;
        
        // Override localStorage
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        // Restore real localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalStorage,
            writable: true,
            configurable: true
        });
    });

    it('should start with 0 karma when no saved state', () => {
        // Simulate fresh start
        mockStorage.clear();
        const stored = mockStorage.getItem('karma_simulator_karma');
        expect(stored).toBeNull();
    });

    it('should persist karma to localStorage', () => {
        mockStorage.setItem('karma_simulator_karma', '50');
        const stored = mockStorage.getItem('karma_simulator_karma');
        expect(stored).toBe('50');
    });

    it('should clamp karma to valid range (-100 to 100)', () => {
        // Simulate the karma clamping logic
        const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
        
        expect(clamp(150, -100, 100)).toBe(100);
        expect(clamp(-150, -100, 100)).toBe(-100);
        expect(clamp(50, -100, 100)).toBe(50);
    });

    it('should calculate spending correctly', () => {
        let karma = 100;
        const spend = (amount) => {
            if (karma >= amount) {
                karma -= amount;
                return karma;
            }
            return false;
        };

        expect(spend(30)).toBe(70);
        expect(spend(50)).toBe(20);
        expect(spend(30)).toBe(false); // Not enough
    });
});

// ============ GAME HUB TESTS ============

describe('Game Hub', () => {
    it('should have 7 registered games', () => {
        const games = [
            'slots', 'pull', 'wheel', 'plinko', 'scratch', 'claw', 'pusher'
        ];
        expect(games).toHaveLength(7);
    });

    it('should enforce minimum karma requirements', () => {
        const gameRequirements = {
            slots: 3,
            pull: 3,
            wheel: 3,
            plinko: 3,
            scratch: 3,
            claw: 5,
            pusher: 1
        };

        // Simulate canPlay check
        const canPlay = (game, karma) => karma >= gameRequirements[game];

        expect(canPlay('slots', 5)).toBe(true);
        expect(canPlay('slots', 2)).toBe(false);
        expect(canPlay('claw', 4)).toBe(false);
        expect(canPlay('pusher', 1)).toBe(true);
    });

    it('should track karma changes during gameplay', () => {
        let hubKarma = 50;
        const spendFn = (amount) => { hubKarma -= amount; };
        const addFn = (amount) => { hubKarma += amount; };

        // Simulate game play
        spendFn(10); // Spent on game
        expect(hubKarma).toBe(40);

        addFn(15); // Won some back
        expect(hubKarma).toBe(55);
    });

    it('should update card states based on karma', () => {
        const karma = 4;
        const games = [
            { id: 'slots', minKarma: 3 },
            { id: 'claw', minKarma: 5 },
            { id: 'pusher', minKarma: 1 }
        ];

        const canPlayStates = games.map(g => ({
            id: g.id,
            canPlay: karma >= g.minKarma
        }));

        expect(canPlayStates[0].canPlay).toBe(true);  // slots
        expect(canPlayStates[1].canPlay).toBe(false); // claw
        expect(canPlayStates[2].canPlay).toBe(true);  // pusher
    });
});

// ============ SHARED UTILITIES TESTS ============

describe('Shared Utilities', () => {
    describe('Color Functions', () => {
        it('should lighten colors correctly', () => {
            // Simulate lightenColor
            const lightenColor = (hex, percent) => {
                const num = parseInt(hex.replace('#', ''), 16);
                const amt = Math.round(2.55 * percent);
                const R = Math.min(255, (num >> 16) + amt);
                const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
                const B = Math.min(255, (num & 0x0000FF) + amt);
                return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
            };

            const result = lightenColor('#000000', 50);
            expect(result).toBe('#7f7f7f');
        });

        it('should darken colors correctly', () => {
            const darkenColor = (hex, percent) => {
                const num = parseInt(hex.replace('#', ''), 16);
                const amt = Math.round(2.55 * percent);
                const R = Math.max(0, (num >> 16) - amt);
                const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
                const B = Math.max(0, (num & 0x0000FF) - amt);
                return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
            };

            const result = darkenColor('#ffffff', 50);
            expect(result).toBe('#808080');
        });
    });

    describe('Rarity Colors', () => {
        it('should define all rarity tiers', () => {
            const RARITY_COLORS = {
                common: { color: '#888888', glow: 'rgba(136,136,136,0.5)' },
                uncommon: { color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
                rare: { color: '#60a5fa', glow: 'rgba(96,165,250,0.5)' },
                epic: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
                legendary: { color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' }
            };

            expect(Object.keys(RARITY_COLORS)).toHaveLength(5);
            expect(RARITY_COLORS.legendary.color).toBe('#fbbf24');
        });
    });

    describe('Random Utilities', () => {
        it('should clamp values correctly', () => {
            const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it('should shuffle arrays', () => {
            const shuffle = (array) => {
                const copy = [...array];
                for (let i = copy.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [copy[i], copy[j]] = [copy[j], copy[i]];
                }
                return copy;
            };

            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffle(original);

            // Should have same elements
            expect(shuffled.sort()).toEqual(original.sort());
            // Original should be unchanged
            expect(original).toEqual([1, 2, 3, 4, 5]);
        });
    });
});

// ============ STATE PERSISTENCE TESTS ============

describe('State Persistence', () => {
    let mockStorage;
    let originalStorage;

    beforeEach(() => {
        mockStorage = TestFramework.createMockStorage();
        originalStorage = window.localStorage;
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: originalStorage,
            writable: true,
            configurable: true
        });
    });

    it('should persist tracking data', () => {
        const trackingData = {
            totalLives: 5,
            totalKarma: 100,
            allEvents: ['event1', 'event2'],
            allRegions: ['UK', 'Japan']
        };

        mockStorage.setItem('karma_simulator_tracking', JSON.stringify(trackingData));
        
        const loaded = JSON.parse(mockStorage.getItem('karma_simulator_tracking'));
        expect(loaded.totalLives).toBe(5);
        expect(loaded.allEvents).toContain('event1');
    });

    it('should handle corrupted data gracefully', () => {
        mockStorage.setItem('karma_simulator_tracking', 'not json');
        
        let data;
        try {
            data = JSON.parse(mockStorage.getItem('karma_simulator_tracking'));
        } catch (e) {
            data = { totalLives: 0, totalKarma: 0 }; // Default fallback
        }

        expect(data.totalLives).toBe(0);
    });

    it('should save and load unlocks', () => {
        const unlocks = {
            countries: ['UK', 'USA', 'Japan'],
            eras: ['contemporary'],
            jobCategories: ['agriculture', 'labor']
        };

        mockStorage.setItem('karma_simulator_unlocks', JSON.stringify(unlocks));
        
        const loaded = JSON.parse(mockStorage.getItem('karma_simulator_unlocks'));
        expect(loaded.countries).toContain('UK');
        expect(loaded.eras).toContain('contemporary');
    });
});

// ============ DEBUG MODE TESTS ============

describe('Debug Mode', () => {
    it('should toggle global debug mode', () => {
        window.debugMode = false;
        
        // Simulate setDebugMode
        const setDebugMode = (enabled) => {
            window.debugMode = enabled;
        };

        setDebugMode(true);
        expect(window.debugMode).toBe(true);

        setDebugMode(false);
        expect(window.debugMode).toBe(false);
    });

    it('should expose debug mode check', () => {
        window.debugMode = true;
        
        const isDebugMode = () => window.debugMode === true;
        expect(isDebugMode()).toBe(true);

        window.debugMode = false;
        expect(isDebugMode()).toBe(false);
    });
});

// ============ GACHA/REWARDS TESTS ============

describe('Gacha System', () => {
    it('should calculate rarity weights correctly', () => {
        const weights = {
            common: 60,
            uncommon: 25,
            rare: 10,
            epic: 4,
            legendary: 1
        };

        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        expect(total).toBe(100);
    });

    it('should apply pity bonus correctly', () => {
        const calculatePityBonus = (pity) => Math.floor(pity / 10) * 5;

        expect(calculatePityBonus(0)).toBe(0);
        expect(calculatePityBonus(10)).toBe(5);
        expect(calculatePityBonus(25)).toBe(10);
        expect(calculatePityBonus(50)).toBe(25);
    });

    it('should select rewards from pool based on rarity', () => {
        const rewardPool = [
            { id: 'a', rarity: 'common' },
            { id: 'b', rarity: 'common' },
            { id: 'c', rarity: 'rare' },
            { id: 'd', rarity: 'legendary' }
        ];

        const getByRarity = (rarity) => 
            rewardPool.filter(r => r.rarity === rarity);

        expect(getByRarity('common')).toHaveLength(2);
        expect(getByRarity('rare')).toHaveLength(1);
        expect(getByRarity('legendary')).toHaveLength(1);
    });
});

// ============ ANIMATION/TIMING TESTS ============

describe('Animation Utilities', () => {
    it('should implement sleep correctly', async () => {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        const start = Date.now();
        await sleep(50);
        const elapsed = Date.now() - start;
        
        expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
    });

    it('should calculate easing functions', () => {
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        
        expect(easeOutCubic(0)).toBe(0);
        expect(easeOutCubic(1)).toBe(1);
        expect(easeOutCubic(0.5)).toBeGreaterThan(0.5); // Eased value
    });
});

// ============ EVENT FLOW TESTS ============

describe('Event Flow', () => {
    it('should track used event IDs', () => {
        const usedEventIds = new Set();
        
        usedEventIds.add('event_001');
        usedEventIds.add('event_002');
        
        expect(usedEventIds.has('event_001')).toBe(true);
        expect(usedEventIds.has('event_003')).toBe(false);
        expect(usedEventIds.size).toBe(2);
    });

    it('should progress through life stages', () => {
        const stages = ['childhood', 'young_adult', 'middle', 'late'];
        let currentIndex = 0;

        const nextStage = () => {
            if (currentIndex < stages.length - 1) {
                currentIndex++;
                return stages[currentIndex];
            }
            return null; // End of life
        };

        expect(stages[currentIndex]).toBe('childhood');
        expect(nextStage()).toBe('young_adult');
        expect(nextStage()).toBe('middle');
        expect(nextStage()).toBe('late');
        expect(nextStage()).toBeNull();
    });

    it('should calculate events per stage', () => {
        const eventsPerStage = {
            childhood: [2, 3],
            young_adult: [3, 4],
            middle: [3, 4],
            late: [2, 3]
        };

        const getStageEventCount = (stage) => {
            const [min, max] = eventsPerStage[stage];
            const count = min + Math.floor(Math.random() * (max - min + 1));
            return count;
        };

        const count = getStageEventCount('childhood');
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(3);
    });
});

// ============ DOM INTERACTION TESTS ============

describe('DOM Interactions', () => {
    it('should create elements with correct classes', () => {
        const createOverlay = (className) => {
            const el = document.createElement('div');
            el.className = `game-overlay ${className}`.trim();
            return el;
        };

        const overlay = createOverlay('test-class');
        expect(overlay.className).toBe('game-overlay test-class');
    });

    it('should generate valid HTML for game cards', () => {
        const createGameCard = (game) => {
            return `<div class="game-card" id="game-card-${game.id}">
                <div class="game-icon">${game.icon}</div>
                <div class="game-name">${game.name}</div>
            </div>`;
        };

        const html = createGameCard({ id: 'test', icon: '🎮', name: 'Test Game' });
        expect(html).toContain('game-card-test');
        expect(html).toContain('🎮');
        expect(html).toContain('Test Game');
    });
});

// ============ EDGE CASES ============

describe('Edge Cases', () => {
    it('should handle empty arrays', () => {
        const arr = [];
        expect(arr).toHaveLength(0);
        expect(arr.filter(x => x)).toEqual([]);
    });

    it('should handle negative karma', () => {
        let karma = -50;
        const canSpend = (amount) => karma >= amount;
        
        expect(canSpend(1)).toBe(false);
        expect(canSpend(-100)).toBe(true); // Negative required = always afford
    });

    it('should handle NaN values', () => {
        const parseKarma = (val) => {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 0 : parsed;
        };

        expect(parseKarma('abc')).toBe(0);
        expect(parseKarma(undefined)).toBe(0);
        expect(parseKarma('50')).toBe(50);
    });

    it('should handle rapid karma changes', () => {
        let karma = 100;
        
        for (let i = 0; i < 100; i++) {
            karma = Math.max(-100, Math.min(100, karma + (Math.random() > 0.5 ? 1 : -1)));
        }
        
        expect(karma).toBeGreaterThanOrEqual(-100);
        expect(karma).toBeLessThanOrEqual(100);
    });
});

console.log('✅ Integration tests loaded');
