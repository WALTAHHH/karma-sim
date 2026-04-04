// Main game loop and state machine

import { getKarma, adjustKarma, spendKarma } from './karma.js';
import { resetChoiceMemory, rememberChoice, getCallbackText } from './choiceMemory.js';
import { generateLife, getStartDescription, getEndDescription, applyJob, checkForChildren, generateDescendantContext, recordMigration } from './life.js';
import {
    selectEvent,
    selectCrisisEvent,
    resolveOutcome,
    applyOutcome,
    selectDeathEvent,
    processPendingHiddenCosts,
    applyHiddenCost,
    getEventTradeoffInfo
} from './events/index.js';
import * as ui from './ui.js';
import { checkAchievements } from './achievements.js';
import { initDebug, updateDebugPanel, registerDebugCallback } from './debug.js';
import { countries, selectWeightedCountry } from './countries.js';
import { selectRandomYear, getEraForYear } from './eras.js';
import { getAvailableJobs, getJobById } from './jobs.js';
import {
    getUnlockedCountries,
    getLockedCountries,
    unlockCountry,
    initializeCountryUnlocks,
    attemptRandomCountryUnlock,
    getUnlockProgress,
    getCountryUnlockCost,
    // Era functions
    getUnlockedEras,
    getLockedEras,
    initializeEraUnlocks,
    attemptEraUnlock,
    getEraUnlockProgress,
    getEraUnlockCost,
    // Job category functions
    getUnlockedJobCategories,
    getLockedJobCategories,
    initializeJobCategoryUnlocks,
    attemptJobCategoryUnlock,
    getJobCategoryUnlockProgress,
    getJobCategoryUnlockCost,
    // Country selection feature
    isCountrySelectionUnlocked,
    attemptCountrySelectionUnlock,
    getCountrySelectionUnlockCost
} from './unlocks.js';
import { getJobsCountByCategory } from './jobs.js';
import {
    getTagById,
    checkTagThresholds,
    discoverTag,
    getTagKarmaModifier
} from './tags.js';
import { showGameHub, hideGameHub, setDebugMode as setGachaDebugMode } from './games/gameHub.js';

// Game state
const state = {
    phase: 'title', // title, event, death, summary, shop
    life: null,
    karmaBefore: 0,
    eventCount: 0,
    maxEvents: 0,
    usedEventIds: new Set(),
    moments: [], // Key moments for summary
    currentStage: 'childhood',
    careerSelected: false, // Track if career selection has happened
    pendingHiddenCosts: [], // Queue of delayed consequences from trade-off events
    hiddenCostsRevealed: 0 // Track number of hidden costs revealed this life
};

// Life stage progression
const stages = ['childhood', 'young_adult', 'middle', 'late'];
const eventsPerStage = {
    childhood: [2, 3],
    young_adult: [3, 4],
    middle: [3, 4],
    late: [2, 3]
};

function getStageEventCount(stage) {
    const [min, max] = eventsPerStage[stage];
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Load persistent tracking data
const TRACKING_KEY = 'karma_simulator_tracking';
const MAX_HISTORY_ENTRIES = 50; // Limit history to prevent storage bloat

function loadTrackingData() {
    try {
        const stored = localStorage.getItem(TRACKING_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return {
                allEvents: new Set(data.allEvents || []),
                allRegions: new Set(data.allRegions || []),
                totalLives: data.totalLives || 0,
                totalKarma: data.totalKarma || 0,
                runHistory: data.runHistory || []
            };
        }
    } catch (e) {
        console.error('Failed to load tracking data:', e);
    }
    return {
        allEvents: new Set(),
        allRegions: new Set(),
        totalLives: 0,
        totalKarma: 0,
        runHistory: []
    };
}

function saveTrackingData(persistent) {
    try {
        // Limit history size
        if (persistent.runHistory.length > MAX_HISTORY_ENTRIES) {
            persistent.runHistory = persistent.runHistory.slice(-MAX_HISTORY_ENTRIES);
        }
        
        localStorage.setItem(TRACKING_KEY, JSON.stringify({
            allEvents: [...persistent.allEvents],
            allRegions: [...persistent.allRegions],
            totalLives: persistent.totalLives,
            totalKarma: persistent.totalKarma,
            runHistory: persistent.runHistory
        }));
    } catch (e) {
        console.error('Failed to save tracking data:', e);
    }
}

// Persistent tracking (across lives)
let persistentTracking = loadTrackingData();

// Initialize game
function init() {
    initDebug();

    // Initialize collapsible side panels
    ui.initCollapsiblePanels();

    // Initialize unlocks (ensures defaults are set)
    initializeCountryUnlocks();
    initializeEraUnlocks();
    initializeJobCategoryUnlocks();

    // Register debug callbacks
    registerDebugCallback('instantKill', () => {
        if (state.phase === 'event' && state.life) {
            triggerDeath('Debug: Instant death triggered.');
        }
    });

    registerDebugCallback('skipToDeath', () => {
        if (state.phase === 'event' && state.life) {
            // Set event count to max to trigger natural death
            state.eventCount = state.maxEvents;
            nextEvent();
        }
    });

    showTitle();
    updateDebugPanel(state);
    updatePanels();
}

// Update side panels
function updatePanels() {
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');

    // Hide panels until player has completed at least one life
    if (persistentTracking.totalLives < 1) {
        if (leftPanel) leftPanel.classList.add('panels-hidden');
        if (rightPanel) rightPanel.classList.add('panels-hidden');
        return;
    }

    // Show panels after first run
    if (leftPanel) leftPanel.classList.remove('panels-hidden');
    if (rightPanel) rightPanel.classList.remove('panels-hidden');

    ui.updateLeftPanel();
    ui.updateRightPanel(state, persistentTracking);
}

// Title screen
function showTitle() {
    state.phase = 'title';

    // Use the new title screen with icon and tagline
    // Pass run history for returning players
    const runHistory = persistentTracking.runHistory && persistentTracking.runHistory.length > 0
        ? persistentTracking.runHistory
        : null;

    const karma = getKarma();
    ui.showTitleScreen(handleBegin, showCollections, runHistory, showGachaScreen, karma);
    updatePanels();
}

// Handle begin button - check for country selection unlock
function handleBegin() {
    // Check if country selection feature is unlocked
    if (isCountrySelectionUnlocked()) {
        showCountryPicker();
    } else {
        startLife();
    }
}

// Show country picker screen
function showCountryPicker() {
    state.phase = 'country_picker';

    const unlockedCountries = getUnlockedCountries();

    ui.showCountryPicker(
        unlockedCountries,
        countries,
        // On country selected
        (country) => {
            state.selectedCountry = country;
            startLife();
        },
        // On random selected
        () => {
            state.selectedCountry = selectWeightedCountry(unlockedCountries);
            startLife();
        },
        // On cancel
        showTitle
    );

    updatePanels();
}

// Show collections view
function showCollections() {
    state.phase = 'collections';
    ui.showCollectionsView(showTitle);
    updatePanels();
}

// Start a new life
function startLife() {
    state.phase = 'event';
    state.karmaBefore = getKarma();

    let country, year, era, descendantContext = null;

    // Check if continuing as descendant
    if (state.descendantContext) {
        descendantContext = state.descendantContext;
        country = state.selectedCountry || descendantContext.country;
        year = state.selectedYear || descendantContext.year;
        era = state.selectedEra || getEraForYear(year);
        state.descendantContext = null;  // Clear after use
    } else {
        // Select from unlocked countries, weighted by population
        const unlockedCountries = getUnlockedCountries();
        country = state.selectedCountry || selectWeightedCountry(unlockedCountries);

        // Select year from unlocked eras
        const unlockedEras = getUnlockedEras();
        year = state.selectedYear || selectRandomYear(unlockedEras);
        era = state.selectedEra || getEraForYear(year);
    }

    // Clear selections
    state.selectedCountry = null;
    state.selectedYear = null;
    state.selectedEra = null;

    state.life = generateLife(country, year, era, descendantContext);
    state.eventCount = 0;
    state.maxEvents = stages.reduce((sum, stage) => sum + getStageEventCount(stage), 0);
    state.usedEventIds = new Set();
    state.moments = [];
    state.currentStage = 'childhood';
    state.stageEventCount = 0;
    state.stageMaxEvents = getStageEventCount('childhood');
    state.careerSelected = false;
    state.pendingHiddenCosts = [];
    state.hiddenCostsRevealed = 0;
    
    // Reset choice memory for new life
    resetChoiceMemory();

    // Track region in persistent tracking
    persistentTracking.allRegions.add(state.life.region.id);

    // Initialize tracking for this life
    state.trackedData = {
        regions: new Set([state.life.region.id]),
        allEvents: new Set(persistentTracking.allEvents), // Start with persistent
        maxKarmaInRun: state.karmaBefore,
        minKarmaInRun: state.karmaBefore,
        karmaChange: 0,
        deathReason: null,
        startStats: { ...state.life },
        finalStats: null,
        eventCount: 0,
        maxEvents: state.maxEvents
    };

    const description = getStartDescription(state.life);
    ui.clear();
    ui.showBirthArt(state.life);
    ui.appendText(description);
    ui.showButton('Continue', nextEvent);
    updateDebugPanel(state);
    updatePanels();
}

// Progress to next event
function nextEvent() {
    // Check for death conditions
    if (state.life.health <= 0) {
        triggerDeath('Your health failed you.');
        return;
    }

    // Check if we've reached max events
    if (state.eventCount >= state.maxEvents) {
        triggerDeath();
        return;
    }

    // Check for pending hidden costs that need to be revealed
    const { toReveal, remaining } = processPendingHiddenCosts(
        state.pendingHiddenCosts,
        state.currentStage
    );
    state.pendingHiddenCosts = remaining;

    // If there are hidden costs to reveal, show them first
    if (toReveal.length > 0) {
        revealHiddenCosts(toReveal, () => {
            // After revealing, continue with next event
            continueToNextEvent();
        });
        return;
    }

    continueToNextEvent();
}

// Continue to next event after hidden costs are processed
function continueToNextEvent() {
    // Check for death conditions again (hidden costs may have affected health)
    if (state.life.health <= 0) {
        triggerDeath('Your health failed you.');
        return;
    }

    // Progress through stages
    if (state.stageEventCount >= state.stageMaxEvents) {
        const currentIndex = stages.indexOf(state.currentStage);
        if (currentIndex < stages.length - 1) {
            const previousStage = state.currentStage;
            state.currentStage = stages[currentIndex + 1];
            state.stageMaxEvents = getStageEventCount(state.currentStage);
            state.stageEventCount = 0;

            // Check for stage-triggered hidden costs
            const { toReveal: stageReveal, remaining: stageRemaining } = processPendingHiddenCosts(
                state.pendingHiddenCosts,
                state.currentStage
            );
            state.pendingHiddenCosts = stageRemaining;

            if (stageReveal.length > 0) {
                revealHiddenCosts(stageReveal, () => {
                    // After revealing, check career selection or continue
                    if (state.currentStage === 'young_adult' && !state.careerSelected) {
                        showCareerSelection();
                    } else {
                        continueToNextEvent();
                    }
                });
                return;
            }

            // Trigger career selection when entering young_adult stage
            if (state.currentStage === 'young_adult' && !state.careerSelected) {
                showCareerSelection();
                return;
            }

            // Check for children when entering middle stage
            if (state.currentStage === 'middle' && state.life.hasChildren === undefined) {
                state.life.hasChildren = checkForChildren(state.life);
                if (state.life.hasChildren) {
                    state.life.lineage.hasChildren = true;
                    // Calculate approximate child birth year
                    state.life.lineage.childBirthYear = state.life.year + 25 + Math.floor(Math.random() * 10);
                }
            }
        } else {
            triggerDeath();
            return;
        }
    }

    // Check for crisis events first (triggered by dangerously low stats)
    // Crisis events create punishing spirals when stats drop to critical levels
    const crisisEvent = selectCrisisEvent(state.life, state.usedEventIds);

    if (crisisEvent) {
        // Crisis takes priority - these are the consequences of low stats
        state.usedEventIds.add(crisisEvent.id);
        state.eventCount++;
        state.stageEventCount++;
        showEvent(crisisEvent);
        return;
    }

    // Select and show regular event
    const event = selectEvent(state.currentStage, state.life, state.usedEventIds);

    if (!event) {
        // No events available, move to next stage or end
        state.stageEventCount = state.stageMaxEvents;
        nextEvent();
        return;
    }

    state.usedEventIds.add(event.id);
    state.eventCount++;
    state.stageEventCount++;

    showEvent(event);
}

// Reveal hidden costs one by one
function revealHiddenCosts(costs, onComplete) {
    if (costs.length === 0) {
        onComplete();
        return;
    }

    const cost = costs[0];
    const remainingCosts = costs.slice(1);

    // Apply the hidden cost effects
    state.life = applyHiddenCost(state.life, cost);
    state.hiddenCostsRevealed++;

    // Track as a moment if significant
    state.moments.push(cost.description);
    if (state.moments.length > 4) {
        state.moments = state.moments.slice(-4);
    }

    // Show the revelation UI
    ui.showHiddenCostReveal(cost, () => {
        updateDebugPanel(state);
        updatePanels();
        // Continue to next hidden cost or complete
        revealHiddenCosts(remainingCosts, onComplete);
    });
}

// Display an event
function showEvent(event) {
    state.currentEvent = event;

    // Track event
    state.trackedData.allEvents.add(event.id);
    persistentTracking.allEvents.add(event.id);

    // Check for callback to past choices
    const callbackText = getCallbackText(event.id, state.currentStage);
    if (callbackText) {
        ui.showText([callbackText, '', event.prompt]);
    } else {
        ui.showText(event.prompt);
    }

    // Get trade-off info for UI
    const tradeoffInfo = getEventTradeoffInfo(event);

    if (event.options.length === 1) {
        // Forced event - single option, styled differently to show this isn't a choice
        ui.showForcedEvent(event.options[0].text, () => resolveEvent(0));
    } else {
        // Choice event - pass trade-off info for preview display
        ui.showChoices(event.options, resolveEvent, tradeoffInfo);
    }

    // Show the life arc progress indicator
    ui.showLifeArc(state.eventCount, state.maxEvents);
}

// Process tags from an outcome - returns array of newly earned tag IDs
function processTagsFromOutcome(outcome) {
    const newTags = [];

    // Method 1: Direct tag grant from outcome
    if (outcome.grantsTag && !state.life.tags.includes(outcome.grantsTag)) {
        state.life.tags.push(outcome.grantsTag);
        discoverTag(outcome.grantsTag);
        newTags.push(outcome.grantsTag);
    }

    // Method 2: Axis adjustment from outcome
    if (outcome.tagAxis) {
        for (const [axis, delta] of Object.entries(outcome.tagAxis)) {
            if (state.life.tagProgress[axis] !== undefined) {
                state.life.tagProgress[axis] += delta;
            }
        }

        // Check if any thresholds reached
        const thresholdTags = checkTagThresholds(state.life.tagProgress, state.life.tags);
        for (const tagId of thresholdTags) {
            if (!state.life.tags.includes(tagId)) {
                state.life.tags.push(tagId);
                discoverTag(tagId);
                newTags.push(tagId);
            }
        }
    }

    return newTags;
}

// Show tag notification(s) sequentially, then call onComplete
function showTagNotifications(tagIds, onComplete) {
    if (tagIds.length === 0) {
        onComplete();
        return;
    }

    const [currentTagId, ...remaining] = tagIds;
    const tag = getTagById(currentTagId);

    if (!tag) {
        showTagNotifications(remaining, onComplete);
        return;
    }

    ui.showTagNotification(tag, () => {
        showTagNotifications(remaining, onComplete);
    });
}

// Resolve player choice
function resolveEvent(optionIndex) {
    const event = state.currentEvent;
    const option = event.options[optionIndex];

    // resolveOutcome now returns { outcome, hiddenCost }
    // Pass life to apply stat modifiers - high stats favor good outcomes, low stats favor bad
    const result = resolveOutcome(option, state.currentStage, state.life);
    const outcome = result.outcome;

    // Apply effects
    const oldLife = { ...state.life };
    state.life = applyOutcome(state.life, outcome);
    
    // Record significant choices for later callbacks
    // Record multi-option events (real choices) - check options.length > 1 as the primary condition
    // Events without explicit type are treated as choices if they have multiple options
    const isChoiceEvent = event.options.length > 1 && event.type !== 'forced';
    if (isChoiceEvent) {
        const tags = outcome.tagAxis ? Object.keys(outcome.tagAxis) : [];
        rememberChoice(event.id, option.text, state.currentStage, tags);
    }

    // Queue hidden cost if present
    if (result.hiddenCost) {
        if (result.hiddenCost.trigger === 'immediate') {
            // Immediate hidden costs are revealed right after the outcome
            state.pendingHiddenCosts.push(result.hiddenCost);
        } else {
            // Delayed or next_stage costs are queued
            state.pendingHiddenCosts.push(result.hiddenCost);
        }
    }

    // Adjust karma
    if (outcome.karma) {
        const newKarma = adjustKarma(outcome.karma);
        state.trackedData.karmaChange += outcome.karma;

        // Track max/min karma in this run
        if (newKarma > state.trackedData.maxKarmaInRun) {
            state.trackedData.maxKarmaInRun = newKarma;
        }
        if (newKarma < state.trackedData.minKarmaInRun) {
            state.trackedData.minKarmaInRun = newKarma;
        }
    }

    // Track significant moments - capture any outcome with karma or stat changes
    // Also capture choice events (type: 'choice') as they represent player agency
    const hasKarmaImpact = outcome.karma !== 0 && outcome.karma !== undefined;
    const hasStatImpact = outcome.effects && Object.values(outcome.effects).some(v => v !== 0);
    const isMomentWorthy = state.currentEvent && state.currentEvent.type === 'choice';
    
    if (hasKarmaImpact || hasStatImpact || isMomentWorthy) {
        state.moments.push(outcome.description);
    }

    // Limit moments to 6 for richer summaries (was 4)
    if (state.moments.length > 6) {
        state.moments = state.moments.slice(-6);
    }

    // Handle migration outcomes
    if (outcome.special === 'migrate') {
        // Select a different country from unlocked countries
        const unlockedCountries = getUnlockedCountries();
        const otherCountries = unlockedCountries.filter(c => c.id !== state.life.currentCountry.id);
        if (otherCountries.length > 0) {
            const newCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
            const currentYear = state.life.year + (state.eventCount * 2);  // Approximate current year
            recordMigration(state.life, newCountry, currentYear, 'migration');
            state.moments.push(`Migrated to ${newCountry.name}`);
        }
    } else if (outcome.special === 'return_home') {
        // Return to birth country
        const birthCountry = state.life.country;
        if (birthCountry.id !== state.life.currentCountry.id) {
            const currentYear = state.life.year + (state.eventCount * 2);
            recordMigration(state.life, birthCountry, currentYear, 'return');
            state.moments.push(`Returned to ${birthCountry.name}`);
        }
    }

    // Process decision tags
    const newTags = processTagsFromOutcome(outcome);

    // Get the choice text that was stored during commitment
    const choiceText = window._lastChoiceText || null;
    window._lastChoiceText = null;
    window._lastChoicePreview = null;
    
    // Show outcome (with tag notification if earned)
    if (newTags.length > 0) {
        // Show tag notification first, then continue to outcome
        showTagNotifications(newTags, () => {
            ui.showOutcomeWithChoice(outcome.description, choiceText);
            ui.showButton('Continue', nextEvent);
            updateDebugPanel(state);
            updatePanels();
        });
    } else {
        ui.showOutcomeWithChoice(outcome.description, choiceText);
        ui.showButton('Continue', nextEvent);
        updateDebugPanel(state);
        updatePanels();
    }
}

// Show career selection
function showCareerSelection() {
    state.careerSelected = true;
    state.usedEventIds.add('career_selection');

    // Get unlocked job categories
    const unlockedCategories = getUnlockedJobCategories().map(c => c.id);

    // Get available jobs for this era and life
    const availableJobs = getAvailableJobs(state.life.era, unlockedCategories, state.life);

    ui.showText('The time has come to find your place in the world.');

    if (availableJobs.length === 0) {
        // No jobs available - forced option
        ui.showButton('Take whatever work you can find', () => {
            const outcomes = [
                { description: 'Survival, nothing more.', wealthChange: -1 },
                { description: 'You get by.' }
            ];
            const outcome = outcomes[Math.random() < 0.6 ? 0 : 1];

            if (outcome.wealthChange) {
                state.life.wealth = Math.max(1, Math.min(5, state.life.wealth + outcome.wealthChange));
            }

            state.moments.push('Found work where you could.');
            ui.showText(outcome.description);
            ui.showButton('Continue', nextEvent);
            updateDebugPanel(state);
        });
    } else {
        // Shuffle and limit to 4 options
        const shuffled = [...availableJobs].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, Math.min(4, shuffled.length));

        // Build detailed career choices display
        const contentEl = document.getElementById('content');
        const choicesEl = document.getElementById('choices');

        // Add career options as cards
        const careerGrid = document.createElement('div');
        careerGrid.style.display = 'grid';
        careerGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        careerGrid.style.gap = '12px';
        careerGrid.style.marginTop = '20px';

        options.forEach((job, index) => {
            const card = document.createElement('div');
            card.className = 'career-card';
            card.style.background = '#151515';
            card.style.border = '1px solid #333';
            card.style.padding = '15px';
            card.style.cursor = 'pointer';
            card.style.transition = 'border-color 0.2s, background 0.2s';

            const name = document.createElement('div');
            name.style.color = '#e0e0e0';
            name.style.fontSize = '16px';
            name.style.marginBottom = '6px';
            name.textContent = job.name;
            card.appendChild(name);

            const desc = document.createElement('div');
            desc.style.color = '#888';
            desc.style.fontSize = '13px';
            desc.textContent = job.description;
            card.appendChild(desc);

            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#666';
                card.style.background = '#1a1a1a';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#333';
                card.style.background = '#151515';
            });

            card.addEventListener('click', () => {
                const selectedJob = options[index];
                state.life = applyJob(state.life, selectedJob.id);

                state.moments.push(`Became a ${selectedJob.name}.`);
                ui.showText(`You begin your career as a ${selectedJob.name}. ${selectedJob.description}`);
                ui.showButton('Continue', nextEvent);
                updateDebugPanel(state);
                updatePanels();
            });

            careerGrid.appendChild(card);
        });

        contentEl.appendChild(careerGrid);
        choicesEl.innerHTML = '';
    }

    // Show the life arc during career selection
    ui.showLifeArc(state.eventCount, state.maxEvents);

    updateDebugPanel(state);
    updatePanels();
}

// Trigger death
function triggerDeath(reason) {
    state.phase = 'death';
    
    // Track death reason
    if (reason) {
        state.trackedData.deathReason = 'health';
    } else {
        state.trackedData.deathReason = 'natural';
    }
    
    // Track final stats
    state.trackedData.finalStats = { ...state.life };
    state.trackedData.eventCount = state.eventCount;

    const deathEvent = selectDeathEvent(state.life);

    if (reason) {
        ui.showText([reason, deathEvent.prompt]);
    } else {
        ui.showText(deathEvent.prompt);
    }

    // Update life arc to show completed journey
    ui.showLifeArc(state.maxEvents, state.maxEvents);

    ui.showButton('Continue', showSummary);
    updateDebugPanel(state);
    updatePanels();
}

// Show end-of-life summary
function showSummary() {
    state.phase = 'summary';

    // Update persistent tracking
    persistentTracking.totalLives += 1;
    persistentTracking.totalKarma = getKarma();
    
    // Prepare tracked data for achievement checking
    const achievementData = {
        ...state.trackedData,
        allEvents: persistentTracking.allEvents, // Use persistent set
        regions: persistentTracking.allRegions, // Use persistent set for regions
        totalLives: persistentTracking.totalLives,
        totalKarma: persistentTracking.totalKarma,
        lifeTags: state.life.tags || [] // Tags earned this life
    };

    // Check achievements
    const newlyUnlocked = checkAchievements(achievementData);
    
    // Save run history
    const runEntry = {
        startDescription: getStartDescription(state.life),
        moments: state.moments,
        endDescription: getEndDescription(state.life),
        karmaBefore: state.karmaBefore,
        karmaAfter: getKarma(),
        karmaChange: getKarma() - state.karmaBefore,
        achievements: newlyUnlocked.map(a => a.id)
    };
    persistentTracking.runHistory.push(runEntry);
    
    // Save persistent tracking (regions and events already updated during gameplay)
    saveTrackingData(persistentTracking);

    const summary = {
        startDescription: getStartDescription(state.life),
        moments: state.moments,
        endDescription: getEndDescription(state.life),
        karmaBefore: state.karmaBefore,
        karmaAfter: getKarma(),
        achievements: newlyUnlocked,
        life: state.life,  // Pass life for death art
        tags: state.life.tags || []  // Character traits earned this life
    };

    ui.showSummary(summary);

    // Show unlock shop if player has karma
    const karma = getKarma();

    // Check if player can continue as descendant
    const hasChildren = state.life.hasChildren;
    if (hasChildren) {
        ui.showButton('Continue as Descendant', () => startAsDescendant(state.life));
    }

    if (karma > 0) {
        ui.showButton('🎮 Game Hub', () => showGachaScreen(karma), hasChildren);
        ui.showButton('Spend Karma', showUnlockShop, true);
        ui.showButton('Begin again', showTitle, true);
    } else {
        ui.showButton('Begin again', showTitle, hasChildren);
    }
    updateDebugPanel(state);
    updatePanels();
}

// Start a new life as descendant of the previous life
function startAsDescendant(parentLife) {
    const descendantContext = generateDescendantContext(parentLife);

    // Get era for the child's birth year
    const era = getEraForYear(descendantContext.year) || parentLife.era;

    // Update state for new life
    state.selectedCountry = descendantContext.country;
    state.selectedYear = descendantContext.year;
    state.selectedEra = era;
    state.descendantContext = descendantContext;

    // Start the new life
    startLife();
}

// Show game hub screen
function showGachaScreen(currentKarma) {
    showGameHub(
        currentKarma,
        (amount) => spendKarma(amount),  // Spend karma function
        (amount) => adjustKarma(amount), // Add karma function (for rewards)
        () => {
            // On close, refresh the summary screen
            showSummary();
        }
    );
}

// Show unlock shop
function showUnlockShop() {
    state.phase = 'shop';
    const karma = getKarma();
    const countryCost = getCountryUnlockCost();
    const eraCost = getEraUnlockCost();
    const jobCategoryCost = getJobCategoryUnlockCost();
    const countryProgress = getUnlockProgress();
    const eraProgress = getEraUnlockProgress();
    const jobCategoryProgress = getJobCategoryUnlockProgress();

    ui.clear();
    ui.showKarma(karma, true);
    ui.appendText('Between lives, you may spend karma to unlock new paths.');

    const lockedCountries = getLockedCountries();
    const lockedEras = getLockedEras();
    const lockedJobCategories = getLockedJobCategories();

    // Build shop content
    const contentEl = document.getElementById('content');
    const choicesEl = document.getElementById('choices');

    // === ERAS SECTION (Direct Selection) ===
    const eraSection = document.createElement('div');
    eraSection.className = 'shop-section';

    const eraTitle = document.createElement('div');
    eraTitle.className = 'shop-section-title';
    eraTitle.textContent = `Eras (${eraCost} karma each)`;
    eraSection.appendChild(eraTitle);

    const eraProgressText = document.createElement('div');
    eraProgressText.className = 'shop-progress';
    eraProgressText.textContent = `${eraProgress.unlocked} / ${eraProgress.total} unlocked`;
    eraSection.appendChild(eraProgressText);

    if (lockedEras.length === 0) {
        const allUnlocked = document.createElement('p');
        allUnlocked.style.color = '#7a7';
        allUnlocked.textContent = 'All eras unlocked!';
        eraSection.appendChild(allUnlocked);
    } else {
        const eraGrid = document.createElement('div');
        eraGrid.className = 'shop-item-grid';

        lockedEras.forEach(era => {
            const item = createShopItem(
                era.name,
                `${era.startYear}-${era.endYear}`,
                era.description,
                eraCost,
                karma >= eraCost,
                () => {
                    const result = attemptEraUnlock(era.id, getKarma(), spendKarma);
                    if (result.success) {
                        ui.showEraCelebration(result.era, () => {
                            showUnlockShop();
                        });
                        updateDebugPanel(state);
                    }
                }
            );
            eraGrid.appendChild(item);
        });

        eraSection.appendChild(eraGrid);
    }

    contentEl.appendChild(eraSection);

    // === JOB CATEGORIES SECTION (Direct Selection) ===
    const jobSection = document.createElement('div');
    jobSection.className = 'shop-section';

    const jobTitle = document.createElement('div');
    jobTitle.className = 'shop-section-title';
    jobTitle.textContent = `Careers (${jobCategoryCost} karma each)`;
    jobSection.appendChild(jobTitle);

    const jobProgressText = document.createElement('div');
    jobProgressText.className = 'shop-progress';
    jobProgressText.textContent = `${jobCategoryProgress.unlocked} / ${jobCategoryProgress.total} unlocked`;
    jobSection.appendChild(jobProgressText);

    if (lockedJobCategories.length === 0) {
        const allUnlocked = document.createElement('p');
        allUnlocked.style.color = '#7a7';
        allUnlocked.textContent = 'All career paths unlocked!';
        jobSection.appendChild(allUnlocked);
    } else {
        const jobGrid = document.createElement('div');
        jobGrid.className = 'shop-item-grid';

        lockedJobCategories.forEach(category => {
            const jobCount = getJobsCountByCategory(category.id);
            const item = createShopItem(
                category.name,
                `${jobCount} jobs`,
                category.description,
                jobCategoryCost,
                karma >= jobCategoryCost,
                () => {
                    const result = attemptJobCategoryUnlock(category.id, getKarma(), spendKarma);
                    if (result.success) {
                        ui.showJobCategoryCelebration(result.category, () => {
                            showUnlockShop();
                        });
                        updateDebugPanel(state);
                    }
                }
            );
            jobGrid.appendChild(item);
        });

        jobSection.appendChild(jobGrid);
    }

    contentEl.appendChild(jobSection);

    // === FEATURES SECTION (Country Selection) ===
    const countrySelectionCost = getCountrySelectionUnlockCost();
    const hasCountrySelection = isCountrySelectionUnlocked();

    if (!hasCountrySelection) {
        const featureSection = document.createElement('div');
        featureSection.className = 'shop-section';

        const featureTitle = document.createElement('div');
        featureTitle.className = 'shop-section-title';
        featureTitle.textContent = `Features`;
        featureSection.appendChild(featureTitle);

        const featureGrid = document.createElement('div');
        featureGrid.className = 'shop-item-grid';

        const item = createShopItem(
            'Country Selection',
            'Choose your fate',
            'Select your starting country instead of leaving it to chance.',
            countrySelectionCost,
            karma >= countrySelectionCost,
            () => {
                const result = attemptCountrySelectionUnlock(getKarma(), spendKarma);
                if (result.success) {
                    ui.showFeatureCelebration('Country Selection', 'You can now choose your starting country!', () => {
                        showUnlockShop();
                    });
                    updateDebugPanel(state);
                }
            }
        );
        featureGrid.appendChild(item);
        featureSection.appendChild(featureGrid);
        contentEl.appendChild(featureSection);
    }

    // === COUNTRIES SECTION (Random - unchanged) ===
    const countrySection = document.createElement('div');
    countrySection.className = 'shop-section';

    const countryTitle = document.createElement('div');
    countryTitle.className = 'shop-section-title';
    countryTitle.textContent = `Countries (${countryCost} karma)`;
    countrySection.appendChild(countryTitle);

    const countryProgressText = document.createElement('div');
    countryProgressText.className = 'shop-progress';
    countryProgressText.textContent = `${countryProgress.unlocked} / ${countryProgress.total} unlocked`;
    countrySection.appendChild(countryProgressText);

    if (lockedCountries.length === 0) {
        const allUnlocked = document.createElement('p');
        allUnlocked.style.color = '#7a7';
        allUnlocked.textContent = 'All countries unlocked!';
        countrySection.appendChild(allUnlocked);
    } else {
        const countryInfo = document.createElement('p');
        countryInfo.style.color = '#888';
        countryInfo.style.fontSize = '14px';
        countryInfo.textContent = 'Countries are unlocked randomly from the remaining pool.';
        countrySection.appendChild(countryInfo);
    }

    contentEl.appendChild(countrySection);

    // === BUTTONS ===
    choicesEl.innerHTML = '';

    // Country unlock button (random only)
    if (lockedCountries.length > 0) {
        const countryBtn = document.createElement('button');
        countryBtn.className = 'begin-button';
        if (karma >= countryCost) {
            countryBtn.textContent = `Unlock Mystery Country (${countryCost} karma)`;
            countryBtn.addEventListener('click', () => {
                const result = attemptRandomCountryUnlock(getKarma(), spendKarma);
                if (result.success) {
                    ui.showUnlockCelebration(result.country, () => {
                        showUnlockShop();
                    });
                    updateDebugPanel(state);
                } else {
                    ui.showText(result.message);
                    ui.showButton('Return to title', showTitle);
                }
            });
        } else {
            countryBtn.textContent = `Mystery Country (${countryCost} karma) - Need ${countryCost - karma} more`;
            countryBtn.style.color = '#555';
            countryBtn.style.cursor = 'not-allowed';
        }
        choicesEl.appendChild(countryBtn);
    }

    // Return button
    const returnBtn = document.createElement('button');
    returnBtn.className = 'begin-button secondary';
    returnBtn.textContent = 'Return to title';
    returnBtn.addEventListener('click', showTitle);
    choicesEl.appendChild(returnBtn);

    updateDebugPanel(state);
    updatePanels();
}

// Helper function to create a shop item card
function createShopItem(name, subtitle, description, cost, canAfford, onUnlock) {
    const item = document.createElement('div');
    item.className = 'shop-item' + (canAfford ? ' affordable' : ' locked');

    const nameEl = document.createElement('div');
    nameEl.className = 'shop-item-name';
    nameEl.textContent = name;
    item.appendChild(nameEl);

    const subtitleEl = document.createElement('div');
    subtitleEl.className = 'shop-item-subtitle';
    subtitleEl.textContent = subtitle;
    item.appendChild(subtitleEl);

    const descEl = document.createElement('div');
    descEl.className = 'shop-item-desc';
    descEl.textContent = description;
    item.appendChild(descEl);

    if (canAfford) {
        item.addEventListener('click', onUnlock);
        item.title = `Click to unlock for ${cost} karma`;
    } else {
        item.title = `Need ${cost} karma to unlock`;
    }

    return item;
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
