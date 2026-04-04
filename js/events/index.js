// Event system - modular re-export
// Maintains backward compatibility with the original events.js API

// Import event data from stage modules
import { childhoodEvents } from './childhood.js';
import { young_adultEvents } from './young_adult.js';
import { middleEvents } from './middle.js';
import { lateEvents } from './late.js';

// Import lifecycle events (death, crisis)
import { deathEvents, crisisEvents } from './lifecycle.js';

// Import chains
import { consequenceChains, chainEvents } from './chains.js';

// Import functions and initialize them with data
import {
    initializeEventData,
    checkForChainTrigger,
    getChainEvent,
    processChains,
    initializeActiveChain,
    getEventsForStage,
    meetsRequirements,
    selectEvent,
    resolveOutcome,
    prepareHiddenCost,
    resolveOutcomeLegacy,
    applyOutcome,
    selectCrisisEvent,
    selectDeathEvent,
    applyHiddenCost,
    processPendingHiddenCosts,
    getEventTradeoffInfo,
    hasTradeoff,
    getEventsByArchetype
} from './functions.js';

// Combine all events into a single array (backward compatibility)
export const events = [
    ...childhoodEvents,
    ...young_adultEvents,
    ...middleEvents,
    ...lateEvents
];

// Initialize function module with all data
initializeEventData({
    events,
    deathEvents,
    crisisEvents,
    consequenceChains,
    chainEvents
});

// Re-export everything for backward compatibility
export { deathEvents };
export { consequenceChains };
export { chainEvents };

// Re-export all functions
export {
    checkForChainTrigger,
    getChainEvent,
    processChains,
    initializeActiveChain,
    getEventsForStage,
    meetsRequirements,
    selectEvent,
    resolveOutcome,
    prepareHiddenCost,
    resolveOutcomeLegacy,
    applyOutcome,
    selectCrisisEvent,
    selectDeathEvent,
    applyHiddenCost,
    processPendingHiddenCosts,
    getEventTradeoffInfo,
    hasTradeoff,
    getEventsByArchetype
};

// Also export the individual stage event arrays for direct access
export { childhoodEvents };
export { young_adultEvents };
export { middleEvents };
export { lateEvents };
export { crisisEvents };
