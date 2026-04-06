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

// CSS animation helpers
function triggerAnimation(selector, className, duration = 400) {
    const el = document.querySelector(selector);
    if (el) {
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), duration);
    }
}

function updateEdgeExcitement(game) {
    const itemsNearEdge = game.items.filter(i => i.edgeTension > 0.3).length;
    const glass = document.querySelector('.pusher-glass');
    if (glass) {
        glass.classList.toggle('edge-excitement', itemsNearEdge >= 3);
    }
    
    // Also check for event active state
    const cabinet = document.querySelector('.pusher-cabinet');
    if (cabinet && game.activeEvent) {
        cabinet.classList.add('event-active');
    } else if (cabinet) {
        cabinet.classList.remove('event-active');
    }
}

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
    
    // Sound and feedback based on what dropped
    triggerAnimation('.pusher-cabinet', 'drop-impact', 150);
    
    if (item.type === 'coin') {
        playTick(450 + Math.random() * 100);
        screenShake = 2;
    } else {
        // Special item dropped! Build excitement
        playChime(500, 2, 'triangle');
        screenShake = 4;
        
        // Flash to draw attention to the special drop
        const rarityFlash = {
            'smallGem': 0.05,
            'token': 0.08,
            'mediumGem': 0.1,
            'star': 0.12,
            'trophy': 0.15,
            'crystal': 0.18,
            'jackpot': 0.25,
            'megaJackpot': 0.3
        };
        const flashIntensity = rarityFlash[item.type] || 0.05;
        screenFlash(item.color, flashIntensity);
        
        // Notification for rare drops
        if (['trophy', 'crystal', 'jackpot', 'megaJackpot'].includes(item.type)) {
            addNotification(`${item.icon} Dropped!`, item.color, 1200);
        }
    }
    
    updateStats();
}

function doMultiDrop(count) {
    const game = getPusherGame();
    const cost = DROP_COST * count;
    
    currentKarma -= cost;
    spendFn(cost);
    updateKarmaDisplay();
    
    // Dramatic multi-drop effect
    const isMassive = count >= 25;
    const isLarge = count >= 10;
    
    // Initial impact notification
    if (isMassive) {
        addNotification('💥 COIN STORM! 💥', '#fbbf24', 2000);
        screenFlash('#fbbf24', 0.15);
        triggerAnimation('.pusher-cabinet', 'storm', 400);
    } else if (isLarge) {
        addNotification('🌧️ Rain incoming!', '#60a5fa', 1500);
        triggerAnimation('.pusher-cabinet', 'drop-impact', 150);
    }
    
    // Staggered drops with escalating intensity
    const baseDelay = isMassive ? 40 : isLarge ? 50 : 60;
    const spread = isMassive ? 0.5 : isLarge ? 0.4 : 0.3;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            // Spread pattern: more spread as drops continue
            const progressSpread = spread * (0.5 + (i / count) * 0.5);
            const pos = dropPosition + (Math.random() - 0.5) * progressSpread;
            game.dropCoin(Math.max(0.05, Math.min(0.95, pos)));
            
            // Escalating pitch creates anticipation
            const pitch = 300 + (i / count) * 200 + Math.random() * 100;
            playTick(pitch);
            
            // Mini shakes throughout
            if (i % 5 === 0) {
                screenShake = Math.max(screenShake, 3);
            }
        }, i * baseDelay);
    }
    
    // Initial screen shake based on count
    screenShake = isMassive ? 15 : isLarge ? 10 : 6;
    
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
        
        // Update edge excitement CSS state
        updateEdgeExcitement(game);
        
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
    let consecutiveCount = items.length;
    
    for (const item of items) {
        const result = game.collectPrize(item);
        totalKarma += result.value;
        
        if (result.value > biggestWin) biggestWin = result.value;
        if (item.prizeType === 'jackpot' || item.prizeType === 'megajackpot') {
            gotJackpot = true;
        }
        
        // Enhanced visual feedback based on prize type
        if (item.type === 'coin') {
            // Satisfying coin collect - pitch varies with combo
            const pitch = 500 + Math.min(result.combo * 50, 400);
            playTick(pitch);
            spawnParticles(item.color, 5 + Math.min(result.combo, 5));
            screenShake = Math.max(screenShake, 2);
        } else if (item.type === 'jackpot' || item.type === 'megaJackpot') {
            // MASSIVE feedback for jackpots
            playWinSound('legendary');
            spawnFireworks(item.color);
            spawnFireworks('#ff6b6b');
            screenFlash(item.color, 0.5);
            screenShake = 25;
            addNotification(`🌟 JACKPOT! +${result.value}☯`, '#fbbf24', 3500);
            
            // CSS celebration animation
            triggerAnimation('.pusher-machine', 'jackpot', 600);
            
            // Extra dramatic pause effect
            setTimeout(() => spawnFireworks('#c084fc'), 300);
        } else if (item.type === 'crystal' || item.type === 'trophy') {
            playWinSound('epic');
            spawnParticles(item.color, 30);
            spawnFireworks(item.color);
            screenFlash(item.color, 0.25);
            screenShake = 12;
            addNotification(`${item.icon} +${result.value}☯`, item.color, 2000);
        } else if (item.type === 'star' || item.type === 'mediumGem') {
            playWinSound('rare');
            spawnParticles(item.color, 18);
            screenFlash(item.color, 0.15);
            screenShake = Math.max(screenShake, 6);
            addNotification(`${item.icon} +${result.value}☯`, item.color, 1500);
        } else {
            // smallGem, token
            playWinSound('uncommon');
            spawnParticles(item.color, 10);
            screenShake = Math.max(screenShake, 4);
        }
        
        // Enhanced combo notification
        if (result.combo >= 3) {
            const comboColors = ['#f472b6', '#ff6b6b', '#fbbf24', '#c084fc'];
            const colorIndex = Math.min(result.combo - 3, comboColors.length - 1);
            const comboSize = result.combo >= 5 ? '🔥' : result.combo >= 4 ? '⚡' : '';
            addNotification(`${comboSize}${result.combo}× COMBO!${comboSize}`, comboColors[colorIndex], 1800);
            
            // Extra shake for big combos
            if (result.combo >= 5) {
                screenShake = Math.max(screenShake, 10);
                // Add mega class to combo display
                const comboDisplay = document.getElementById('combo-display');
                if (comboDisplay) comboDisplay.classList.add('mega');
            }
            
            // Big win animation for high-value collections
            if (result.value >= 10) {
                triggerAnimation('.pusher-machine', 'big-win', 400);
            }
        }
        
        // Gold rush notification
        if (result.isGoldRush && item.type !== 'coin') {
            addNotification('✨ 2× GOLD RUSH! ✨', '#fbbf24', 1200);
        }
    }
    
    // Multi-item cascade bonus feedback
    if (consecutiveCount >= 3 && !gotJackpot) {
        addNotification(`💰 ${consecutiveCount} items!`, '#4ade80', 1500);
        screenShake = Math.max(screenShake, 8);
    }
    
    if (totalKarma > 0) {
        currentKarma += totalKarma;
        addFn(totalKarma);
        updateKarmaDisplay(totalKarma);
        
        // Show total for multi-drops
        if (items.length > 1 && !gotJackpot && totalKarma > 3) {
            addNotification(`+${totalKarma}☯ total`, '#4ade80', 1800);
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
    
    // Platform border
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    // Pusher bar with enhanced 3D depth and motion feel
    const barX = game.pusherX;
    const isMovingForward = game.pusherDirection > 0;
    
    // Motion blur effect when moving forward (the impactful direction)
    if (isMovingForward) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#888';
        ctx.fillRect(barX - 8, pusherBar.y + 2, 8, pusherBar.height - 4);
        ctx.restore();
    }
    
    // Shadow under pusher for depth
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(barX + 3, pusherBar.y + pusherBar.height, pusherWidth - 2, 4);
    
    // Main pusher body with metallic gradient
    const pusherGrad = ctx.createLinearGradient(0, pusherBar.y, 0, pusherBar.y + pusherBar.height);
    pusherGrad.addColorStop(0, '#c0c0c0');
    pusherGrad.addColorStop(0.15, '#a8a8a8');
    pusherGrad.addColorStop(0.5, '#787878');
    pusherGrad.addColorStop(0.85, '#606060');
    pusherGrad.addColorStop(1, '#505050');
    ctx.fillStyle = pusherGrad;
    
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(barX, pusherBar.y, pusherWidth, pusherBar.height, 4);
    } else {
        ctx.rect(barX, pusherBar.y, pusherWidth, pusherBar.height);
    }
    ctx.fill();
    
    // Front face highlight (3D effect)
    const faceGrad = ctx.createLinearGradient(barX + pusherWidth - 8, 0, barX + pusherWidth, 0);
    faceGrad.addColorStop(0, 'rgba(255,255,255,0)');
    faceGrad.addColorStop(1, 'rgba(255,255,255,0.2)');
    ctx.fillStyle = faceGrad;
    ctx.fillRect(barX + pusherWidth - 8, pusherBar.y, 8, pusherBar.height);
    
    // Top shine with subtle movement
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(barX + 3, pusherBar.y + 2, pusherWidth - 6, 3);
    
    // Edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 0.5, pusherBar.y + 0.5, pusherWidth - 1, pusherBar.height - 1);
    
    // Mega push indicator with pulsing glow
    if (game.activeEvent?.type === 'megaPush') {
        const megaPulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10 * megaPulse;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -(Date.now() / 30) % 8;
        ctx.strokeRect(barX - 2, pusherBar.y - 2, pusherWidth + 4, pusherBar.height + 4);
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
        ctx.shadowBlur = 0;
    }
    
    // Win zone with pulsing effect
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    
    // Check if any items are near the edge (for enhanced glow)
    const itemsNearEdge = game.items.filter(i => i.edgeTension > 0.3).length;
    const edgeExcitement = Math.min(itemsNearEdge / 5, 1);
    
    const winZoneGrad = ctx.createLinearGradient(0, platform.edgeY - 30, 0, platform.edgeY + 25);
    const baseAlpha = 0.15 + edgeExcitement * 0.15;
    winZoneGrad.addColorStop(0, `rgba(74, 222, 128, ${baseAlpha * 0.3})`);
    winZoneGrad.addColorStop(0.4, `rgba(74, 222, 128, ${baseAlpha * pulse})`);
    winZoneGrad.addColorStop(1, `rgba(74, 222, 128, ${baseAlpha * 1.5})`);
    ctx.fillStyle = winZoneGrad;
    ctx.fillRect(platform.x, platform.edgeY - 30, platform.width, 55);
    
    // Animated win zone line
    const dashOffset = (Date.now() / 50) % 12;
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.6 + edgeExcitement * 0.3})`;
    ctx.lineWidth = 2 + edgeExcitement;
    ctx.setLineDash([8, 4]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(platform.x, platform.edgeY);
    ctx.lineTo(platform.x + platform.width, platform.edgeY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    
    // "WIN" text with glow when items are near
    if (edgeExcitement > 0.2) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 8 + edgeExcitement * 8;
    }
    ctx.fillStyle = `rgba(74, 222, 128, ${0.5 + edgeExcitement * 0.4})`;
    ctx.font = `bold ${12 + edgeExcitement * 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('▼ WIN ▼', platform.x + platform.width / 2, platform.edgeY + 16);
    ctx.shadowBlur = 0;
    
    // Draw items (back to front for proper layering)
    const sortedItems = [...game.items].sort((a, b) => a.y - b.y);
    for (const item of sortedItems) {
        drawItem(item, platform);
    }
    
    // Draw drop preview with enhanced visibility
    const dropX = platform.x + 15 + dropPosition * (platform.width - 30);
    
    // Animated drop guide
    const dropPulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    const dropBob = Math.sin(Date.now() / 300) * 3;
    
    // Glowing drop zone indicator at landing point
    ctx.save();
    ctx.globalAlpha = 0.3 * dropPulse;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(dropX, platform.y + 5, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Drop line with animated dash
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 * dropPulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -(Date.now() / 50) % 10;
    ctx.beginPath();
    ctx.moveTo(dropX, 35);
    ctx.lineTo(dropX, platform.y - 5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    
    // Drop coin preview with subtle animation
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8 * dropPulse;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪙', dropX, 20 + dropBob);
    ctx.shadowBlur = 0;
    
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
    // Enhanced 2.5D depth effect
    const depthRange = platform.edgeY - platform.y;
    const depthFactor = Math.max(0, Math.min(1, (item.y - platform.y) / depthRange));
    
    // More dramatic scale range: 0.7x at back to 1.3x at front
    const scale = 0.7 + depthFactor * 0.6;
    
    // Y offset for "3D" positioning (items appear to lift as they come forward)
    const depthOffset = depthFactor * -8;
    
    const drawX = item.x + (item.wobble || 0);
    const drawY = item.y + depthOffset;
    
    // Glow effect for special items and edge tension
    const isSpecial = item.type !== 'coin';
    const tension = item.edgeTension || 0;
    
    if (isSpecial || item.glow > 0 || tension > 0.5) {
        ctx.save();
        
        // Determine glow color and intensity
        let glowColor = item.color;
        let glowIntensity = 0;
        
        if (tension > 0.5) {
            // Pulsing red/gold glow for edge tension
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            glowColor = '#ff6b6b';
            glowIntensity = (tension - 0.5) * 2 * pulse * 15;
        } else if (item.glow > 0) {
            glowIntensity = item.glow * 12;
        } else if (isSpecial) {
            // Subtle constant glow for special items
            glowIntensity = 6 + Math.sin(Date.now() / 200 + item.wobblePhase) * 3;
        }
        
        if (glowIntensity > 0) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowIntensity * scale;
        }
        
        const size = item.radius * 2 * scale;
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, drawX, drawY);
        ctx.restore();
    } else {
        // Regular coin - no glow for performance
        const size = item.radius * 2 * scale;
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, drawX, drawY);
    }
    
    // Flash overlay effect (when just pushed)
    if (item.flash > 0.1) {
        ctx.save();
        ctx.globalAlpha = item.flash * 0.6;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(drawX, drawY, item.radius * scale * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // Drop shadow for depth (scaled by position)
    if (depthFactor > 0.3) {
        ctx.save();
        ctx.globalAlpha = depthFactor * 0.3;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        const shadowOffset = depthFactor * 4;
        ctx.beginPath();
        ctx.ellipse(drawX + shadowOffset, drawY + item.radius * scale + shadowOffset, 
                    item.radius * scale * 0.8, item.radius * scale * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
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
