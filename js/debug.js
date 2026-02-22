// Debug panel functionality

import { getKarma, adjustKarma, resetKarma, spendKarma } from './karma.js';
import { unlockAchievement, achievements, resetAchievements } from './achievements.js';
import {
    unlockCountry,
    getUnlockProgress,
    resetUnlocks,
    unlockAllCountries,
    getEraUnlockProgress,
    unlockAllEras,
    getJobCategoryUnlockProgress,
    unlockAllJobCategories
} from './unlocks.js';
import { countries } from './countries.js';
import { eras } from './eras.js';
import { jobCategories } from './jobs.js';
import { showGachaMachine } from './gachaUI.js';
import { getGachaConfig, setGachaConfig, debugResetGacha } from './gacha.js';

// Tracking data key (must match main.js)
const TRACKING_KEY = 'karma_simulator_tracking';

// Reset all run history and tracking logs
export function resetLogs() {
    localStorage.removeItem(TRACKING_KEY);
}

let debugPanelVisible = false;
let debugCallbacks = {};
let currentState = null;

export function initDebug() {
    const toggle = document.getElementById('debug-toggle');
    const panel = document.getElementById('debug-panel');
    
    if (!toggle || !panel) return;
    
    toggle.addEventListener('click', () => {
        debugPanelVisible = !debugPanelVisible;
        window.debugMode = debugPanelVisible; // Expose to other modules
        panel.classList.toggle('visible', debugPanelVisible);
        if (debugPanelVisible) {
            updateDebugPanel();
        }
    });
}

export function registerDebugCallback(name, callback) {
    debugCallbacks[name] = callback;
}

export function updateDebugPanel(state = null) {
    const panel = document.getElementById('debug-panel');
    if (!panel || !debugPanelVisible) return;
    
    // Store current state reference
    if (state !== null) {
        currentState = state;
    }
    
    // Use stored state if no state provided
    const displayState = state || currentState;
    
    const karma = getKarma();
    let html = '<div class="debug-section"><div class="debug-title">Karma</div>';
    html += `<div class="debug-row"><span>Current Karma</span><span class="debug-value">${karma}</span></div>`;
    
    // Karma controls
    html += '<div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">';
    html += '<input type="number" id="debug-karma-amount" value="10" style="width: 60px; background: #222; border: 1px solid #444; color: #aaa; padding: 3px; font-size: 11px;">';
    html += '<button id="debug-add-karma" style="background: #333; border: 1px solid #555; color: #aaa; padding: 3px 8px; font-size: 11px; cursor: pointer;">+Karma</button>';
    html += '<button id="debug-subtract-karma" style="background: #333; border: 1px solid #555; color: #aaa; padding: 3px 8px; font-size: 11px; cursor: pointer;">-Karma</button>';
    html += '</div>';
    html += '</div>';
    
    if (displayState) {
        html += '<div class="debug-section"><div class="debug-title">Game State</div>';
        html += `<div class="debug-row"><span>Phase</span><span class="debug-value">${displayState.phase}</span></div>`;
        html += `<div class="debug-row"><span>Stage</span><span class="debug-value">${displayState.currentStage || 'N/A'}</span></div>`;
        html += `<div class="debug-row"><span>Events</span><span class="debug-value">${displayState.eventCount || 0}/${displayState.maxEvents || 0}</span></div>`;
        
        if (displayState.life) {
            html += '<div class="debug-section"><div class="debug-title">Current Life</div>';
            html += `<div class="debug-row"><span>Wealth</span><span class="debug-value">${displayState.life.wealth}</span></div>`;
            html += `<div class="debug-row"><span>Education</span><span class="debug-value">${displayState.life.education}</span></div>`;
            html += `<div class="debug-row"><span>Health</span><span class="debug-value">${displayState.life.health}</span></div>`;
            html += `<div class="debug-row"><span>Connections</span><span class="debug-value">${displayState.life.connections}</span></div>`;
            html += '</div>';
        }
        
        html += '</div>';
        
        // Game control commands (only during event phase)
        if (displayState.phase === 'event' && displayState.life) {
            html += '<div class="debug-section"><div class="debug-title">Commands</div>';
            html += '<button id="debug-instant-kill" style="background: #333; border: 1px solid #555; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%; margin-bottom: 5px;">Instant Kill</button>';
            html += '<button id="debug-skip-death" style="background: #333; border: 1px solid #555; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%; margin-bottom: 5px;">Skip to Death</button>';
            html += '</div>';
        }
    }
    
    // Karma Slots section
    const gachaConfig = getGachaConfig();
    html += '<div class="debug-section"><div class="debug-title">🎰 Karma Slots</div>';
    html += '<button id="debug-open-slots" style="background: linear-gradient(180deg, #fbbf24, #f59e0b); border: none; color: #000; padding: 8px 12px; font-size: 12px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; border-radius: 4px;">OPEN SLOTS</button>';
    html += '<div style="font-size: 10px; color: #888; margin-bottom: 8px;">Settings:</div>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">';
    html += `<label style="color: #888;">Pull Cost:</label><input type="number" id="debug-pull-cost" value="${gachaConfig.pullCost}" style="width: 100%; background: #222; border: 1px solid #444; color: #aaa; padding: 2px 4px; font-size: 10px;">`;
    html += `<label style="color: #888;">Multi Cost:</label><input type="number" id="debug-multi-cost" value="${gachaConfig.multiPullCost}" style="width: 100%; background: #222; border: 1px solid #444; color: #aaa; padding: 2px 4px; font-size: 10px;">`;
    html += `<label style="color: #888;">Multi Count:</label><input type="number" id="debug-multi-count" value="${gachaConfig.multiPullCount}" style="width: 100%; background: #222; border: 1px solid #444; color: #aaa; padding: 2px 4px; font-size: 10px;">`;
    html += `<label style="color: #888;">Pity Threshold:</label><input type="number" id="debug-pity-threshold" value="${gachaConfig.pityThreshold}" style="width: 100%; background: #222; border: 1px solid #444; color: #aaa; padding: 2px 4px; font-size: 10px;">`;
    html += '</div>';
    html += '<div style="font-size: 10px; color: #888; margin: 8px 0 4px;">Drop Rates (%):</div>';
    html += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; font-size: 9px;">';
    html += `<div style="text-align: center;"><div style="color: #888;">C</div><input type="number" id="debug-weight-common" value="${gachaConfig.weights.common}" style="width: 100%; background: #222; border: 1px solid #444; color: #888; padding: 2px; font-size: 9px; text-align: center;"></div>`;
    html += `<div style="text-align: center;"><div style="color: #4ade80;">U</div><input type="number" id="debug-weight-uncommon" value="${gachaConfig.weights.uncommon}" style="width: 100%; background: #222; border: 1px solid #444; color: #4ade80; padding: 2px; font-size: 9px; text-align: center;"></div>`;
    html += `<div style="text-align: center;"><div style="color: #60a5fa;">R</div><input type="number" id="debug-weight-rare" value="${gachaConfig.weights.rare}" style="width: 100%; background: #222; border: 1px solid #444; color: #60a5fa; padding: 2px; font-size: 9px; text-align: center;"></div>`;
    html += `<div style="text-align: center;"><div style="color: #c084fc;">E</div><input type="number" id="debug-weight-epic" value="${gachaConfig.weights.epic}" style="width: 100%; background: #222; border: 1px solid #444; color: #c084fc; padding: 2px; font-size: 9px; text-align: center;"></div>`;
    html += `<div style="text-align: center;"><div style="color: #fbbf24;">L</div><input type="number" id="debug-weight-legendary" value="${gachaConfig.weights.legendary}" style="width: 100%; background: #222; border: 1px solid #444; color: #fbbf24; padding: 2px; font-size: 9px; text-align: center;"></div>`;
    html += '</div>';
    html += '<div style="display: flex; gap: 4px; margin-top: 8px;">';
    html += '<button id="debug-slots-apply" style="flex: 1; background: #333; border: 1px solid #555; color: #aaa; padding: 4px 8px; font-size: 10px; cursor: pointer;">Apply</button>';
    html += '<button id="debug-slots-reset" style="flex: 1; background: #522; border: 1px solid #855; color: #aaa; padding: 4px 8px; font-size: 10px; cursor: pointer;">Reset</button>';
    html += '</div>';
    html += '</div>';

    // Era progress section
    const eraProgress = getEraUnlockProgress();
    html += '<div class="debug-section"><div class="debug-title">Eras</div>';
    html += `<div class="debug-row"><span>Unlocked</span><span class="debug-value">${eraProgress.unlocked} / ${eraProgress.total}</span></div>`;

    // Show current era if in a life
    if (displayState && displayState.life && displayState.life.era) {
        const era = displayState.life.era;
        html += `<div class="debug-row"><span>Current</span><span class="debug-value">${era.name}</span></div>`;
        html += `<div class="debug-row"><span>Years</span><span class="debug-value">${era.startYear}-${era.endYear}</span></div>`;
    }
    html += '</div>';

    // Job category progress section
    const jobCategoryProgress = getJobCategoryUnlockProgress();
    html += '<div class="debug-section"><div class="debug-title">Careers</div>';
    html += `<div class="debug-row"><span>Unlocked</span><span class="debug-value">${jobCategoryProgress.unlocked} / ${jobCategoryProgress.total}</span></div>`;

    // Show current job if in a life
    if (displayState && displayState.life && displayState.life.job) {
        const job = displayState.life.job;
        html += `<div class="debug-row"><span>Current Job</span><span class="debug-value">${job.name}</span></div>`;
        html += `<div class="debug-row"><span>Category</span><span class="debug-value">${job.category}</span></div>`;
    }
    html += '</div>';

    // Country progress section
    const progress = getUnlockProgress();
    html += '<div class="debug-section"><div class="debug-title">Countries</div>';
    html += `<div class="debug-row"><span>Unlocked</span><span class="debug-value">${progress.unlocked} / ${progress.total}</span></div>`;
    html += `<div class="debug-row"><span>Progress</span><span class="debug-value">${progress.percentage}%</span></div>`;

    // Show current country if in a life
    if (displayState && displayState.life && displayState.life.country) {
        const country = displayState.life.country;
        html += `<div class="debug-row"><span>Current</span><span class="debug-value">${country.name}</span></div>`;
        html += `<div class="debug-row"><span>Income</span><span class="debug-value">${country.incomeLevel}</span></div>`;
        html += `<div class="debug-row"><span>Population</span><span class="debug-value">${country.populationScale}</span></div>`;
    }
    html += '</div>';

    // Unlock commands (always available)
    html += '<div class="debug-section"><div class="debug-title">Unlocks</div>';
    html += '<button id="debug-unlock-all" style="background: #333; border: 1px solid #555; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%; margin-bottom: 5px;">Unlock All Items</button>';
    html += '<button id="debug-reset-unlocks" style="background: #522; border: 1px solid #855; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%;">Reset Country Unlocks</button>';
    html += '</div>';

    // Reset commands
    html += '<div class="debug-section"><div class="debug-title">Reset</div>';
    html += '<button id="debug-reset-logs" style="background: #333; border: 1px solid #555; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%; margin-bottom: 5px;">Reset Run History</button>';
    html += '<button id="debug-full-reset" style="background: #522; border: 1px solid #855; color: #aaa; padding: 5px 10px; font-size: 11px; cursor: pointer; width: 100%;">Full Game Reset</button>';
    html += '</div>';
    
    panel.innerHTML = html;
    
    // Attach event listeners
    const addKarmaBtn = document.getElementById('debug-add-karma');
    const subtractKarmaBtn = document.getElementById('debug-subtract-karma');
    const karmaAmountInput = document.getElementById('debug-karma-amount');
    const instantKillBtn = document.getElementById('debug-instant-kill');
    const skipDeathBtn = document.getElementById('debug-skip-death');
    const unlockAllBtn = document.getElementById('debug-unlock-all');
    
    if (addKarmaBtn && karmaAmountInput) {
        addKarmaBtn.addEventListener('click', () => {
            const amount = parseInt(karmaAmountInput.value) || 10;
            adjustKarma(amount);
            updateDebugPanel(displayState);
        });
    }
    
    if (subtractKarmaBtn && karmaAmountInput) {
        subtractKarmaBtn.addEventListener('click', () => {
            const amount = parseInt(karmaAmountInput.value) || 10;
            adjustKarma(-amount);
            updateDebugPanel(displayState);
        });
    }
    
    if (instantKillBtn && debugCallbacks.instantKill) {
        instantKillBtn.addEventListener('click', () => {
            debugCallbacks.instantKill();
        });
    }
    
    if (skipDeathBtn && debugCallbacks.skipToDeath) {
        skipDeathBtn.addEventListener('click', () => {
            debugCallbacks.skipToDeath();
        });
    }
    
    if (unlockAllBtn) {
        unlockAllBtn.addEventListener('click', () => {
            // Unlock all achievements
            achievements.forEach(achievement => {
                unlockAchievement(achievement.id);
            });
            // Unlock all countries, eras, and job categories
            unlockAllCountries();
            unlockAllEras();
            unlockAllJobCategories();
            alert('All achievements, countries, eras, and careers unlocked!');
            updateDebugPanel(displayState);
        });
    }

    const resetUnlocksBtn = document.getElementById('debug-reset-unlocks');
    if (resetUnlocksBtn) {
        resetUnlocksBtn.addEventListener('click', () => {
            if (confirm('Reset all unlocks? This will return to default unlocks only.')) {
                resetUnlocks();
                alert('All unlocks reset. Only defaults are now unlocked.');
                updateDebugPanel(displayState);
            }
        });
    }

    const resetLogsBtn = document.getElementById('debug-reset-logs');
    if (resetLogsBtn) {
        resetLogsBtn.addEventListener('click', () => {
            if (confirm('Reset run history? This clears all past life records.')) {
                resetLogs();
                alert('Run history cleared.');
                updateDebugPanel(displayState);
            }
        });
    }

    const fullResetBtn = document.getElementById('debug-full-reset');
    if (fullResetBtn) {
        fullResetBtn.addEventListener('click', () => {
            if (confirm('FULL RESET: This will clear ALL game data including karma, unlocks, achievements, and history. Are you sure?')) {
                resetKarma();
                resetUnlocks();
                resetAchievements();
                resetLogs();
                alert('Full game reset complete. Refresh the page to start fresh.');
                updateDebugPanel(displayState);
            }
        });
    }

    // Karma Slots controls
    const openSlotsBtn = document.getElementById('debug-open-slots');
    if (openSlotsBtn) {
        openSlotsBtn.addEventListener('click', () => {
            showGachaMachine(
                getKarma(),
                (amount) => adjustKarma(-amount),
                (amount) => adjustKarma(amount),
                () => updateDebugPanel(displayState)
            );
        });
    }

    const slotsApplyBtn = document.getElementById('debug-slots-apply');
    if (slotsApplyBtn) {
        slotsApplyBtn.addEventListener('click', () => {
            const newConfig = {
                pullCost: parseInt(document.getElementById('debug-pull-cost')?.value) || 3,
                multiPullCost: parseInt(document.getElementById('debug-multi-cost')?.value) || 25,
                multiPullCount: parseInt(document.getElementById('debug-multi-count')?.value) || 10,
                pityThreshold: parseInt(document.getElementById('debug-pity-threshold')?.value) || 50,
                weights: {
                    common: parseInt(document.getElementById('debug-weight-common')?.value) || 60,
                    uncommon: parseInt(document.getElementById('debug-weight-uncommon')?.value) || 25,
                    rare: parseInt(document.getElementById('debug-weight-rare')?.value) || 10,
                    epic: parseInt(document.getElementById('debug-weight-epic')?.value) || 4,
                    legendary: parseInt(document.getElementById('debug-weight-legendary')?.value) || 1
                }
            };
            setGachaConfig(newConfig);
            updateDebugPanel(displayState);
        });
    }

    const slotsResetBtn = document.getElementById('debug-slots-reset');
    if (slotsResetBtn) {
        slotsResetBtn.addEventListener('click', () => {
            debugResetGacha();
            // Also reset config to defaults
            setGachaConfig({
                pullCost: 3,
                multiPullCost: 25,
                multiPullCount: 10,
                pityThreshold: 50,
                weights: { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }
            });
            updateDebugPanel(displayState);
        });
    }
}
