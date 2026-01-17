// Trade-off system for meaningful choices with hidden costs
// Six archetypes that define the nature of dilemmas players face

export const TRADEOFF_ARCHETYPES = {
    money_health: {
        id: 'money_health',
        name: 'Money vs Health',
        description: 'Financial gain at physical cost, or vice versa',
        primaryStats: ['wealth', 'health'],
        karmaWeight: 0,  // Neutral - personal choice
        hiddenCostLikelihood: 0.25,
        examples: ['Overwork for promotion', 'Expensive treatment', 'Dangerous job']
    },
    passion_safety: {
        id: 'passion_safety',
        name: 'Passion vs Safety',
        description: 'Following dreams versus the secure path',
        primaryStats: ['education', 'wealth'],
        karmaWeight: 0.5,  // Slight positive for courage
        hiddenCostLikelihood: 0.3,
        examples: ['Artist vs accountant', 'Startup vs corporate', 'Adventure vs routine']
    },
    now_later: {
        id: 'now_later',
        name: 'Short-term vs Long-term',
        description: 'Immediate gratification versus future investment',
        primaryStats: ['wealth', 'education'],
        karmaWeight: -0.3,  // Slight negative for impatience
        hiddenCostLikelihood: 0.6,  // High chance of delayed consequences
        examples: ['Spend vs save', 'Party vs study', 'Quick fix vs proper solution']
    },
    stability_opportunity: {
        id: 'stability_opportunity',
        name: 'Stability vs Opportunity',
        description: 'Safe harbor versus uncharted waters',
        primaryStats: ['wealth', 'connections'],
        karmaWeight: 0,
        hiddenCostLikelihood: 0.4,
        examples: ['Keep job vs startup', 'Stay vs relocate', 'Known vs unknown']
    },
    family_mobility: {
        id: 'family_mobility',
        name: 'Family vs Geographic Mobility',
        description: 'Roots versus wings',
        primaryStats: ['connections', 'wealth'],
        karmaWeight: 0.3,  // Slight positive for family values
        hiddenCostLikelihood: 0.2,
        examples: ['Care for parents vs career abroad', 'Stay for kids vs opportunity']
    },
    self_others: {
        id: 'self_others',
        name: 'Self vs Others',
        description: 'Personal needs versus community and relationships',
        primaryStats: ['connections', 'karma'],
        karmaWeight: 1.0,  // Strong karma influence
        hiddenCostLikelihood: 0.15,
        examples: ['Help stranger vs self-interest', 'Sacrifice vs self-preservation']
    }
};

// Intensity affects magnitude of effects and hidden cost probability
export const INTENSITY_MODIFIERS = {
    mild: {
        effectMultiplier: 0.5,
        hiddenCostMultiplier: 0.5,
        description: 'Minor consequences either way'
    },
    moderate: {
        effectMultiplier: 1.0,
        hiddenCostMultiplier: 1.0,
        description: 'Meaningful impact on your life'
    },
    severe: {
        effectMultiplier: 1.5,
        hiddenCostMultiplier: 1.5,
        description: 'Life-altering decision'
    }
};

// Clarity determines how much information player sees before choosing
export const CLARITY_LEVELS = {
    transparent: {
        showGains: true,
        showRisks: true,
        showMagnitude: true,
        description: 'Full information available'
    },
    partial: {
        showGains: true,
        showRisks: true,
        showMagnitude: false,
        description: 'Outcomes unclear but stakes visible'
    },
    hidden: {
        showGains: true,
        showRisks: false,
        showMagnitude: false,
        description: 'Unknown consequences lurk'
    }
};

// Get archetype by ID
export function getArchetype(archetypeId) {
    return TRADEOFF_ARCHETYPES[archetypeId] || null;
}

// Calculate if a hidden cost should trigger based on archetype and intensity
export function shouldTriggerHiddenCost(archetypeId, intensity) {
    const archetype = getArchetype(archetypeId);
    if (!archetype) return false;

    const baseProbability = archetype.hiddenCostLikelihood || 0.2;
    const intensityMod = INTENSITY_MODIFIERS[intensity]?.hiddenCostMultiplier || 1.0;

    return Math.random() < (baseProbability * intensityMod);
}

// Get preview configuration for an option based on clarity level
export function getPreviewConfig(clarity) {
    return CLARITY_LEVELS[clarity] || CLARITY_LEVELS.partial;
}

// Format preview text for display
export function formatPreviewText(preview, clarityConfig) {
    const parts = [];

    if (preview.gains && preview.gains.length > 0 && clarityConfig.showGains) {
        const gainsText = preview.gains.map(stat => {
            if (clarityConfig.showMagnitude && preview.gainMagnitude) {
                return `+${stat}`;
            }
            return `+${stat}`;
        }).join(', ');
        parts.push(gainsText);
    }

    if (preview.risks && preview.risks.length > 0 && clarityConfig.showRisks) {
        const risksText = preview.risks.map(stat => {
            if (clarityConfig.showMagnitude && preview.riskMagnitude) {
                return `-${stat}`;
            }
            return `-${stat}`;
        }).join(', ');
        parts.push(risksText);
    }

    if (!clarityConfig.showRisks && preview.risks && preview.risks.length > 0) {
        parts.push('???');
    }

    return parts.join(' / ');
}

// Get karma modifier based on archetype for outcome selection
export function getArchetypeKarmaInfluence(archetypeId, currentKarma) {
    const archetype = getArchetype(archetypeId);
    if (!archetype) return 0;

    // Karma weight determines how much current karma influences this type of decision
    const normalized = currentKarma / 100;  // -1 to 1
    return normalized * archetype.karmaWeight * 0.1;
}

// Determine next stage for hidden cost triggers
export function getNextStage(currentStage) {
    const stages = ['childhood', 'young_adult', 'middle', 'late'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
        return stages[currentIndex + 1];
    }
    return null;  // Already at late stage
}

// Check if hidden cost should reveal based on trigger conditions
export function checkHiddenCostTrigger(cost, currentStage, eventsElapsed) {
    if (!cost) return false;

    switch (cost.trigger) {
        case 'immediate':
            return true;
        case 'next_stage':
            return cost.targetStage === currentStage;
        case 'delayed':
            return cost.eventsRemaining !== undefined && cost.eventsRemaining <= 0;
        default:
            return false;
    }
}

// Process pending hidden costs, decrementing delays and checking triggers
export function processPendingCosts(pendingCosts, currentStage) {
    const toReveal = [];
    const remaining = [];

    for (const cost of pendingCosts) {
        // Check stage-based triggers
        if (cost.trigger === 'next_stage' && cost.targetStage === currentStage) {
            toReveal.push(cost);
            continue;
        }

        // Check and decrement delayed triggers
        if (cost.trigger === 'delayed') {
            cost.eventsRemaining--;
            if (cost.eventsRemaining <= 0) {
                toReveal.push(cost);
                continue;
            }
        }

        remaining.push(cost);
    }

    return { toReveal, remaining };
}

// Create a hidden cost object for an outcome
export function createHiddenCost(trigger, effects, description, options = {}) {
    const cost = {
        trigger,
        effects,
        description,
        revealed: false
    };

    if (trigger === 'delayed') {
        cost.eventsRemaining = options.delay || 3;
    }

    if (trigger === 'next_stage') {
        cost.targetStage = options.targetStage || null;
    }

    return cost;
}

// Validate trade-off event structure
export function validateTradeoffEvent(event) {
    const errors = [];

    if (event.tradeoff) {
        if (!TRADEOFF_ARCHETYPES[event.tradeoff.archetype]) {
            errors.push(`Unknown archetype: ${event.tradeoff.archetype}`);
        }
        if (!INTENSITY_MODIFIERS[event.tradeoff.intensity]) {
            errors.push(`Unknown intensity: ${event.tradeoff.intensity}`);
        }
        if (!CLARITY_LEVELS[event.tradeoff.clarity]) {
            errors.push(`Unknown clarity: ${event.tradeoff.clarity}`);
        }
    }

    if (event.options) {
        event.options.forEach((option, i) => {
            if (option.preview) {
                if (!Array.isArray(option.preview.gains)) {
                    errors.push(`Option ${i}: preview.gains must be array`);
                }
                if (!Array.isArray(option.preview.risks)) {
                    errors.push(`Option ${i}: preview.risks must be array`);
                }
            }

            if (option.outcomes) {
                option.outcomes.forEach((outcome, j) => {
                    if (outcome.hiddenCost) {
                        const validTriggers = ['immediate', 'next_stage', 'delayed'];
                        if (!validTriggers.includes(outcome.hiddenCost.trigger)) {
                            errors.push(`Option ${i}, Outcome ${j}: invalid hidden cost trigger`);
                        }
                    }
                });
            }
        });
    }

    return errors;
}
