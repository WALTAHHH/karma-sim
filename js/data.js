// Real-world data distributions

// Re-export countries from countries.js (the canonical source)
export { countries } from './countries.js';

// Years (expanded range: 1800-2025)
export const years = [];
for (let year = 1800; year <= 2025; year += 5) {
    years.push(year);
}

// Industries
export const industries = [
  { id: 'tech', name: 'Technology', wealthMod: 0.1 },
  { id: 'agriculture', name: 'Agriculture', wealthMod: -0.05 },
  { id: 'finance', name: 'Finance', wealthMod: 0.15 },
  { id: 'manufacturing', name: 'Manufacturing', wealthMod: 0 },
  { id: 'services', name: 'Services', wealthMod: 0.05 }
];




// Global income quintile distribution (approximate share of total income)
// Q1: bottom 20%, Q5: top 20%
export const incomeDistribution = {
    weights: [0.40, 0.25, 0.18, 0.12, 0.05], // Probability of being born into each quintile (inverted from income share)
    shareOfIncome: [0.02, 0.05, 0.10, 0.22, 0.61]
};

// Wealth descriptors (no numbers shown to player)
export const wealthDescriptors = {
    1: ['struggling', 'poor', 'destitute'],
    2: ['modest', 'working-class', 'getting by'],
    3: ['comfortable', 'middle-class', 'stable'],
    4: ['prosperous', 'well-off', 'affluent'],
    5: ['wealthy', 'privileged', 'elite']
};

// Regions removed - countries are now the primary structural unit

// Education access correlates with wealth
export const educationByWealth = {
    1: [0.50, 0.30, 0.15, 0.04, 0.01], // 50% level 1, 30% level 2, etc.
    2: [0.25, 0.35, 0.25, 0.12, 0.03],
    3: [0.10, 0.25, 0.35, 0.22, 0.08],
    4: [0.05, 0.15, 0.30, 0.35, 0.15],
    5: [0.02, 0.08, 0.20, 0.35, 0.35]
};

// Health baseline distribution (fairly even, slight wealth correlation)
export const healthByWealth = {
    1: [0.15, 0.25, 0.30, 0.20, 0.10],
    2: [0.10, 0.20, 0.35, 0.25, 0.10],
    3: [0.08, 0.17, 0.35, 0.28, 0.12],
    4: [0.05, 0.15, 0.30, 0.32, 0.18],
    5: [0.03, 0.12, 0.25, 0.35, 0.25]
};

// Connection/social capital baseline
export const connectionsByWealth = {
    1: [0.30, 0.30, 0.25, 0.12, 0.03],
    2: [0.20, 0.30, 0.30, 0.15, 0.05],
    3: [0.12, 0.23, 0.35, 0.22, 0.08],
    4: [0.08, 0.17, 0.30, 0.30, 0.15],
    5: [0.05, 0.12, 0.25, 0.33, 0.25]
};

// Utility: pick from weighted distribution
export function weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) return i + 1; // 1-indexed (quintile 1-5)
    }
    return weights.length;
}

// Get random descriptor for a wealth level
export function getWealthDescriptor(wealth) {
    const descriptors = wealthDescriptors[wealth];
    return descriptors[Math.floor(Math.random() * descriptors.length)];
}

// getRandomRegion removed - use selectWeightedCountry from countries.js instead

// ============================================
// FAMILY GENERATION DATA
// ============================================

// Family structure distributions (vary by era and wealth)
export const FAMILY_STRUCTURES = {
    nuclear: { id: 'nuclear', name: 'nuclear family', description: 'two parents' },
    extended: { id: 'extended', name: 'extended family', description: 'with grandparents or relatives' },
    single_parent: { id: 'single_parent', name: 'single-parent home', description: 'one parent' },
    orphaned: { id: 'orphaned', name: 'orphanage', description: 'without parents' }
};

// Distribution of family structures by era (index: nuclear, extended, single_parent, orphaned)
export const familyStructureByEra = {
    pre_industrial: [0.30, 0.55, 0.10, 0.05],    // Extended families common
    industrial_revolution: [0.40, 0.40, 0.12, 0.08],
    early_modern: [0.50, 0.30, 0.15, 0.05],     // Wars increase single-parent/orphan
    cold_war: [0.60, 0.20, 0.17, 0.03],
    contemporary: [0.55, 0.15, 0.28, 0.02]      // More single-parent today
};

// Sibling count distribution by era (more kids historically)
export const siblingCountByEra = {
    pre_industrial: [0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.15],  // 0-6 siblings
    industrial_revolution: [0.08, 0.12, 0.18, 0.22, 0.18, 0.12, 0.10],
    early_modern: [0.12, 0.18, 0.25, 0.20, 0.15, 0.07, 0.03],
    cold_war: [0.15, 0.25, 0.30, 0.18, 0.08, 0.03, 0.01],
    contemporary: [0.20, 0.35, 0.30, 0.10, 0.04, 0.01, 0.00]
};

// Family stability (stable, volatile, broken)
export const familyStabilityByWealth = {
    1: [0.40, 0.35, 0.25],
    2: [0.50, 0.30, 0.20],
    3: [0.60, 0.28, 0.12],
    4: [0.70, 0.22, 0.08],
    5: [0.75, 0.20, 0.05]
};

// Parent occupations by era and wealth level
export const parentOccupations = {
    pre_industrial: {
        1: ['laborer', 'servant', 'beggar', 'peddler'],
        2: ['farmer', 'fisherman', 'weaver', 'miner'],
        3: ['craftsman', 'shopkeeper', 'clerk', 'innkeeper'],
        4: ['merchant', 'teacher', 'physician', 'priest'],
        5: ['landowner', 'nobleman', 'banker', 'magistrate']
    },
    industrial_revolution: {
        1: ['factory worker', 'street sweeper', 'chimney sweep', 'dock worker'],
        2: ['mill worker', 'miner', 'railroad worker', 'seamstress'],
        3: ['foreman', 'shopkeeper', 'telegraph operator', 'clerk'],
        4: ['engineer', 'banker', 'doctor', 'lawyer'],
        5: ['factory owner', 'railway baron', 'industrialist', 'politician']
    },
    early_modern: {
        1: ['factory hand', 'day laborer', 'domestic servant', 'unemployed'],
        2: ['assembly worker', 'farmer', 'truck driver', 'soldier'],
        3: ['office clerk', 'teacher', 'nurse', 'police officer'],
        4: ['manager', 'professor', 'doctor', 'architect'],
        5: ['executive', 'banker', 'industrialist', 'diplomat']
    },
    cold_war: {
        1: ['janitor', 'farmhand', 'factory worker', 'waitress'],
        2: ['machinist', 'secretary', 'construction worker', 'salesman'],
        3: ['accountant', 'teacher', 'engineer', 'nurse'],
        4: ['manager', 'professor', 'doctor', 'lawyer'],
        5: ['executive', 'investor', 'business owner', 'politician']
    },
    contemporary: {
        1: ['warehouse worker', 'cleaner', 'fast food worker', 'unemployed'],
        2: ['retail worker', 'driver', 'construction worker', 'office assistant'],
        3: ['programmer', 'teacher', 'nurse', 'accountant'],
        4: ['manager', 'doctor', 'engineer', 'consultant'],
        5: ['CEO', 'investor', 'entrepreneur', 'surgeon']
    }
};

// Urban/rural setting distribution by country income level
export const settingByIncomeLevel = {
    low: [0.25, 0.60, 0.15],          // urban, rural, suburban
    'lower-middle': [0.35, 0.45, 0.20],
    'upper-middle': [0.50, 0.25, 0.25],
    high: [0.55, 0.15, 0.30]
};

// Setting names
export const SETTINGS = ['urban', 'rural', 'suburban'];

// Get random parent occupation for era and wealth
export function getParentOccupation(eraId, wealth) {
    const eraOccupations = parentOccupations[eraId] || parentOccupations.contemporary;
    const wealthOccupations = eraOccupations[wealth] || eraOccupations[3];
    return wealthOccupations[Math.floor(Math.random() * wealthOccupations.length)];
}

// Get family structure for era
export function getFamilyStructure(eraId) {
    const weights = familyStructureByEra[eraId] || familyStructureByEra.contemporary;
    const structures = ['nuclear', 'extended', 'single_parent', 'orphaned'];
    const index = weightedRandomIndex(weights);
    return structures[index];
}

// Get sibling count for era
export function getSiblingCount(eraId) {
    const weights = siblingCountByEra[eraId] || siblingCountByEra.contemporary;
    return weightedRandomIndex(weights);
}

// Get family stability based on wealth
export function getFamilyStability(wealth) {
    const weights = familyStabilityByWealth[wealth] || familyStabilityByWealth[3];
    const stabilities = ['stable', 'volatile', 'broken'];
    return stabilities[weightedRandomIndex(weights)];
}

// Get urban/rural/suburban setting
export function getSetting(incomeLevel) {
    const weights = settingByIncomeLevel[incomeLevel] || settingByIncomeLevel['upper-middle'];
    return SETTINGS[weightedRandomIndex(weights)];
}

// Utility: weighted random returning 0-indexed result
export function weightedRandomIndex(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) return i;
    }
    return weights.length - 1;
}
