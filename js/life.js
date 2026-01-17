// Life generation and starting conditions

import {
    incomeDistribution,
    educationByWealth,
    healthByWealth,
    connectionsByWealth,
    weightedRandom,
    getWealthDescriptor,
    // Family generation functions
    getParentOccupation,
    getFamilyStructure,
    getSiblingCount,
    getFamilyStability,
    getSetting,
    FAMILY_STRUCTURES
} from './data.js';

import { initializeTagProgress } from './tags.js';

import {
    getCountryModifiers,
    INCOME_LEVELS,
    getCountryFlavor
} from './countries.js';

import {
    getEraModifiers,
    DEFAULT_ERA_ID,
    getEraById,
    getRandomHistoricalContext
} from './eras.js';

import {
    getStartingConditionBias,
    biasWeights
} from './karma.js';

import {
    getJobById
} from './jobs.js';

import {
    getActiveWorldEvents,
    getWorldEventEffects,
    getWorldEventNarrative
} from './worldEvents.js';

// ============================================
// LINEAGE SYSTEM
// ============================================

// Generate a unique ID for lineage tracking
function generateLineageId() {
    return 'life_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// Calculate probability of having children based on stats
export function calculateChildProbability(life) {
    const base = 0.30;  // 30% base chance

    // Wealth bonus: more resources = more likely to have/support children
    const wealthBonus = (life.wealth - 3) * 0.08;

    // Health bonus: good health = more likely to survive to have children
    const healthBonus = (life.health - 3) * 0.08;

    // Connections bonus: social ties encourage family formation
    const connectionsBonus = (life.connections - 3) * 0.10;

    // Era modifier: earlier eras had more children
    let eraBonus = 0;
    if (life.era) {
        switch (life.era.id) {
            case 'pre_industrial':
                eraBonus = 0.15;
                break;
            case 'industrial_revolution':
                eraBonus = 0.10;
                break;
            case 'early_modern':
                eraBonus = 0.05;
                break;
            case 'cold_war':
                eraBonus = 0;
                break;
            case 'contemporary':
                eraBonus = -0.05;
                break;
        }
    }

    const total = base + wealthBonus + healthBonus + connectionsBonus + eraBonus;

    // Clamp between 10% and 85%
    return Math.min(0.85, Math.max(0.10, total));
}

// Check if this life will have children (called during middle/late stage)
export function checkForChildren(life) {
    if (life.hasChildren !== undefined) {
        return life.hasChildren;  // Already determined
    }

    const probability = calculateChildProbability(life);
    return Math.random() < probability;
}

// Generate descendant starting conditions based on parent
export function generateDescendantContext(parentLife, parentKarma = 0) {
    // Calculate birth year: 25-35 years after parent's birth
    const parentBirthYear = parentLife.year;
    const childBirthYear = parentBirthYear + 25 + Math.floor(Math.random() * 11);

    // Inherit country (or final location if migration implemented)
    const country = parentLife.currentCountry || parentLife.country;

    // Wealth tends to persist but with regression to mean
    const parentWealth = parentLife.wealth;
    let inheritedWealthTendency = parentWealth;
    // 60% chance of staying same, 20% up, 20% down
    const wealthRoll = Math.random();
    if (wealthRoll < 0.20 && inheritedWealthTendency < 5) {
        inheritedWealthTendency += 1;
    } else if (wealthRoll > 0.80 && inheritedWealthTendency > 1) {
        inheritedWealthTendency -= 1;
    }

    return {
        country: country,
        year: childBirthYear,
        wealthTendency: inheritedWealthTendency,
        parentLineageId: parentLife.lineage?.lifeId || null,
        generation: (parentLife.lineage?.generation || 1) + 1,
        // Legacy data for inheritance
        parentLife: parentLife,
        parentKarma: parentKarma
    };
}

// Create lineage data for a new life
export function createLineageData(parentLineageId = null, generation = 1) {
    return {
        lifeId: generateLineageId(),
        parentLifeId: parentLineageId,
        generation: generation,
        hasChildren: undefined,  // Determined during gameplay
        childBirthYear: null
    };
}

// ============================================
// LEGACY SYSTEM - Generational Trait Inheritance
// ============================================

// Legacy traits that can be inherited by descendants
export const LEGACY_TRAITS = {
    scholarly_lineage: {
        id: 'scholarly_lineage',
        name: 'Scholarly Lineage',
        description: 'A family tradition of learning and education',
        trigger: (parentLife) => parentLife.education >= 5,
        effects: { education: +1 },
        narrativeHint: 'Your family has always valued education above all else.',
        linkedEvents: ['family_library', 'academic_expectations']
    },
    merchant_blood: {
        id: 'merchant_blood',
        name: 'Merchant Blood',
        description: 'Business acumen runs in the family',
        trigger: (parentLife) => parentLife.wealth >= 5,
        effects: { wealthVariance: +1 },
        narrativeHint: 'Your ancestors built fortunes through trade and commerce.',
        linkedEvents: ['family_business_heir', 'competitor_grudge']
    },
    survivor_stock: {
        id: 'survivor_stock',
        name: 'Survivor Stock',
        description: 'Resilience passed down through hardship',
        trigger: (parentLife) => parentLife.survivedHealthCrisis === true,
        effects: { health: +1 },
        narrativeHint: 'Your family has weathered storms that broke others.',
        linkedEvents: ['resilience_story', 'genetic_strength']
    },
    social_climbers: {
        id: 'social_climbers',
        name: 'Social Climbers',
        description: 'A family that knows how to build relationships',
        trigger: (parentLife) => parentLife.connectionsGained >= 2,
        effects: { connections: +1 },
        narrativeHint: 'Your family has a talent for making the right friends.',
        linkedEvents: ['family_connections', 'social_obligations']
    },
    karmic_burden: {
        id: 'karmic_burden',
        name: 'Karmic Burden',
        description: 'Ancestral debts yet unpaid',
        trigger: (parentLife, karma) => karma < -5,
        effects: { startingKarma: -3 },
        narrativeHint: 'The sins of your ancestors cast a long shadow.',
        linkedEvents: ['family_shame', 'redemption_chance']
    },
    blessed_line: {
        id: 'blessed_line',
        name: 'Blessed Line',
        description: 'Good fortune follows this family',
        trigger: (parentLife, karma) => karma >= 10,
        effects: { luckyChance: +0.10 },
        narrativeHint: 'Fortune has always smiled upon your family.',
        linkedEvents: ['good_fortune', 'karmic_protection']
    },
    wanderers: {
        id: 'wanderers',
        name: 'Wanderers',
        description: 'A family with roots in many lands',
        trigger: (parentLife) => parentLife.migrationHistory?.length >= 2,
        effects: { adaptability: +1 },
        narrativeHint: 'Your family has called many places home.',
        linkedEvents: ['heritage_discovery', 'cosmopolitan_outlook']
    },
    hard_workers: {
        id: 'hard_workers',
        name: 'Hard Workers',
        description: 'A legacy of honest toil',
        trigger: (parentLife) => parentLife.totalChoicesMade >= 8,
        effects: { wealthFloor: 2 },
        narrativeHint: 'Your family never shied from hard work.',
        linkedEvents: ['work_ethic', 'labor_pride']
    }
};

// Calculate legacy traits from a parent's life
export function calculateLegacyTraits(parentLife, karma = 0) {
    const traits = [];

    for (const [traitId, trait] of Object.entries(LEGACY_TRAITS)) {
        try {
            if (trait.trigger(parentLife, karma)) {
                traits.push({
                    id: trait.id,
                    name: trait.name,
                    effects: { ...trait.effects },
                    narrativeHint: trait.narrativeHint,
                    linkedEvents: trait.linkedEvents || []
                });
            }
        } catch (e) {
            // Silently skip traits that can't be evaluated
        }
    }

    return traits;
}

// Create legacy data structure for a life
export function createLegacyData(parentLife = null, karma = 0) {
    if (!parentLife) {
        return {
            traits: [],
            reputation: 'unknown',
            ancestorMemories: [],
            inheritedEffects: {}
        };
    }

    const traits = calculateLegacyTraits(parentLife, karma);

    // Calculate reputation based on parent's stats and choices
    let reputation = 'ordinary';
    if (parentLife.wealth >= 5) reputation = 'prosperous';
    else if (parentLife.education >= 5) reputation = 'learned';
    else if (parentLife.connections >= 5) reputation = 'well-connected';
    else if (karma >= 10) reputation = 'honored';
    else if (karma < -5) reputation = 'troubled';

    // Create ancestor memories - narrative callbacks
    const ancestorMemories = [];
    if (parentLife.job) {
        ancestorMemories.push({
            type: 'occupation',
            content: `Your ${parentLife.family?.structure === 'single_parent' ? 'parent' : 'father'} worked as a ${parentLife.job.title}.`
        });
    }
    if (parentLife.wealth >= 5) {
        ancestorMemories.push({
            type: 'wealth',
            content: 'Stories of your family\'s prosperity are still told.'
        });
    }
    if (parentLife.survivedHealthCrisis) {
        ancestorMemories.push({
            type: 'survival',
            content: 'Your parent\'s struggle with illness is part of family legend.'
        });
    }
    if (karma >= 10) {
        ancestorMemories.push({
            type: 'karma',
            content: 'Your parent\'s kindness is remembered by many.'
        });
    }
    if (karma < -5) {
        ancestorMemories.push({
            type: 'karma',
            content: 'Whispers of your parent\'s misdeeds still circulate.'
        });
    }

    // Calculate inherited stat effects
    const inheritedEffects = {};
    for (const trait of traits) {
        for (const [stat, value] of Object.entries(trait.effects)) {
            if (typeof value === 'number') {
                inheritedEffects[stat] = (inheritedEffects[stat] || 0) + value;
            }
        }
    }

    return {
        traits,
        reputation,
        ancestorMemories,
        inheritedEffects
    };
}

// Apply legacy effects to starting stats
export function applyLegacyEffects(life, legacy) {
    if (!legacy || !legacy.inheritedEffects) return life;

    const newLife = { ...life };

    // Apply stat bonuses
    if (legacy.inheritedEffects.education) {
        newLife.education = clampStat(newLife.education + legacy.inheritedEffects.education);
    }
    if (legacy.inheritedEffects.health) {
        newLife.health = clampStat(newLife.health + legacy.inheritedEffects.health);
    }
    if (legacy.inheritedEffects.connections) {
        newLife.connections = clampStat(newLife.connections + legacy.inheritedEffects.connections);
    }
    if (legacy.inheritedEffects.wealthFloor && newLife.wealth < legacy.inheritedEffects.wealthFloor) {
        newLife.wealth = legacy.inheritedEffects.wealthFloor;
    }

    return newLife;
}

// Track legacy-relevant events during gameplay
export function trackLegacyEvent(life, eventType, data = {}) {
    if (!life.legacyTracking) {
        life.legacyTracking = {
            choicesMade: 0,
            connectionsGained: 0,
            survivedHealthCrisis: false,
            majorDecisions: []
        };
    }

    switch (eventType) {
        case 'choice_made':
            life.legacyTracking.choicesMade++;
            break;
        case 'stat_change':
            if (data.stat === 'connections' && data.delta > 0) {
                life.legacyTracking.connectionsGained += data.delta;
            }
            if (data.stat === 'health' && data.delta >= 2) {
                // Recovered significantly from low health
                life.legacyTracking.survivedHealthCrisis = true;
            }
            break;
        case 'health_crisis_survived':
            life.legacyTracking.survivedHealthCrisis = true;
            break;
        case 'major_decision':
            life.legacyTracking.majorDecisions.push(data);
            break;
    }

    // Copy tracking to life for legacy evaluation
    life.totalChoicesMade = life.legacyTracking.choicesMade;
    life.connectionsGained = life.legacyTracking.connectionsGained;
    life.survivedHealthCrisis = life.legacyTracking.survivedHealthCrisis;
}

// Get legacy events available for this life
export function getLegacyLinkedEvents(life) {
    if (!life.legacy || !life.legacy.traits) return [];

    const events = [];
    for (const trait of life.legacy.traits) {
        if (trait.linkedEvents) {
            events.push(...trait.linkedEvents);
        }
    }
    return events;
}

export function generateLife(country, year = null, era = null, descendantContext = null) {
    if (!country) {
        console.warn('generateLife called without country - this should not happen');
        country = { id: 'UK', name: 'United Kingdom', incomeLevel: 'high', populationScale: 'large',
            baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.05, connections: 0.03, volatility: 0 }};
    }

    // Get era if not provided (fallback to contemporary)
    if (!era) {
        era = getEraById(DEFAULT_ERA_ID);
    }

    const bias = getStartingConditionBias();

    // Get combined modifiers for this country (baseline + income level effects)
    const countryMods = getCountryModifiers(country);

    // Get era modifiers
    const eraMods = getEraModifiers(era);

    // Get world event effects for this year and country
    const worldEventEffects = year ? getWorldEventEffects(year, country.id) : {
        wealth: 0, education: 0, health: 0, connections: 0, volatility: 0
    };

    // Combine country, era, and world event modifiers
    const modifiers = {
        wealth: countryMods.wealth + eraMods.wealth + worldEventEffects.wealth,
        education: countryMods.education + eraMods.education + worldEventEffects.education,
        health: countryMods.health + eraMods.health + worldEventEffects.health,
        connections: countryMods.connections + eraMods.connections + worldEventEffects.connections,
        volatility: countryMods.volatility + eraMods.volatility + worldEventEffects.volatility
    };

    // Generate base wealth (karma-biased)
    const wealthWeights = biasWeights(incomeDistribution.weights, bias);
    let wealth = weightedRandom(wealthWeights);

    // If descendant, bias toward inherited wealth tendency
    if (descendantContext && descendantContext.wealthTendency) {
        // 50% chance to inherit parent's wealth level
        if (Math.random() < 0.5) {
            wealth = descendantContext.wealthTendency;
        }
    }

    // Apply combined wealth modifier (probability-based adjustment)
    if (modifiers.wealth !== 0 && Math.random() < Math.abs(modifiers.wealth) * 5) {
        wealth = clampStat(wealth + Math.sign(modifiers.wealth));
    }

    // Generate other stats (correlated with wealth, then adjusted by combined modifiers)
    let education = weightedRandom(biasWeights(educationByWealth[wealth], bias * 0.5));
    if (modifiers.education !== 0 && Math.random() < Math.abs(modifiers.education) * 5) {
        education = clampStat(education + Math.sign(modifiers.education));
    }

    let health = weightedRandom(biasWeights(healthByWealth[wealth], bias * 0.3));
    if (modifiers.health !== 0 && Math.random() < Math.abs(modifiers.health) * 5) {
        health = clampStat(health + Math.sign(modifiers.health));
    }

    let connections = weightedRandom(biasWeights(connectionsByWealth[wealth], bias * 0.4));
    if (modifiers.connections !== 0 && Math.random() < Math.abs(modifiers.connections) * 5) {
        connections = clampStat(connections + Math.sign(modifiers.connections));
    }

    // Generate family context
    const eraId = era?.id || 'contemporary';
    const familyStructure = getFamilyStructure(eraId);
    const siblingCount = getSiblingCount(eraId);
    const familyStability = getFamilyStability(wealth);
    const setting = getSetting(country.incomeLevel);
    const parentOccupation = familyStructure !== 'orphaned'
        ? getParentOccupation(eraId, wealth)
        : null;

    // Get country flavor for narrative
    const countryFlavor = getCountryFlavor(country.id);

    // Get active world events
    const activeWorldEvents = year ? getActiveWorldEvents(year, country.id) : [];

    let life = {
        // Keep region for backward compatibility with existing code
        region: { id: country.id, name: country.name },
        country: country,
        year: year,
        era: era,
        wealth: wealth,
        education: education,
        health: health,
        connections: connections,
        wealthDescriptor: getWealthDescriptor(wealth),
        incomeLevel: country.incomeLevel,
        volatility: modifiers.volatility,
        // Family context
        family: {
            structure: familyStructure,
            siblingCount: siblingCount,
            stability: familyStability,
            parentOccupation: parentOccupation
        },
        // Birth context
        birthContext: {
            setting: setting,
            countryFlavor: countryFlavor
        },
        // World events active at birth
        worldEvents: activeWorldEvents,
        // Lineage data
        lineage: createLineageData(
            descendantContext?.parentLineageId || null,
            descendantContext?.generation || 1
        ),
        // Legacy data (inherited traits from ancestors)
        legacy: createLegacyData(
            descendantContext?.parentLife || null,
            descendantContext?.parentKarma || 0
        ),
        // For migration system (Feature 6)
        currentCountry: country,
        migrationHistory: [{
            country: country,
            year: year,
            reason: 'birth'
        }],
        // Children status (determined during gameplay)
        hasChildren: undefined,
        // Legacy tracking (filled during gameplay)
        legacyTracking: {
            choicesMade: 0,
            connectionsGained: 0,
            survivedHealthCrisis: false,
            majorDecisions: []
        },
        // Decision tags (character traits earned through choices)
        tags: [],
        tagProgress: initializeTagProgress()
    };

    // Apply legacy effects to starting stats for descendants
    if (descendantContext?.parentLife) {
        life = applyLegacyEffects(life, life.legacy);
    }

    return life;
}

// Record a migration to a new country
export function recordMigration(life, newCountry, year, reason = 'migration') {
    life.currentCountry = newCountry;
    life.migrationHistory.push({
        country: newCountry,
        year: year,
        reason: reason
    });
    return life;
}

// Get migration summary for display
export function getMigrationSummary(life) {
    if (!life.migrationHistory || life.migrationHistory.length <= 1) {
        return null;
    }

    const moves = life.migrationHistory.slice(1); // Skip birth country
    return moves.map(m => `${m.country.name} (${m.year})`).join(' → ');
}

// Income level descriptors for player-facing text
const incomeLevelDescriptors = {
    'low': ['developing', 'emerging', 'struggling'],
    'lower-middle': ['growing', 'developing', 'modest'],
    'upper-middle': ['advancing', 'prospering', 'growing'],
    'high': ['wealthy', 'developed', 'prosperous']
};

// Setting descriptors
const settingDescriptors = {
    urban: ['bustling', 'crowded', 'vibrant'],
    rural: ['quiet', 'remote', 'pastoral'],
    suburban: ['growing', 'quiet', 'comfortable']
};

// Sibling phrases
function getSiblingPhrase(count) {
    if (count === 0) return 'You are an only child.';
    if (count === 1) return 'You have one sibling.';
    if (count === 2) return 'You have two siblings.';
    if (count === 3) return 'You are one of four children.';
    if (count === 4) return 'You are one of five children.';
    if (count === 5) return 'You are one of six children.';
    return `You are one of ${count + 1} children.`;
}

// Family structure phrases
function getFamilyPhrase(structure, parentOccupation, wealthDescriptor) {
    switch (structure) {
        case 'nuclear':
            if (parentOccupation) {
                return `Your father works as a ${parentOccupation}, and your mother tends the home.`;
            }
            return `You are raised by both parents in a ${wealthDescriptor} household.`;
        case 'extended':
            if (parentOccupation) {
                return `Your father works as a ${parentOccupation}, and grandparents help raise you.`;
            }
            return `You grow up in an extended household with grandparents and relatives.`;
        case 'single_parent':
            if (parentOccupation) {
                return `Your mother raises you alone, working as a ${parentOccupation}.`;
            }
            return `You are raised by a single parent who does their best.`;
        case 'orphaned':
            return `You never knew your parents and grow up in an orphanage.`;
        default:
            return `Your family is ${wealthDescriptor}.`;
    }
}

// Stability phrases
function getStabilityPhrase(stability, structure) {
    if (structure === 'orphaned') return '';

    switch (stability) {
        case 'stable':
            return 'Home life is steady and secure.';
        case 'volatile':
            return 'Home life is uncertain, with occasional hardship.';
        case 'broken':
            return 'Home life is troubled, marked by conflict and struggle.';
        default:
            return '';
    }
}

export function getStartDescription(life) {
    const countryName = life.country?.name || life.region.name;
    const descriptor = life.wealthDescriptor;
    const year = life.year;
    const incomeLevel = life.incomeLevel || 'upper-middle';

    // Get era context
    const era = life.era;
    const worldMood = era?.worldMood || 'a changing world';
    const historicalContext = era ? getRandomHistoricalContext(era) : 'the world moves forward';

    // Get country flavor
    const flavor = life.birthContext?.countryFlavor || { culturalNotes: 'a nation with its own character' };
    const setting = life.birthContext?.setting || 'urban';

    // Get family context
    const family = life.family || { structure: 'nuclear', siblingCount: 1, stability: 'stable', parentOccupation: null };

    // Build the narrative in parts
    const parts = [];

    // Lineage info for descendants
    const generation = life.lineage?.generation || 1;
    if (generation > 1) {
        const ordinals = ['', '', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
        const ordinal = ordinals[generation] || `${generation}th`;
        parts.push(`[Generation ${generation}]`);
    }

    // Opening - location and year with country flavor
    const settingDesc = settingDescriptors[setting][Math.floor(Math.random() * 3)];

    if (setting === 'urban' && flavor.urbanCenters && flavor.urbanCenters.length > 0) {
        const city = flavor.urbanCenters[Math.floor(Math.random() * flavor.urbanCenters.length)];
        parts.push(`You are born in ${year} in ${city}, ${countryName} - ${flavor.culturalNotes}.`);
    } else if (setting === 'rural') {
        parts.push(`You are born in ${year} in ${settingDesc} ${countryName}, amid ${flavor.ruralCharacter || 'the countryside'}.`);
    } else {
        parts.push(`You are born in ${year} in ${countryName} - ${flavor.culturalNotes}.`);
    }

    // Era context
    parts.push(`It is ${worldMood}; ${historicalContext}.`);

    // World events
    if (life.worldEvents && life.worldEvents.length > 0) {
        // Add narrative from the most significant world event
        const primaryEvent = life.worldEvents[0];
        if (primaryEvent.birthNarrative) {
            parts.push(primaryEvent.birthNarrative);
        }
    }

    // Family structure and occupation
    parts.push(getFamilyPhrase(family.structure, family.parentOccupation, descriptor));

    // Siblings
    if (family.structure !== 'orphaned') {
        parts.push(getSiblingPhrase(family.siblingCount));
    }

    // Family stability (subtle)
    const stabilityPhrase = getStabilityPhrase(family.stability, family.structure);
    if (stabilityPhrase) {
        parts.push(stabilityPhrase);
    }

    // Wealth context
    if (family.structure !== 'orphaned') {
        const wealthPhrases = {
            1: 'Money is always scarce.',
            2: 'The family gets by, but there is little to spare.',
            3: 'The household is comfortable, neither rich nor poor.',
            4: 'Your family is well-off, with few material wants.',
            5: 'Wealth surrounds you from birth.'
        };
        parts.push(wealthPhrases[life.wealth] || '');
    }

    return parts.filter(p => p).join(' ');
}

// Simple version for fallback
export function getStartDescriptionSimple(life) {
    const countryName = life.country?.name || life.region.name;
    const descriptor = life.wealthDescriptor;
    const year = life.year;

    return `You are born in ${year} in ${countryName}. Your family is ${descriptor}.`;
}

export function getEndDescription(life) {
    const health = life.health;
    const wealth = life.wealth;
    const connections = life.connections;

    const endings = [];

    if (health <= 1) {
        endings.push('Your body gave out.');
        endings.push('Illness claimed you.');
        endings.push('Your health failed.');
    } else if (health >= 4) {
        endings.push('You passed peacefully.');
        endings.push('Age caught up with you gently.');
        endings.push('You drifted away in comfort.');
    } else {
        endings.push('Your time came.');
        endings.push('Life ran its course.');
        endings.push('The end arrived.');
    }

    const base = endings[Math.floor(Math.random() * endings.length)];

    let context = '';
    if (wealth >= 4 && connections >= 4) {
        context = ' You left behind a comfortable legacy.';
    } else if (wealth <= 2 && connections <= 2) {
        context = ' Few noticed your passing.';
    } else if (connections >= 4) {
        context = ' Many mourned your loss.';
    } else if (wealth >= 4) {
        context = ' Your estate was settled quietly.';
    }

    return base + context;
}

export function clampStat(value) {
    return Math.max(1, Math.min(5, value));
}

// Apply job to a life, storing it and adjusting stats based on job modifiers
export function applyJob(life, jobId) {
    if (!jobId) return life;

    const job = getJobById(jobId);
    if (!job) return life;

    const newLife = { ...life, job: job };

    // Apply job modifiers to stats
    // Modifiers are small floats (-0.15 to +0.15), we convert to stat changes
    for (const [stat, mod] of Object.entries(job.modifiers)) {
        if (stat in newLife && typeof newLife[stat] === 'number') {
            // Convert modifier to stat point change (0.10 = 1 stat point)
            const delta = Math.round(mod * 10);
            if (delta !== 0) {
                newLife[stat] = clampStat(newLife[stat] + delta);
            }
        }
    }

    return newLife;
}
