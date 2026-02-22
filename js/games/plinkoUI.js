// Plinko UI - Canvas rendering with juice
// Uses shared.js for common utilities

import {
    initPlinkoBoard,
    dropBall,
    stopPlinko,
    getPlinkoState,
    getPlinkoCost,
    getPlinkoBasePayout,
    getMultiplierRarity,
    getDropPositions
} from './plinko.js';

import {
    initAudio,
    playTick,
    playChime,
    playWinSound,
    playNearMiss,
    spawnParticles,
    spawnFireworks,
    screenFlash,
    shakeScreen,
    sleep,
    updateKarmaDisplay,
    RARITY_COLORS
} from './shared.js';

let plinkoContainer = null;
let canvas = null;
let ctx = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let isDropping = false;
let boardData = null;
let animationId = null;

// Visual state
let pegFlashes = new Map(); // pegIndex -> flash intensity
let screenShake = { x: 0, y: 0 };
let slotGlows = new Map();

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

// Color palette
const COLORS = {
    bg: '#1a1a2e',
    peg: '#4a4a6a',
    pegHit: '#fbbf24',
    ball: '#ff6b6b',
    ballGlow: 'rgba(255, 107, 107, 0.5)',
    slotBorder: '#3a3a5a',
    text: '#ffffff'
};

// Multiplier colors
const MULT_COLORS = {
    0: '#ff4444',
    0.5: '#888888',
    1: '#4ade80',
    2: '#60a5fa',
    3: '#c084fc',
    5: '#f472b6',
    10: '#fbbf24'
};

export function showPlinkoGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hidePlinkoGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    
    plinkoContainer = document.createElement('div');
    plinkoContainer.className = 'plinko-overlay';
    plinkoContainer.innerHTML = `
        <div class="plinko-game">
            <div class="plinko-header">
                <h2 class="plinko-title">📍 KARMA PLINKO 📍</h2>
                <div class="plinko-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="plinko-karma">${karma}</span>
                    <span class="karma-delta" id="plinko-delta"></span>
                </div>
            </div>
            
            <div class="plinko-board-container" id="plinko-board-container">
                <canvas id="plinko-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
                <div class="drop-zone">
                    <button class="drop-btn" data-pos="left" title="Left Drop">◀</button>
                    <button class="drop-btn center" data-pos="center" title="Center Drop">▼</button>
                    <button class="drop-btn" data-pos="right" title="Right Drop">▶</button>
                </div>
            </div>
            
            <div class="plinko-result" id="plinko-result"></div>
            
            <div class="plinko-info">
                <div class="info-cost">Cost: <span class="cost-value">${getPlinkoCost()}☯</span></div>
                <div class="info-base">Base: <span class="base-value">${getPlinkoBasePayout()}☯</span> × Multiplier</div>
            </div>
            
            <div class="plinko-footer">
                <button class="plinko-btn" id="plinko-random">🎲 Random Drop (${getPlinkoCost()}☯)</button>
                <button class="plinko-btn secondary" id="plinko-close">Back to Hub</button>
            </div>
        </div>
        <div class="particle-container" id="plinko-particles"></div>
    `;
    
    document.body.appendChild(plinkoContainer);
    
    // Setup canvas
    canvas = document.getElementById('plinko-canvas');
    ctx = canvas.getContext('2d');
    
    // Initialize board
    boardData = initPlinkoBoard(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Start render loop
    startRenderLoop();
    
    // Bind events
    bindEvents(onClose);
    updateButtonStates();
}

function bindEvents(onClose) {
    // Drop position buttons
    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isDropping && currentKarma >= getPlinkoCost()) {
                const pos = btn.dataset.pos;
                const positions = getDropPositions(CANVAS_WIDTH);
                handleDrop(positions[pos]);
            }
        });
    });
    
    // Random drop
    document.getElementById('plinko-random').addEventListener('click', () => {
        if (!isDropping && currentKarma >= getPlinkoCost()) {
            const positions = getDropPositions(CANVAS_WIDTH);
            handleDrop(positions.random);
        }
    });
    
    // Close
    document.getElementById('plinko-close').addEventListener('click', () => {
        hidePlinkoGame();
        if (onClose) onClose();
    });
}

async function handleDrop(dropX) {
    if (isDropping || currentKarma < getPlinkoCost()) return;
    
    isDropping = true;
    updateButtonStates();
    
    // Clear previous result
    document.getElementById('plinko-result').classList.remove('show');
    
    // Spend karma
    currentKarma -= getPlinkoCost();
    spendFn(getPlinkoCost());
    updateKarmaLocal(currentKarma, -getPlinkoCost());
    
    // Reset visual states
    pegFlashes.clear();
    slotGlows.clear();
    boardData.slots.forEach(slot => slot.lit = false);
    
    // Init audio
    initAudio();
    
    // Drop the ball!
    playTick(600);
    
    dropBall(dropX, CANVAS_HEIGHT, {
        onPegHit: (peg) => {
            // Flash the peg
            const pegIndex = boardData.pegs.indexOf(peg);
            pegFlashes.set(pegIndex, 1.0);
            
            // Play sound with pitch variation based on position
            const pitchVariation = 300 + (peg.y / CANVAS_HEIGHT) * 400;
            playTick(pitchVariation);
        },
        onSlotLand: async (slot, result) => {
            await handleLanding(slot, result);
        },
        onBallMove: (ball) => {
            // Check for near misses (ball close to edge slots)
            const edgeSlots = [0, 12]; // 10x slots
            edgeSlots.forEach(idx => {
                const slot = boardData.slots[idx];
                const dist = Math.abs(ball.x - slot.x);
                if (dist < 30 && ball.y > CANVAS_HEIGHT - 150) {
                    slotGlows.set(idx, Math.max(slotGlows.get(idx) || 0, 1 - dist / 30));
                }
            });
        }
    });
}

async function handleLanding(slot, result) {
    const mult = result.multiplier;
    const payout = result.payout;
    const rarity = getMultiplierRarity(mult);
    
    // Dramatic pause
    await sleep(200);
    
    // Play appropriate sound
    if (mult === 0) {
        // Sad loss
        playLossSound();
        shakeScreen(document.querySelector('.plinko-game'));
    } else if (mult >= 5) {
        // Big win!
        playWinSound(rarity);
        shakeScreen(document.querySelector('.plinko-game'));
        screenFlash(MULT_COLORS[mult], 0.3);
        const particles = document.getElementById('plinko-particles');
        spawnFireworks(MULT_COLORS[mult], particles);
    } else if (mult >= 2) {
        // Nice win
        playChime(500, 4, 'sine');
        const particles = document.getElementById('plinko-particles');
        spawnParticles(MULT_COLORS[mult], 20, particles);
    } else {
        // Small win
        playChime(400, 2, 'triangle');
    }
    
    // Show result
    showResult(mult, payout);
    
    // Apply winnings
    if (payout > 0) {
        await sleep(500);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
    }
    
    await sleep(1500);
    
    isDropping = false;
    updateButtonStates();
}

function showResult(mult, payout) {
    const resultEl = document.getElementById('plinko-result');
    const rarity = getMultiplierRarity(mult);
    const color = MULT_COLORS[mult];
    
    let message, emoji;
    if (mult === 0) {
        message = 'ZERO!';
        emoji = '💀';
    } else if (mult === 10) {
        message = 'JACKPOT!!!';
        emoji = '🎉🎉🎉';
    } else if (mult === 5) {
        message = 'BIG WIN!';
        emoji = '🌟';
    } else if (mult === 3) {
        message = 'Nice!';
        emoji = '✨';
    } else if (mult >= 1) {
        message = 'Win!';
        emoji = '👍';
    } else {
        message = 'Small return';
        emoji = '😅';
    }
    
    resultEl.innerHTML = `
        <div class="result-content ${rarity}" style="--mult-color: ${color}">
            <div class="result-emoji">${emoji}</div>
            <div class="result-mult">${mult}×</div>
            <div class="result-message">${message}</div>
            <div class="result-payout">${payout > 0 ? `+${payout}☯` : 'Lost 3☯'}</div>
        </div>
    `;
    resultEl.classList.add('show');
}

function playLossSound() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

function startRenderLoop() {
    function render() {
        if (!canvas || !ctx) return;
        
        const state = getPlinkoState();
        
        // Clear with shake offset
        ctx.save();
        ctx.translate(screenShake.x, screenShake.y);
        
        // Background
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
        
        // Draw slots first (background)
        drawSlots(state.slots);
        
        // Draw pegs
        drawPegs(state.pegs);
        
        // Draw ball
        if (state.ball) {
            drawBall(state.ball);
        }
        
        ctx.restore();
        
        // Decay effects
        decayEffects();
        
        animationId = requestAnimationFrame(render);
    }
    
    render();
}

function drawPegs(pegs) {
    pegs.forEach((peg, index) => {
        const flashIntensity = pegFlashes.get(index) || 0;
        
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        
        if (flashIntensity > 0) {
            // Glowing hit peg
            const gradient = ctx.createRadialGradient(
                peg.x, peg.y, 0,
                peg.x, peg.y, peg.radius * 2
            );
            gradient.addColorStop(0, COLORS.pegHit);
            gradient.addColorStop(0.5, `rgba(251, 191, 36, ${flashIntensity * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = COLORS.pegHit;
            ctx.fill();
            
            // Glow effect
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 191, 36, ${flashIntensity * 0.3})`;
            ctx.fill();
        } else {
            ctx.fillStyle = COLORS.peg;
            ctx.fill();
        }
    });
}

function drawSlots(slots) {
    slots.forEach((slot, index) => {
        const glow = slotGlows.get(index) || 0;
        const mult = slot.multiplier;
        const color = MULT_COLORS[mult];
        
        // Slot background
        ctx.fillStyle = slot.lit ? color : '#2a2a4a';
        ctx.fillRect(
            slot.x - slot.width / 2,
            slot.y,
            slot.width,
            slot.height
        );
        
        // Glow for near misses
        if (glow > 0 && !slot.lit) {
            ctx.fillStyle = `${color}${Math.floor(glow * 80).toString(16).padStart(2, '0')}`;
            ctx.fillRect(
                slot.x - slot.width / 2,
                slot.y,
                slot.width,
                slot.height
            );
        }
        
        // Slot border
        ctx.strokeStyle = slot.lit ? '#ffffff' : COLORS.slotBorder;
        ctx.lineWidth = slot.lit ? 3 : 1;
        ctx.strokeRect(
            slot.x - slot.width / 2,
            slot.y,
            slot.width,
            slot.height
        );
        
        // Multiplier text
        ctx.fillStyle = slot.lit ? '#000' : color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mult}×`, slot.x, slot.y + slot.height / 2);
    });
}

function drawBall(ball) {
    // Ball glow
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius * 2
    );
    gradient.addColorStop(0, COLORS.ball);
    gradient.addColorStop(0.6, COLORS.ballGlow);
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Ball core
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball;
    ctx.fill();
    
    // Shine
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
}

function decayEffects() {
    // Decay peg flashes
    pegFlashes.forEach((value, key) => {
        const newValue = value - 0.08;
        if (newValue <= 0) {
            pegFlashes.delete(key);
        } else {
            pegFlashes.set(key, newValue);
        }
    });
    
    // Decay slot glows
    slotGlows.forEach((value, key) => {
        const newValue = value - 0.02;
        if (newValue <= 0) {
            slotGlows.delete(key);
        } else {
            slotGlows.set(key, newValue);
        }
    });
    
    // Decay screen shake
    screenShake.x *= 0.9;
    screenShake.y *= 0.9;
}

function updateKarmaLocal(newValue, delta = 0) {
    const display = document.getElementById('plinko-karma');
    const deltaEl = document.getElementById('plinko-delta');
    updateKarmaDisplay(display, deltaEl, newValue, delta);
}

function updateButtonStates() {
    const canPlay = currentKarma >= getPlinkoCost() && !isDropping;
    
    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.disabled = !canPlay;
        btn.classList.toggle('disabled', !canPlay);
    });
    
    const randomBtn = document.getElementById('plinko-random');
    randomBtn.disabled = !canPlay;
    randomBtn.classList.toggle('disabled', !canPlay);
}

export function hidePlinkoGame() {
    stopPlinko();
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    if (plinkoContainer) {
        plinkoContainer.remove();
        plinkoContainer = null;
    }
    
    canvas = null;
    ctx = null;
}
