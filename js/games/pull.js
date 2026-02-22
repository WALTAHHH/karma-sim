// Pull Game Logic - Single dramatic card reveal
// Uses shared gacha pools and costs from gacha.js

import { 
    RARITIES, 
    REWARD_POOL, 
    getPullCost, 
    getMultiPullCost, 
    getMultiPullCount,
    rollRarity, 
    getRewardByRarity, 
    getGachaState,
    debugForcePull as gachaDebugForcePull,
    debugResetGacha,
    debugSetPity,
    debugGetState
} from '../gacha.js';

// Re-export what we need
export { 
    RARITIES, 
    REWARD_POOL, 
    getPullCost, 
    getMultiPullCost, 
    getMultiPullCount,
    getGachaState,
    debugResetGacha,
    debugSetPity,
    debugGetState
};

const GACHA_KEY = 'karma_simulator_gacha';

// Save gacha state (mirrors gacha.js)
function saveGachaState(state) {
    try {
        localStorage.setItem(GACHA_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save gacha state:', e);
    }
}

// Perform a single pull (doesn't spend karma - caller handles that)
export function doPull() {
    const state = getGachaState();
    const rarity = rollRarity(state.pity);
    const reward = getRewardByRarity(rarity);
    
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
    
    return { reward, rarity: RARITIES[rarity], rarityKey: rarity };
}

// Debug: Force a specific rarity pull
export function debugForcePull(rarity) {
    const result = gachaDebugForcePull(rarity);
    return { ...result, rarityKey: rarity };
}

// Get rarity tier (for animation timing)
export function getRarityTier(rarity) {
    const tiers = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5
    };
    return tiers[rarity] || 1;
}

// Get anticipation duration based on rarity (higher = longer wait)
export function getAnticipationDuration(rarity) {
    const durations = {
        common: 1200,
        uncommon: 1400,
        rare: 1600,
        epic: 1800,
        legendary: 2200
    };
    return durations[rarity] || 1200;
}

// Get crack duration based on rarity
export function getCrackDuration(rarity) {
    const durations = {
        common: 300,
        uncommon: 350,
        rare: 400,
        epic: 500,
        legendary: 700
    };
    return durations[rarity] || 300;
}
