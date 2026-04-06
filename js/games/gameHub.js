/**
 * @fileoverview Game Hub - Central menu for all mini-games
 * Manages game selection, karma flow, and navigation between games.
 * @module games/gameHub
 */

import { showGachaMachine, hideGachaMachine, setDebugMode as setSlotsDebugMode } from './slotsUI.js';
import { showPullGame, hidePullGame, setDebugMode as setPullDebugMode } from './pullUI.js';
import { showWheelGame, hideWheelGame } from './wheelUI.js';
import { showPlinkoGame, hidePlinkoGame } from './plinkoUI.js';
import { showClawGame, hideClawGame } from './clawUI.js';
import { showScratchGame, hideScratchGame } from './scratchUI.js';
import { showPusherGame, hidePusherGame } from './pusherUI.js';
import { getTotalKarmaEarned } from '../karma.js';

/** @type {HTMLElement|null} */
let hubContainer = null;

/** @type {number} */
let currentKarma = 0;

/** @type {Function|null} */
let spendKarmaFn = null;

/** @type {Function|null} */
let addKarmaFn = null;

/** @type {Function|null} */
let onHubClose = null;

/** @type {boolean} */
let debugModeEnabled = false;

/** @type {Set<string>} Track which game unlocks have been celebrated */
const celebratedUnlocks = new Set();
const CELEBRATED_UNLOCKS_KEY = 'karma_simulator_celebrated_game_unlocks';

// Load celebrated unlocks from localStorage
function loadCelebratedUnlocks() {
    try {
        const stored = localStorage.getItem(CELEBRATED_UNLOCKS_KEY);
        if (stored) {
            const arr = JSON.parse(stored);
            arr.forEach(id => celebratedUnlocks.add(id));
        }
    } catch (e) {
        console.error('Failed to load celebrated unlocks:', e);
    }
}

function saveCelebratedUnlocks() {
    try {
        localStorage.setItem(CELEBRATED_UNLOCKS_KEY, JSON.stringify([...celebratedUnlocks]));
    } catch (e) {
        console.error('Failed to save celebrated unlocks:', e);
    }
}

// Initialize on module load
loadCelebratedUnlocks();

/**
 * Game unlock thresholds based on total lifetime karma earned
 * @type {Object.<string, number>}
 */
const GAME_UNLOCK_THRESHOLDS = {
    plinko: 0,      // Always available - primary game
    slots: 25,      // Quick first unlock
    wheel: 75,      // Mid-tier
    scratch: 150,   // Casual game
    claw: 300,      // More complex
    pull: 500,      // Collection mechanic
    pusher: 1000    // "Endgame" content
};

/**
 * @typedef {Object} GameDefinition
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {number} minKarma - Minimum karma to play
 * @property {Function} launch - Function to launch the game
 * @property {boolean} [comingSoon] - Whether it's coming soon
 */

/**
 * Check if a game is unlocked based on total karma earned
 * @param {string} gameId - Game ID
 * @returns {boolean} Whether the game is unlocked
 */
function isGameUnlocked(gameId) {
    const threshold = GAME_UNLOCK_THRESHOLDS[gameId];
    if (threshold === undefined) return true; // Unknown games default to unlocked
    const totalEarned = getTotalKarmaEarned();
    return totalEarned >= threshold;
}

/**
 * Get unlock progress for a game
 * @param {string} gameId - Game ID
 * @returns {{ current: number, required: number, percentage: number }}
 */
function getUnlockProgress(gameId) {
    const threshold = GAME_UNLOCK_THRESHOLDS[gameId] || 0;
    const current = getTotalKarmaEarned();
    return {
        current,
        required: threshold,
        percentage: threshold > 0 ? Math.min(100, (current / threshold) * 100) : 100
    };
}

/**
 * Get next game to unlock
 * @returns {{ game: GameDefinition, threshold: number } | null}
 */
function getNextUnlock() {
    const totalEarned = getTotalKarmaEarned();
    const sortedGames = GAMES
        .filter(g => !isGameUnlocked(g.id))
        .sort((a, b) => GAME_UNLOCK_THRESHOLDS[a.id] - GAME_UNLOCK_THRESHOLDS[b.id]);
    
    if (sortedGames.length === 0) return null;
    return {
        game: sortedGames[0],
        threshold: GAME_UNLOCK_THRESHOLDS[sortedGames[0].id]
    };
}

/**
 * Available games with their configuration
 * @type {GameDefinition[]}
 */
const GAMES = [
    {
        id: 'plinko',
        name: 'Karma Plinko',
        icon: '📍',
        description: 'Drop and watch it bounce',
        minKarma: 3,
        launch: launchPlinko
    },
    {
        id: 'slots',
        name: 'Karma Slots',
        icon: '🎰',
        description: 'Pull the lever, spin the reels!',
        minKarma: 3,
        launch: launchSlots
    },
    {
        id: 'wheel',
        name: 'Wheel of Fate',
        icon: '🎡',
        description: 'Spin for your destiny',
        minKarma: 3,
        launch: launchWheel
    },
    {
        id: 'scratch',
        name: 'Scratch Cards',
        icon: '🎫',
        description: 'Scratch to reveal your fate!',
        minKarma: 3,
        launch: launchScratch
    },
    {
        id: 'claw',
        name: 'Karma Claw',
        icon: '🎮',
        description: 'Grab prizes with skill!',
        minKarma: 5,
        launch: launchClaw
    },
    {
        id: 'pull',
        name: 'Karma Pull',
        icon: '🎴',
        description: 'Dramatic card reveal!',
        minKarma: 3,
        launch: launchPull
    },
    {
        id: 'pusher',
        name: 'Karma Pusher',
        icon: '🪙',
        description: 'Drop coins, push prizes!',
        minKarma: 1,
        launch: launchPusher
    }
];

/**
 * Check for newly unlocked games and show celebration
 * @param {Function} onComplete - Called when all celebrations complete
 */
function checkAndShowUnlockCelebrations(onComplete) {
    const newlyUnlocked = GAMES.filter(game => {
        const unlocked = isGameUnlocked(game.id);
        const celebrated = celebratedUnlocks.has(game.id);
        return unlocked && !celebrated;
    });
    
    if (newlyUnlocked.length === 0) {
        onComplete();
        return;
    }
    
    // Show celebrations sequentially
    let index = 0;
    function showNext() {
        if (index >= newlyUnlocked.length) {
            saveCelebratedUnlocks();
            onComplete();
            return;
        }
        
        const game = newlyUnlocked[index];
        celebratedUnlocks.add(game.id);
        index++;
        
        showGameUnlockCelebration(game, showNext);
    }
    
    showNext();
}

/**
 * Show a celebration overlay for unlocking a game
 * @param {GameDefinition} game - The game that was unlocked
 * @param {Function} onComplete - Called when celebration is dismissed
 */
function showGameUnlockCelebration(game, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'game-unlock-overlay';
    overlay.innerHTML = `
        <div class="game-unlock-particles" id="unlock-particles"></div>
        <div class="game-unlock-reveal">
            <div class="game-unlock-label">🎉 NEW GAME UNLOCKED! 🎉</div>
            <div class="game-unlock-icon">${game.icon}</div>
            <div class="game-unlock-name">${game.name}</div>
            <div class="game-unlock-desc">${game.description}</div>
            <button class="game-unlock-continue">Play Now!</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Create particles
    const particleContainer = overlay.querySelector('#unlock-particles');
    const colors = ['#fbbf24', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'unlock-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        particle.style.animationDuration = (1.5 + Math.random()) + 's';
        particleContainer.appendChild(particle);
    }
    
    const continueBtn = overlay.querySelector('.game-unlock-continue');
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            onComplete();
        }, 400);
    });
}

/**
 * Show the game hub menu
 * @param {number} karma - Current karma balance
 * @param {Function} spendFn - Function to call when spending karma
 * @param {Function} addFn - Function to call when gaining karma
 * @param {Function} onClose - Callback when hub is closed
 */
export function showGameHub(karma, spendFn, addFn, onClose) {
    hideGameHub(); // Clean up any existing
    
    currentKarma = karma;
    spendKarmaFn = spendFn;
    addKarmaFn = addFn;
    onHubClose = onClose;
    
    // Check for new unlocks first
    checkAndShowUnlockCelebrations(() => {
        renderGameHub();
    });
}

/**
 * Render the game hub UI
 */
function renderGameHub() {
    const totalEarned = getTotalKarmaEarned();
    const nextUnlock = getNextUnlock();
    
    hubContainer = document.createElement('div');
    hubContainer.className = 'game-hub-overlay';
    
    // Build progress bar for next unlock
    let progressHtml = '';
    if (nextUnlock) {
        const progress = getUnlockProgress(nextUnlock.game.id);
        progressHtml = `
            <div class="hub-progress-section">
                <div class="hub-progress-label">
                    Next unlock: <span class="hub-progress-game">${nextUnlock.game.icon} ${nextUnlock.game.name}</span>
                    <span class="hub-progress-nums">${totalEarned} / ${nextUnlock.threshold} ☯</span>
                </div>
                <div class="hub-progress-bar">
                    <div class="hub-progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            </div>
        `;
    } else {
        progressHtml = `
            <div class="hub-progress-section hub-all-unlocked">
                <div class="hub-progress-label">✨ All games unlocked! ✨</div>
            </div>
        `;
    }
    
    hubContainer.innerHTML = `
        <div class="game-hub">
            <div class="hub-header">
                <h2 class="hub-title">🎮 GAME HUB 🎮</h2>
                <div class="hub-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="hub-karma">${currentKarma}</span>
                </div>
            </div>
            
            ${progressHtml}
            
            <div class="hub-games" id="hub-games">
                ${GAMES.map(game => createGameCard(game, currentKarma)).join('')}
            </div>
            
            <div class="hub-footer">
                <button class="hub-close-btn" id="hub-close">Back</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(hubContainer);
    
    // Bind events
    document.getElementById('hub-close').addEventListener('click', () => {
        hideGameHub();
        if (onHubClose) onHubClose();
    });
    
    // Bind game card clicks (only for unlocked games)
    GAMES.forEach(game => {
        if (isGameUnlocked(game.id)) {
            const card = document.getElementById(`game-card-${game.id}`);
            if (card) {
                card.addEventListener('click', () => {
                    if (currentKarma >= game.minKarma) {
                        game.launch();
                    }
                });
            }
        }
    });
}

/**
 * Create HTML for a game card
 * @param {GameDefinition} game - Game definition
 * @param {number} karma - Current karma
 * @returns {string} HTML string
 */
function createGameCard(game, karma) {
    const unlocked = isGameUnlocked(game.id);
    const canPlay = karma >= game.minKarma;
    const progress = getUnlockProgress(game.id);
    const threshold = GAME_UNLOCK_THRESHOLDS[game.id] || 0;
    
    const classes = [
        'game-card',
        unlocked ? 'available' : 'locked',
        game.comingSoon ? 'coming-soon' : '',
        unlocked && !canPlay ? 'insufficient-karma' : ''
    ].filter(Boolean).join(' ');
    
    if (!unlocked) {
        // Locked game card
        return `
            <div class="${classes}" id="game-card-${game.id}">
                <div class="game-lock-overlay">
                    <div class="game-lock-icon">🔒</div>
                </div>
                <div class="game-icon game-icon-locked">${game.icon}</div>
                <div class="game-name">${game.name}</div>
                <div class="game-unlock-requirement">
                    <div class="unlock-label">Unlock at ${threshold} ☯ earned</div>
                    <div class="unlock-progress-bar">
                        <div class="unlock-progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="unlock-progress-text">${progress.current} / ${threshold}</div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="${classes}" id="game-card-${game.id}" ${canPlay ? 'role="button" tabindex="0"' : ''}>
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-desc">${game.description}</div>
            ${game.comingSoon ? '<div class="game-badge">COMING SOON</div>' : ''}
            ${!canPlay ? `<div class="game-cost">Need ${game.minKarma}☯</div>` : ''}
        </div>
    `;
}

/**
 * Create karma callback wrapper that tracks current karma
 * @param {boolean} isSpend - Whether this is a spend (true) or add (false) callback
 * @returns {Function} Wrapped callback
 */
function createKarmaCallback(isSpend) {
    return (amount) => {
        if (isSpend) {
            spendKarmaFn(amount);
            currentKarma -= amount;
        } else {
            addKarmaFn(amount);
            currentKarma += amount;
        }
    };
}

/**
 * Launch Karma Slots game
 */
function launchSlots() {
    hubContainer.style.display = 'none';
    
    showGachaMachine(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Karma Pull game
 */
function launchPull() {
    hubContainer.style.display = 'none';
    
    showPullGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Wheel of Fate game
 */
function launchWheel() {
    hubContainer.style.display = 'none';
    
    showWheelGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Plinko game
 */
function launchPlinko() {
    hubContainer.style.display = 'none';
    
    showPlinkoGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Scratch Cards game
 */
function launchScratch() {
    hubContainer.style.display = 'none';
    
    showScratchGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Claw game
 */
function launchClaw() {
    hubContainer.style.display = 'none';
    
    showClawGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Launch Pusher game
 */
function launchPusher() {
    hubContainer.style.display = 'none';
    
    showPusherGame(
        currentKarma,
        createKarmaCallback(true),
        createKarmaCallback(false),
        returnToHub
    );
}

/**
 * Return to the hub from a game
 */
function returnToHub() {
    // Hide all games
    hideAllGames();
    
    // Check for new unlocks (player may have earned karma)
    checkAndShowUnlockCelebrations(() => {
        // Re-render hub to reflect any changes
        if (hubContainer) {
            hubContainer.remove();
            hubContainer = null;
        }
        renderGameHub();
    });
}

/**
 * Hide all game UIs
 */
function hideAllGames() {
    hideGachaMachine();
    hidePullGame();
    hideWheelGame();
    hidePlinkoGame();
    hideScratchGame();
    hideClawGame();
    hidePusherGame();
}

/**
 * Hide the game hub and all games
 */
export function hideGameHub() {
    hideAllGames();
    
    if (hubContainer) {
        hubContainer.remove();
        hubContainer = null;
    }
}

/**
 * Set debug mode for all games
 * @param {boolean} enabled - Whether debug mode is enabled
 */
export function setDebugMode(enabled) {
    debugModeEnabled = enabled;
    window.debugMode = enabled;
    
    // Propagate to all games that support it
    setSlotsDebugMode(enabled);
    setPullDebugMode(enabled);
    // Other games can check window.debugMode directly
}

/**
 * Get current karma (for external checks)
 * @returns {number} Current karma balance
 */
export function getHubKarma() {
    return currentKarma;
}

/**
 * Update hub karma externally (e.g., from debug panel)
 * @param {number} newKarma - New karma value
 */
export function updateHubKarma(newKarma) {
    currentKarma = newKarma;
    const karmaEl = document.getElementById('hub-karma');
    if (karmaEl) karmaEl.textContent = Math.floor(currentKarma);
}

/**
 * Get list of unlocked games
 * @returns {GameDefinition[]} Array of game definitions
 */
export function getAvailableGames() {
    return GAMES.filter(g => isGameUnlocked(g.id));
}

/**
 * Get list of all games (including locked)
 * @returns {GameDefinition[]} Array of game definitions
 */
export function getAllGames() {
    return GAMES;
}

/**
 * Check if a specific game is unlocked
 * @param {string} gameId - Game ID to check
 * @returns {boolean} Whether the game is unlocked
 */
export function checkGameUnlocked(gameId) {
    return isGameUnlocked(gameId);
}

/**
 * Get unlock threshold for a game
 * @param {string} gameId - Game ID
 * @returns {number} Karma threshold to unlock
 */
export function getGameUnlockThreshold(gameId) {
    return GAME_UNLOCK_THRESHOLDS[gameId] || 0;
}

/**
 * Get game by ID
 * @param {string} id - Game ID
 * @returns {GameDefinition|undefined} Game definition or undefined
 */
export function getGameById(id) {
    return GAMES.find(g => g.id === id);
}
