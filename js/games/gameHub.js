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

/**
 * @typedef {Object} GameDefinition
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {boolean} available - Whether the game is playable
 * @property {number} minKarma - Minimum karma to play
 * @property {Function} launch - Function to launch the game
 * @property {boolean} [featured] - Whether to highlight as featured
 * @property {boolean} [comingSoon] - Whether it's coming soon
 */

/**
 * Available games with their configuration
 * @type {GameDefinition[]}
 */
const GAMES = [
    {
        id: 'slots',
        name: 'Karma Slots',
        icon: '🎰',
        description: 'Pull the lever, spin the reels!',
        available: true,
        minKarma: 3,
        launch: launchSlots
    },
    {
        id: 'pull',
        name: 'Karma Pull',
        icon: '🎴',
        description: 'Dramatic card reveal!',
        available: true,
        minKarma: 3,
        launch: launchPull
    },
    {
        id: 'wheel',
        name: 'Wheel of Fate',
        icon: '🎡',
        description: 'Spin for your destiny',
        available: true,
        minKarma: 3,
        launch: launchWheel
    },
    {
        id: 'plinko',
        name: 'Karma Plinko',
        icon: '📍',
        description: 'Drop and watch it bounce',
        available: true,
        minKarma: 3,
        launch: launchPlinko
    },
    {
        id: 'scratch',
        name: 'Scratch Cards',
        icon: '🎫',
        description: 'Scratch to reveal your fate!',
        available: true,
        minKarma: 3,
        launch: launchScratch
    },
    {
        id: 'claw',
        name: 'Karma Claw',
        icon: '🎮',
        description: 'Grab prizes with skill!',
        available: true,
        minKarma: 5,
        launch: launchClaw
    },
    {
        id: 'pusher',
        name: 'Karma Pusher',
        icon: '🪙',
        description: 'Drop coins, push prizes!',
        available: true,
        minKarma: 1,
        launch: launchPusher,
        featured: true
    }
];

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
    
    hubContainer = document.createElement('div');
    hubContainer.className = 'game-hub-overlay';
    hubContainer.innerHTML = `
        <div class="game-hub">
            <div class="hub-header">
                <h2 class="hub-title">🎮 GAME HUB 🎮</h2>
                <div class="hub-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="hub-karma">${karma}</span>
                </div>
            </div>
            
            <div class="hub-games" id="hub-games">
                ${GAMES.map(game => createGameCard(game, karma)).join('')}
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
    
    // Bind game card clicks
    GAMES.forEach(game => {
        if (game.available) {
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
    const canPlay = karma >= game.minKarma;
    const classes = [
        'game-card',
        game.available ? 'available' : 'unavailable',
        game.comingSoon ? 'coming-soon' : '',
        game.featured ? 'featured' : '',
        !canPlay && game.available ? 'insufficient-karma' : ''
    ].filter(Boolean).join(' ');
    
    return `
        <div class="${classes}" id="game-card-${game.id}" ${game.available && canPlay ? 'role="button" tabindex="0"' : ''}>
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-desc">${game.description}</div>
            ${game.comingSoon ? '<div class="game-badge">COMING SOON</div>' : ''}
            ${game.featured ? '<div class="game-badge featured">NEW</div>' : ''}
            ${game.available && !canPlay ? `<div class="game-cost">Need ${game.minKarma}☯</div>` : ''}
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
    
    if (hubContainer) {
        hubContainer.style.display = 'flex';
        
        // Update karma display
        const karmaEl = document.getElementById('hub-karma');
        if (karmaEl) karmaEl.textContent = Math.floor(currentKarma);
        
        // Update card states based on new karma
        GAMES.forEach(game => {
            const card = document.getElementById(`game-card-${game.id}`);
            if (card && game.available) {
                const canPlay = currentKarma >= game.minKarma;
                card.classList.toggle('insufficient-karma', !canPlay);
                
                // Update cost display
                const costEl = card.querySelector('.game-cost');
                if (!canPlay && !costEl) {
                    const newCostEl = document.createElement('div');
                    newCostEl.className = 'game-cost';
                    newCostEl.textContent = `Need ${game.minKarma}☯`;
                    card.appendChild(newCostEl);
                } else if (canPlay && costEl) {
                    costEl.remove();
                }
            }
        });
    }
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
 * Get list of available games
 * @returns {GameDefinition[]} Array of game definitions
 */
export function getAvailableGames() {
    return GAMES.filter(g => g.available);
}

/**
 * Get game by ID
 * @param {string} id - Game ID
 * @returns {GameDefinition|undefined} Game definition or undefined
 */
export function getGameById(id) {
    return GAMES.find(g => g.id === id);
}
