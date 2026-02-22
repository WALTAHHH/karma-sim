// Karma Pusher UI
// Canvas rendering + interactions

import { getPusherGame, PRIZES } from './pusher.js';
import { spawnParticles, spawnFireworks, screenFlash, playTick, playWinSound, playChime } from './shared.js';

let pusherContainer = null;
let canvas = null;
let ctx = null;
let animationFrame = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let onCloseFn = null;
let dropPosition = 0.5; // 0-1
let lastCollections = [];
let showCollectionPopup = false;
let collectionPopupTimer = 0;

const DROP_COST = 1; // 1 karma per coin drop
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 350;

export function showPusherGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hidePusherGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    onCloseFn = onClose;
    
    pusherContainer = document.createElement('div');
    pusherContainer.className = 'pusher-overlay';
    pusherContainer.innerHTML = `
        <div class="pusher-machine">
            <div class="pusher-header">
                <h2 class="pusher-title">🪙 KARMA PUSHER 🪙</h2>
                <div class="pusher-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="pusher-karma">${karma}</span>
                </div>
            </div>
            
            <div class="pusher-cabinet">
                <div class="pusher-glass">
                    <canvas id="pusher-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
                </div>
                <div class="pusher-drop-zone">
                    <div class="drop-indicator" id="drop-indicator"></div>
                </div>
            </div>
            
            <div class="pusher-controls">
                <div class="drop-slider-container">
                    <input type="range" id="drop-slider" min="0" max="100" value="50" class="drop-slider">
                    <div class="slider-labels">
                        <span>◀ LEFT</span>
                        <span>RIGHT ▶</span>
                    </div>
                </div>
                <button class="pusher-btn drop-btn" id="btn-drop">
                    <span class="btn-icon">🪙</span>
                    <span class="btn-text">DROP</span>
                    <span class="btn-cost">${DROP_COST}☯</span>
                </button>
                <button class="pusher-btn drop-multi-btn" id="btn-drop-5">
                    <span class="btn-text">×5</span>
                    <span class="btn-cost">${DROP_COST * 5}☯</span>
                </button>
            </div>
            
            <div class="pusher-stats" id="pusher-stats"></div>
            
            <div class="pusher-collection" id="collection-popup"></div>
            
            <div class="pusher-footer">
                <button class="pusher-btn-secondary" id="btn-pusher-close">Close</button>
            </div>
        </div>
        <div class="particle-container" id="particles"></div>
    `;
    
    document.body.appendChild(pusherContainer);
    
    canvas = document.getElementById('pusher-canvas');
    ctx = canvas.getContext('2d');
    
    bindEvents();
    updateStats();
    startGameLoop();
}

function bindEvents() {
    const slider = document.getElementById('drop-slider');
    const dropIndicator = document.getElementById('drop-indicator');
    
    slider.addEventListener('input', (e) => {
        dropPosition = e.target.value / 100;
        dropIndicator.style.left = `${dropPosition * 100}%`;
    });
    
    document.getElementById('btn-drop').addEventListener('click', () => {
        if (currentKarma >= DROP_COST) {
            dropCoin();
        } else {
            shakeButton('btn-drop');
        }
    });
    
    document.getElementById('btn-drop-5').addEventListener('click', () => {
        if (currentKarma >= DROP_COST * 5) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (currentKarma >= DROP_COST) {
                        dropCoin(dropPosition + (Math.random() - 0.5) * 0.2);
                    }
                }, i * 150);
            }
        } else {
            shakeButton('btn-drop-5');
        }
    });
    
    document.getElementById('btn-pusher-close').addEventListener('click', () => {
        hidePusherGame();
        if (onCloseFn) onCloseFn();
    });
    
    // Click on canvas to set drop position
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        dropPosition = Math.max(0.1, Math.min(0.9, x));
        document.getElementById('drop-slider').value = dropPosition * 100;
        document.getElementById('drop-indicator').style.left = `${dropPosition * 100}%`;
    });
}

function dropCoin(position = dropPosition) {
    const game = getPusherGame();
    
    currentKarma -= DROP_COST;
    spendFn(DROP_COST);
    updateKarmaDisplay();
    
    const item = game.dropCoin(position);
    playTick(300 + Math.random() * 100);
    
    updateStats();
}

function startGameLoop() {
    const game = getPusherGame();
    
    function loop() {
        // Update physics
        const fallen = game.update();
        
        // Handle collected prizes
        if (fallen.length > 0) {
            handleCollections(fallen);
        }
        
        // Render
        render(game);
        
        // Update collection popup
        updateCollectionPopup();
        
        animationFrame = requestAnimationFrame(loop);
    }
    
    loop();
}

function handleCollections(items) {
    const game = getPusherGame();
    let totalKarma = 0;
    
    for (const item of items) {
        game.collectPrize(item);
        
        // Calculate karma value
        if (item.prizeType === 'karma') {
            totalKarma += item.value;
        } else if (item.prizeType === 'token') {
            // Tokens give free plays - worth 3 karma
            totalKarma += 3;
        } else if (item.prizeType === 'jackpot') {
            totalKarma += item.value;
            spawnFireworks('#fbbf24');
            screenFlash('#fbbf24', 0.3);
        }
        
        // Visual feedback
        if (item.type === 'coin') {
            playTick(500);
        } else {
            playWinSound(getPrizeRarity(item.type));
            spawnParticles(getPrizeColor(item.type), 15);
        }
        
        lastCollections.push({
            icon: item.icon,
            value: item.value,
            type: item.type,
            timestamp: Date.now()
        });
    }
    
    if (totalKarma > 0) {
        currentKarma += totalKarma;
        addFn(totalKarma);
        updateKarmaDisplay();
        showCollectionNotification(totalKarma);
    }
    
    updateStats();
}

function getPrizeRarity(type) {
    const rarityMap = {
        coin: 'common',
        token: 'uncommon',
        statBoost: 'rare',
        karmaGem: 'epic',
        reroll: 'epic',
        trophy: 'legendary',
        jackpot: 'legendary'
    };
    return rarityMap[type] || 'common';
}

function getPrizeColor(type) {
    const colorMap = {
        coin: '#fbbf24',
        token: '#4ade80',
        statBoost: '#60a5fa',
        karmaGem: '#c084fc',
        reroll: '#f472b6',
        trophy: '#fbbf24',
        jackpot: '#fbbf24'
    };
    return colorMap[type] || '#fbbf24';
}

function showCollectionNotification(amount) {
    showCollectionPopup = true;
    collectionPopupTimer = 120; // ~2 seconds at 60fps
    
    const popup = document.getElementById('collection-popup');
    popup.innerHTML = `<div class="collection-amount">+${amount} ☯</div>`;
    popup.classList.add('show');
}

function updateCollectionPopup() {
    if (showCollectionPopup) {
        collectionPopupTimer--;
        if (collectionPopupTimer <= 0) {
            showCollectionPopup = false;
            document.getElementById('collection-popup').classList.remove('show');
        }
    }
    
    // Clean old collections
    lastCollections = lastCollections.filter(c => Date.now() - c.timestamp < 3000);
}

function render(game) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const platform = game.getPlatformBounds();
    const pusher = game.getPusherBounds();
    
    // Draw cabinet background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw platform
    const gradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.edgeY);
    gradient.addColorStop(0, '#2a2a4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    // Platform border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.edgeY - platform.y);
    
    // Draw pusher bar
    const pusherGradient = ctx.createLinearGradient(pusher.x, pusher.y, pusher.x, pusher.y + pusher.height);
    pusherGradient.addColorStop(0, '#666');
    pusherGradient.addColorStop(1, '#333');
    ctx.fillStyle = pusherGradient;
    ctx.fillRect(pusher.x, pusher.y, pusher.width, pusher.height);
    
    // Pusher shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(pusher.x, pusher.y, pusher.width, 3);
    
    // Draw win zone
    ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
    ctx.fillRect(platform.x, platform.edgeY - 20, platform.width, 40);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(platform.x, platform.edgeY);
    ctx.lineTo(platform.x + platform.width, platform.edgeY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw items
    for (const item of game.items) {
        drawItem(item);
    }
    
    // Draw drop preview
    const dropX = platform.x + 20 + dropPosition * (platform.width - 40);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(dropX, 20);
    ctx.lineTo(dropX, platform.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Drop indicator coin
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪙', dropX, 35);
}

function drawItem(item) {
    ctx.save();
    
    // Apply wobble
    ctx.translate(item.x + item.wobble, item.y);
    
    // Flash effect
    if (item.flash > 0) {
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 20 * item.flash;
    }
    
    // Draw glow for non-coins
    if (item.type !== 'coin') {
        const color = getPrizeColor(item.type);
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
    }
    
    // Draw item
    ctx.font = `${item.radius * 1.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 0, 0);
    
    ctx.restore();
}

function updateKarmaDisplay() {
    const display = document.getElementById('pusher-karma');
    if (display) display.textContent = Math.floor(currentKarma);
    
    // Update button states
    const dropBtn = document.getElementById('btn-drop');
    const drop5Btn = document.getElementById('btn-drop-5');
    
    dropBtn.classList.toggle('disabled', currentKarma < DROP_COST);
    drop5Btn.classList.toggle('disabled', currentKarma < DROP_COST * 5);
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
        `;
    }
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
}

export function updatePusherKarma(karma) {
    currentKarma = karma;
    updateKarmaDisplay();
}
