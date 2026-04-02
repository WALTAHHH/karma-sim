// Choice Memory System
// Tracks significant choices that can echo forward in later events

// Memory structure: { choiceId: { text, timestamp, eventId, stage } }
let choiceMemory = {};

// Initialize/reset memory for a new life
export function resetChoiceMemory() {
    choiceMemory = {};
}

// Record a significant choice
export function rememberChoice(eventId, choiceText, stage, tags = []) {
    choiceMemory[eventId] = {
        text: choiceText,
        stage: stage,
        tags: tags,
        timestamp: Date.now()
    };
}

// Check if a specific choice was made
export function didChoose(eventId) {
    return eventId in choiceMemory;
}

// Get the choice made for a specific event
export function getChoice(eventId) {
    return choiceMemory[eventId] || null;
}

// Get all choices with a specific tag
export function getChoicesWithTag(tag) {
    return Object.entries(choiceMemory)
        .filter(([_, choice]) => choice.tags.includes(tag))
        .map(([eventId, choice]) => ({ eventId, ...choice }));
}

// Generate callback text based on past choices
// Returns null if no relevant memory, or a string to prepend to event text
export function getCallbackText(eventId, currentStage) {
    // Define callback mappings: what events can reference what past choices
    const callbacks = {
        // Late life events can reference earlier choices
        'old_regret': {
            checks: ['war_refugee', 'family_obligation', 'leave_home'],
            templates: {
                'war_refugee': 'You remember fleeing the bombs, leaving everything behind.',
                'family_obligation': 'You think of the family you supported, or didn\'t.',
                'leave_home': 'The city you left for feels like another life now.'
            }
        },
        'legacy_question': {
            checks: ['child_arrives', 'childless_reflection'],
            templates: {
                'child_arrives': 'Your children will inherit what you leave.',
                'childless_reflection': 'Without children, legacy takes other forms.'
            }
        },
        'final_kindness': {
            checks: ['helping_stranger', 'stranger_in_need'],
            templates: {
                'helping_stranger': 'You remember helping a stranger once, long ago.',
                'stranger_in_need': 'You\'ve faced this choice before.'
            }
        },
        'health_decline': {
            checks: ['health_scare', 'health_crisis'],
            templates: {
                'health_scare': 'This isn\'t the first warning your body has sent.',
                'health_crisis': 'Your body remembers every battle it\'s fought.'
            }
        },
        // Integration can reference culture shock
        'integration_milestone': {
            checks: ['culture_shock'],
            templates: {
                'culture_shock': 'You remember when everything here was strange and foreign.'
            }
        },
        // Discrimination can reference earlier struggles
        'discrimination_faced': {
            checks: ['between_two_worlds'],
            templates: {
                'between_two_worlds': 'You\'ve always lived between worlds. This is nothing new.'
            }
        }
    };

    const callback = callbacks[eventId];
    if (!callback) return null;

    // Check each potential past choice
    for (const checkId of callback.checks) {
        if (didChoose(checkId)) {
            return callback.templates[checkId];
        }
    }

    return null;
}

// Get memory for serialization (save/load)
export function getMemoryState() {
    return { ...choiceMemory };
}

// Restore memory from serialization
export function restoreMemoryState(savedMemory) {
    choiceMemory = savedMemory ? { ...savedMemory } : {};
}
