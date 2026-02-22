// Karma Pusher UI - Full Featured
// Canvas rendering, upgrades, events, debug/design tools

import { 
    getPusherGame, 
    PRIZES, 
    UPGRADES, 
    SPECIAL_EVENTS,
    PHYSICS,
    getPhysics,
    setPhysics
} from './pusher.js';
import { spawnParticles, spawnFireworks, screenFlash, playTick, playWinSound, playChime } from './shared.js';

// UI State
let pusherContainer = null;
let canvas = null;
let ctx = null;
let animationFrame = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let onCloseFn = null;
let dropPosition = 0.5;

// Visual state
let screenShake = 0;
let notifications = [];
let showUpgradePanel = false;
let showDebugPanel = false;
let showDesignPanel = false;

// Constants
const DROP_COST = 1;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 320;

/**
 * Show the pusher game overlay
 * @param {number} karma - Current karma balance
 * @param {Function} spendKarmaFn - Callback to spend karma
 * @param {Function} addKarmaFn - Callback to add karma
 * @param {Function} onClose - Callback when game closes
 */
export function showPusherGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hidePusherGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    onCloseFn = onClose;
    
    const game = getPusherGame();
    
    pusherContainer = document.createElement('div');
    pusherContainer.className = 'pusher-overlay';
    pusherContainer.innerHTML = `
        <div class="pusher-machine">
            <div class="pusher-header">
                <h2 class="pusher-title">🪙 KARMA PUSHER</h2>
                <div class="pusher-header-right">
                    <button class="pusher-icon-btn" id="btn-debug" title="Debug Tools">🐛</button>
                    <button class="pusher-icon-btn" id="btn-design" title="Design Tools">🎨</button>
                    <div class="pusher-karma-display">
                        <span class="karma-icon">☯</span>
                        <span class="karma-amount" id="pusher-karma">${karma}</span>
                    </div>
                </div>
            </div>
            
            <div class="pusher-event-banner" id="event-banner"></div>
            
            <div class="pusher-cabinet">
                <div class="pusher-glass">
                    <canvas id="pusher-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
                    <div class="combo-display" id="combo-display"></div>
                    <div class="debug-overlay" id="debug-overlay"></div>
                </div>
            </div>
            
            <div class="pusher-controls">
                <div class="drop-position-control">
                    <input type="range" id="drop-slider" min="5" max="95" value="50" class="drop-slider">
                </div>
                <div class="drop-buttons">
                    <button class="pusher-btn drop-btn" id="btn-drop">
                        <span class="btn-icon">🪙</span>
                        <span class="btn-text">DROP</span>
                        <span class="btn-cost">${DROP_COST}☯</span>
                    </button>
                    <button class="pusher-btn drop-multi-btn" id="btn-drop-multi">
                        <span class="btn-text" id="multi-label">×${game.getMultiDropCount()}</span>
                        <span class="btn-cost" id="multi-cost">${DROP_COST * game.getMultiDropCount()}☯</span>
                    </button>
                    <button class="pusher-btn upgrade-btn" id="btn-upgrades">
                        <span class="btn-icon">⬆️</span>
                    </button>
                </div>
            </div>
            
            <div class="pusher-stats" id="pusher-stats"></div>
            
            <div class="pusher-footer">
                <button class="pusher-btn-secondary" id="btn-pusher-close">Close</button>
            </div>
            
            <!-- Upgrade Panel -->
            <div class="upgrade-panel" id="upgrade-panel">
                <div class="upgrade-panel-header">
                    <h3>⬆️ UPGRADES</h3>
                    <button class="upgrade-close" id="upgrade-close">✕</button>
                </div>
                <div class="upgrade-list" id="upgrade-list"></div>
            </div>
            
            <!-- Debug Panel -->
            <div class="debug-panel" id="debug-panel">
                <div class="debug-panel-header">
                    <h3>🐛 DEBUG</h3>
                    <button class="debug-close" id="debug-close">✕</button>
                </div>
                <div class="debug-section">
                    <h4>Events</h4>
                    <div class="debug-buttons" id="debug-events"></div>
                </div>
                <div class="debug-section">
                    <h4>Spawn Prizes</h4>
                    <div class="debug-buttons" id="debug-prizes"></div>
                </div>
                <div class="debug-section">
                    <h4>Shortcuts</h4>
                    <div class="debug-buttons">
                        <button class="debug-btn" id="debug-max-upgrades">Max All Upgrades</button>
                        <button class="debug-btn" id="debug-add-karma">+100 Karma</button>
                        <button class="debug-btn" id="debug-spawn-50">Spawn 50 Items</button>
                        <button class="debug-btn" id="debug-spawn-200">Spawn 200 Items</button>
                        <button class="debug-btn" id="debug-clear">Clear Board</button>
                        <button class="debug-btn danger" id="debug-reset">Full Reset</button>
                    </div>
                </div>
            </div>
            
            <!-- Design Panel -->
            <div class="design-panel" id="design-panel">
                <div class="design-panel-header">
                    <h3>🎨 DESIGN</h3>
                    <button class="design-close" id="design-close">✕</button>
                </div>
                <div class="design-section">
                    <h4>Physics</h4>
                    <div class="design-sliders" id="design-physics"></div>
                </div>
                <div class="design-section">
                    <h4>Presets</h4>
                    <div class="design-buttons">
                        <button class="design-btn" id="preset-default">Default</button>
                        <button class="design-btn" id="preset-bouncy">Bouncy</button>
                        <button class="design-btn" id="preset-heavy">Heavy</button>
                        <button class="design-btn" id="preset-chaos">Chaos</button>
                        <button class="design-btn" id="preset-save">Save Custom</button>
                        <button class="design-btn" id="preset-load">Load Custom</button>
                    </div>
                </div>
            </div>
            
            <div class="notification-container" id="notifications"></div>
        </div>
        <div class="particle-container" id="particles"></div>
    `;
    
    document.body.appendChild(pusherContainer);
    
    canvas = document.getElementById('pusher-canvas');
    ctx = canvas.getContext('2d');
    
    bindEvents();
    buildDebugPanel();
    buildDesignPanel();
    updateStats();
    updateUpgradePanel();
    startGameLoop();
}

/**
 * Bind all UI event handlers
 */
function bindEvents() {
    const game = getPusherGame();
    
    // Drop position slider
    document.getElementById('drop-slider').addEventListener('input', (e) => {
        dropPosition = e.target.value / 100;
    });
    
    // Single drop
    document.getElementById('btn-drop').addEventListener('click', () => {
        if (currentKarma >= DROP_COST) {
            doDrop();
        } else {
            shakeButton('btn-drop');
        }
    });
    
    // Multi drop
    document.getElementById('btn-drop-multi').addEventListener('click', () => {
        const count = game.getMultiDropCount();
        const cost = DROP_COST * count;
        if (currentKarma >= cost) {
            doMultiDrop(count);
        } else {
            shakeButton('btn-drop-multi');
        }
    });
    
    // Upgrade panel toggle
    document.getElementById('btn-upgrades').addEventListener('click', () => {
        showUpgradePanel = !showUpgradePanel;
        showDebugPanel = false;
        showDesignPanel = false;
        updatePanelVisibility();
    });
    
    document.getElementById('upgrade-close').addEventListener('click', () => {
        showUpgradePanel = false;
        updatePanelVisibility();
    });
    
    // Debug panel toggle
    document.getElementById('btn-debug').addEventListener('click', () => {
        showDebugPanel = !showDebugPanel;
        showUpgradePanel = false;
        showDesignPanel = false;
        updatePanelVisibility();
    });
    
    document.getElementById('debug-close').addEventListener('click', () => {
        showDebugPanel = false;
        updatePanelVisibility();
    });
    
    // Design panel toggle
    document.getElementById('btn-design').addEventListener('click', () => {
        showDesignPanel = !showDesignPanel;
        showUpgradePanel = false;
        showDebugPanel = false;
        updatePanelVisibility();
    });
    
    document.getElementById('design-close').addEventListener('click', () => {
        showDesignPanel = false;
        updatePanelVisibility();
    });
    
    // Close button
    document.getElementById('btn-pusher-close').addEventListener('click', () => {
        hidePusherGame();
        if (onCloseFn) onCloseFn();
    });
    
    // Canvas click to set drop position
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        dropPosition = Math.max(0.05, Math.min(0.95, x));
        document.getElementById('drop-slider').value = dropPosition * 100;
    });
}

/**
 * Build debug panel content
 */
function buildDebugPanel() {
    const game = getPusherGame();
    
    // Event trigger buttons
    const eventsContainer = document.getElementById('debug-events');
    eventsContainer.innerHTML = Object.entries(SPECIAL_EVENTS).map(([key, event]) => 
        `<button class="debug-btn" data-event="${key}">${event.name.split(' ')[0]} ${key}</button>`
    ).join('');
    
    eventsContainer.querySelectorAll('[data-event]').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventType = btn.dataset.event;
            const triggered = game.triggerEvent(eventType);
            if (triggered) {
                addNotification(triggered.name, '#fbbf24', 2000);
                playWinSound('rare');
            }
        });
    });
    
    // Prize spawn buttons
    const prizesContainer = document.getElementById('debug-prizes');
    prizesContainer.innerHTML = Object.entries(PRIZES).map(([key, prize]) => 
        `<button class="debug-btn" data-prize="${key}">${prize.icon} ${key}</button>`
    ).join('');
    
    prizesContainer.querySelectorAll('[data-prize]').forEach(btn => {
        btn.addEventListener('click', () => {
            game.dropCoin(dropPosition, btn.dataset.prize);
            playChime(500);
        });
    });
    
    // Shortcut buttons
    document.getElementById('debug-max-upgrades').addEventListener('click', () => {
        game.maxAllUpgrades();
        updateUpgradePanel();
        addNotification('⬆️ All upgrades maxed!', '#c084fc');
    });
    
    document.getElementById('debug-add-karma').addEventListener('click', () => {
        currentKarma += 100;
        addFn(100);
        updateKarmaDisplay();
        addNotification('+100☯', '#4ade80');
    });
    
    document.getElementById('debug-spawn-50').addEventListener('click', () => {
        game.spawnTestItems(50);
        addNotification('Spawned 50 items', '#60a5fa');
    });
    
    document.getElementById('debug-spawn-200').addEventListener('click', () => {
        game.spawnTestItems(200);
        addNotification('Spawned 200 items (stress test!)', '#ef4444');
    });
    
    document.getElementById('debug-clear').addEventListener('click', () => {
        game.clearItems();
        addNotification('Board cleared', '#888');
    });
    
    document.getElementById('debug-reset').addEventListener('click', () => {
        if (confirm('Full reset? This clears all upgrades and stats!')) {
            game.fullReset();
            updateUpgradePanel();
            updateStats();
            addNotification('Full reset complete', '#ef4444');
        }
    });
}

/**
 * Build design panel content with physics sliders
 */
function buildDesignPanel() {
    const physics = getPhysics();
    
    const sliderDefs = [
        { key: 'gravity', label: 'Gravity', min: 0.05, max: 1, step: 0.05 },
        { key: 'friction', label: 'Friction', min: 0.5, max: 0.99, step: 0.01 },
        { key: 'bounce', label: 'Bounce', min: 0.1, max: 0.9, step: 0.05 },
        { key: 'maxVelocity', label: 'Max Velocity', min: 5, max: 30, step: 1 },
        { key: 'collisionDamping', label: 'Collision Damping', min: 0.1, max: 1, step: 0.05 }
    ];
    
    const container = document.getElementById('design-physics');
    container.innerHTML = sliderDefs.map(def => `
        <div class="design-slider-row">
            <label>${def.label}</label>
            <input type="range" class="design-slider" 
                   data-key="${def.key}" 
                   min="${def.min}" max="${def.max}" step="${def.step}" 
                   value="${physics[def.key]}">
            <span class="design-value" id="value-${def.key}">${physics[def.key]}</span>
        </div>
    `).join('');
    
    // Bind slider events
    container.querySelectorAll('.design-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            const key = slider.dataset.key;
            const value = parseFloat(slider.value);
            setPhysics({ [key]: value });
            document.getElementById(`value-${key}`).textContent = value;
        });
    });
    
    // Preset buttons
    const presets = {
        default: { gravity: 0.3, friction: 0.85, bounce: 0.4, maxVelocity: 15, collisionDamping: 0.5 },
        bouncy: { gravity: 0.2, friction: 0.9, bounce: 0.8, maxVelocity: 20, collisionDamping: 0.7 },
        heavy: { gravity: 0.6, friction: 0.7, bounce: 0.2, maxVelocity: 12, collisionDamping: 0.3 },
        chaos: { gravity: 0.15, friction: 0.95, bounce: 0.85, maxVelocity: 25, collisionDamping: 0.9 }
    };
    
    Object.entries(presets).forEach(([name, values]) => {
        document.getElementById(`preset-${name}`).addEventListener('click', () => {
            setPhysics(values);
            updatePhysicsSliders();
            addNotification(`Applied "${name}" preset`, '#c084fc');
        });
    });
    
    // Save/load custom preset
    document.getElementById('preset-save').addEventListener('click', () => {
        const physics = getPhysics();
        localStorage.setItem('pusher_physics_preset', JSON.stringify(physics));
        addNotification('Preset saved!', '#4ade80');
    });
    
    document.getElementById('preset-load').addEventListener('click', () => {
        try {
            const saved = localStorage.getItem('pusher_physics_preset');
            if (saved) {
                setPhysics(JSON.parse(saved));
                updatePhysicsSliders();
                addNotification('Preset loaded!', '#4ade80');
            } else {
                addNotification('No saved preset', '#888');
            }
        } catch (e) {
            addNotification('Failed to load preset', '#ef4444');
        }
    });
}

/**
 * Update physics sliders to reflect current values
 */
function updatePhysicsSliders() {
    const physics = getPhysics();
    document.querySelectorAll('.design-slider').forEach(slider => {
        const key = slider.dataset.key;
        if (physics[key] !== undefined) {
            slider.value = physics[key];
            document.getElementById(`value-${key}`).textContent = physics[key];
        }
    });
}

/**
 * Update panel visibility based on state
 */
function updatePanelVisibility() {
    document.getElementById('upgrade-panel').classList.toggle('show', showUpgradePanel);
    document.getElementById('debug-panel').classList.toggle('show', showDebugPanel);
    document.getElementById('design-panel').classList.toggle('show', showDesignPanel);
    
    // Toggle debug overlay
    const game = getPusherGame();
    game.debugMode = showDebugPanel;
}

/**
 * Perform a single drop
 * @param {number} position - X position (0-1)
 */
function doDrop(position = dropPosition) {
    const game = getPusherGame();
    
    currentKarma -= DROP_COST;
    spendFn(DROP_COST);
    updateKarmaDisplay();
    
    const item = game.dropCoin(position);
    
    // Sound based on what dropped
    if (item.type === 'coin') {
        playTick(400 + Math.random() * 100);
    } else {
        playChime(500);
    }
    
    screenShake = 3;
    updateStats();
}

/**
 * Perform a multi-drop
 * @param {number} count - Number of items to drop
 */
function doMultiDrop(count) {
    const game = getPusherGame();
    const cost = DROP_COST * count;
    
    currentKarma -= cost;
    spendFn(cost);
    updateKarmaDisplay();
    
    // Staggered drops with spread
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const spread = 0.3;
            const pos = dropPosition + (Math.random() - 0.5) * spread;
            game.dropCoin(Math.max(0.05, Math.min(0.95, pos)));
            playTick(350 + Math.random() * 150);
        }, i * 60);
    }
    
    screenShake = 8;
    updateStats();
}

/**
 * Start the main game loop
 */
function startGameLoop() {
    const game = getPusherGame();
    
    function loop() {
        // Update physics
        const result = game.update(currentKarma, addFn);
        
        // Handle auto-drop
        if (result.autoDrop && currentKarma >= DROP_COST) {
            doDrop(Math.random());
            addNotification('🤖 Auto-drop!', '#4ade80');
        }
        
        // Handle collected prizes
        if (result.fallen && result.fallen.length > 0) {
            handleCollections(result.fallen);
        }
        
        // Update event banner
        updateEventBanner();
        
        // Decay screen shake
        if (screenShake > 0) screenShake *= 0.9;
        
        // Update combo display
        updateComboDisplay();
        
        // Update debug overlay
        if (game.debugMode) {
            updateDebugOverlay();
        }
        
        // Render
        render(game);
        
        // Update notifications
        updateNotifications();
        
        animationFrame = requestAnimationFrame(loop);
    }
    
    animationFrame = requestAnimationFrame(loop);
}

/**
 * Handle prize collections
 * @param {PusherItem[]} items - Collected items
 */
function handleCollections(items) {
    const game = getPusherGame();
    let totalKarma = 0;
    let gotJackpot = false;
    
    for (const item of items) {
        const result = game.collectPrize(item);
        totalKarma += result.value;
        
        if (item.prizeType === 'jackpot' || item.prizeType === 'megajackpot') {
            gotJackpot = true;
        }
        
        // Visual feedback based on prize type
        if (item.type === 'coin') {
            playTick(600);
            spawnParticles(item.color, 3);
        } else if (item.type === 'jackpot' || item.type === 'megaJackpot') {
            playWinSound('legendary');
            spawnFireworks(item.color);
            screenFlash(item.color, 0.4);
            screenShake = 20;
            addNotification(`🌟 JACKPOT! +${result.value}☯`, '#fbbf24', 3000);
        } else if (item.type === 'crystal' || item.type === 'trophy') {
            playWinSound('epic');
            spawnParticles(item.color, 25);
            screenFlash(item.color, 0.2);
            screenShake = 10;
        } else {
            playWinSound('uncommon');
            spawnParticles(item.color, 12);
        }
        
        // Combo notification
        if (result.combo > 2) {
            addNotification(`${result.combo}× COMBO!`, '#f472b6', 1500);
        }
        
        // Gold rush notification
        if (result.isGoldRush && item.type !== 'coin') {
            addNotification('2× GOLD RUSH!', '#fbbf24', 1000);
        }
    }
    
    if (totalKarma > 0) {
        currentKarma += totalKarma;
        addFn(totalKarma);
        updateKarmaDisplay(totalKarma);
        
        if (items.length > 1 && !gotJackpot) {
            addNotification(`+${totalKarma}☯`, '#4ade80', 1500);
        }
    }
    
    updateStats();
}

/**
 * Update the event banner
 */
function updateEventBanner() {
    const game = getPusherGame();
    const banner = document.getElementById('event-banner');
    
    if (game.activeEvent) {
        const eventDef = SPECIAL_EVENTS[game.activeEvent.type];
        const progress = game.eventTimer / eventDef.duration;
        
        banner.innerHTML = `
            <div class="event-name">${game.activeEvent.name}</div>
            <div class="event-effect">${game.activeEvent.effect}</div>
            <div class="event-timer" style="width: ${progress * 100}%"></div>
        `;
        banner.classList.add('active');
        
        // Trigger notification on new event
        if (game.eventTimer > eventDef.duration - 100) {
            addNotification(game.activeEvent.name, '#fbbf24', 2000);
            playWinSound('rare');
        }
    } else {
        banner.classList.remove('active');
    }
}

/**
 * Update the combo display
 */
function updateComboDisplay() {
    const game = getPusherGame();
    const display = document.getElementById('combo-display');
    
    if (game.combo > 1) {
        display.innerHTML = `<span class="combo-count">${game.combo}×</span><span class="combo-label">COMBO</span>`;
        display.classList.add('show');
    } else {
        display.classList.remove('show');
    }
}

/**
 * Update debug overlay
 */
function updateDebugOverlay() {
    const game = getPusherGame();
    const info = game.getDebugInfo();
    const overlay = document.getElementById('debug-overlay');
    
    overlay.innerHTML = `
        <div class="debug-stat">FPS: ${info.fps}</div>
        <div class="debug-stat">Items: ${info.itemCount} (${info.settledCount} settled)</div>
        <div class="debug-stat">Pusher: ${info.pusherX} ${info.pusherDir}</div>
        <div class="debug-stat">Event: ${info.activeEvent} (${info.eventTimer}s)</div>
        <div class="debug-stat">Cooldown: ${info.eventCooldown}s</div>
        <div class="debug-stat">Combo: ${info.combo} (${info.comboTimer}s)</div>
    `;
    overlay.classList.add('show');
}

/**
 * Main render function
 * @param {PusherGame} game - Game instance
 */
function render(game) {
    const platform = game.getPlatform();
    const pusherBar = game.getPusherBar();
    const pusherWidth = game.getPusherWidth();
    
    // Apply screen shake
    ctx.save();
    if (screenShake > 0.5) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
    }
    
    // Clear
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Platform glow
    ctx.shadowColor = 'rgba(251, 191, 36, 0.2)';
    ctx.shadowBlur = 20;
    
    // Platform background
    const platGrad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.edgeY);
    platGrad.addColorStop(0, '#252540');
    platGrad.addColorStop(0.5, '#1e1e35');
    platGrad.addColorStop(1, '#18182a');
    ctx.fillStyle = platGrad;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    ctx.shadowBlur = 0;
    
    // Platform border
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    // Pusher bar
    const pusherGrad = ctx.createLinearGradient(0, pusherBar.y, 0, pusherBar.y + pusherBar.height);
    pusherGrad.addColorStop(0, '#888');
    pusherGrad.addColorStop(0.5, '#666');
    pusherGrad.addColorStop(1, '#444');
    ctx.fillStyle = pusherGrad;
    
    const barX = game.pusherX;
    ctx.beginPath();
    ctx.roundRect(barX, pusherBar.y, pusherWidth, pusherBar.height, 4);
    ctx.fill();
    
    // Pusher shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(barX + 2, pusherBar.y + 2, pusherWidth - 4, 4);
    
    // Mega push indicator
    if (game.activeEvent?.type === 'megaPush') {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(barX - 2, pusherBar.y - 2, pusherWidth + 4, pusherBar.height + 4);
        ctx.setLineDash([]);
    }
    
    // Win zone
    const winZoneGrad = ctx.createLinearGradient(0, platform.edgeY - 25, 0, platform.edgeY + 20);
    winZoneGrad.addColorStop(0, 'rgba(74, 222, 128, 0.1)');
    winZoneGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.25)');
    winZoneGrad.addColorStop(1, 'rgba(74, 222, 128, 0.4)');
    ctx.fillStyle = winZoneGrad;
    ctx.fillRect(platform.x, platform.edgeY - 25, platform.width, 45);
    
    // Win zone line
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(platform.x, platform.edgeY);
    ctx.lineTo(platform.x + platform.width, platform.edgeY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // "WIN" text
    ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼ WIN ▼', platform.x + platform.width / 2, platform.edgeY + 15);
    
    // Draw items (back to front for proper layering)
    const sortedItems = [...game.items].sort((a, b) => a.y - b.y);
    for (const item of sortedItems) {
        drawItem(item, platform);
    }
    
    // Draw drop preview
    const dropX = platform.x + 15 + dropPosition * (platform.width - 30);
    
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dropX, 15);
    ctx.lineTo(dropX, platform.y - 5);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Drop coin preview
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪙', dropX, 25);
    
    // Event overlays
    if (game.activeEvent?.type === 'goldRush') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    if (game.activeEvent?.type === 'frenzy') {
        const pulse = Math.sin(Date.now() / 100) * 0.03;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.05 + pulse})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    ctx.restore();
}

/**
 * Draw a single item
 * @param {PusherItem} item - Item to draw
 * @param {Object} platform - Platform bounds
 */
function drawItem(item, platform) {
    ctx.save();
    ctx.translate(item.x + item.wobble, item.y);
    
    // Glow effect
    if (item.glow > 0 || item.type !== 'coin') {
        ctx.shadowColor = item.color || '#fbbf24';
        ctx.shadowBlur = item.type === 'coin' ? 5 * item.glow : 8;
    }
    
    // Flash effect
    if (item.flash > 0) {
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15 * item.flash;
    }
    
    // Near-edge tension glow
    if (item.y + item.radius > platform.edgeY - 30) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 12;
    }
    
    // Draw icon
    const size = item.radius * 1.8;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 0, 0);
    
    ctx.restore();
}

/**
 * Add a notification
 * @param {string} text - Notification text
 * @param {string} color - Text color
 * @param {number} duration - Duration in ms
 */
function addNotification(text, color = '#fff', duration = 2000) {
    notifications.push({
        text,
        color,
        createdAt: Date.now(),
        duration
    });
}

/**
 * Update notifications display
 */
function updateNotifications() {
    const container = document.getElementById('notifications');
    const now = Date.now();
    
    notifications = notifications.filter(n => now - n.createdAt < n.duration);
    
    container.innerHTML = notifications.map((n, i) => {
        const age = now - n.createdAt;
        const progress = age / n.duration;
        const opacity = progress < 0.2 ? progress * 5 : progress > 0.7 ? (1 - progress) * 3.33 : 1;
        const y = -i * 35;
        
        return `<div class="notification" style="color: ${n.color}; opacity: ${opacity}; transform: translateY(${y}px)">${n.text}</div>`;
    }).join('');
}

/**
 * Update karma display
 * @param {number} delta - Amount changed
 */
function updateKarmaDisplay(delta = 0) {
    const display = document.getElementById('pusher-karma');
    if (display) {
        if (delta > 0) {
            display.classList.add('pulse');
            setTimeout(() => display.classList.remove('pulse'), 300);
        }
        display.textContent = Math.floor(currentKarma);
    }
    
    // Update button states
    const game = getPusherGame();
    const dropBtn = document.getElementById('btn-drop');
    const multiBtn = document.getElementById('btn-drop-multi');
    const multiCount = game.getMultiDropCount();
    
    dropBtn.classList.toggle('disabled', currentKarma < DROP_COST);
    multiBtn.classList.toggle('disabled', currentKarma < DROP_COST * multiCount);
    
    // Update multi button label
    document.getElementById('multi-label').textContent = `×${multiCount}`;
    document.getElementById('multi-cost').textContent = `${DROP_COST * multiCount}☯`;
    
    // Update upgrade panel if open
    if (showUpgradePanel) {
        updateUpgradePanel();
    }
}

/**
 * Update stats display
 */
function updateStats() {
    const game = getPusherGame();
    const stats = game.stats;
    const statsEl = document.getElementById('pusher-stats');
    
    if (statsEl) {
        statsEl.innerHTML = `
            <span>Dropped: ${stats.coinsDropped}</span>
            <span>Collected: ${stats.prizesCollected}</span>
            <span>Earned: ${stats.karmaEarned}☯</span>
            ${stats.jackpots > 0 ? `<span class="jackpot-stat">🌟 ${stats.jackpots}</span>` : ''}
        `;
    }
}

/**
 * Update upgrade panel
 */
function updateUpgradePanel() {
    const game = getPusherGame();
    const list = document.getElementById('upgrade-list');
    
    const upgradeTypes = ['platform', 'pusherSpeed', 'prizeQuality', 'multiDrop', 'autoDrop'];
    
    list.innerHTML = upgradeTypes.map(type => {
        const info = game.getUpgradeInfo(type);
        const canAfford = !info.isMaxed && currentKarma >= info.nextCost;
        
        return `
            <div class="upgrade-item ${info.isMaxed ? 'maxed' : ''} ${canAfford ? 'affordable' : ''}">
                <div class="upgrade-icon">${info.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${info.name}</div>
                    <div class="upgrade-level">${info.currentLabel}</div>
                    <div class="upgrade-desc">${info.description}</div>
                </div>
                <div class="upgrade-action">
                    ${info.isMaxed ? 
                        '<span class="maxed-label">MAX</span>' : 
                        `<button class="upgrade-buy-btn ${canAfford ? '' : 'disabled'}" data-type="${type}" data-cost="${info.nextCost}">
                            ${info.nextCost}☯ → ${info.nextLabel}
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    // Bind upgrade buttons
    list.querySelectorAll('.upgrade-buy-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const cost = parseInt(btn.dataset.cost);
            
            if (currentKarma >= cost) {
                currentKarma -= cost;
                spendFn(cost);
                game.applyUpgrade(type);
                updateKarmaDisplay();
                updateUpgradePanel();
                updateStats();
                
                addNotification(`⬆️ ${UPGRADES[type].name} upgraded!`, '#4ade80');
                playWinSound('rare');
                screenShake = 5;
            }
        });
    });
}

/**
 * Shake a button for feedback
 * @param {string} id - Button element ID
 */
function shakeButton(id) {
    const btn = document.getElementById(id);
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
}

/**
 * Hide the pusher game overlay
 */
export function hidePusherGame() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    if (pusherContainer) {
        pusherContainer.remove();
        pusherContainer = null;
    }
    canvas = null;
    ctx = null;
    notifications = [];
    showUpgradePanel = false;
    showDebugPanel = false;
    showDesignPanel = false;
}

/**
 * Update karma from external source
 * @param {number} karma - New karma value
 */
export function updatePusherKarma(karma) {
    currentKarma = karma;
    updateKarmaDisplay();
}
