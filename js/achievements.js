// Achievements system

import { getDiscoveredTags, getTagDiscoveryProgress } from './tags.js';

const ACHIEVEMENTS_KEY = 'karma_simulator_achievements';
const TOTAL_EVENTS = 25; // Regular events (excluding death events)
const TOTAL_REGIONS = 4;

// Achievement definitions
export const achievements = [
    // === EXPLORATION ===
    {
        id: 'wanderer',
        name: 'Wanderer',
        description: 'Encountered all region types',
        category: 'exploration'
    },
    {
        id: 'event_horizon',
        name: 'Event Horizon',
        description: 'Experienced 20 unique events',
        category: 'exploration'
    },
    {
        id: 'completionist',
        name: 'Completionist',
        description: 'Experienced all 25 unique events',
        category: 'exploration'
    },
    {
        id: 'trait_collector',
        name: 'Trait Collector',
        description: 'Discovered 6 unique character traits',
        category: 'exploration'
    },
    {
        id: 'full_spectrum',
        name: 'Full Spectrum',
        description: 'Discovered all 12 character traits',
        category: 'exploration'
    },

    // === KARMA ACHIEVEMENTS ===
    {
        id: 'enlightened',
        name: 'Enlightened',
        description: 'Reached maximum karma (+100) in one life',
        category: 'karma'
    },
    {
        id: 'damned',
        name: 'Damned',
        description: 'Reached minimum karma (-100) in one life',
        category: 'karma'
    },
    {
        id: 'karmic_balance',
        name: 'Karmic Balance',
        description: 'Finished a life with exactly 0 karma change',
        category: 'karma'
    },
    {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Gained +50 karma in one life',
        category: 'karma'
    },
    {
        id: 'fallen_angel',
        name: 'Fallen Angel',
        description: 'Lost -50 karma in one life',
        category: 'karma'
    },
    {
        id: 'virtuous',
        name: 'Virtuous',
        description: 'Accumulated +100 total karma across all lives',
        category: 'karma'
    },
    {
        id: 'wicked',
        name: 'Wicked',
        description: 'Accumulated -100 total karma across all lives',
        category: 'karma'
    },
    {
        id: 'saint',
        name: 'Saint',
        description: 'Earned the Generous trait',
        category: 'karma'
    },
    {
        id: 'self_made',
        name: 'Self Made',
        description: 'Earned the Pragmatist trait',
        category: 'karma'
    },

    // === LIFE MILESTONES ===
    {
        id: 'centenarian',
        name: 'Centenarian',
        description: 'Completed maximum events in a single life',
        category: 'life'
    },
    {
        id: 'tragic_hero',
        name: 'Tragic Hero',
        description: 'Died from health reaching 0',
        category: 'life'
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Reached maximum connections',
        category: 'life'
    },
    {
        id: 'hermit',
        name: 'Hermit',
        description: 'Finished with minimum connections',
        category: 'life'
    },
    {
        id: 'fortunes_favorite',
        name: "Fortune's Favorite",
        description: 'Reached maximum wealth',
        category: 'life'
    },
    {
        id: 'rags_to_riches',
        name: 'Rags to Riches',
        description: 'Rose from poverty to prosperity',
        category: 'life'
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Reached maximum education',
        category: 'life'
    },
    {
        id: 'iron_will',
        name: 'Iron Will',
        description: 'Reached maximum health',
        category: 'life'
    },
    {
        id: 'perfect_life',
        name: 'Perfect Life',
        description: 'Achieved excellence in all aspects of life',
        category: 'life'
    },
    {
        id: 'struggling',
        name: 'Struggling',
        description: 'Finished with all stats at their lowest',
        category: 'life'
    },
    {
        id: 'defined_by_choices',
        name: 'Defined By Choices',
        description: 'Earned 3 traits in a single life',
        category: 'life'
    },
    {
        id: 'opposite_lives',
        name: 'Opposite Lives',
        description: 'Earned both Family Oriented and Career Driven across different lives',
        category: 'life'
    },
    {
        id: 'balanced_soul',
        name: 'Balanced Soul',
        description: 'Completed a life without earning any traits',
        category: 'life'
    },

    // === META ACHIEVEMENTS ===
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Completed your first life',
        category: 'meta'
    },
    {
        id: 'reincarnated',
        name: 'Reincarnated',
        description: 'Completed 10 lives',
        category: 'meta'
    },
    {
        id: 'eternal_cycle',
        name: 'Eternal Cycle',
        description: 'Completed 50 lives',
        category: 'meta'
    },
    {
        id: 'hundred_lives',
        name: 'Hundred Lives',
        description: 'Completed 100 lives',
        category: 'meta'
    }
];

// Get unlocked achievements from storage
export function getUnlockedAchievements() {
    try {
        const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
        return new Set();
    }
}

// Reset all achievements
export function resetAchievements() {
    localStorage.removeItem(ACHIEVEMENTS_KEY);
}

// Save unlocked achievements
function saveUnlockedAchievements(unlocked) {
    try {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...unlocked]));
    } catch (e) {
        console.error('Failed to save achievements:', e);
    }
}

// Unlock an achievement
export function unlockAchievement(achievementId) {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.has(achievementId)) {
        unlocked.add(achievementId);
        saveUnlockedAchievements(unlocked);
        return true;
    }
    return false;
}

// Check all achievements and return newly unlocked ones
export function checkAchievements(trackedData) {
    const unlocked = getUnlockedAchievements();
    const newlyUnlocked = [];

    for (const achievement of achievements) {
        if (unlocked.has(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.id) {
            // Exploration
            case 'wanderer':
                shouldUnlock = trackedData.regions && trackedData.regions.size >= TOTAL_REGIONS;
                break;
            case 'event_horizon':
                shouldUnlock = trackedData.allEvents && trackedData.allEvents.size >= 20;
                break;
            case 'completionist':
                shouldUnlock = trackedData.allEvents && trackedData.allEvents.size >= TOTAL_EVENTS;
                break;
            case 'trait_collector':
                const traitProgress = getTagDiscoveryProgress();
                shouldUnlock = traitProgress.discovered >= 6;
                break;
            case 'full_spectrum':
                const fullProgress = getTagDiscoveryProgress();
                shouldUnlock = fullProgress.discovered >= fullProgress.total;
                break;

            // Karma
            case 'enlightened':
                shouldUnlock = trackedData.maxKarmaInRun >= 100;
                break;
            case 'damned':
                shouldUnlock = trackedData.minKarmaInRun <= -100;
                break;
            case 'karmic_balance':
                shouldUnlock = trackedData.karmaChange === 0;
                break;
            case 'rising_star':
                shouldUnlock = trackedData.karmaChange >= 50;
                break;
            case 'fallen_angel':
                shouldUnlock = trackedData.karmaChange <= -50;
                break;
            case 'virtuous':
                shouldUnlock = trackedData.totalKarma >= 100;
                break;
            case 'wicked':
                shouldUnlock = trackedData.totalKarma <= -100;
                break;
            case 'saint':
                const discoveredTags = getDiscoveredTags();
                shouldUnlock = discoveredTags.has('generous');
                break;
            case 'self_made':
                const allDiscovered = getDiscoveredTags();
                shouldUnlock = allDiscovered.has('pragmatist');
                break;

            // Life milestones
            case 'centenarian':
                shouldUnlock = trackedData.eventCount >= trackedData.maxEvents;
                break;
            case 'tragic_hero':
                shouldUnlock = trackedData.deathReason === 'health';
                break;
            case 'social_butterfly':
                shouldUnlock = trackedData.finalStats && trackedData.finalStats.connections >= 5;
                break;
            case 'hermit':
                shouldUnlock = trackedData.finalStats && trackedData.finalStats.connections === 1;
                break;
            case 'fortunes_favorite':
                shouldUnlock = trackedData.finalStats && trackedData.finalStats.wealth >= 5;
                break;
            case 'rags_to_riches':
                shouldUnlock = trackedData.startStats && trackedData.finalStats &&
                    trackedData.startStats.wealth === 1 && trackedData.finalStats.wealth >= 5;
                break;
            case 'scholar':
                shouldUnlock = trackedData.finalStats && trackedData.finalStats.education >= 5;
                break;
            case 'iron_will':
                shouldUnlock = trackedData.finalStats && trackedData.finalStats.health >= 5;
                break;
            case 'perfect_life':
                shouldUnlock = trackedData.finalStats &&
                    trackedData.finalStats.wealth === 5 &&
                    trackedData.finalStats.education === 5 &&
                    trackedData.finalStats.health === 5 &&
                    trackedData.finalStats.connections === 5;
                break;
            case 'struggling':
                shouldUnlock = trackedData.finalStats &&
                    trackedData.finalStats.wealth === 1 &&
                    trackedData.finalStats.education === 1 &&
                    trackedData.finalStats.health === 1 &&
                    trackedData.finalStats.connections === 1;
                break;
            case 'defined_by_choices':
                shouldUnlock = trackedData.lifeTags && trackedData.lifeTags.length >= 3;
                break;
            case 'opposite_lives':
                const tagsDiscovered = getDiscoveredTags();
                shouldUnlock = tagsDiscovered.has('family_oriented') && tagsDiscovered.has('career_driven');
                break;
            case 'balanced_soul':
                shouldUnlock = trackedData.lifeTags && trackedData.lifeTags.length === 0;
                break;

            // Meta
            case 'first_steps':
                shouldUnlock = trackedData.totalLives >= 1;
                break;
            case 'reincarnated':
                shouldUnlock = trackedData.totalLives >= 10;
                break;
            case 'eternal_cycle':
                shouldUnlock = trackedData.totalLives >= 50;
                break;
            case 'hundred_lives':
                shouldUnlock = trackedData.totalLives >= 100;
                break;
        }

        if (shouldUnlock) {
            unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement);
        }
    }

    return newlyUnlocked;
}

// Get achievement by ID
export function getAchievement(id) {
    return achievements.find(a => a.id === id);
}

// Get achievement count
export function getAchievementCount() {
    const unlocked = getUnlockedAchievements();
    return {
        unlocked: unlocked.size,
        total: achievements.length
    };
}
