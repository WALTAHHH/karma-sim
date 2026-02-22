// Gacha / Slot Machine System
// Flashy pull mechanic where Karma buys chances at rewards

const GACHA_KEY = 'karma_simulator_gacha';
const PULL_COST = 3; // Karma per pull
const MULTI_PULL_COUNT = 10;
const MULTI_PULL_COST = 25; // Discount for 10-pull

// Rarity tiers with weights and colors
export const RARITIES = {
    common: { name: 'Common', weight: 60, color: '#888888', glow: 'rgba(136,136,136,0.5)' },
    uncommon: { name: 'Uncommon', weight: 25, color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
    rare: { name: 'Rare', weight: 10, color: '#60a5fa', glow: 'rgba(96,165,250,0.5)' },
    epic: { name: 'Epic', weight: 4, color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
    legendary: { name: 'Legendary', weight: 1, color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' }
};

// Reward pool - items that can be pulled
export const REWARD_POOL = [
    // Common rewards
    { id: 'karma_crumb', name: 'Karma Crumb', rarity: 'common', type: 'karma', value: 1, icon: '✨', description: '+1 Karma' },
    { id: 'small_blessing', name: 'Small Blessing', rarity: 'common', type: 'modifier', value: 0.05, stat: 'luck', duration: 1, icon: '🍀', description: '+5% luck next life' },
    { id: 'copper_coin', name: 'Copper Coin', rarity: 'common', type: 'cosmetic', icon: '🪙', description: 'A humble coin' },
    
    // Uncommon rewards
    { id: 'karma_shard', name: 'Karma Shard', rarity: 'uncommon', type: 'karma', value: 3, icon: '💎', description: '+3 Karma' },
    { id: 'lucky_charm', name: 'Lucky Charm', rarity: 'uncommon', type: 'modifier', value: 0.10, stat: 'wealth', duration: 1, icon: '🎲', description: '+10% wealth next life' },
    { id: 'silver_token', name: 'Silver Token', rarity: 'uncommon', type: 'cosmetic', icon: '🥈', description: 'A silver token of favor' },
    { id: 'health_boost', name: 'Vitality Essence', rarity: 'uncommon', type: 'modifier', value: 0.10, stat: 'health', duration: 1, icon: '❤️', description: '+10% health next life' },
    
    // Rare rewards
    { id: 'karma_gem', name: 'Karma Gem', rarity: 'rare', type: 'karma', value: 8, icon: '💠', description: '+8 Karma' },
    { id: 'golden_opportunity', name: 'Golden Opportunity', rarity: 'rare', type: 'modifier', value: 0.15, stat: 'connections', duration: 2, icon: '🌟', description: '+15% connections for 2 lives' },
    { id: 'scholars_boon', name: "Scholar's Boon", rarity: 'rare', type: 'modifier', value: 0.15, stat: 'education', duration: 2, icon: '📚', description: '+15% education for 2 lives' },
    { id: 'gold_medal', name: 'Gold Medal', rarity: 'rare', type: 'cosmetic', icon: '🥇', description: 'Excellence recognized' },
    
    // Epic rewards
    { id: 'karma_crystal', name: 'Karma Crystal', rarity: 'epic', type: 'karma', value: 15, icon: '🔮', description: '+15 Karma' },
    { id: 'destiny_reroll', name: 'Destiny Reroll', rarity: 'epic', type: 'special', effect: 'reroll_birth', icon: '🎰', description: 'Reroll your birth country once' },
    { id: 'fates_favor', name: "Fate's Favor", rarity: 'epic', type: 'modifier', value: 0.20, stat: 'all', duration: 3, icon: '⚡', description: '+20% all stats for 3 lives' },
    { id: 'crown_jewel', name: 'Crown Jewel', rarity: 'epic', type: 'cosmetic', icon: '👑', description: 'Royalty in any life' },
    
    // Legendary rewards
    { id: 'karma_nexus', name: 'Karma Nexus', rarity: 'legendary', type: 'karma', value: 30, icon: '🌌', description: '+30 Karma' },
    { id: 'golden_ticket', name: 'Golden Ticket', rarity: 'legendary', type: 'special', effect: 'unlock_random', icon: '🎫', description: 'Unlock a random era, career, or country' },
    { id: 'cosmic_alignment', name: 'Cosmic Alignment', rarity: 'legendary', type: 'modifier', value: 0.25, stat: 'all', duration: 5, icon: '🌠', description: '+25% all stats for 5 lives' },
    { id: 'philosophers_stone', name: "Philosopher's Stone", rarity: 'legendary', type: 'special', effect: 'double_karma', icon: '🗿', description: 'Double karma gains for 3 lives' }
];

// Get saved gacha state
export function getGachaState() {
    try {
        const stored = localStorage.getItem(GACHA_KEY);
        return stored ? JSON.parse(stored) : { 
            inventory: [], 
            activeModifiers: [],
            pullCount: 0,
            pity: 0, // Pity counter for guaranteed rare+
            stats: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
        };
    } catch (e) {
        console.warn('Failed to load gacha state:', e);
        return { inventory: [], activeModifiers: [], pullCount: 0, pity: 0, stats: {} };
    }
}

// Save gacha state
function saveGachaState(state) {
    try {
        localStorage.setItem(GACHA_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save gacha state:', e);
    }
}

// Calculate weighted random rarity with pity system
export function rollRarity(pity = 0) {
    // Pity increases rare+ chances every 10 pulls without rare+
    const pityBonus = Math.floor(pity / 10) * 5;
    
    const weights = {
        common: Math.max(RARITIES.common.weight - pityBonus, 20),
        uncommon: RARITIES.uncommon.weight,
        rare: RARITIES.rare.weight + Math.floor(pityBonus * 0.5),
        epic: RARITIES.epic.weight + Math.floor(pityBonus * 0.3),
        legendary: RARITIES.legendary.weight + Math.floor(pityBonus * 0.2)
    };
    
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(weights)) {
        roll -= weight;
        if (roll <= 0) return rarity;
    }
    return 'common';
}

// Get random reward of specific rarity
export function getRewardByRarity(rarity) {
    const pool = REWARD_POOL.filter(r => r.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

// Perform a single pull
export function doPull(karma, spendKarmaFn) {
    if (karma < PULL_COST) {
        return { success: false, error: 'Not enough karma' };
    }
    
    const state = getGachaState();
    const rarity = rollRarity(state.pity);
    const reward = getRewardByRarity(rarity);
    
    // Spend karma
    spendKarmaFn(PULL_COST);
    
    // Update pity (reset on rare+)
    if (['rare', 'epic', 'legendary'].includes(rarity)) {
        state.pity = 0;
    } else {
        state.pity++;
    }
    
    // Add to inventory and stats
    state.inventory.push({ ...reward, obtainedAt: Date.now() });
    state.pullCount++;
    state.stats[rarity] = (state.stats[rarity] || 0) + 1;
    
    saveGachaState(state);
    
    return { success: true, reward, rarity: RARITIES[rarity] };
}

// Perform multi-pull (10x)
export function doMultiPull(karma, spendKarmaFn) {
    if (karma < MULTI_PULL_COST) {
        return { success: false, error: 'Not enough karma for 10-pull' };
    }
    
    spendKarmaFn(MULTI_PULL_COST);
    
    const results = [];
    const state = getGachaState();
    
    for (let i = 0; i < MULTI_PULL_COUNT; i++) {
        const rarity = rollRarity(state.pity);
        const reward = getRewardByRarity(rarity);
        
        if (['rare', 'epic', 'legendary'].includes(rarity)) {
            state.pity = 0;
        } else {
            state.pity++;
        }
        
        state.inventory.push({ ...reward, obtainedAt: Date.now() });
        state.pullCount++;
        state.stats[rarity] = (state.stats[rarity] || 0) + 1;
        
        results.push({ reward, rarity: RARITIES[rarity] });
    }
    
    saveGachaState(state);
    
    return { success: true, results };
}

// Apply reward effects
export function applyReward(reward, addKarmaFn) {
    switch (reward.type) {
        case 'karma':
            addKarmaFn(reward.value);
            return `+${reward.value} Karma!`;
        case 'modifier':
            const state = getGachaState();
            state.activeModifiers.push({
                ...reward,
                livesRemaining: reward.duration
            });
            saveGachaState(state);
            return `${reward.name} activated!`;
        case 'special':
            // Handle special effects
            return `${reward.name} added to inventory!`;
        case 'cosmetic':
            return `${reward.name} collected!`;
        default:
            return 'Reward received!';
    }
}

// Get active modifiers for current life
export function getActiveModifiers() {
    const state = getGachaState();
    return state.activeModifiers.filter(m => m.livesRemaining > 0);
}

// Decrement modifier durations (call at end of each life)
export function tickModifiers() {
    const state = getGachaState();
    state.activeModifiers = state.activeModifiers
        .map(m => ({ ...m, livesRemaining: m.livesRemaining - 1 }))
        .filter(m => m.livesRemaining > 0);
    saveGachaState(state);
}

// Debug: Force a specific rarity pull
export function debugForcePull(rarity) {
    const reward = getRewardByRarity(rarity);
    const state = getGachaState();
    state.inventory.push({ ...reward, obtainedAt: Date.now(), debug: true });
    state.pullCount++;
    state.stats[rarity] = (state.stats[rarity] || 0) + 1;
    saveGachaState(state);
    return { reward, rarity: RARITIES[rarity] };
}

// Debug: Reset gacha state
export function debugResetGacha() {
    localStorage.removeItem(GACHA_KEY);
}

// Debug: Set pity counter
export function debugSetPity(value) {
    const state = getGachaState();
    state.pity = value;
    saveGachaState(state);
}

// Debug: Get full state
export function debugGetState() {
    return getGachaState();
}

// Export costs for UI
export { PULL_COST, MULTI_PULL_COST, MULTI_PULL_COUNT };
