// Game Hub - Central menu for all mini-games
// Manages game selection and karma flow

import { showGachaMachine, hideGachaMachine, setDebugMode as setSlotsDebugMode } from './slotsUI.js';
import { showPullGame, hidePullGame, setDebugMode as setPullDebugMode } from './pullUI.js';
import { showWheelGame, hideWheelGame } from './wheelUI.js';
import { showPlinkoGame, hidePlinkoGame } from './plinkoUI.js';

let hubContainer = null;
let currentKarma = 0;
let spendKarmaFn = null;
let addKarmaFn = null;
let onHubClose = null;

// Available games with their status
const GAMES = [
    {
        id: 'slots',
        name: 'Karma Slots',
        icon: '🎰',
        description: 'Pull the lever, spin the reels!',
        available: true,
        minKarma: 3, // Minimum to play
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
    }
];

// Show the game hub
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

function createGameCard(game, karma) {
    const canPlay = karma >= game.minKarma;
    const classes = [
        'game-card',
        game.available ? 'available' : 'unavailable',
        game.comingSoon ? 'coming-soon' : '',
        !canPlay && game.available ? 'insufficient-karma' : ''
    ].filter(Boolean).join(' ');
    
    return `
        <div class="${classes}" id="game-card-${game.id}" ${game.available && canPlay ? 'role="button" tabindex="0"' : ''}>
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-desc">${game.description}</div>
            ${game.comingSoon ? '<div class="game-badge">COMING SOON</div>' : ''}
            ${game.available && !canPlay ? `<div class="game-cost">Need ${game.minKarma}☯</div>` : ''}
        </div>
    `;
}

function launchSlots() {
    // Hide the hub but don't remove it
    hubContainer.style.display = 'none';
    
    showGachaMachine(
        currentKarma,
        (amount) => {
            spendKarmaFn(amount);
            currentKarma -= amount;
        },
        (amount) => {
            addKarmaFn(amount);
            currentKarma += amount;
        },
        () => {
            // On slots close, return to hub
            returnToHub();
        }
    );
}

function launchPull() {
    // Hide the hub but don't remove it
    hubContainer.style.display = 'none';
    
    showPullGame(
        currentKarma,
        (amount) => {
            spendKarmaFn(amount);
            currentKarma -= amount;
        },
        (amount) => {
            addKarmaFn(amount);
            currentKarma += amount;
        },
        () => {
            // On pull close, return to hub
            returnToHub();
        }
    );
}

function launchWheel() {
    // Hide the hub but don't remove it
    hubContainer.style.display = 'none';
    
    showWheelGame(
        currentKarma,
        (amount) => {
            spendKarmaFn(amount);
            currentKarma -= amount;
        },
        (amount) => {
            addKarmaFn(amount);
            currentKarma += amount;
        },
        () => {
            // On wheel close, return to hub
            returnToHub();
        }
    );
}

function launchPlinko() {
    // Hide the hub but don't remove it
    hubContainer.style.display = 'none';
    
    showPlinkoGame(
        currentKarma,
        (amount) => {
            spendKarmaFn(amount);
            currentKarma -= amount;
        },
        (amount) => {
            addKarmaFn(amount);
            currentKarma += amount;
        },
        () => {
            // On plinko close, return to hub
            returnToHub();
        }
    );
}

function returnToHub() {
    hideGachaMachine();
    hidePullGame();
    hideWheelGame();
    hidePlinkoGame();
    
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
            }
        });
    }
}

export function hideGameHub() {
    hideGachaMachine();
    hidePullGame();
    hideWheelGame();
    hidePlinkoGame();
    if (hubContainer) {
        hubContainer.remove();
        hubContainer = null;
    }
}

// Expose debug mode toggle for all games
export function setDebugMode(enabled) {
    setSlotsDebugMode(enabled);
    setPullDebugMode(enabled);
}

// Get current karma (for external checks)
export function getHubKarma() {
    return currentKarma;
}
