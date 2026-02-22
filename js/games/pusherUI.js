// Karma Pusher UI - Full Featured
// Canvas rendering, upgrades, events, maximum juice

import { getPusherGame, PRIZES, UPGRADES, SPECIAL_EVENTS } from './pusher.js';
import { spawnParticles, spawnFireworks, screenFlash, playTick, playWinSound, playChime, sleep } from './shared.js';

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

const DROP_COST = 1;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 320;

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
                <div class="pusher-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="pusher-karma">${karma}</span>
                </div>
            </div>
            
            <div class="pusher-event-banner" id="event-banner"></div>
            
            <div class="pusher-cabinet">
                <div class="pusher-glass">
                    <canvas id="pusher-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
                    <div class="combo-display" id="combo-display"></div>
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
            
            <div class="upgrade-panel" id="upgrade-panel">
                <div class="upgrade-panel-header">
                    <h3>⬆️ UPGRADES</h3>
                    <button class="upgrade-close" id="upgrade-close">✕</button>
                </div>
                <div class="upgrade-list" id="upgrade-list"></div>
            </div>
            
            <div class="notification-container" id="notifications"></div>
        </div>
        <div class="particle-container" id="particles"></div>
    `;
    
    document.body.appendChild(pusherContainer);
    
    canvas = document.getElementById('pusher-canvas');
    ctx = canvas.getContext('2d');
    
    bindEvents();
    updateStats();
    updateUpgradePanel();
    startGameLoop();
}

function bindEvents() {
    const game = getPusherGame();
    
    document.getElementById('drop-slider').addEventListener('input', (e) => {
        dropPosition = e.target.value / 100;
    });
    
    document.getElementById('btn-drop').addEventListener('click', () => {
        if (currentKarma >= DROP_COST) {
            doDrop();
        } else {
            shakeButton('btn-drop');
        }
    });
    
    document.getElementById('btn-drop-multi').addEventListener('click', () => {
        const count = game.getMultiDropCount();
        const cost = DROP_COST * count;
        if (currentKarma >= cost) {
            doMultiDrop(count);
        } else {
            shakeButton('btn-drop-multi');
        }
    });
    
    document.getElementById('btn-upgrades').addEventListener('click', () => {
        showUpgradePanel = !showUpgradePanel;
        document.getElementById('upgrade-panel').classList.toggle('show', showUpgradePanel);
    });
    
    document.getElementById('upgrade-close').addEventListener('click', () => {
        showUpgradePanel = false;
        document.getElementById('upgrade-panel').classList.remove('show');
    });
    
    document.getElementById('btn-pusher-close').addEventListener('click', () => {
        hidePusherGame();
        if (onCloseFn) onCloseFn();
    });
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        dropPosition = Math.max(0.05, Math.min(0.95, x));
        document.getElementById('drop-slider').value = dropPosition * 100;
    });
}

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
    
    // Small screen shake
    screenShake = 3;
    
    updateStats();
}

function doMultiDrop(count) {
    const game = getPusherGame();
    const cost = DROP_COST * count;
    
    currentKarma -= cost;
    spendFn(cost);
    updateKarmaDisplay();
    
    // Staggered drops across the platform
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

function startGameLoop() {
    const game = getPusherGame();
    let lastTime = performance.now();
    
    function loop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
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
        
        // Render
        render(game);
        
        // Update notifications
        updateNotifications();
        
        animationFrame = requestAnimationFrame(loop);
    }
    
    animationFrame = requestAnimationFrame(loop);
}

function handleCollections(items) {
    const game = getPusherGame();
    let totalKarma = 0;
    let biggestWin = 0;
    let gotJackpot = false;
    
    for (const item of items) {
        const result = game.collectPrize(item);
        totalKarma += result.value;
        
        if (result.value > biggestWin) biggestWin = result.value;
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

function updateEventBanner() {
    const game = getPusherGame();
    const banner = document.getElementById('event-banner');
    
    if (game.activeEvent) {
        banner.innerHTML = `
            <div class="event-name">${game.activeEvent.name}</div>
            <div class="event-effect">${game.activeEvent.effect}</div>
            <div class="event-timer" style="width: ${(game.eventTimer / SPECIAL_EVENTS[game.activeEvent.type].duration) * 100}%"></div>
        `;
        banner.classList.add('active');
        
        // Trigger notification on new event
        if (game.eventTimer > SPECIAL_EVENTS[game.activeEvent.type].duration - 100) {
            addNotification(game.activeEvent.name, '#fbbf24', 2000);
            playWinSound('rare');
        }
    } else {
        banner.classList.remove('active');
    }
}

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
    
    // Draw cabinet background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Platform glow (subtle)
    ctx.shadowColor = 'rgba(251, 191, 36, 0.2)';
    ctx.shadowBlur = 20;
    
    // Platform background with metallic gradient
    const platGrad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.edgeY);
    platGrad.addColorStop(0, '#3a3a5a');
    platGrad.addColorStop(0.3, '#2a2a45');
    platGrad.addColorStop(0.7, '#1e1e35');
    platGrad.addColorStop(1, '#151525');
    ctx.fillStyle = platGrad;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    ctx.shadowBlur = 0;
    
    // Depth grid lines (perspective effect)
    ctx.strokeStyle = 'rgba(80, 80, 120, 0.2)';
    ctx.lineWidth = 1;
    const gridSpacing = 25;
    for (let y = platform.y + gridSpacing; y < platform.edgeY; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(platform.x, y);
        ctx.lineTo(platform.x + platform.width, y);
        ctx.stroke();
    }
    
    // Platform border with inner highlight
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    ctx.strokeStyle = 'rgba(100, 100, 140, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.edgeY - platform.y - 4);
    
    // Pusher bar with 3D depth
    const barX = game.pusherX;
    
    // Shadow under pusher
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    
    // Main pusher body
    const pusherGrad = ctx.createLinearGradient(0, pusherBar.y, 0, pusherBar.y + pusherBar.height);
    pusherGrad.addColorStop(0, '#aaa');
    pusherGrad.addColorStop(0.3, '#888');
    pusherGrad.addColorStop(0.7, '#666');
    pusherGrad.addColorStop(1, '#555');
    ctx.fillStyle = pusherGrad;
    
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(barX, pusherBar.y, pusherWidth, pusherBar.height, 4);
    } else {
        ctx.rect(barX, pusherBar.y, pusherWidth, pusherBar.height);
    }
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Top shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(barX + 3, pusherBar.y + 2, pusherWidth - 6, 3);
    
    // Front face (3D depth)
    const frontGrad = ctx.createLinearGradient(0, pusherBar.y + pusherBar.height - 4, 0, pusherBar.y + pusherBar.height + 6);
    frontGrad.addColorStop(0, '#555');
    frontGrad.addColorStop(1, '#333');
    ctx.fillStyle = frontGrad;
    ctx.fillRect(barX + 2, pusherBar.y + pusherBar.height - 2, pusherWidth - 4, 8);
    
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
    
    // Drop line
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
    
    // Gold rush overlay
    if (game.activeEvent?.type === 'goldRush') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    // Frenzy overlay
    if (game.activeEvent?.type === 'frenzy') {
        const pulse = Math.sin(Date.now() / 100) * 0.03;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.05 + pulse})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    ctx.restore();
}

function drawItem(item, platform) {
    ctx.save();
    
    // 2.5D depth effect: items scale larger as they approach the edge
    const depthRange = platform.edgeY - platform.y;
    const depthFactor = Math.max(0, (item.y - platform.y) / depthRange);
    const scale = 0.85 + depthFactor * 0.3; // 0.85x at top, 1.15x at bottom
    
    ctx.translate(item.x + (item.wobble || 0), item.y);
    ctx.scale(scale, scale);
    
    // Depth shadow (grows as item gets "closer")
    const shadowSize = 2 + depthFactor * 6;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = shadowSize;
    ctx.shadowOffsetY = shadowSize * 0.5;
    
    // Glow effect
    if (item.glow > 0 || item.type !== 'coin') {
        const glowColor = item.color || '#fbbf24';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = item.type === 'coin' ? 5 * item.glow : 8 + depthFactor * 4;
    }
    
    // Flash effect
    if (item.flash > 0) {
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15 * item.flash;
    }
    
    // Near-edge tension glow
    if (item.y + item.radius > platform.edgeY - 30) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 12 + depthFactor * 5;
    }
    
    // Draw icon
    const size = item.radius * 1.8;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 0, 0);
    
    ctx.restore();
}

function addNotification(text, color = '#fff', duration = 2000) {
    notifications.push({
        text,
        color,
        createdAt: Date.now(),
        duration,
        y: 0
    });
}

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

function shakeButton(id) {
    const btn = document.getElementById(id);
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
}

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
}

export function updatePusherKarma(karma) {
    currentKarma = karma;
    updateKarmaDisplay();
}
