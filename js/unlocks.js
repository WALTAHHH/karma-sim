// Unlock system for countries, eras, and job categories
// These are unlocked progressively via karma

import { countries, getCountryById, selectWeightedCountry } from './countries.js';
import { eras, getEraById, ERA_UNLOCK_COST, DEFAULT_ERA_ID } from './eras.js';
import { jobCategories, JOB_CATEGORY_UNLOCK_COST, DEFAULT_JOB_CATEGORIES } from './jobs.js';

const UNLOCKS_KEY = 'karma_simulator_unlocks';
const COUNTRIES_CATEGORY = 'countries';
const ERAS_CATEGORY = 'eras';
const FEATURES_CATEGORY = 'features';
const COUNTRY_UNLOCK_COST = 5;
const COUNTRY_SELECTION_UNLOCK_COST = 50;
const DEFAULT_COUNTRY_ID = 'UK'; // United Kingdom is the default starting country

// Get all unlocked data from storage
export function getUnlocked() {
    try {
        const stored = localStorage.getItem(UNLOCKS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.warn('Failed to load unlocks:', e);
        return {};
    }
}

// Save unlocked data to storage
function saveUnlocked(data) {
    try {
        localStorage.setItem(UNLOCKS_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save unlocks:', e);
    }
}

// Check if an item is unlocked
export function isUnlocked(category, id) {
    const unlocked = getUnlocked();
    return unlocked[category] && unlocked[category].includes(id);
}

// Unlock a specific item
export function unlock(category, id) {
    const unlocked = getUnlocked();
    if (!unlocked[category]) {
        unlocked[category] = [];
    }
    if (!unlocked[category].includes(id)) {
        unlocked[category].push(id);
        saveUnlocked(unlocked);
        return true;
    }
    return false;
}

// Initialize country unlocks - ensures UK is always unlocked
export function initializeCountryUnlocks() {
    const unlocked = getUnlocked();
    const unlockedCountries = unlocked[COUNTRIES_CATEGORY] || [];

    // Ensure UK is always unlocked (default starting country)
    if (!unlockedCountries.includes(DEFAULT_COUNTRY_ID)) {
        unlock(COUNTRIES_CATEGORY, DEFAULT_COUNTRY_ID);
    }
}

// Get list of unlocked country objects
export function getUnlockedCountries() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[COUNTRIES_CATEGORY] || [];

    // Always include UK even if somehow missing
    if (!unlockedIds.includes(DEFAULT_COUNTRY_ID)) {
        unlockedIds.push(DEFAULT_COUNTRY_ID);
    }

    return countries.filter(country => unlockedIds.includes(country.id));
}

// Get list of locked country objects
export function getLockedCountries() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[COUNTRIES_CATEGORY] || [];
    return countries.filter(country => !unlockedIds.includes(country.id));
}

// Get unlock progress stats
export function getUnlockProgress() {
    const unlockedCountries = getUnlockedCountries();
    return {
        unlocked: unlockedCountries.length,
        total: countries.length,
        percentage: Math.round((unlockedCountries.length / countries.length) * 100)
    };
}

// Unlock a specific country by ID
export function unlockCountry(countryId) {
    return unlock(COUNTRIES_CATEGORY, countryId);
}

// Check if a specific country is unlocked
export function isCountryUnlocked(countryId) {
    // UK is always considered unlocked
    if (countryId === DEFAULT_COUNTRY_ID) return true;
    return isUnlocked(COUNTRIES_CATEGORY, countryId);
}

// Attempt to unlock a random country (costs karma)
// Returns: { success: boolean, country?: object, message: string }
export function attemptRandomCountryUnlock(currentKarma, spendKarmaFn) {
    // Check if player has enough karma
    if (currentKarma < COUNTRY_UNLOCK_COST) {
        return {
            success: false,
            message: `Not enough karma. Need ${COUNTRY_UNLOCK_COST}, have ${currentKarma}.`
        };
    }

    // Get locked countries
    const lockedCountries = getLockedCountries();

    // Check if any countries left to unlock
    if (lockedCountries.length === 0) {
        return {
            success: false,
            message: 'All countries have been unlocked!'
        };
    }

    // Spend karma
    const spent = spendKarmaFn(COUNTRY_UNLOCK_COST);
    if (!spent && spent !== 0) {
        return {
            success: false,
            message: 'Failed to spend karma.'
        };
    }

    // Select random locked country (not weighted - fair random draw)
    const randomIndex = Math.floor(Math.random() * lockedCountries.length);
    const newCountry = lockedCountries[randomIndex];

    // Unlock it
    unlockCountry(newCountry.id);

    return {
        success: true,
        country: newCountry,
        message: `Unlocked: ${newCountry.name}`
    };
}

// Get the unlock cost
export function getCountryUnlockCost() {
    return COUNTRY_UNLOCK_COST;
}

// Reset all unlocks (debug function)
export function resetUnlocks() {
    localStorage.removeItem(UNLOCKS_KEY);
    initializeCountryUnlocks();
    initializeEraUnlocks();
    initializeJobCategoryUnlocks();
}

// Unlock all countries (debug function)
export function unlockAllCountries() {
    countries.forEach(country => {
        unlockCountry(country.id);
    });
}

// ============================================
// ERA UNLOCK SYSTEM
// ============================================

// Initialize era unlocks - ensures Contemporary is always unlocked
export function initializeEraUnlocks() {
    const unlocked = getUnlocked();
    const unlockedEras = unlocked[ERAS_CATEGORY] || [];

    // Ensure Contemporary is always unlocked (default starting era)
    if (!unlockedEras.includes(DEFAULT_ERA_ID)) {
        unlock(ERAS_CATEGORY, DEFAULT_ERA_ID);
    }
}

// Get list of unlocked era objects
export function getUnlockedEras() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[ERAS_CATEGORY] || [];

    // Always include Contemporary even if somehow missing
    if (!unlockedIds.includes(DEFAULT_ERA_ID)) {
        unlockedIds.push(DEFAULT_ERA_ID);
    }

    return eras.filter(era => unlockedIds.includes(era.id));
}

// Get list of locked era objects
export function getLockedEras() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[ERAS_CATEGORY] || [];
    return eras.filter(era => !unlockedIds.includes(era.id));
}

// Get era unlock progress stats
export function getEraUnlockProgress() {
    const unlockedEras = getUnlockedEras();
    return {
        unlocked: unlockedEras.length,
        total: eras.length,
        percentage: Math.round((unlockedEras.length / eras.length) * 100)
    };
}

// Unlock a specific era by ID
export function unlockEra(eraId) {
    return unlock(ERAS_CATEGORY, eraId);
}

// Check if a specific era is unlocked
export function isEraUnlocked(eraId) {
    // Contemporary is always considered unlocked
    if (eraId === DEFAULT_ERA_ID) return true;
    return isUnlocked(ERAS_CATEGORY, eraId);
}

// Attempt to unlock a specific era (costs karma)
// Returns: { success: boolean, era?: object, message: string }
export function attemptEraUnlock(eraId, currentKarma, spendKarmaFn) {
    // Check if player has enough karma
    if (currentKarma < ERA_UNLOCK_COST) {
        return {
            success: false,
            message: `Not enough karma. Need ${ERA_UNLOCK_COST}, have ${currentKarma}.`
        };
    }

    // Check if era exists
    const era = getEraById(eraId);
    if (!era) {
        return {
            success: false,
            message: 'Era not found.'
        };
    }

    // Check if already unlocked
    if (isEraUnlocked(eraId)) {
        return {
            success: false,
            message: 'Era already unlocked!'
        };
    }

    // Spend karma
    const spent = spendKarmaFn(ERA_UNLOCK_COST);
    if (!spent && spent !== 0) {
        return {
            success: false,
            message: 'Failed to spend karma.'
        };
    }

    // Unlock it
    unlockEra(eraId);

    return {
        success: true,
        era: era,
        message: `Unlocked: ${era.name}`
    };
}

// Get the era unlock cost
export function getEraUnlockCost() {
    return ERA_UNLOCK_COST;
}

// Unlock all eras (debug function)
export function unlockAllEras() {
    eras.forEach(era => {
        unlockEra(era.id);
    });
}

// ============================================
// JOB CATEGORY UNLOCK SYSTEM
// ============================================

const JOB_CATEGORIES_KEY = 'job_categories';

// Initialize job category unlocks - ensures defaults are always unlocked
export function initializeJobCategoryUnlocks() {
    const unlocked = getUnlocked();
    const unlockedCategories = unlocked[JOB_CATEGORIES_KEY] || [];

    // Ensure default categories are always unlocked
    DEFAULT_JOB_CATEGORIES.forEach(catId => {
        if (!unlockedCategories.includes(catId)) {
            unlock(JOB_CATEGORIES_KEY, catId);
        }
    });
}

// Get list of unlocked job category objects
export function getUnlockedJobCategories() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[JOB_CATEGORIES_KEY] || [];

    // Always include defaults even if somehow missing
    DEFAULT_JOB_CATEGORIES.forEach(id => {
        if (!unlockedIds.includes(id)) {
            unlockedIds.push(id);
        }
    });

    return jobCategories.filter(cat => unlockedIds.includes(cat.id));
}

// Get list of locked job category objects
export function getLockedJobCategories() {
    const unlocked = getUnlocked();
    const unlockedIds = unlocked[JOB_CATEGORIES_KEY] || [];
    return jobCategories.filter(cat => !unlockedIds.includes(cat.id));
}

// Get job category unlock progress stats
export function getJobCategoryUnlockProgress() {
    const unlockedCategories = getUnlockedJobCategories();
    return {
        unlocked: unlockedCategories.length,
        total: jobCategories.length,
        percentage: Math.round((unlockedCategories.length / jobCategories.length) * 100)
    };
}

// Unlock a specific job category by ID
export function unlockJobCategory(categoryId) {
    return unlock(JOB_CATEGORIES_KEY, categoryId);
}

// Check if a specific job category is unlocked
export function isJobCategoryUnlocked(categoryId) {
    // Default categories are always considered unlocked
    if (DEFAULT_JOB_CATEGORIES.includes(categoryId)) return true;
    return isUnlocked(JOB_CATEGORIES_KEY, categoryId);
}

// Attempt to unlock a specific job category (costs karma)
// Returns: { success: boolean, category?: object, message: string }
export function attemptJobCategoryUnlock(categoryId, currentKarma, spendKarmaFn) {
    // Check if player has enough karma
    if (currentKarma < JOB_CATEGORY_UNLOCK_COST) {
        return {
            success: false,
            message: `Not enough karma. Need ${JOB_CATEGORY_UNLOCK_COST}, have ${currentKarma}.`
        };
    }

    // Check if category exists
    const category = jobCategories.find(c => c.id === categoryId);
    if (!category) {
        return {
            success: false,
            message: 'Career path not found.'
        };
    }

    // Check if already unlocked
    if (isJobCategoryUnlocked(categoryId)) {
        return {
            success: false,
            message: 'Career path already unlocked!'
        };
    }

    // Spend karma
    const spent = spendKarmaFn(JOB_CATEGORY_UNLOCK_COST);
    if (!spent && spent !== 0) {
        return {
            success: false,
            message: 'Failed to spend karma.'
        };
    }

    // Unlock it
    unlockJobCategory(categoryId);

    return {
        success: true,
        category: category,
        message: `Unlocked: ${category.name}`
    };
}

// Get the job category unlock cost
export function getJobCategoryUnlockCost() {
    return JOB_CATEGORY_UNLOCK_COST;
}

// Unlock all job categories (debug function)
export function unlockAllJobCategories() {
    jobCategories.forEach(cat => {
        unlockJobCategory(cat.id);
    });
}

// Update resetUnlocks to also reset eras and job categories
export function resetAllUnlocks() {
    localStorage.removeItem(UNLOCKS_KEY);
    initializeCountryUnlocks();
    initializeEraUnlocks();
    initializeJobCategoryUnlocks();
}

// ============================================
// COUNTRY SELECTION FEATURE UNLOCK
// ============================================

const COUNTRY_SELECTION_FEATURE_ID = 'country_selection';

// Check if country selection feature is unlocked
export function isCountrySelectionUnlocked() {
    return isUnlocked(FEATURES_CATEGORY, COUNTRY_SELECTION_FEATURE_ID);
}

// Get country selection unlock cost
export function getCountrySelectionUnlockCost() {
    return COUNTRY_SELECTION_UNLOCK_COST;
}

// Attempt to unlock country selection (costs 50 karma)
// Returns: { success: boolean, message: string }
export function attemptCountrySelectionUnlock(currentKarma, spendKarmaFn) {
    // Check if already unlocked
    if (isCountrySelectionUnlocked()) {
        return {
            success: false,
            message: 'Country selection already unlocked!'
        };
    }

    // Check if player has enough karma
    if (currentKarma < COUNTRY_SELECTION_UNLOCK_COST) {
        return {
            success: false,
            message: `Not enough karma. Need ${COUNTRY_SELECTION_UNLOCK_COST}, have ${currentKarma}.`
        };
    }

    // Spend karma
    const spent = spendKarmaFn(COUNTRY_SELECTION_UNLOCK_COST);
    if (!spent && spent !== 0) {
        return {
            success: false,
            message: 'Failed to spend karma.'
        };
    }

    // Unlock the feature
    unlock(FEATURES_CATEGORY, COUNTRY_SELECTION_FEATURE_ID);

    return {
        success: true,
        message: 'Country selection unlocked! You can now choose your starting country.'
    };
}
