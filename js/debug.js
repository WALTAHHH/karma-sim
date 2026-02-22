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

}
