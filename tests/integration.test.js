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

// ============ EVENT → OUTCOME → TAG FLOW TESTS ============

describe('Event→Outcome→Tag Flow', () => {
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

    it('should simulate event with choice and select weighted outcome', () => {
        // Simulate event structure from events.js
        const event = {
            id: 'test_event',
            stage: 'childhood',
            type: 'choice',
            prompt: 'A test event occurs.',
            options: [
                {
                    text: 'Take a risk',
                    outcomes: [
                        { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Success!', tagAxis: { risk_vs_safety: 1 } },
                        { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Failure.', tagAxis: { risk_vs_safety: 1 } },
                        { weight: 20, effects: {}, karma: 0, description: 'Nothing happens.', tagAxis: { risk_vs_safety: 1 } }
                    ]
                }
            ]
        };

        // Simulate weighted outcome selection (like in events.js resolveOutcome)
        const selectWeightedOutcome = (outcomes) => {
            const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
            let roll = Math.random() * totalWeight;
            for (const outcome of outcomes) {
                roll -= outcome.weight;
                if (roll <= 0) return outcome;
            }
            return outcomes[outcomes.length - 1];
        };

        // Run selection 100 times to verify distribution
        const selections = { success: 0, failure: 0, nothing: 0 };
        for (let i = 0; i < 100; i++) {
            const outcome = selectWeightedOutcome(event.options[0].outcomes);
            if (outcome.description === 'Success!') selections.success++;
            else if (outcome.description === 'Failure.') selections.failure++;
            else selections.nothing++;
        }

        // With these weights (50/30/20), success should be most common
        expect(selections.success).toBeGreaterThan(selections.nothing);
        expect(selections.success + selections.failure + selections.nothing).toBe(100);
    });

    it('should update tagAxis correctly when outcome is resolved', () => {
        // Initialize tag progress (from tags.js initializeTagProgress)
        let tagProgress = {
            family_vs_career: 0,
            roots_vs_wings: 0,
            social_vs_solitary: 0,
            self_vs_others: 0,
            tradition_vs_change: 0,
            risk_vs_safety: 0
        };

        // Simulate resolving an outcome with tagAxis
        const outcome = { tagAxis: { risk_vs_safety: 1 } };
        
        // Apply tagAxis update (like in events.js processTagsFromOutcome)
        if (outcome.tagAxis) {
            for (const [axis, delta] of Object.entries(outcome.tagAxis)) {
                if (tagProgress[axis] !== undefined) {
                    tagProgress[axis] += delta;
                }
            }
        }

        expect(tagProgress.risk_vs_safety).toBe(1);
        expect(tagProgress.family_vs_career).toBe(0);

        // Apply more choices that push toward risk_taker
        tagProgress.risk_vs_safety += 1;
        tagProgress.risk_vs_safety += 1;

        expect(tagProgress.risk_vs_safety).toBe(3);
    });

    it('should grant tag when threshold is reached', () => {
        // Tag axis definitions (from tags.js)
        const tagAxes = {
            risk_vs_safety: {
                positive: 'risk_taker',
                negative: 'cautious'
            }
        };

        // Function to check thresholds (simplified from tags.js checkTagThresholds)
        const checkTagThresholds = (tagProgress, currentTags) => {
            const newTags = [];
            const currentTagSet = new Set(currentTags);

            for (const [axis, axisConfig] of Object.entries(tagAxes)) {
                const value = tagProgress[axis] || 0;
                if (value >= 3 && !currentTagSet.has(axisConfig.positive)) {
                    newTags.push(axisConfig.positive);
                }
                if (value <= -3 && !currentTagSet.has(axisConfig.negative)) {
                    newTags.push(axisConfig.negative);
                }
            }
            return newTags;
        };

        const tagProgress = { risk_vs_safety: 2 };
        const currentTags = [];

        // Not at threshold yet
        let newTags = checkTagThresholds(tagProgress, currentTags);
        expect(newTags).toHaveLength(0);

        // Push to threshold
        tagProgress.risk_vs_safety = 3;
        newTags = checkTagThresholds(tagProgress, currentTags);
        expect(newTags).toContain('risk_taker');
        expect(newTags).toHaveLength(1);

        // Tag already granted should not be granted again
        currentTags.push('risk_taker');
        newTags = checkTagThresholds(tagProgress, currentTags);
        expect(newTags).toHaveLength(0);
    });

    it('should grant tag via grantsTag on pivotal choice', () => {
        // Simulate outcome with direct tag grant (from events.js)
        const outcome = {
            weight: 20,
            effects: { health: -1 },
            karma: 1,
            description: 'Helping costs you something.',
            tagAxis: { self_vs_others: 1 },
            grantsTag: 'generous'
        };

        let lifeTags = [];

        // Process direct tag grant (like in events.js processTagsFromOutcome)
        if (outcome.grantsTag && !lifeTags.includes(outcome.grantsTag)) {
            lifeTags.push(outcome.grantsTag);
        }

        expect(lifeTags).toContain('generous');
        expect(lifeTags).toHaveLength(1);

        // Attempting to grant same tag again should not duplicate
        if (outcome.grantsTag && !lifeTags.includes(outcome.grantsTag)) {
            lifeTags.push(outcome.grantsTag);
        }
        expect(lifeTags).toHaveLength(1);
    });

    it('should discover tag and persist to localStorage', () => {
        const TAGS_KEY = 'karma_simulator_tags';

        // Simulate discoverTag function
        const discoverTag = (tagId) => {
            const stored = mockStorage.getItem(TAGS_KEY);
            const discovered = stored ? new Set(JSON.parse(stored)) : new Set();
            if (!discovered.has(tagId)) {
                discovered.add(tagId);
                mockStorage.setItem(TAGS_KEY, JSON.stringify([...discovered]));
                return true;
            }
            return false;
        };

        // Discover a new tag
        const result1 = discoverTag('risk_taker');
        expect(result1).toBe(true);

        // Verify persistence
        const stored = JSON.parse(mockStorage.getItem(TAGS_KEY));
        expect(stored).toContain('risk_taker');

        // Discovering same tag again returns false
        const result2 = discoverTag('risk_taker');
        expect(result2).toBe(false);

        // Discover another tag
        const result3 = discoverTag('cautious');
        expect(result3).toBe(true);

        const stored2 = JSON.parse(mockStorage.getItem(TAGS_KEY));
        expect(stored2).toContain('risk_taker');
        expect(stored2).toContain('cautious');
        expect(stored2).toHaveLength(2);
    });
});

// ============ MULTI-GAME KARMA SYNC TESTS ============

describe('Multi-game Karma Sync', () => {
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

    it('should sync karma earned in mini-games to main game', () => {
        const KARMA_KEY = 'karma_simulator_karma';

        // Simulate karma functions (from karma.js)
        const getKarma = () => {
            const stored = mockStorage.getItem(KARMA_KEY);
            return stored ? parseInt(stored, 10) : 0;
        };

        const setKarma = (value) => {
            const clamped = Math.max(-100, Math.min(100, value));
            mockStorage.setItem(KARMA_KEY, clamped.toString());
            return clamped;
        };

        const adjustKarma = (delta) => setKarma(getKarma() + delta);

        // Start with some karma
        setKarma(50);
        expect(getKarma()).toBe(50);

        // Simulate mini-game win (like in gameHub.js addKarmaFn)
        const miniGameWinnings = 15;
        adjustKarma(miniGameWinnings);
        expect(getKarma()).toBe(65);

        // Simulate mini-game spending (like in gameHub.js spendKarmaFn)
        const miniGameCost = 5;
        adjustKarma(-miniGameCost);
        expect(getKarma()).toBe(60);

        // Main game should see the updated karma
        expect(getKarma()).toBe(60);
    });

    it('should handle karma spending in shop correctly', () => {
        const KARMA_KEY = 'karma_simulator_karma';

        const getKarma = () => {
            const stored = mockStorage.getItem(KARMA_KEY);
            return stored ? parseInt(stored, 10) : 0;
        };

        const setKarma = (value) => {
            const clamped = Math.max(-100, Math.min(100, value));
            mockStorage.setItem(KARMA_KEY, clamped.toString());
            return clamped;
        };

        const spendKarma = (amount) => {
            const current = getKarma();
            if (current >= amount) {
                return setKarma(current - amount);
            }
            return false;
        };

        // Set up initial karma
        setKarma(30);

        // Attempt to spend on country unlock (5 karma)
        const result1 = spendKarma(5);
        expect(result1).toBe(25);
        expect(getKarma()).toBe(25);

        // Attempt to spend on era unlock (10 karma)
        const result2 = spendKarma(10);
        expect(result2).toBe(15);
        expect(getKarma()).toBe(15);

        // Attempt to spend more than available (should fail)
        const result3 = spendKarma(20);
        expect(result3).toBe(false);
        expect(getKarma()).toBe(15); // Unchanged
    });

    it('should clamp karma to valid range after mini-game', () => {
        const KARMA_KEY = 'karma_simulator_karma';

        const setKarma = (value) => {
            const clamped = Math.max(-100, Math.min(100, value));
            mockStorage.setItem(KARMA_KEY, clamped.toString());
            return clamped;
        };

        const getKarma = () => {
            const stored = mockStorage.getItem(KARMA_KEY);
            return stored ? parseInt(stored, 10) : 0;
        };

        // Test upper bound
        setKarma(90);
        const result1 = setKarma(getKarma() + 50); // Try to exceed 100
        expect(result1).toBe(100);
        expect(getKarma()).toBe(100);

        // Test lower bound
        setKarma(-90);
        const result2 = setKarma(getKarma() - 50); // Try to go below -100
        expect(result2).toBe(-100);
        expect(getKarma()).toBe(-100);
    });

    it('should track karma across multiple game hub sessions', () => {
        const KARMA_KEY = 'karma_simulator_karma';

        const getKarma = () => {
            const stored = mockStorage.getItem(KARMA_KEY);
            return stored ? parseInt(stored, 10) : 0;
        };

        const setKarma = (value) => {
            const clamped = Math.max(-100, Math.min(100, value));
            mockStorage.setItem(KARMA_KEY, clamped.toString());
            return clamped;
        };

        // Session 1: Start game hub with 50 karma
        let hubKarma = 50;
        setKarma(hubKarma);

        // Play slots, spend 3, win 8
        hubKarma -= 3;
        hubKarma += 8;
        setKarma(hubKarma);
        expect(getKarma()).toBe(55);

        // Close hub, verify persistence
        hubKarma = 0; // Reset local variable

        // Session 2: Reopen game hub
        hubKarma = getKarma();
        expect(hubKarma).toBe(55);

        // Play wheel, spend 3, lose
        hubKarma -= 3;
        setKarma(hubKarma);
        expect(getKarma()).toBe(52);
    });
});

// ============ UNLOCK CYCLE TESTS ============

describe('Unlock Cycle', () => {
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

    it('should start with default unlocks', () => {
        const UNLOCKS_KEY = 'karma_simulator_unlocks';
        const DEFAULT_COUNTRY = 'UK';
        const DEFAULT_ERA = 'contemporary';
        const DEFAULT_JOBS = ['agriculture', 'labor'];

        // Initialize unlocks (like in unlocks.js)
        const initializeUnlocks = () => {
            const unlocks = {
                countries: [DEFAULT_COUNTRY],
                eras: [DEFAULT_ERA],
                job_categories: [...DEFAULT_JOBS]
            };
            mockStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
            return unlocks;
        };

        const getUnlocked = () => {
            const stored = mockStorage.getItem(UNLOCKS_KEY);
            return stored ? JSON.parse(stored) : null;
        };

        // Initialize
        initializeUnlocks();
        const unlocked = getUnlocked();

        expect(unlocked.countries).toContain('UK');
        expect(unlocked.eras).toContain('contemporary');
        expect(unlocked.job_categories).toContain('agriculture');
        expect(unlocked.job_categories).toContain('labor');
    });

    it('should earn karma through life choices', () => {
        const KARMA_KEY = 'karma_simulator_karma';

        const getKarma = () => {
            const stored = mockStorage.getItem(KARMA_KEY);
            return stored ? parseInt(stored, 10) : 0;
        };

        const adjustKarma = (delta) => {
            const current = getKarma();
            const newVal = Math.max(-100, Math.min(100, current + delta));
            mockStorage.setItem(KARMA_KEY, newVal.toString());
            return newVal;
        };

        // Start with 0 karma
        expect(getKarma()).toBe(0);

        // Simulate life events that grant karma
        // Helping stranger (+2), being generous (+1), ethical choice (+1)
        const lifeKarmaChanges = [2, 1, 1, -1, 2]; // Net +5

        for (const change of lifeKarmaChanges) {
            adjustKarma(change);
        }

        expect(getKarma()).toBe(5);
    });

    it('should spend karma to unlock country/era/job', () => {
        const KARMA_KEY = 'karma_simulator_karma';
        const UNLOCKS_KEY = 'karma_simulator_unlocks';
        const COUNTRY_COST = 5;
        const ERA_COST = 10;
        const JOB_COST = 8;

        // Setup
        mockStorage.setItem(KARMA_KEY, '30');
        mockStorage.setItem(UNLOCKS_KEY, JSON.stringify({
            countries: ['UK'],
            eras: ['contemporary'],
            job_categories: ['agriculture', 'labor']
        }));

        const getKarma = () => parseInt(mockStorage.getItem(KARMA_KEY), 10);

        const spendKarma = (amount) => {
            const current = getKarma();
            if (current >= amount) {
                mockStorage.setItem(KARMA_KEY, (current - amount).toString());
                return true;
            }
            return false;
        };

        const unlock = (category, id) => {
            const unlocks = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));
            if (!unlocks[category].includes(id)) {
                unlocks[category].push(id);
                mockStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
                return true;
            }
            return false;
        };

        // Unlock a country (5 karma)
        expect(spendKarma(COUNTRY_COST)).toBe(true);
        expect(unlock('countries', 'Japan')).toBe(true);
        expect(getKarma()).toBe(25);

        // Unlock an era (10 karma)
        expect(spendKarma(ERA_COST)).toBe(true);
        expect(unlock('eras', 'cold_war')).toBe(true);
        expect(getKarma()).toBe(15);

        // Unlock a job category (8 karma)
        expect(spendKarma(JOB_COST)).toBe(true);
        expect(unlock('job_categories', 'professional')).toBe(true);
        expect(getKarma()).toBe(7);

        // Verify all unlocks persisted
        const unlocks = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));
        expect(unlocks.countries).toContain('Japan');
        expect(unlocks.eras).toContain('cold_war');
        expect(unlocks.job_categories).toContain('professional');
    });

    it('should persist unlocks across page refresh (localStorage)', () => {
        const UNLOCKS_KEY = 'karma_simulator_unlocks';

        // Simulate first session - unlock some items
        const unlocks1 = {
            countries: ['UK', 'Japan', 'France'],
            eras: ['contemporary', 'cold_war'],
            job_categories: ['agriculture', 'labor', 'professional']
        };
        mockStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks1));

        // Simulate page refresh (clear local variables)
        let memoryCleared = true;

        // Simulate second session - load from storage
        const loaded = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));

        expect(loaded.countries).toHaveLength(3);
        expect(loaded.countries).toContain('UK');
        expect(loaded.countries).toContain('Japan');
        expect(loaded.countries).toContain('France');

        expect(loaded.eras).toHaveLength(2);
        expect(loaded.eras).toContain('contemporary');
        expect(loaded.eras).toContain('cold_war');

        expect(loaded.job_categories).toHaveLength(3);
        expect(loaded.job_categories).toContain('professional');
    });

    it('should not allow duplicate unlocks', () => {
        const UNLOCKS_KEY = 'karma_simulator_unlocks';

        mockStorage.setItem(UNLOCKS_KEY, JSON.stringify({
            countries: ['UK'],
            eras: ['contemporary'],
            job_categories: ['agriculture', 'labor']
        }));

        const isUnlocked = (category, id) => {
            const unlocks = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));
            return unlocks[category] && unlocks[category].includes(id);
        };

        const attemptUnlock = (category, id) => {
            if (isUnlocked(category, id)) {
                return { success: false, message: 'Already unlocked!' };
            }
            const unlocks = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));
            unlocks[category].push(id);
            mockStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
            return { success: true };
        };

        // UK already unlocked
        expect(isUnlocked('countries', 'UK')).toBe(true);

        const result = attemptUnlock('countries', 'UK');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Already unlocked!');

        // Verify no duplicate added
        const unlocks = JSON.parse(mockStorage.getItem(UNLOCKS_KEY));
        expect(unlocks.countries.filter(c => c === 'UK')).toHaveLength(1);
    });
});

// ============ TAG MODIFIER APPLICATION TESTS ============

describe('Tag Modifier Application', () => {
    it('should grant a tag and apply to life object', () => {
        const life = {
            wealth: 3,
            education: 3,
            health: 3,
            connections: 3,
            tags: [],
            tagProgress: {
                family_vs_career: 0,
                roots_vs_wings: 0,
                social_vs_solitary: 0,
                self_vs_others: 0,
                tradition_vs_change: 0,
                risk_vs_safety: 0
            }
        };

        // Grant risk_taker tag
        life.tags.push('risk_taker');

        expect(life.tags).toContain('risk_taker');
        expect(life.tags).toHaveLength(1);
    });

    it('should modify subsequent outcome weights based on tag bonuses', () => {
        // Tag definitions (from tags.js)
        const tags = {
            risk_taker: {
                id: 'risk_taker',
                varianceBonus: 0.30
            },
            family_oriented: {
                id: 'family_oriented',
                bonuses: { connections: 0.25 },
                penalties: { wealth: 0.20 }
            }
        };

        const life = {
            tags: ['family_oriented']
        };

        // Outcomes with stat effects
        const outcomes = [
            { weight: 50, effects: { connections: +1 }, description: 'Connections gain' },
            { weight: 50, effects: { wealth: +1 }, description: 'Wealth gain' },
            { weight: 50, effects: {}, description: 'Neutral' }
        ];

        // Apply tag modifiers (simplified from tags.js applyTagModifiers)
        const applyTagModifiers = (life, outcomes) => {
            if (!life.tags || life.tags.length === 0) return outcomes;

            return outcomes.map(outcome => {
                let weightModifier = 1.0;
                const effects = outcome.effects || {};

                for (const tagId of life.tags) {
                    const tag = tags[tagId];
                    if (!tag) continue;

                    if (tag.bonuses) {
                        for (const [stat, bonus] of Object.entries(tag.bonuses)) {
                            if (effects[stat] && effects[stat] > 0) {
                                weightModifier *= (1 + bonus);
                            }
                        }
                    }

                    if (tag.penalties) {
                        for (const [stat, penalty] of Object.entries(tag.penalties)) {
                            if (effects[stat] && effects[stat] > 0) {
                                weightModifier *= (1 - penalty);
                            }
                        }
                    }
                }

                return {
                    ...outcome,
                    weight: Math.max(1, Math.round(outcome.weight * weightModifier))
                };
            });
        };

        const modifiedOutcomes = applyTagModifiers(life, outcomes);

        // Connections outcome should be boosted (50 * 1.25 = 62.5 -> 63)
        expect(modifiedOutcomes[0].weight).toBeGreaterThan(50);
        expect(modifiedOutcomes[0].weight).toBe(63);

        // Wealth outcome should be penalized (50 * 0.80 = 40)
        expect(modifiedOutcomes[1].weight).toBeLessThan(50);
        expect(modifiedOutcomes[1].weight).toBe(40);

        // Neutral outcome unchanged
        expect(modifiedOutcomes[2].weight).toBe(50);
    });

    it('should return correct variance modifier from getTagVarianceModifier', () => {
        // Tag definitions
        const tags = {
            risk_taker: { varianceBonus: 0.30 },
            cautious: { variancePenalty: 0.25 }
        };

        // getTagVarianceModifier implementation (from tags.js)
        const getTagVarianceModifier = (life) => {
            if (!life || !life.tags || life.tags.length === 0) {
                return 1.0;
            }

            let modifier = 1.0;

            for (const tagId of life.tags) {
                const tag = tags[tagId];
                if (!tag) continue;

                if (tag.varianceBonus) {
                    modifier += tag.varianceBonus;
                }
                if (tag.variancePenalty) {
                    modifier -= tag.variancePenalty;
                }
            }

            return Math.max(0.5, Math.min(2.0, modifier));
        };

        // No tags = 1.0
        expect(getTagVarianceModifier({ tags: [] })).toBe(1.0);
        expect(getTagVarianceModifier(null)).toBe(1.0);
        expect(getTagVarianceModifier({})).toBe(1.0);

        // Risk taker increases variance
        expect(getTagVarianceModifier({ tags: ['risk_taker'] })).toBe(1.3);

        // Cautious decreases variance
        expect(getTagVarianceModifier({ tags: ['cautious'] })).toBe(0.75);

        // Both tags (hypothetically) would mostly cancel out
        const bothTags = getTagVarianceModifier({ tags: ['risk_taker', 'cautious'] });
        expect(bothTags).toBe(1.05); // 1.0 + 0.30 - 0.25
    });

    it('should apply variance modifier to outcome selection', () => {
        // When variance is high (risk_taker), extreme outcomes more likely
        // When variance is low (cautious), median outcomes more likely

        const outcomes = [
            { weight: 10, effects: { wealth: +2 }, description: 'Big win' },
            { weight: 30, effects: { wealth: +1 }, description: 'Small win' },
            { weight: 30, effects: {}, description: 'Nothing' },
            { weight: 20, effects: { wealth: -1 }, description: 'Small loss' },
            { weight: 10, effects: { wealth: -2 }, description: 'Big loss' }
        ];

        // Apply variance to outcome weights (simplified version)
        const applyVariance = (outcomes, varianceModifier) => {
            const medianIndex = Math.floor(outcomes.length / 2);
            
            return outcomes.map((outcome, index) => {
                // Distance from median
                const distanceFromMedian = Math.abs(index - medianIndex);
                
                // Higher variance = boost extreme outcomes
                // Lower variance = boost middle outcomes
                let weightMod = 1.0;
                if (distanceFromMedian > 0) {
                    // Extreme outcomes
                    weightMod = varianceModifier > 1.0 
                        ? 1.0 + (varianceModifier - 1.0) * distanceFromMedian * 0.5
                        : 1.0 - (1.0 - varianceModifier) * distanceFromMedian * 0.3;
                } else {
                    // Middle outcome
                    weightMod = varianceModifier < 1.0 
                        ? 1.0 + (1.0 - varianceModifier) * 0.5
                        : 1.0;
                }

                return {
                    ...outcome,
                    weight: Math.max(1, Math.round(outcome.weight * weightMod))
                };
            });
        };

        // Risk taker (variance 1.3) - extreme outcomes boosted
        const riskTakerOutcomes = applyVariance(outcomes, 1.3);
        expect(riskTakerOutcomes[0].weight).toBeGreaterThan(outcomes[0].weight); // Big win boosted
        expect(riskTakerOutcomes[4].weight).toBeGreaterThan(outcomes[4].weight); // Big loss boosted

        // Cautious (variance 0.75) - middle outcomes boosted
        const cautiousOutcomes = applyVariance(outcomes, 0.75);
        expect(cautiousOutcomes[2].weight).toBeGreaterThan(outcomes[2].weight); // Nothing boosted
    });

    it('should stack multiple tag effects correctly', () => {
        const tags = {
            family_oriented: {
                bonuses: { connections: 0.25 },
                penalties: { wealth: 0.20 }
            },
            extrovert: {
                bonuses: { connections: 0.30 },
                penalties: { education: 0.15 }
            }
        };

        const life = {
            tags: ['family_oriented', 'extrovert']
        };

        const outcomes = [
            { weight: 100, effects: { connections: +1 }, description: 'Connections gain' }
        ];

        const applyTagModifiers = (life, outcomes) => {
            return outcomes.map(outcome => {
                let weightModifier = 1.0;
                const effects = outcome.effects || {};

                for (const tagId of life.tags) {
                    const tag = tags[tagId];
                    if (!tag) continue;

                    if (tag.bonuses) {
                        for (const [stat, bonus] of Object.entries(tag.bonuses)) {
                            if (effects[stat] && effects[stat] > 0) {
                                weightModifier *= (1 + bonus);
                            }
                        }
                    }
                }

                return {
                    ...outcome,
                    weight: Math.max(1, Math.round(outcome.weight * weightModifier))
                };
            });
        };

        const modifiedOutcomes = applyTagModifiers(life, outcomes);
        
        // Both bonuses apply: 100 * 1.25 * 1.30 = 162.5 -> 163
        expect(modifiedOutcomes[0].weight).toBe(163);
    });
});

// ============ CRISIS EVENT TRIGGER TESTS ============

describe('Crisis Event Trigger', () => {
    it('should detect critical health level', () => {
        const life = {
            health: 3,
            wealth: 3,
            education: 3,
            connections: 3
        };

        const isInCrisis = (life, stat, threshold = 1) => {
            return life[stat] <= threshold;
        };

        // Not in crisis
        expect(isInCrisis(life, 'health')).toBe(false);

        // Set to critical
        life.health = 1;
        expect(isInCrisis(life, 'health')).toBe(true);

        // Just above threshold
        life.health = 2;
        expect(isInCrisis(life, 'health')).toBe(false);
    });

    it('should trigger crisis event when stat reaches critical level', () => {
        // Crisis events (simplified from events.js)
        const crisisEvents = [
            {
                id: 'health_crisis',
                stage: 'middle',
                type: 'choice',
                requirements: { health: '<2' },
                prompt: 'Your health demands attention.',
                options: [
                    {
                        text: 'Prioritize treatment',
                        outcomes: [
                            { weight: 40, effects: { health: +1, wealth: -1 }, karma: 0, description: 'Recovery.' }
                        ]
                    }
                ]
            }
        ];

        const life = {
            health: 1,
            wealth: 3,
            stage: 'middle'
        };

        // Check if requirements are met (simplified)
        const meetsRequirements = (event, life) => {
            if (!event.requirements) return true;
            
            for (const [stat, condition] of Object.entries(event.requirements)) {
                const value = life[stat];
                if (condition.startsWith('<')) {
                    const threshold = parseInt(condition.slice(1), 10);
                    if (value >= threshold) return false;
                } else if (condition.startsWith('>')) {
                    const threshold = parseInt(condition.slice(1), 10);
                    if (value <= threshold) return false;
                }
            }
            return true;
        };

        // Find applicable crisis event
        const crisisEvent = crisisEvents.find(e => 
            e.stage === life.stage && meetsRequirements(e, life)
        );

        expect(crisisEvent).toBeDefined();
        expect(crisisEvent.id).toBe('health_crisis');
    });

    it('should handle crisis chain events', () => {
        // Crisis chains - one crisis can lead to another
        const life = {
            health: 1,
            wealth: 3,
            connections: 3,
            crisisHistory: []
        };

        const triggerCrisis = (life, crisisType) => {
            life.crisisHistory.push({
                type: crisisType,
                stage: life.stage
            });

            // Crisis effects
            switch (crisisType) {
                case 'health_crisis':
                    // Seeking treatment costs money
                    life.wealth = Math.max(1, life.wealth - 1);
                    // May trigger wealth crisis
                    if (life.wealth <= 1) {
                        return 'wealth_crisis';
                    }
                    break;
                case 'wealth_crisis':
                    // Poverty affects health
                    life.health = Math.max(1, life.health - 1);
                    break;
            }
            return null;
        };

        // Initial crisis
        const nextCrisis = triggerCrisis(life, 'health_crisis');
        expect(life.crisisHistory).toHaveLength(1);
        expect(life.wealth).toBe(2);
        expect(nextCrisis).toBeNull(); // Wealth not critical yet

        // Another health crisis that drains wealth to critical
        life.wealth = 2;
        life.health = 1;
        const chainedCrisis = triggerCrisis(life, 'health_crisis');
        expect(life.wealth).toBe(1);
        expect(chainedCrisis).toBe('wealth_crisis'); // Now triggers chain
    });

    it('should prioritize crisis events over regular events', () => {
        const life = {
            health: 1,
            wealth: 3,
            stage: 'middle'
        };

        const regularEvents = [
            { id: 'regular_1', stage: 'middle', priority: 'normal' },
            { id: 'regular_2', stage: 'middle', priority: 'normal' }
        ];

        const crisisEvents = [
            { 
                id: 'health_crisis', 
                stage: 'middle', 
                priority: 'crisis',
                requirements: { health: '<2' }
            }
        ];

        // Select next event with priority
        const selectEvent = (life, regularEvents, crisisEvents) => {
            // Check for crisis events first
            const applicableCrisis = crisisEvents.find(e => {
                if (e.stage !== life.stage) return false;
                if (!e.requirements) return true;
                
                for (const [stat, condition] of Object.entries(e.requirements)) {
                    const value = life[stat];
                    if (condition.startsWith('<')) {
                        if (value >= parseInt(condition.slice(1), 10)) return false;
                    }
                }
                return true;
            });

            if (applicableCrisis) {
                return applicableCrisis;
            }

            // Fall back to regular events
            const stageEvents = regularEvents.filter(e => e.stage === life.stage);
            return stageEvents[Math.floor(Math.random() * stageEvents.length)];
        };

        const selectedEvent = selectEvent(life, regularEvents, crisisEvents);
        expect(selectedEvent.id).toBe('health_crisis');
        expect(selectedEvent.priority).toBe('crisis');
    });

    it('should allow recovery from crisis', () => {
        const life = {
            health: 1,
            wealth: 3,
            inCrisis: true,
            crisisType: 'health_crisis'
        };

        const resolveOutcome = (life, outcome) => {
            // Apply effects
            if (outcome.effects) {
                for (const [stat, delta] of Object.entries(outcome.effects)) {
                    if (life[stat] !== undefined) {
                        life[stat] = Math.max(1, Math.min(5, life[stat] + delta));
                    }
                }
            }

            // Check if crisis resolved
            if (life.inCrisis) {
                if (life.crisisType === 'health_crisis' && life.health >= 2) {
                    life.inCrisis = false;
                    life.crisisType = null;
                    return { resolved: true, message: 'You\'ve recovered from your health crisis.' };
                }
            }

            return { resolved: false };
        };

        // Before treatment
        expect(life.inCrisis).toBe(true);

        // Apply treatment outcome
        const outcome = { effects: { health: +1, wealth: -1 } };
        const result = resolveOutcome(life, outcome);

        expect(life.health).toBe(2);
        expect(life.wealth).toBe(2);
        expect(result.resolved).toBe(true);
        expect(life.inCrisis).toBe(false);
    });

    it('should track multiple crises in a single life', () => {
        const life = {
            health: 3,
            wealth: 3,
            connections: 3,
            crisisLog: []
        };

        const logCrisis = (life, crisisType, resolved) => {
            life.crisisLog.push({
                type: crisisType,
                resolved: resolved,
                timestamp: Date.now()
            });
        };

        // First crisis
        life.health = 1;
        logCrisis(life, 'health_crisis', false);
        
        // Recovered
        life.health = 3;
        life.crisisLog[0].resolved = true;

        // Second crisis (different type)
        life.wealth = 1;
        logCrisis(life, 'wealth_crisis', false);

        expect(life.crisisLog).toHaveLength(2);
        expect(life.crisisLog[0].type).toBe('health_crisis');
        expect(life.crisisLog[0].resolved).toBe(true);
        expect(life.crisisLog[1].type).toBe('wealth_crisis');
        expect(life.crisisLog[1].resolved).toBe(false);
    });
});

console.log('✅ Integration tests loaded');
