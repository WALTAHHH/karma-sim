// Event utility functions

import { getAgencyChance, getVarianceMultiplier } from '../karma.js';
import { clampStat } from '../life.js';
import { getNextStage, getArchetype, getPreviewConfig } from '../tradeoffs.js';
import { getRegionalCluster, getRegionalThemes } from '../regions.js';
import { applyTagModifiers, getTagVarianceModifier } from '../tags.js';

// Import data from sibling modules (will be set by index.js)
let events = [];
let deathEvents = [];
let crisisEvents = [];
let consequenceChains = {};
let chainEvents = [];

// Initialize function references (called by index.js after all modules load)
export function initializeEventData(data) {
    events = data.events;
    deathEvents = data.deathEvents;
    crisisEvents = data.crisisEvents;
    consequenceChains = data.consequenceChains;
    chainEvents = data.chainEvents;
}

// Check if an outcome triggers a consequence chain
export function checkForChainTrigger(eventId, outcome) {
    for (const chain of Object.values(consequenceChains)) {
        if (chain.triggerEventId === eventId && chain.triggerOutcomeMatch(outcome)) {
            return chain;
        }
    }
    return null;
}

// Get chain event by ID
export function getChainEvent(eventId) {
    return chainEvents.find(e => e.id === eventId) || null;
}

// Process active chains - returns event to trigger if any chain is ready
export function processChains(activeChains, eventCount) {
    for (const activeChain of activeChains) {
        // Find next event in chain sequence
        for (const chainStep of activeChain.remainingSteps) {
            if (chainStep.triggerAfterEvents <= eventCount - activeChain.startEventCount) {
                // This step is ready
                const event = getChainEvent(chainStep.eventId);
                if (event) {
                    // Remove this step from remaining
                    activeChain.remainingSteps = activeChain.remainingSteps.filter(
                        s => s.eventId !== chainStep.eventId
                    );
                    return { event, chainId: activeChain.chainId };
                }
            }
        }
    }
    return null;
}

// Initialize a new active chain
export function initializeActiveChain(chain, currentEventCount) {
    return {
        chainId: chain.id,
        chainName: chain.name,
        startEventCount: currentEventCount,
        remainingSteps: chain.chain.map(step => ({
            eventId: step.eventId,
            triggerAfterEvents: step.delay
        }))
    };
}

// Get events for a specific life stage
export function getEventsForStage(stage) {
    return events.filter(e => e.stage === stage);
}

// Check if character meets event requirements
export function meetsRequirements(event, life) {
    if (!event.requirements) return true;

    for (const [stat, condition] of Object.entries(event.requirements)) {
        const value = life[stat];
        if (condition.startsWith('>')) {
            if (value <= parseInt(condition.slice(1))) return false;
        } else if (condition.startsWith('<')) {
            if (value >= parseInt(condition.slice(1))) return false;
        } else if (condition.startsWith('=')) {
            if (value !== parseInt(condition.slice(1))) return false;
        }
    }
    return true;
}

// Check if an event is available for this region
function meetsRegionalRequirements(event, life) {
    // If event has no regional requirements, it's universal
    if (!event.region && !event.themes) return true;

    const countryId = life.country?.id || life.country;
    const playerRegion = getRegionalCluster(countryId);
    const playerThemes = getRegionalThemes(countryId);

    // Check if event is for a specific region
    if (event.region) {
        if (event.region !== playerRegion.id) return false;
    }

    // Check if event themes match player's regional themes
    if (event.themes && event.themes.length > 0) {
        const hasMatchingTheme = event.themes.some(t => playerThemes.includes(t));
        if (!hasMatchingTheme) return false;
    }

    return true;
}

// Apply era variant to event if available
function applyEraVariant(event, life) {
    if (!event.eraVariants) return event;

    const eraId = life.era?.id || 'contemporary';

    // Check if there's a variant for this era
    const variant = event.eraVariants[eraId];
    if (!variant) return event;

    // Create a new event with the era-specific content merged in
    return {
        ...event,
        prompt: variant.prompt || event.prompt,
        options: variant.options || event.options
    };
}

// Select an event for the current state
export function selectEvent(stage, life, usedEventIds) {
    const stageEvents = getEventsForStage(stage);

    // Filter by requirements and regional availability
    const available = stageEvents.filter(e =>
        !usedEventIds.has(e.id) &&
        meetsRequirements(e, life) &&
        meetsRegionalRequirements(e, life)
    );

    if (available.length === 0) {
        // Fallback: try events without regional requirements
        const universalFallback = stageEvents.filter(e =>
            !usedEventIds.has(e.id) &&
            meetsRequirements(e, life) &&
            !e.region && !e.themes
        );
        if (universalFallback.length > 0) {
            const selected = universalFallback[Math.floor(Math.random() * universalFallback.length)];
            return applyEraVariant(selected, life);
        }
        // Last resort: any unused event from stage
        const fallback = stageEvents.filter(e => !usedEventIds.has(e.id));
        if (fallback.length === 0) return null;
        const selected = fallback[Math.floor(Math.random() * fallback.length)];
        return applyEraVariant(selected, life);
    }

    // Decide between choice and forced based on karma
    const agencyChance = getAgencyChance();
    const preferChoice = Math.random() < agencyChance;

    const choiceEvents = available.filter(e => e.type === 'choice');
    const forcedEvents = available.filter(e => e.type === 'forced');

    let selected;
    if (preferChoice && choiceEvents.length > 0) {
        selected = choiceEvents[Math.floor(Math.random() * choiceEvents.length)];
    } else if (!preferChoice && forcedEvents.length > 0) {
        selected = forcedEvents[Math.floor(Math.random() * forcedEvents.length)];
    } else {
        selected = available[Math.floor(Math.random() * available.length)];
    }

    // Apply era variant if available
    return applyEraVariant(selected, life);
}

// Apply stat modifiers to outcome weights
// High stats favor positive outcomes, low stats favor negative outcomes
// This creates punishing consequences for low stats and rewards for high stats
function applyStatModifiers(life, outcomes) {
    if (!life) return outcomes;

    return outcomes.map(outcome => {
        const effects = outcome.effects || {};
        let weightModifier = 1.0;

        for (const [stat, delta] of Object.entries(effects)) {
            const currentStat = life[stat];
            if (currentStat === undefined) continue;

            // Punishing scale: stats dramatically affect outcome odds
            if (currentStat === 5) {
                // Max stat: +35% to positive outcomes, -35% to negative
                weightModifier *= delta > 0 ? 1.35 : 0.65;
            } else if (currentStat === 4) {
                // High stat: +20% to positive outcomes, -20% to negative
                weightModifier *= delta > 0 ? 1.20 : 0.80;
            } else if (currentStat === 2) {
                // Low stat: +20% to negative outcomes, -20% to positive
                weightModifier *= delta < 0 ? 1.20 : 0.80;
            } else if (currentStat === 1) {
                // Min stat: +40% to negative outcomes, -40% to positive
                weightModifier *= delta < 0 ? 1.40 : 0.60;
            }
            // Stat = 3 is neutral, no modifier
        }

        return {
            ...outcome,
            weight: Math.max(1, Math.round(outcome.weight * weightModifier))
        };
    });
}

// Resolve outcome based on weights, karma, player stats, and active tags
// Returns { outcome, hiddenCost? } where hiddenCost is prepared for queuing if present
export function resolveOutcome(option, currentStage = null, life = null) {
    // Get base variance from karma
    let varianceMult = getVarianceMultiplier();

    // Apply tag variance modifier (risk_taker increases, cautious decreases)
    const tagVarianceMod = getTagVarianceModifier(life);
    varianceMult *= tagVarianceMod;

    // Apply stat modifiers first - this creates the punishing/rewarding dynamic
    const statModifiedOutcomes = applyStatModifiers(life, option.outcomes);

    // Apply tag modifiers - character traits bias outcomes
    const tagModifiedOutcomes = applyTagModifiers(life, statModifiedOutcomes);

    // Adjust weights based on variance multiplier
    // Higher variance = more extreme outcomes
    // Lower variance = more median outcomes
    const adjustedWeights = tagModifiedOutcomes.map((o, i) => {
        const isExtreme = i === 0 || i === tagModifiedOutcomes.length - 1;
        if (isExtreme) {
            return o.weight * varianceMult;
        }
        return o.weight * (2 - varianceMult);
    });

    const total = adjustedWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    let selectedOutcome = tagModifiedOutcomes[tagModifiedOutcomes.length - 1];
    for (let i = 0; i < tagModifiedOutcomes.length; i++) {
        random -= adjustedWeights[i];
        if (random <= 0) {
            selectedOutcome = tagModifiedOutcomes[i];
            break;
        }
    }

    // Prepare hidden cost if present
    let preparedHiddenCost = null;
    if (selectedOutcome.hiddenCost) {
        preparedHiddenCost = prepareHiddenCost(selectedOutcome.hiddenCost, currentStage);
    }

    return {
        outcome: selectedOutcome,
        hiddenCost: preparedHiddenCost
    };
}

// Prepare a hidden cost for queuing based on its trigger type
export function prepareHiddenCost(hiddenCost, currentStage) {
    const prepared = {
        trigger: hiddenCost.trigger,
        effects: { ...hiddenCost.effects },
        description: hiddenCost.description,
        revealed: false
    };

    switch (hiddenCost.trigger) {
        case 'immediate':
            // Will be revealed right after outcome
            break;
        case 'next_stage':
            // Set target stage
            prepared.targetStage = getNextStage(currentStage);
            break;
        case 'delayed':
            // Set countdown
            prepared.eventsRemaining = hiddenCost.delay || 3;
            break;
    }

    return prepared;
}

// Legacy wrapper for backward compatibility - returns just the outcome object
export function resolveOutcomeLegacy(option) {
    const result = resolveOutcome(option);
    return result.outcome;
}

// Apply outcome effects to life
export function applyOutcome(life, outcome) {
    const newLife = { ...life };

    if (outcome.effects) {
        for (const [stat, delta] of Object.entries(outcome.effects)) {
            if (stat in newLife && typeof newLife[stat] === 'number') {
                newLife[stat] = clampStat(newLife[stat] + delta);
            }
        }
    }

    return newLife;
}

// Check if a crisis event should trigger based on stat levels
// Returns a crisis event or null
export function selectCrisisEvent(life, usedEventIds) {
    const crisisCandidates = [];

    // Check health crisis (40% at 1, 20% at 2)
    if (life.health === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'health'));
    } else if (life.health === 2 && Math.random() < 0.20) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'health'));
    }

    // Check wealth crisis (40% at 1)
    if (life.wealth === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'wealth'));
    }

    // Check connections crisis (40% at 1)
    if (life.connections === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'connections'));
    }

    // Filter out already used events
    const available = crisisCandidates.filter(e => !usedEventIds.has(e.id));

    if (available.length === 0) return null;

    // Return a random crisis event from available candidates
    return available[Math.floor(Math.random() * available.length)];
}

// Get appropriate death event
export function selectDeathEvent(life) {
    const matching = deathEvents.filter(e => !e.requirements || meetsRequirements(e, life));
    return matching[Math.floor(Math.random() * matching.length)];
}

// Apply hidden cost effects to life (same as outcome effects)
export function applyHiddenCost(life, hiddenCost) {
    const newLife = { ...life };

    if (hiddenCost.effects) {
        for (const [stat, delta] of Object.entries(hiddenCost.effects)) {
            if (stat in newLife && typeof newLife[stat] === 'number') {
                newLife[stat] = clampStat(newLife[stat] + delta);
            }
        }
    }

    return newLife;
}

// Process pending hidden costs and return those that should be revealed
export function processPendingHiddenCosts(pendingCosts, currentStage) {
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

// Get trade-off info for an event (for UI display)
export function getEventTradeoffInfo(event) {
    if (!event.tradeoff) return null;

    const archetype = getArchetype(event.tradeoff.archetype);
    const clarityConfig = getPreviewConfig(event.tradeoff.clarity);

    return {
        archetype: archetype,
        intensity: event.tradeoff.intensity,
        clarity: event.tradeoff.clarity,
        clarityConfig: clarityConfig
    };
}

// Check if an event has trade-off metadata
export function hasTradeoff(event) {
    return event && event.tradeoff && event.tradeoff.archetype;
}

// Get events filtered by trade-off archetype (useful for testing)
export function getEventsByArchetype(archetype) {
    return events.filter(e => e.tradeoff && e.tradeoff.archetype === archetype);
}
