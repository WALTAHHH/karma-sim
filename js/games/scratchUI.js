// Scratch Card UI
// Canvas-based scratch-off interaction

import {
    SCRATCH_COST,
    SYMBOL_POOLS,
    WIN_LINES,
    generateCard,
    findWins,
    findNearWins,
    calculateReward,
    getCoatingColor,
    getStats,
    recordCard
} from './scratch.js';

import {
    initAudio,
    playTick,
    playWinSound,
    playNearMiss,
    playChime,
    spawnParticles,
    spawnFireworks,
    screenFlash,
    shakeScreen,
    sleep,
    updateKarmaDisplay,
    RARITY_COLORS
} from './shared.js';

let scratchContainer = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let onCloseFn = null;

// Card state
let currentCard = null;
let scratchCanvas = null;
let scratchCtx = null;
let symbolCanvas = null;
let symbolCtx = null;
let isScratching = false;
let scratchPercent = 0;
let revealedCells = new Set();
let cardComplete = false;

// Canvas dimensions
const CARD_WIDTH = 300;
const CARD_HEIGHT = 300;
const CELL_SIZE = 100;
const SCRATCH_RADIUS = 25;

export function showScratchGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hideScratchGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    onCloseFn = onClose;
    
    scratchContainer = document.createElement('div');
    scratchContainer.className = 'scratch-overlay';
    scratchContainer.innerHTML = `
        <div class="scratch-machine">
            <div class="scratch-header">
                <h2 class="scratch-title">🎫 SCRATCH CARDS 🎫</h2>
                <div class="scratch-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="scratch-karma">${karma}</span>
                    <span class="karma-delta" id="scratch-karma-delta"></span>
                </div>
            </div>
            
            <div class="scratch-stage">
                <div class="scratch-card-container" id="scratch-card-container">
                    <div class="scratch-card-placeholder">
                        <div class="placeholder-text">Buy a card to play!</div>
                        <div class="placeholder-icon">🎫</div>
                    </div>
                </div>
                
                <div class="scratch-result" id="scratch-result">
                    <div class="result-content"></div>
                </div>
            </div>
            
            <div class="scratch-controls">
                <button class="scratch-buy-btn" id="btn-buy-card">
                    <span class="buy-text">BUY CARD</span>
                    <span class="buy-cost">${SCRATCH_COST} ☯</span>
                </button>
                <button class="scratch-auto-btn" id="btn-auto-scratch" disabled>
                    <span>AUTO-SCRATCH</span>
                </button>
            </div>
            
            <div class="scratch-stats" id="scratch-stats">
                <span class="stat">Cards: <span id="stat-cards">0</span></span>
                <span class="stat">Won: <span id="stat-won">0</span>☯</span>
                <span class="stat">Best: <span id="stat-best">0</span>☯</span>
            </div>
            
            <div class="scratch-footer">
                <button class="scratch-btn-secondary" id="btn-scratch-close">Back to Hub</button>
            </div>
        </div>
        <div class="scratch-particles" id="scratch-particles"></div>
    `;
    
    document.body.appendChild(scratchContainer);
    
    bindEvents();
    updateButtonState();
    updateStats();
}

function bindEvents() {
    document.getElementById('btn-buy-card').addEventListener('click', handleBuyCard);
    document.getElementById('btn-auto-scratch').addEventListener('click', handleAutoScratch);
    document.getElementById('btn-scratch-close').addEventListener('click', () => {
        hideScratchGame();
        if (onCloseFn) onCloseFn();
    });
}

function handleBuyCard() {
    if (currentKarma < SCRATCH_COST || (currentCard && !cardComplete)) return;
    
    // Spend karma
    currentKarma -= SCRATCH_COST;
    spendFn(SCRATCH_COST);
    updateKarmaLocal(currentKarma, -SCRATCH_COST);
    
    // Generate new card
    currentCard = generateCard();
    cardComplete = false;
    scratchPercent = 0;
    revealedCells = new Set();
    
    // Create card canvases
    createCardCanvases();
    
    // Enable auto-scratch
    document.getElementById('btn-auto-scratch').disabled = false;
    
    // Play buy sound
    playChime(500, 2, 'sine');
    
    updateButtonState();
}

function createCardCanvases() {
    const container = document.getElementById('scratch-card-container');
    container.innerHTML = '';
    
    // Create card wrapper
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'scratch-card';
    
    // Symbols canvas (underneath)
    symbolCanvas = document.createElement('canvas');
    symbolCanvas.width = CARD_WIDTH;
    symbolCanvas.height = CARD_HEIGHT;
    symbolCanvas.className = 'symbol-canvas';
    symbolCtx = symbolCanvas.getContext('2d');
    
    // Scratch coating canvas (on top)
    scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = CARD_WIDTH;
    scratchCanvas.height = CARD_HEIGHT;
    scratchCanvas.className = 'scratch-canvas';
    scratchCtx = scratchCanvas.getContext('2d');
    
    cardWrapper.appendChild(symbolCanvas);
    cardWrapper.appendChild(scratchCanvas);
    container.appendChild(cardWrapper);
    
    // Draw symbols
    drawSymbols();
    
    // Draw scratch coating
    drawCoating();
    
    // Bind scratch events
    bindScratchEvents();
    
    // Add shimmer based on card potential
    addShimmerHint();
}

function drawSymbols() {
    symbolCtx.fillStyle = '#1a1a2e';
    symbolCtx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    
    // Draw grid
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        const cell = currentCard[i];
        const pool = SYMBOL_POOLS[cell.rarity];
        
        // Cell background with subtle gradient
        const gradient = symbolCtx.createRadialGradient(
            x + CELL_SIZE / 2, y + CELL_SIZE / 2, 0,
            x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2
        );
        gradient.addColorStop(0, 'rgba(40, 40, 60, 1)');
        gradient.addColorStop(1, 'rgba(25, 25, 40, 1)');
        symbolCtx.fillStyle = gradient;
        symbolCtx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        
        // Symbol
        symbolCtx.font = '48px system-ui';
        symbolCtx.textAlign = 'center';
        symbolCtx.textBaseline = 'middle';
        
        // Add glow for rare+ symbols
        if (['rare', 'epic', 'legendary'].includes(cell.rarity)) {
            symbolCtx.shadowColor = pool.glow;
            symbolCtx.shadowBlur = 15;
        }
        
        symbolCtx.fillText(cell.symbol, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        symbolCtx.shadowBlur = 0;
        
        // Grid lines
        symbolCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        symbolCtx.lineWidth = 2;
        symbolCtx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
    }
}

function drawCoating() {
    const coating = getCoatingColor(currentCard);
    
    // Create metallic gradient based on coating type
    let gradient;
    if (coating === 'gold') {
        gradient = scratchCtx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.3, '#fde68a');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(0.7, '#f59e0b');
        gradient.addColorStop(1, '#fbbf24');
    } else if (coating === 'purple') {
        gradient = scratchCtx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.3, '#c084fc');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(0.7, '#9333ea');
        gradient.addColorStop(1, '#a855f7');
    } else if (coating === 'blue') {
        gradient = scratchCtx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.3, '#60a5fa');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(0.7, '#2563eb');
        gradient.addColorStop(1, '#3b82f6');
    } else {
        gradient = scratchCtx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#9ca3af');
        gradient.addColorStop(0.3, '#d1d5db');
        gradient.addColorStop(0.5, '#9ca3af');
        gradient.addColorStop(0.7, '#6b7280');
        gradient.addColorStop(1, '#9ca3af');
    }
    
    scratchCtx.fillStyle = gradient;
    scratchCtx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    
    // Add texture pattern
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * CARD_WIDTH;
        const y = Math.random() * CARD_HEIGHT;
        scratchCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
        scratchCtx.fillRect(x, y, 2, 2);
    }
    
    // "SCRATCH HERE" text
    scratchCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    scratchCtx.font = 'bold 24px system-ui';
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';
    scratchCtx.fillText('SCRATCH TO WIN!', CARD_WIDTH / 2, CARD_HEIGHT / 2);
}

function addShimmerHint() {
    const coating = getCoatingColor(currentCard);
    const card = scratchContainer.querySelector('.scratch-card');
    
    if (coating === 'gold') {
        card.classList.add('shimmer-gold');
    } else if (coating === 'purple') {
        card.classList.add('shimmer-purple');
    } else if (coating === 'blue') {
        card.classList.add('shimmer-blue');
    }
}

function bindScratchEvents() {
    let scratching = false;
    let lastX = 0;
    let lastY = 0;
    
    const getPos = (e) => {
        const rect = scratchCanvas.getBoundingClientRect();
        const scaleX = scratchCanvas.width / rect.width;
        const scaleY = scratchCanvas.height / rect.height;
        
        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };
    
    const startScratch = (e) => {
        if (cardComplete) return;
        e.preventDefault();
        scratching = true;
        isScratching = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        scratch(pos.x, pos.y);
    };
    
    const moveScratch = (e) => {
        if (!scratching || cardComplete) return;
        e.preventDefault();
        const pos = getPos(e);
        
        // Draw line from last position
        scratchLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
        
        // Play scratch sound occasionally
        if (Math.random() < 0.3) {
            playScratchSound();
        }
        
        checkScratchProgress();
    };
    
    const endScratch = () => {
        scratching = false;
        isScratching = false;
    };
    
    // Mouse events
    scratchCanvas.addEventListener('mousedown', startScratch);
    scratchCanvas.addEventListener('mousemove', moveScratch);
    scratchCanvas.addEventListener('mouseup', endScratch);
    scratchCanvas.addEventListener('mouseleave', endScratch);
    
    // Touch events
    scratchCanvas.addEventListener('touchstart', startScratch);
    scratchCanvas.addEventListener('touchmove', moveScratch);
    scratchCanvas.addEventListener('touchend', endScratch);
}

function scratch(x, y) {
    scratchCtx.globalCompositeOperation = 'destination-out';
    
    // Eraser circle with soft edges
    const gradient = scratchCtx.createRadialGradient(x, y, 0, x, y, SCRATCH_RADIUS);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    scratchCtx.fillStyle = gradient;
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    scratchCtx.fill();
    
    scratchCtx.globalCompositeOperation = 'source-over';
    
    // Track which cells are revealed
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (col >= 0 && col < 3 && row >= 0 && row < 3) {
        const cellIndex = row * 3 + col;
        if (!revealedCells.has(cellIndex)) {
            revealedCells.add(cellIndex);
            checkCellReveal(cellIndex);
        }
    }
}

function scratchLine(x1, y1, x2, y2) {
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.ceil(dist / 10);
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        scratch(x, y);
    }
}

function checkCellReveal(cellIndex) {
    const cell = currentCard[cellIndex];
    
    // Check for near-wins when revealing
    const nearWins = findNearWins(currentCard);
    const relevantNearWin = nearWins.find(nw => 
        nw.indices.includes(cellIndex) && revealedCells.has(nw.indices[0]) && revealedCells.has(nw.indices[1]) && revealedCells.has(nw.indices[2])
    );
    
    // Play reveal sound based on rarity
    const pitches = {
        common: 300,
        uncommon: 400,
        rare: 500,
        epic: 600,
        legendary: 800,
        bust: 200
    };
    playTick(pitches[cell.rarity] || 400);
}

function playScratchSound() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        // White noise-like scratch
        osc.frequency.value = 100 + Math.random() * 200;
        osc.type = 'sawtooth';
        
        filter.type = 'highpass';
        filter.frequency.value = 500;
        
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
}

function checkScratchProgress() {
    // Calculate how much is scratched
    const imageData = scratchCtx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) transparent++;
    }
    
    scratchPercent = transparent / (pixels.length / 4);
    
    // Auto-complete at 70%
    if (scratchPercent > 0.7 && !cardComplete) {
        completeCard();
    }
}

async function handleAutoScratch() {
    if (!currentCard || cardComplete) return;
    
    document.getElementById('btn-auto-scratch').disabled = true;
    
    // Animate scratching across the card
    const ctx = scratchCtx;
    
    for (let y = 0; y < CARD_HEIGHT; y += 20) {
        for (let x = 0; x < CARD_WIDTH; x += 20) {
            scratch(x + Math.random() * 20, y + Math.random() * 20);
            
            // Sound and visual feedback
            if (Math.random() < 0.2) {
                playScratchSound();
            }
        }
        await sleep(30);
        
        if (cardComplete) break;
    }
    
    if (!cardComplete) {
        completeCard();
    }
}

async function completeCard() {
    cardComplete = true;
    
    // Clear remaining coating
    scratchCtx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    
    // Find wins
    const wins = findWins(currentCard);
    const reward = calculateReward(wins);
    
    // Highlight winning lines
    await highlightWins(wins);
    
    // Show result
    await showResult(wins, reward);
    
    // Record stats
    recordCard(reward.total);
    updateStats();
    updateButtonState();
}

async function highlightWins(wins) {
    if (wins.length === 0) return;
    
    const card = scratchContainer.querySelector('.scratch-card');
    
    for (const win of wins) {
        // Create highlight overlay for winning cells
        for (const index of win.indices) {
            const row = Math.floor(index / 3);
            const col = index % 3;
            
            const highlight = document.createElement('div');
            highlight.className = `win-highlight rarity-${win.rarity}`;
            highlight.style.left = `${col * (100 / 3)}%`;
            highlight.style.top = `${row * (100 / 3)}%`;
            highlight.style.width = `${100 / 3}%`;
            highlight.style.height = `${100 / 3}%`;
            card.appendChild(highlight);
        }
        
        // Small delay between highlighting each win
        playChime(600, 1);
        await sleep(200);
    }
}

async function showResult(wins, reward) {
    const resultEl = document.getElementById('scratch-result');
    const contentEl = resultEl.querySelector('.result-content');
    const particleContainer = document.getElementById('scratch-particles');
    
    if (wins.length === 0) {
        // No win
        contentEl.innerHTML = `
            <div class="result-icon bust">😔</div>
            <div class="result-text bust">No Match</div>
            <div class="result-value bust">-${SCRATCH_COST}☯</div>
        `;
        resultEl.classList.add('show', 'bust');
        playNearMiss();
        
    } else {
        const { total, bestRarity, winCount } = reward;
        const pool = SYMBOL_POOLS[bestRarity];
        
        // Celebration based on rarity
        if (bestRarity === 'legendary') {
            contentEl.innerHTML = `
                <div class="result-icon jackpot">🏆</div>
                <div class="result-text jackpot">JACKPOT!</div>
                <div class="result-value jackpot">+${total}☯</div>
                ${winCount > 1 ? `<div class="result-lines">${winCount} winning lines!</div>` : ''}
            `;
            resultEl.classList.add('jackpot');
            
            screenFlash('#fbbf24', 0.4);
            shakeScreen(scratchContainer.querySelector('.scratch-machine'));
            spawnFireworks('#fbbf24', particleContainer);
            playWinSound('legendary');
            
        } else if (bestRarity === 'epic') {
            contentEl.innerHTML = `
                <div class="result-icon win" style="color: ${pool.color}">⚡</div>
                <div class="result-text win">EPIC WIN!</div>
                <div class="result-value win" style="color: ${pool.color}">+${total}☯</div>
                ${winCount > 1 ? `<div class="result-lines">${winCount} winning lines!</div>` : ''}
            `;
            resultEl.classList.add('win');
            
            screenFlash(pool.color, 0.3);
            spawnParticles(pool.color, 30, particleContainer);
            playWinSound('epic');
            
        } else {
            contentEl.innerHTML = `
                <div class="result-icon win" style="color: ${pool.color}">✨</div>
                <div class="result-text win">WIN!</div>
                <div class="result-value win" style="color: ${pool.color}">+${total}☯</div>
                ${winCount > 1 ? `<div class="result-lines">${winCount} winning lines!</div>` : ''}
            `;
            resultEl.classList.add('win');
            
            spawnParticles(pool.color, 15, particleContainer);
            playWinSound(bestRarity);
        }
        
        // Add karma
        await sleep(500);
        currentKarma += total;
        addFn(total);
        updateKarmaLocal(currentKarma, total);
    }
    
    resultEl.classList.add('show');
    
    // Auto-hide
    await sleep(wins.length === 0 ? 2000 : 3000);
    resultEl.classList.remove('show', 'bust', 'jackpot', 'win');
}

function updateKarmaLocal(newValue, delta = 0) {
    const display = document.getElementById('scratch-karma');
    const deltaEl = document.getElementById('scratch-karma-delta');
    updateKarmaDisplay(display, deltaEl, newValue, delta);
}

function updateButtonState() {
    const buyBtn = document.getElementById('btn-buy-card');
    const autoBtn = document.getElementById('btn-auto-scratch');
    
    const canBuy = currentKarma >= SCRATCH_COST && (!currentCard || cardComplete);
    
    buyBtn.disabled = !canBuy;
    buyBtn.classList.toggle('disabled', !canBuy);
    
    if (currentCard && !cardComplete) {
        buyBtn.querySelector('.buy-text').textContent = 'SCRATCHING...';
    } else {
        buyBtn.querySelector('.buy-text').textContent = 'BUY CARD';
    }
    
    autoBtn.disabled = !currentCard || cardComplete;
}

function updateStats() {
    const stats = getStats();
    
    const cardsEl = document.getElementById('stat-cards');
    const wonEl = document.getElementById('stat-won');
    const bestEl = document.getElementById('stat-best');
    
    if (cardsEl) cardsEl.textContent = stats.cardsScratched;
    if (wonEl) wonEl.textContent = stats.totalWon;
    if (bestEl) bestEl.textContent = stats.bestWin;
}

export function hideScratchGame() {
    currentCard = null;
    scratchCanvas = null;
    symbolCanvas = null;
    cardComplete = false;
    
    if (scratchContainer) {
        scratchContainer.remove();
        scratchContainer = null;
    }
}
