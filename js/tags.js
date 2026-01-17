// Decision Tag System
// Tags are per-life character traits with double-edged effects

const TAGS_KEY = 'karma_simulator_tags';

// Tag definitions - 12 tags across 3 categories
export const tags = [
    // === ORIENTATION TAGS ===
    {
        id: 'family_oriented',
        name: 'Family Oriented',
        icon: '👨‍👩‍👧',
        description: 'You prioritize family bonds above all else.',
        flavorText: 'Blood runs thicker than ambition.',
        category: 'orientation',
        bonuses: { connections: 0.25 },
        penalties: { wealth: 0.20 },
        axis: 'family_vs_career',
        threshold: 3
    },
    {
        id: 'career_driven',
        name: 'Career Driven',
        icon: '💼',
        description: 'You pursue professional success with single-minded focus.',
        flavorText: 'Success demands sacrifice.',
        category: 'orientation',
        bonuses: { wealth: 0.25, education: 0.15 },
        penalties: { connections: 0.20 },
        axis: 'family_vs_career',
        threshold: -3
    },
    {
        id: 'wanderer',
        name: 'Wanderer',
        icon: '🧭',
        description: 'You seek new horizons and embrace change.',
        flavorText: 'Not all who wander are lost.',
        category: 'orientation',
        bonuses: { wealth: 0.20, education: 0.20 },
        penalties: { connections: 0.25 },
        axis: 'roots_vs_wings',
        threshold: -3
    },
    {
        id: 'rooted',
        name: 'Rooted',
        icon: '🌳',
        description: 'You find strength in stability and community.',
        flavorText: 'Deep roots weather any storm.',
        category: 'orientation',
        bonuses: { connections: 0.25, health: 0.10 },
        penalties: { wealth: 0.15, education: 0.10 },
        axis: 'roots_vs_wings',
        threshold: 3
    },

    // === SOCIAL TAGS ===
    {
        id: 'extrovert',
        name: 'Extrovert',
        icon: '🎉',
        description: 'You thrive in social situations and build networks easily.',
        flavorText: 'Every stranger is a friend you haven\'t met.',
        category: 'social',
        bonuses: { connections: 0.30 },
        penalties: { education: 0.15 },
        axis: 'social_vs_solitary',
        threshold: 3
    },
    {
        id: 'introvert',
        name: 'Introvert',
        icon: '📚',
        description: 'You find power in solitude and deep focus.',
        flavorText: 'Stillness speaks volumes.',
        category: 'social',
        bonuses: { education: 0.25, health: 0.10 },
        penalties: { connections: 0.20 },
        axis: 'social_vs_solitary',
        threshold: -3
    },
    {
        id: 'generous',
        name: 'Generous',
        icon: '🤲',
        description: 'You give freely of yourself to help others.',
        flavorText: 'What you give, returns tenfold.',
        category: 'social',
        bonuses: { connections: 0.20 },
        penalties: { wealth: 0.15 },
        karmaBonus: 1,
        axis: 'self_vs_others',
        threshold: 3
    },
    {
        id: 'pragmatist',
        name: 'Pragmatist',
        icon: '⚖️',
        description: 'You make practical choices that serve your interests.',
        flavorText: 'Survival favors the shrewd.',
        category: 'social',
        bonuses: { wealth: 0.20 },
        penalties: { connections: 0.15 },
        karmaPenalty: 1,
        axis: 'self_vs_others',
        threshold: -3
    },

    // === VALUES TAGS ===
    {
        id: 'traditionalist',
        name: 'Traditionalist',
        icon: '🏛️',
        description: 'You honor the wisdom of the past.',
        flavorText: 'Some things should never change.',
        category: 'values',
        bonuses: { connections: 0.15, health: 0.15 },
        penalties: { education: 0.15 },
        axis: 'tradition_vs_change',
        threshold: 3
    },
    {
        id: 'progressive',
        name: 'Progressive',
        icon: '🚀',
        description: 'You embrace innovation and challenge conventions.',
        flavorText: 'The future belongs to the bold.',
        category: 'values',
        bonuses: { education: 0.25 },
        penalties: { connections: 0.10 },
        axis: 'tradition_vs_change',
        threshold: -3
    },
    {
        id: 'risk_taker',
        name: 'Risk Taker',
        icon: '🎲',
        description: 'You chase big rewards despite the dangers.',
        flavorText: 'Fortune favors the bold.',
        category: 'values',
        // Risk taker increases variance - both good and bad outcomes more likely
        varianceBonus: 0.30,
        axis: 'risk_vs_safety',
        threshold: 3
    },
    {
        id: 'cautious',
        name: 'Cautious',
        icon: '🛡️',
        description: 'You minimize risk and protect what you have.',
        flavorText: 'A bird in hand is worth two in the bush.',
        category: 'values',
        // Cautious reduces variance - extreme outcomes less likely
        variancePenalty: 0.25,
        axis: 'risk_vs_safety',
        threshold: -3
    }
];

// Axis definitions for pattern recognition
export const tagAxes = {
    family_vs_career: {
        positive: 'family_oriented',   // +3 = family oriented
        negative: 'career_driven'      // -3 = career driven
    },
    roots_vs_wings: {
        positive: 'rooted',            // +3 = rooted
        negative: 'wanderer'           // -3 = wanderer
    },
    social_vs_solitary: {
        positive: 'extrovert',         // +3 = extrovert
        negative: 'introvert'          // -3 = introvert
    },
    self_vs_others: {
        positive: 'generous',          // +3 = generous
        negative: 'pragmatist'         // -3 = pragmatist
    },
    tradition_vs_change: {
        positive: 'traditionalist',    // +3 = traditionalist
        negative: 'progressive'        // -3 = progressive
    },
    risk_vs_safety: {
        positive: 'risk_taker',        // +3 = risk taker
        negative: 'cautious'           // -3 = cautious
    }
};

// Get tag by ID
export function getTagById(id) {
    return tags.find(t => t.id === id);
}

// Get all tags in a category
export function getTagsByCategory(category) {
    return tags.filter(t => t.category === category);
}

// Initialize tag progress for a new life
export function initializeTagProgress() {
    return {
        family_vs_career: 0,
        roots_vs_wings: 0,
        social_vs_solitary: 0,
        self_vs_others: 0,
        tradition_vs_change: 0,
        risk_vs_safety: 0
    };
}

// Check if any tag thresholds have been reached
// Returns array of newly earned tag IDs
export function checkTagThresholds(tagProgress, currentTags) {
    const newTags = [];
    const currentTagSet = new Set(currentTags);

    for (const [axis, axisConfig] of Object.entries(tagAxes)) {
        const value = tagProgress[axis] || 0;

        // Check positive threshold
        if (value >= 3 && !currentTagSet.has(axisConfig.positive)) {
            newTags.push(axisConfig.positive);
        }
        // Check negative threshold
        if (value <= -3 && !currentTagSet.has(axisConfig.negative)) {
            newTags.push(axisConfig.negative);
        }
    }

    return newTags;
}

// Apply tag modifiers to outcome weights
export function applyTagModifiers(life, outcomes) {
    if (!life || !life.tags || life.tags.length === 0) {
        return outcomes;
    }

    return outcomes.map(outcome => {
        let weightModifier = 1.0;
        const effects = outcome.effects || {};

        for (const tagId of life.tags) {
            const tag = getTagById(tagId);
            if (!tag) continue;

            // Apply stat bonuses (increase weight for positive outcomes in bonus stats)
            if (tag.bonuses) {
                for (const [stat, bonus] of Object.entries(tag.bonuses)) {
                    if (effects[stat] && effects[stat] > 0) {
                        weightModifier *= (1 + bonus);
                    }
                }
            }

            // Apply stat penalties (decrease weight for positive outcomes in penalty stats)
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
}

// Calculate variance modifier from tags (for risk_taker / cautious)
export function getTagVarianceModifier(life) {
    if (!life || !life.tags || life.tags.length === 0) {
        return 1.0;
    }

    let modifier = 1.0;

    for (const tagId of life.tags) {
        const tag = getTagById(tagId);
        if (!tag) continue;

        if (tag.varianceBonus) {
            modifier += tag.varianceBonus;
        }
        if (tag.variancePenalty) {
            modifier -= tag.variancePenalty;
        }
    }

    return Math.max(0.5, Math.min(2.0, modifier));
}

// Get karma modifier from tags (for generous / pragmatist)
export function getTagKarmaModifier(life) {
    if (!life || !life.tags || life.tags.length === 0) {
        return 0;
    }

    let modifier = 0;

    for (const tagId of life.tags) {
        const tag = getTagById(tagId);
        if (!tag) continue;

        if (tag.karmaBonus) {
            modifier += tag.karmaBonus;
        }
        if (tag.karmaPenalty) {
            modifier -= tag.karmaPenalty;
        }
    }

    return modifier;
}

// ============================================
// PERSISTENT TRACKING (for collections)
// ============================================

// Get all tags ever discovered (for collections)
export function getDiscoveredTags() {
    try {
        const stored = localStorage.getItem(TAGS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
        return new Set();
    }
}

// Save discovered tags
function saveDiscoveredTags(tagSet) {
    try {
        localStorage.setItem(TAGS_KEY, JSON.stringify([...tagSet]));
    } catch (e) {
        console.error('Failed to save discovered tags:', e);
    }
}

// Mark a tag as discovered (for collections)
export function discoverTag(tagId) {
    const discovered = getDiscoveredTags();
    if (!discovered.has(tagId)) {
        discovered.add(tagId);
        saveDiscoveredTags(discovered);
        return true;
    }
    return false;
}

// Get discovery progress
export function getTagDiscoveryProgress() {
    const discovered = getDiscoveredTags();
    return {
        discovered: discovered.size,
        total: tags.length,
        percentage: Math.round((discovered.size / tags.length) * 100)
    };
}

// Reset discovered tags (for debug)
export function resetDiscoveredTags() {
    localStorage.removeItem(TAGS_KEY);
}

// Check if a specific tag has been discovered
export function isTagDiscovered(tagId) {
    const discovered = getDiscoveredTags();
    return discovered.has(tagId);
}

// Get total tag count
export function getTotalTagCount() {
    return tags.length;
}
