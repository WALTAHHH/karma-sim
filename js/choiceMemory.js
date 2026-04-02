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
        // === LATE LIFE REFLECTIONS ===
        'old_regret': {
            checks: ['war_refugee', 'family_obligation', 'leave_home', 'career_crossroads', 'romantic_choice'],
            templates: {
                'war_refugee': 'You remember fleeing the bombs, leaving everything behind.',
                'family_obligation': 'You think of the family you supported, or didn\'t.',
                'leave_home': 'The city you left for feels like another life now.',
                'career_crossroads': 'The path not taken still haunts you.',
                'romantic_choice': 'Love found or love lost — it shaped everything after.'
            }
        },
        'legacy_question': {
            checks: ['child_arrives', 'childless_reflection', 'mentor_figure', 'younger_generation'],
            templates: {
                'child_arrives': 'Your children will inherit what you leave.',
                'childless_reflection': 'Without children, legacy takes other forms.',
                'mentor_figure': 'You remember those who shaped you. Now you shape others.',
                'younger_generation': 'The young ones you guided — that is legacy.'
            }
        },
        'final_kindness': {
            checks: ['helping_stranger', 'stranger_in_need', 'community_crisis'],
            templates: {
                'helping_stranger': 'You remember helping a stranger once, long ago.',
                'stranger_in_need': 'You\'ve faced this choice before.',
                'community_crisis': 'When your community needed you, you were there.'
            }
        },
        'memories': {
            checks: ['childhood_friendship', 'first_loss', 'romantic_choice', 'old_friend_returns'],
            templates: {
                'childhood_friendship': 'That first friend — you wonder where they are now.',
                'first_loss': 'The first goodbye never leaves you.',
                'romantic_choice': 'Love. It all comes back to love.',
                'old_friend_returns': 'The past has a way of finding you.'
            }
        },
        'wisdom_sought': {
            checks: ['mentor_figure', 'mentor_appears', 'education_opportunity'],
            templates: {
                'mentor_figure': 'Once, someone believed in you. Now they believe in you.',
                'mentor_appears': 'You learned from the best. Now it\'s your turn.',
                'education_opportunity': 'Knowledge compounds. You\'ve spent a lifetime proving it.'
            }
        },
        
        // === HEALTH CONSEQUENCES ===
        'health_decline': {
            checks: ['health_scare', 'health_crisis', 'early_illness', 'risky_venture'],
            templates: {
                'health_scare': 'This isn\'t the first warning your body has sent.',
                'health_crisis': 'Your body remembers every battle it\'s fought.',
                'early_illness': 'You\'ve been fighting this body since childhood.',
                'risky_venture': 'The risks you took — your body kept the score.'
            }
        },
        'body_slowing': {
            checks: ['health_scare', 'overtime_promotion', 'dangerous_opportunity'],
            templates: {
                'health_scare': 'The warnings came years ago. You didn\'t listen.',
                'overtime_promotion': 'All those long nights. Your body remembers each one.',
                'dangerous_opportunity': 'Adventure has its price. You\'re paying it now.'
            }
        },
        'chronic_condition_begins': {
            checks: ['health_scare', 'health_crisis', 'factory_opening'],
            templates: {
                'health_scare': 'That earlier warning — it was a preview.',
                'health_crisis': 'Your body has been sending signals for years.',
                'factory_opening': 'The factory air. The chemicals. It catches up.'
            }
        },
        
        // === MIGRATION & IDENTITY ===
        'integration_milestone': {
            checks: ['culture_shock', 'language_barrier', 'diaspora_community'],
            templates: {
                'culture_shock': 'You remember when everything here was strange and foreign.',
                'language_barrier': 'Once, you couldn\'t say a word. Look how far you\'ve come.',
                'diaspora_community': 'Your people made this place feel like home.'
            }
        },
        'discrimination_faced': {
            checks: ['between_two_worlds', 'culture_shock', 'immigration_wave'],
            templates: {
                'between_two_worlds': 'You\'ve always lived between worlds. This is nothing new.',
                'culture_shock': 'They see an outsider. You remember arriving.',
                'immigration_wave': 'You came seeking better. Some don\'t want you here.'
            }
        },
        'nostalgia_weighs': {
            checks: ['leave_home', 'war_refugee', 'opportunity_abroad', 'family_reunion_call'],
            templates: {
                'leave_home': 'The place you left — it calls to you in dreams.',
                'war_refugee': 'Home exists only in memory now.',
                'opportunity_abroad': 'You traded home for opportunity. Was it worth it?',
                'family_reunion_call': 'Family ties stretch across borders, never breaking.'
            }
        },
        'heritage_rediscovery': {
            checks: ['heritage_shame', 'between_two_worlds', 'cultural_bridge'],
            templates: {
                'heritage_shame': 'Once you hid it. Now you seek it.',
                'between_two_worlds': 'Neither fully one nor the other — perhaps that\'s strength.',
                'cultural_bridge': 'You connect worlds. It\'s who you\'ve become.'
            }
        },
        'roots_or_return': {
            checks: ['leave_home', 'war_refugee', 'family_abroad', 'nostalgia_weighs'],
            templates: {
                'leave_home': 'You\'ve built a life here. But roots run deep.',
                'war_refugee': 'Is it safe to go back? Do you want to?',
                'family_abroad': 'Family ties tug you back.',
                'nostalgia_weighs': 'The longing has grown too strong to ignore.'
            }
        },
        
        // === CAREER & AMBITION ===
        'career_recognition': {
            checks: ['skill_training', 'career_crossroads', 'mentor_appears', 'education_opportunity'],
            templates: {
                'skill_training': 'Those early lessons paid off.',
                'career_crossroads': 'You chose this path. It chose you back.',
                'mentor_appears': 'They saw something in you. You proved them right.',
                'education_opportunity': 'Knowledge opened doors. Now look where you stand.'
            }
        },
        'leadership_opportunity': {
            checks: ['community_role', 'mentor_appears', 'reputation_test'],
            templates: {
                'community_role': 'You\'ve served quietly. Now they want you to lead.',
                'mentor_appears': 'Your mentor\'s lessons prepared you for this.',
                'reputation_test': 'Your reputation precedes you. They trust you.'
            }
        },
        'business_crossroads': {
            checks: ['risky_venture', 'startup_leap', 'investment_opportunity'],
            templates: {
                'risky_venture': 'Risk brought you here. More risk beckons.',
                'startup_leap': 'That first leap changed everything.',
                'investment_opportunity': 'Money moves. You\'ve learned to move with it.'
            }
        },
        
        // === FAMILY CONSEQUENCES ===
        'child_milestone': {
            checks: ['child_arrives', 'family_planning', 'romantic_choice'],
            templates: {
                'child_arrives': 'It feels like yesterday they were born.',
                'family_planning': 'Every decision led to this moment.',
                'romantic_choice': 'Love created this. Created them.'
            }
        },
        'family_estrangement': {
            checks: ['family_obligation', 'sibling_rivalry', 'leave_home'],
            templates: {
                'family_obligation': 'The weight of family expectations — it broke something.',
                'sibling_rivalry': 'Old wounds never fully healed.',
                'leave_home': 'You left. Some never forgave you.'
            }
        },
        'reconciliation_chance': {
            checks: ['family_estrangement', 'sibling_rivalry', 'first_loss'],
            templates: {
                'family_estrangement': 'Years of silence. One chance to break it.',
                'sibling_rivalry': 'You were children once, fighting. Now look at you.',
                'first_loss': 'Loss taught you — don\'t let more time pass.'
            }
        },
        
        // === CRISIS CALLBACKS ===
        'debt_spiral': {
            checks: ['risky_investment', 'windfall_choice', 'startup_leap'],
            templates: {
                'risky_investment': 'The risk didn\'t pay off. Now comes the reckoning.',
                'windfall_choice': 'Easy come, easy go. It\'s gone.',
                'startup_leap': 'The dream crashed. The debts remain.'
            }
        },
        'desperate_measures': {
            checks: ['debt_spiral', 'family_hardship', 'economic_collapse'],
            templates: {
                'debt_spiral': 'Rock bottom. You never thought you\'d be here.',
                'family_hardship': 'You knew hardship as a child. You know it now.',
                'economic_collapse': 'The system failed. You\'re picking up the pieces.'
            }
        },
        
        // === MORAL ECHOES ===
        'reputation_test': {
            checks: ['caught_lying', 'helping_stranger', 'community_role'],
            templates: {
                'caught_lying': 'Trust, once broken, takes years to rebuild.',
                'helping_stranger': 'Your kindness is remembered.',
                'community_role': 'People know your name. Your character.'
            }
        },
        'community_hero': {
            checks: ['community_crisis', 'helping_stranger', 'stranger_in_need'],
            templates: {
                'community_crisis': 'When it mattered, you stepped up.',
                'helping_stranger': 'Small kindnesses compound. You\'re living proof.',
                'stranger_in_need': 'You\'ve always helped. It\'s who you are.'
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
