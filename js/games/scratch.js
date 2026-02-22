/**
 * @fileoverview Scratch Card Logic
 * Symbol pools, win detection, card generation
 * @module games/scratch
 */

/** @constant {number} Cost in karma to buy a scratch card */
export const SCRATCH_COST = 3;

// Symbol pools by rarity
export const SYMBOL_POOLS = {
    common: {
        symbols: ['🪨', '🍂', '🌿'],
        karmaRange: [1, 2],
        color: '#888888',
        glow: 'rgba(136,136,136,0.5)'
    },
    uncommon: {
        symbols: ['🍀', '💚', '🌟'],
        karmaRange: [3, 5],
        color: '#4ade80',
        glow: 'rgba(74,222,128,0.5)'
    },
    rare: {
        symbols: ['💎', '💠', '🔷'],
        karmaRange: [6, 10],
        color: '#60a5fa',
        glow: 'rgba(96,165,250,0.5)'
    },
    epic: {
        symbols: ['🔮', '👑', '⚡'],
        karmaRange: [12, 18],
        color: '#c084fc',
        glow: 'rgba(192,132,252,0.5)'
    },
    legendary: {
        symbols: ['🌌', '✨', '🏆'],
        karmaRange: [25, 40],
        color: '#fbbf24',
        glow: 'rgba(251,191,36,0.7)'
    },
    bust: {
        symbols: ['💀'],
        karmaRange: [0, 0],
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.5)'
    }
};

// Rarity weights for card generation
const RARITY_WEIGHTS = {
    common: 45,
    uncommon: 28,
    rare: 15,
    epic: 8,
    legendary: 3,
    bust: 1
};

// Win lines (indices for 3x3 grid)
export const WIN_LINES = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6]
];

// Roll a random rarity
function rollRarity() {
    const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        roll -= weight;
        if (roll <= 0) return rarity;
    }
    return 'common';
}

// Get random symbol from rarity pool
function getSymbol(rarity) {
    const pool = SYMBOL_POOLS[rarity];
    return {
        symbol: pool.symbols[Math.floor(Math.random() * pool.symbols.length)],
        rarity
    };
}

// Generate a scratch card grid
export function generateCard() {
    const grid = [];
    
    // Determine card "theme" - slight bias toward same rarity cluster
    const primaryRarity = rollRarity();
    const secondaryRarity = rollRarity();
    
    for (let i = 0; i < 9; i++) {
        // 40% primary, 30% secondary, 30% random
        const roll = Math.random();
        let rarity;
        if (roll < 0.4) {
            rarity = primaryRarity;
        } else if (roll < 0.7) {
            rarity = secondaryRarity;
        } else {
            rarity = rollRarity();
        }
        
        grid.push(getSymbol(rarity));
    }
    
    return grid;
}

// Find all winning lines in a card
export function findWins(grid) {
    const wins = [];
    
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        const symbolA = grid[a].symbol;
        const symbolB = grid[b].symbol;
        const symbolC = grid[c].symbol;
        
        // All three match
        if (symbolA === symbolB && symbolB === symbolC) {
            wins.push({
                indices: line,
                symbol: symbolA,
                rarity: grid[a].rarity
            });
        }
    }
    
    return wins;
}

// Find near-wins (2 matching in a line)
export function findNearWins(grid) {
    const nearWins = [];
    
    for (const line of WIN_LINES) {
        const symbols = line.map(i => grid[i].symbol);
        const counts = {};
        symbols.forEach(s => counts[s] = (counts[s] || 0) + 1);
        
        // Two of same symbol in line
        for (const [symbol, count] of Object.entries(counts)) {
            if (count === 2) {
                nearWins.push({
                    indices: line,
                    matchingSymbol: symbol,
                    missingIndex: line.find(i => grid[i].symbol !== symbol)
                });
            }
        }
    }
    
    return nearWins;
}

// Calculate total karma reward from wins
export function calculateReward(wins) {
    let total = 0;
    let bestRarity = 'common';
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    
    for (const win of wins) {
        if (win.rarity === 'bust') {
            // Bust wipes any winnings on that line
            continue;
        }
        
        const pool = SYMBOL_POOLS[win.rarity];
        const [min, max] = pool.karmaRange;
        const reward = min + Math.floor(Math.random() * (max - min + 1));
        total += reward;
        
        // Track best rarity for celebration
        if (rarityOrder.indexOf(win.rarity) > rarityOrder.indexOf(bestRarity)) {
            bestRarity = win.rarity;
        }
    }
    
    return { total, bestRarity, winCount: wins.length };
}

// Check if card has any bust symbols
export function hasBust(grid) {
    return grid.some(cell => cell.rarity === 'bust');
}

// Get card coating color based on potential
export function getCoatingColor(grid) {
    const rarities = grid.map(c => c.rarity);
    
    if (rarities.includes('legendary')) return 'gold';
    if (rarities.includes('epic')) return 'purple';
    if (rarities.includes('rare')) return 'blue';
    return 'silver';
}

// Stats tracking
const SCRATCH_STATS_KEY = 'karma_sim_scratch_stats';

export function getStats() {
    try {
        const stored = localStorage.getItem(SCRATCH_STATS_KEY);
        return stored ? JSON.parse(stored) : {
            cardsScratched: 0,
            totalWon: 0,
            totalSpent: 0,
            bestWin: 0,
            bigWins: 0  // Wins >= 10 karma
        };
    } catch (e) {
        return { cardsScratched: 0, totalWon: 0, totalSpent: 0, bestWin: 0, bigWins: 0 };
    }
}

export function recordCard(karmaWon) {
    const stats = getStats();
    stats.cardsScratched++;
    stats.totalWon += karmaWon;
    stats.totalSpent += SCRATCH_COST;
    if (karmaWon > stats.bestWin) stats.bestWin = karmaWon;
    if (karmaWon >= 10) stats.bigWins++;
    
    try {
        localStorage.setItem(SCRATCH_STATS_KEY, JSON.stringify(stats));
    } catch (e) {}
    
    return stats;
}
