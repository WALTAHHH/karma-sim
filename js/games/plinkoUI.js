/**
 * @fileoverview Plinko UI - Canvas rendering with MAXIMUM JUICE
 * Uses shared.js for common utilities
 * @module games/plinkoUI
 */

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
let screenShake = { x: 0, y: 0, intensity: 0 };
let slotGlows = new Map();
let backgroundPhase = 0;
let dropPreviewPhase = 0;
let anticipationLevel = 0;  // Builds as ball approaches bottom

// Audio state
let lastPegPitch = 300;
let hitStreakAudio = 0;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

// Color palette - more vibrant
const COLORS = {
    bg: '#0f0f1a',
    bgGradientTop: '#1a1a2e',
    bgGradientBot: '#0a0a15',
    peg: '#5a5a7a',
    pegHit: '#fbbf24',
    pegLucky: '#ffd700',
    ball: '#ff6b6b',
    ballCore: '#ff8888',
    ballGlow: 'rgba(255, 107, 107, 0.6)',
    ballTrail: 'rgba(255, 107, 107, 0.3)',
    slotBorder: '#3a3a5a',
    text: '#ffffff',
    anticipation: 'rgba(255, 215, 0, 0.1)'
};

// Multiplier colors - more saturated
const MULT_COLORS = {
    0: '#ff3333',
    0.5: '#777799',
    1: '#4ade80',
    2: '#60a5fa',
    3: '#c084fc',
    5: '#ff6bb5',
    10: '#ffd700'
};

// Multiplier glow colors
const MULT_GLOWS = {
    0: 'rgba(255, 51, 51, 0.5)',
    0.5: 'rgba(119, 119, 153, 0.3)',
    1: 'rgba(74, 222, 128, 0.4)',
    2: 'rgba(96, 165, 250, 0.4)',
    3: 'rgba(192, 132, 252, 0.5)',
    5: 'rgba(255, 107, 181, 0.6)',
    10: 'rgba(255, 215, 0, 0.7)'
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
            
            <div class="plinko-debug" id="plinko-debug" style="display: none;">
                <div class="debug-title">🔧 Debug</div>
                <div class="debug-row">
                    <button class="debug-btn" data-mult="10">10× (Edge)</button>
                    <button class="debug-btn" data-mult="5">5×</button>
                    <button class="debug-btn" data-mult="0">0× (Bust)</button>
                </div>
                <div class="debug-stats" id="plinko-debug-stats"></div>
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
    
    // Indicate if lucky peg is present
    const gameEl = document.querySelector('.plinko-game');
    if (gameEl && boardData.hasLuckyPeg) {
        gameEl.setAttribute('data-has-lucky', 'true');
    }
    
    // Start render loop
    startRenderLoop();
    
    // Bind events
    bindEvents(onClose);
    
    // Show debug panel if enabled
    if (window.debugMode) {
        document.getElementById('plinko-debug').style.display = 'block';
    }
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
    
    // Debug: Force drop to specific multiplier slot
    document.querySelectorAll('#plinko-debug .debug-btn[data-mult]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetMult = parseFloat(btn.dataset.mult);
            handleDebugDrop(targetMult);
        });
    });
}

/**
 * Debug drop that lands on a specific multiplier
 * @param {number} targetMult - Target multiplier to land on
 */
async function handleDebugDrop(targetMult) {
    if (isDropping) return;
    
    isDropping = true;
    updateButtonStates();
    document.getElementById('plinko-result').classList.remove('show');
    
    // Reset visual states
    pegFlashes.clear();
    slotGlows.clear();
    boardData.slots.forEach(slot => slot.lit = false);
    
    // Find slot with target multiplier
    const targetSlot = boardData.slots.find(s => s.multiplier === targetMult);
    if (!targetSlot) {
        console.warn('No slot with multiplier', targetMult);
        isDropping = false;
        return;
    }
    
    // Animate ball falling to target slot
    initAudio();
    playTick(600);
    
    // Create ball at slot position (skip physics, just animate down)
    const ball = { x: targetSlot.x, y: 15, radius: 8 };
    const targetY = CANVAS_HEIGHT - 100;
    const duration = 1500;
    const startTime = performance.now();
    
    const animateDebugBall = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        
        // Move ball down with slight wobble
        ball.y = 15 + (targetY - 15) * eased;
        ball.x = targetSlot.x + Math.sin(progress * 20) * (1 - progress) * 20;
        
        // Hit pegs for sound effects
        if (Math.random() < 0.15) {
            playTick(300 + progress * 400);
        }
        
        // Update display (redraw board with ball)
        if (ctx) {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawSlots(boardData.slots);
            drawPegs(boardData.pegs);
            
            // Draw ball
            const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(0.6, 'rgba(255, 107, 107, 0.5)');
            gradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b6b';
            ctx.fill();
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateDebugBall);
        } else {
            // Landing!
            const result = {
                slot: targetSlot,
                multiplier: targetMult,
                payout: 3 * targetMult
            };
            targetSlot.lit = true;
            handleLanding(targetSlot, result);
        }
    };
    
    animateDebugBall();
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
    anticipationLevel = 0;
    hitStreakAudio = 0;
    lastPegPitch = 300;
    
    // Init audio
    initAudio();
    
    // Drop sound - satisfying "plop"
    playDropSound();
    
    // Drop button feedback
    const dropBtn = document.querySelector('.drop-btn.center');
    if (dropBtn) {
        dropBtn.classList.add('pressed');
        setTimeout(() => dropBtn.classList.remove('pressed'), 150);
    }
    
    // Small screen shake on drop
    screenShake.intensity = 3;
    
    dropBall(dropX, CANVAS_HEIGHT, {
        onPegHit: (peg, data) => {
            // Flash the peg with intensity based on impact
            const pegIndex = boardData.pegs.indexOf(peg);
            pegFlashes.set(pegIndex, Math.min(1, 0.6 + data.impactStrength * 0.2));
            
            // Escalating pitch as ball descends
            const rowPitch = 300 + data.row * 50;
            // Add streak bonus for rapid hits
            const streakBonus = Math.min(data.hitStreak * 30, 200);
            // Slight random variation
            const variation = (Math.random() - 0.5) * 40;
            const pitch = rowPitch + streakBonus + variation;
            
            // Smoother pitch transition
            lastPegPitch = lastPegPitch * 0.3 + pitch * 0.7;
            playPegHitSound(lastPegPitch, data.impactStrength, data.isLucky);
            
            // Track audio streak for volume boost
            hitStreakAudio = data.hitStreak;
            
            // Screen shake on hard hits
            if (data.impactStrength > 3) {
                screenShake.intensity = Math.max(screenShake.intensity, data.impactStrength * 0.5);
            }
            
            // Lucky peg hit - BIG feedback!
            if (data.isLucky) {
                playWinSound('rare');
                screenFlash('#ffd700', 0.2);
                screenShake.intensity = 8;
                const particles = document.getElementById('plinko-particles');
                spawnParticles('#ffd700', 15, particles);
                showNotification('✨ LUCKY PEG! ✨', '#ffd700');
            }
            
            // Spawn mini particles on hits with streak
            if (data.hitStreak >= 3) {
                const particles = document.getElementById('plinko-particles');
                spawnParticles(COLORS.pegHit, Math.min(data.hitStreak, 5), particles);
            }
        },
        onSlotLand: async (slot, result) => {
            await handleLanding(slot, result);
        },
        onBallMove: (ball, data) => {
            // Update anticipation as ball approaches bottom
            anticipationLevel = Math.max(0, (data.progress - 0.6) * 2.5);
            
            // Near-miss glow handled in physics now, but we can add extra UI
            if (anticipationLevel > 0.5) {
                // Dramatic music-like effect could go here
            }
        },
        onNearMiss: (slot) => {
            // "So close!" effect
            playNearMiss();
            showNotification('SO CLOSE!', '#ff6b6b', 1500);
        }
    });
}

async function handleLanding(slot, result) {
    const mult = result.multiplier;
    const payout = result.payout;
    const rarity = getMultiplierRarity(mult);
    const particles = document.getElementById('plinko-particles');
    const gameEl = document.querySelector('.plinko-game');
    
    // Dramatic pause - longer for big wins
    const pauseDuration = mult >= 10 ? 400 : mult >= 5 ? 300 : 200;
    await sleep(pauseDuration);
    
    // ===== BUST (0x) =====
    if (mult === 0) {
        playLossSound();
        screenShake.intensity = 5;
        
        // Subtle gray flash
        screenFlash('#333333', 0.2);
        
        // Sad particle poof
        spawnParticles('#666666', 8, particles);
        
        // Crack effect on slot
        slot.cracked = true;
        
        showResult(mult, payout);
        await sleep(1200);
    }
    // ===== JACKPOT (10x) =====
    else if (mult === 10) {
        // MAXIMUM CELEBRATION
        playJackpotFanfare();
        
        // Massive screen shake
        screenShake.intensity = 20;
        
        // Golden flash
        screenFlash('#ffd700', 0.5);
        await sleep(100);
        screenFlash('#ffffff', 0.3);
        
        // Multiple firework bursts
        spawnFireworks('#ffd700', particles);
        await sleep(150);
        spawnFireworks('#ff6b6b', particles);
        await sleep(150);
        spawnFireworks('#c084fc', particles);
        
        // Add pulsing glow to game container
        gameEl?.classList.add('jackpot-win');
        
        showResult(mult, payout);
        
        // Extended celebration
        await sleep(500);
        spawnFireworks('#60a5fa', particles);
        
        // Apply winnings with dramatic reveal
        await sleep(800);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        // Hold the celebration
        await sleep(2000);
        gameEl?.classList.remove('jackpot-win');
    }
    // ===== BIG WIN (5x) =====
    else if (mult === 5) {
        playWinSound('epic');
        
        // Strong screen shake
        screenShake.intensity = 12;
        
        // Pink/magenta flash
        screenFlash(MULT_COLORS[mult], 0.35);
        
        // Fireworks
        spawnFireworks(MULT_COLORS[mult], particles);
        await sleep(200);
        spawnFireworks('#fbbf24', particles);
        
        gameEl?.classList.add('big-win');
        
        showResult(mult, payout);
        
        await sleep(600);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        await sleep(1500);
        gameEl?.classList.remove('big-win');
    }
    // ===== GOOD WIN (3x) =====
    else if (mult === 3) {
        playWinSound('rare');
        screenShake.intensity = 6;
        screenFlash(MULT_COLORS[mult], 0.2);
        spawnParticles(MULT_COLORS[mult], 25, particles);
        
        showResult(mult, payout);
        
        await sleep(500);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        await sleep(1200);
    }
    // ===== DECENT WIN (2x) =====
    else if (mult === 2) {
        playChime(500, 4, 'sine');
        screenShake.intensity = 4;
        spawnParticles(MULT_COLORS[mult], 18, particles);
        
        showResult(mult, payout);
        
        await sleep(400);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        await sleep(1000);
    }
    // ===== BREAK EVEN (1x) =====
    else if (mult === 1) {
        playChime(400, 2, 'triangle');
        spawnParticles(MULT_COLORS[mult], 10, particles);
        
        showResult(mult, payout);
        
        await sleep(300);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        await sleep(800);
    }
    // ===== SMALL RETURN (0.5x) =====
    else {
        playTick(350);
        spawnParticles(MULT_COLORS[mult], 5, particles);
        
        showResult(mult, payout);
        
        await sleep(300);
        currentKarma += payout;
        addFn(payout);
        updateKarmaLocal(currentKarma, payout);
        
        await sleep(800);
    }
    
    // Near miss notification
    if (result.isNearMiss) {
        await sleep(300);
        showNotification('Almost hit 10×!', '#ff6b6b', 2000);
    }
    
    isDropping = false;
    updateButtonStates();
}

function showResult(mult, payout) {
    const resultEl = document.getElementById('plinko-result');
    const rarity = getMultiplierRarity(mult);
    const color = MULT_COLORS[mult];
    const glow = MULT_GLOWS[mult];
    
    let message, emoji, extraClass = '';
    if (mult === 0) {
        message = 'BUST!';
        emoji = '💀';
        extraClass = 'bust';
    } else if (mult === 10) {
        message = 'JACKPOT!!!';
        emoji = '🎉🎉🎉';
        extraClass = 'jackpot';
    } else if (mult === 5) {
        message = 'BIG WIN!';
        emoji = '🌟🌟';
        extraClass = 'big-win';
    } else if (mult === 3) {
        message = 'Nice Win!';
        emoji = '✨';
    } else if (mult === 2) {
        message = 'Good!';
        emoji = '🎯';
    } else if (mult === 1) {
        message = 'Break Even';
        emoji = '👍';
    } else {
        message = 'Small Return';
        emoji = '😅';
    }
    
    resultEl.innerHTML = `
        <div class="result-content ${rarity} ${extraClass}" style="--mult-color: ${color}; --mult-glow: ${glow}">
            <div class="result-emoji">${emoji}</div>
            <div class="result-mult">${mult}×</div>
            <div class="result-message">${message}</div>
            <div class="result-payout ${payout > 0 ? 'positive' : 'negative'}">${payout > 0 ? `+${payout}☯` : '-3☯'}</div>
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

// Drop sound - satisfying "plop"
function playDropSound() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
}

// Enhanced peg hit sound with "thunk" feel
function playPegHitSound(pitch, impactStrength, isLucky = false) {
    try {
        const ctx = initAudio();
        
        // Main tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = pitch;
        osc.type = isLucky ? 'sine' : 'square';
        
        // Volume based on impact and streak
        const volume = Math.min(0.15 + impactStrength * 0.02 + hitStreakAudio * 0.01, 0.25);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
        
        // Add "thunk" undertone for meatier feel
        const thunk = ctx.createOscillator();
        const thunkGain = ctx.createGain();
        thunk.connect(thunkGain);
        thunkGain.connect(ctx.destination);
        thunk.frequency.setValueAtTime(pitch * 0.5, ctx.currentTime);
        thunk.frequency.exponentialRampToValueAtTime(pitch * 0.25, ctx.currentTime + 0.04);
        thunk.type = 'triangle';
        thunkGain.gain.setValueAtTime(0.08, ctx.currentTime);
        thunkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        thunk.start(ctx.currentTime);
        thunk.stop(ctx.currentTime + 0.04);
        
        // Lucky peg gets a sparkle
        if (isLucky) {
            setTimeout(() => {
                const sparkle = ctx.createOscillator();
                const sparkleGain = ctx.createGain();
                sparkle.connect(sparkleGain);
                sparkleGain.connect(ctx.destination);
                sparkle.frequency.value = pitch * 2;
                sparkle.type = 'sine';
                sparkleGain.gain.setValueAtTime(0.1, ctx.currentTime);
                sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                sparkle.start(ctx.currentTime);
                sparkle.stop(ctx.currentTime + 0.2);
            }, 50);
        }
    } catch (e) { }
}

// Jackpot fanfare - escalating triumphant tones
function playJackpotFanfare() {
    try {
        const ctx = initAudio();
        const notes = [400, 500, 600, 800, 1000, 1200, 1400];
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
                
                // Harmony note
                const harm = ctx.createOscillator();
                const harmGain = ctx.createGain();
                harm.connect(harmGain);
                harmGain.connect(ctx.destination);
                harm.frequency.value = freq * 1.25; // Major third
                harm.type = 'sine';
                harmGain.gain.setValueAtTime(0.08, ctx.currentTime);
                harmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                harm.start(ctx.currentTime);
                harm.stop(ctx.currentTime + 0.3);
            }, i * 80);
        });
    } catch (e) { }
}

// Notification system
let notifications = [];

function showNotification(text, color = '#fff', duration = 2000) {
    const container = document.getElementById('plinko-particles');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = 'plinko-notification';
    notif.textContent = text;
    notif.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        animation: notificationPop 0.3s ease-out forwards, notificationFade ${duration}ms ease-in forwards;
        pointer-events: none;
        z-index: 100;
    `;
    container.appendChild(notif);
    setTimeout(() => notif.remove(), duration);
}

function startRenderLoop() {
    function render() {
        if (!canvas || !ctx) return;
        
        const state = getPlinkoState();
        const now = Date.now();
        
        // Update animation phases
        backgroundPhase += 0.01;
        dropPreviewPhase += 0.05;
        
        // Apply screen shake
        if (screenShake.intensity > 0.1) {
            screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
            screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
            screenShake.intensity *= 0.9;
        } else {
            screenShake.x = 0;
            screenShake.y = 0;
        }
        
        ctx.save();
        ctx.translate(screenShake.x, screenShake.y);
        
        // Animated background
        drawBackground(state);
        
        // Anticipation overlay (builds as ball approaches bottom)
        if (anticipationLevel > 0 && state.running) {
            drawAnticipationOverlay();
        }
        
        // Draw slots first (background layer)
        drawSlots(state.slots);
        
        // Draw pegs
        drawPegs(state.pegs);
        
        // Draw ball trail
        if (state.ballTrail && state.ballTrail.length > 1) {
            drawBallTrail(state.ballTrail, state.ball);
        }
        
        // Draw ball
        if (state.ball) {
            drawBall(state.ball, state.slowMo);
        }
        
        // Draw drop preview when not dropping
        if (!isDropping) {
            drawDropPreview();
        }
        
        ctx.restore();
        
        // Decay effects
        decayEffects();
        
        animationId = requestAnimationFrame(render);
    }
    
    render();
}

// Animated background with subtle movement
function drawBackground(state) {
    // Base gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, COLORS.bgGradientTop);
    bgGrad.addColorStop(1, COLORS.bgGradientBot);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
    
    // Subtle animated pattern
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5; i++) {
        const y = ((backgroundPhase * 50 + i * 120) % (CANVAS_HEIGHT + 100)) - 50;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }
    ctx.globalAlpha = 1;
    
    // Slow-mo vignette effect
    if (state.slowMo) {
        const vignetteGrad = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.8
        );
        vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}

// Anticipation overlay as ball approaches bottom
function drawAnticipationOverlay() {
    const intensity = anticipationLevel * 0.15;
    const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
    
    // Golden anticipation glow from bottom
    const grad = ctx.createLinearGradient(0, CANVAS_HEIGHT, 0, CANVAS_HEIGHT - 200);
    grad.addColorStop(0, `rgba(255, 215, 0, ${intensity * pulse})`);
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, CANVAS_HEIGHT - 200, CANVAS_WIDTH, 200);
}

// Ball trail effect
function drawBallTrail(trail, ball) {
    if (!ball || trail.length < 2) return;
    
    const now = Date.now();
    
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < trail.length - 1; i++) {
        const point = trail[i];
        const age = now - point.time;
        const alpha = Math.max(0, 1 - age / 200) * 0.4;
        const size = ball.radius * (1 - age / 300) * 0.8;
        
        if (size > 0 && alpha > 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// Enhanced drop preview
function drawDropPreview() {
    const positions = getDropPositions(CANVAS_WIDTH);
    const centerX = positions.center;
    const spread = positions.right - positions.center;
    
    // Animated preview ball
    const pulse = Math.sin(dropPreviewPhase) * 0.1 + 0.9;
    const bob = Math.sin(dropPreviewPhase * 0.7) * 3;
    
    // Drop zone indicator
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(centerX - spread - 10, 5, spread * 2 + 20, 30);
    ctx.restore();
    
    // Animated arrow pointing down
    ctx.save();
    ctx.globalAlpha = 0.4 + pulse * 0.3;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼', centerX, 50 + bob);
    ctx.restore();
    
    // "Click to drop" hint
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK TO DROP', centerX, 20);
    ctx.restore();
}

function drawPegs(pegs) {
    pegs.forEach((peg, index) => {
        const flashIntensity = pegFlashes.get(index) || 0;
        const scale = peg.pulseScale || 1;
        const glowIntensity = peg.glowIntensity || 0;
        const isLucky = peg.isLucky;
        
        const radius = peg.radius * scale;
        
        // Lucky peg special rendering
        if (isLucky) {
            // Animated golden glow
            const luckyPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 * luckyPulse;
            
            // Outer glow ring
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.2 * luckyPulse})`;
            ctx.fill();
            
            // Core
            const luckyGrad = ctx.createRadialGradient(
                peg.x - 2, peg.y - 2, 0,
                peg.x, peg.y, radius
            );
            luckyGrad.addColorStop(0, '#fff8dc');
            luckyGrad.addColorStop(0.5, '#ffd700');
            luckyGrad.addColorStop(1, '#daa520');
            
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = luckyGrad;
            ctx.fill();
            
            // Sparkle effect
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(peg.x - radius * 0.3, peg.y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            return;
        }
        
        // Regular peg with hit effects
        if (flashIntensity > 0 || glowIntensity > 0) {
            const intensity = Math.max(flashIntensity, glowIntensity);
            
            // Outer glow
            ctx.save();
            ctx.shadowColor = COLORS.pegHit;
            ctx.shadowBlur = 10 * intensity;
            
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, radius * (1 + intensity * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 191, 36, ${intensity * 0.4})`;
            ctx.fill();
            ctx.restore();
            
            // Hit peg - gradient from white to gold
            const hitGrad = ctx.createRadialGradient(
                peg.x - 2, peg.y - 2, 0,
                peg.x, peg.y, radius
            );
            hitGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            hitGrad.addColorStop(0.4, COLORS.pegHit);
            hitGrad.addColorStop(1, '#b8860b');
            
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = hitGrad;
            ctx.fill();
        } else {
            // Normal peg with subtle 3D gradient
            const pegGrad = ctx.createRadialGradient(
                peg.x - 2, peg.y - 2, 0,
                peg.x, peg.y, radius
            );
            pegGrad.addColorStop(0, '#7a7a9a');
            pegGrad.addColorStop(0.7, COLORS.peg);
            pegGrad.addColorStop(1, '#3a3a5a');
            
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = pegGrad;
            ctx.fill();
            
            // Tiny highlight
            ctx.beginPath();
            ctx.arc(peg.x - radius * 0.25, peg.y - radius * 0.25, radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
        }
    });
}

function drawSlots(slots) {
    slots.forEach((slot, index) => {
        const physicsGlow = slot.glowIntensity || 0;
        const uiGlow = slotGlows.get(index) || 0;
        const glow = Math.max(physicsGlow, uiGlow);
        const mult = slot.multiplier;
        const color = MULT_COLORS[mult];
        const glowColor = MULT_GLOWS[mult];
        const isJackpot = slot.isJackpot;
        const isBust = slot.isBust;
        
        // Jackpot slots get special animated glow
        if (isJackpot && !slot.lit) {
            const jackpotPulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10 * jackpotPulse;
            
            // Animated border
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 * jackpotPulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                slot.x - slot.width / 2 - 2,
                slot.y - 2,
                slot.width + 4,
                slot.height + 4
            );
            ctx.restore();
        }
        
        // Near-miss glow effect
        if (glow > 0 && !slot.lit) {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 15 * glow;
            
            ctx.fillStyle = glowColor;
            ctx.fillRect(
                slot.x - slot.width / 2 - 5,
                slot.y - 5,
                slot.width + 10,
                slot.height + 10
            );
            ctx.restore();
        }
        
        // Slot background with gradient
        const slotGrad = ctx.createLinearGradient(0, slot.y, 0, slot.y + slot.height);
        if (slot.lit) {
            slotGrad.addColorStop(0, lightenColor(color, 20));
            slotGrad.addColorStop(0.5, color);
            slotGrad.addColorStop(1, darkenColor(color, 20));
        } else {
            slotGrad.addColorStop(0, '#3a3a5a');
            slotGrad.addColorStop(0.5, '#2a2a4a');
            slotGrad.addColorStop(1, '#1a1a3a');
        }
        
        ctx.fillStyle = slotGrad;
        ctx.fillRect(
            slot.x - slot.width / 2,
            slot.y,
            slot.width,
            slot.height
        );
        
        // Lit slot extra glow
        if (slot.lit) {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.fillRect(
                slot.x - slot.width / 2,
                slot.y,
                slot.width,
                slot.height
            );
            ctx.restore();
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
        
        // Multiplier text with shadow
        ctx.save();
        if (slot.lit) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillStyle = isBust ? '#ffffff' : '#000000';
        } else {
            ctx.fillStyle = color;
            // Jackpot slots get glowing text
            if (isJackpot) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 5;
            }
        }
        ctx.font = `bold ${slot.lit ? 16 : 14}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mult}×`, slot.x, slot.y + slot.height / 2);
        ctx.restore();
        
        // Bust slot X mark
        if (isBust && !slot.lit) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(slot.x - 8, slot.y + 8);
            ctx.lineTo(slot.x + 8, slot.y + slot.height - 8);
            ctx.moveTo(slot.x + 8, slot.y + 8);
            ctx.lineTo(slot.x - 8, slot.y + slot.height - 8);
            ctx.stroke();
            ctx.restore();
        }
    });
}

// Color utility functions
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
}

function drawBall(ball, isSlowMo = false) {
    const spin = ball.spin || 0;
    const stretch = ball.stretch || 1;
    
    ctx.save();
    ctx.translate(ball.x, ball.y);
    
    // Apply stretch based on velocity direction
    const vx = ball.vx || 0;
    const vy = ball.vy || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = Math.atan2(vy, vx);
    
    // Rotate to velocity direction, apply stretch, rotate back
    ctx.rotate(angle);
    ctx.scale(stretch, 1 / stretch);
    ctx.rotate(-angle);
    
    // Slow-mo gets extra glow
    if (isSlowMo) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
    }
    
    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, ball.radius * 2.5);
    glowGrad.addColorStop(0, COLORS.ballGlow);
    glowGrad.addColorStop(0.5, 'rgba(255, 107, 107, 0.2)');
    glowGrad.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();
    
    // Ball core with gradient
    const coreGrad = ctx.createRadialGradient(
        -ball.radius * 0.3, -ball.radius * 0.3, 0,
        0, 0, ball.radius
    );
    coreGrad.addColorStop(0, COLORS.ballCore);
    coreGrad.addColorStop(0.6, COLORS.ball);
    coreGrad.addColorStop(1, '#cc4444');
    
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();
    
    // Spin indicator - a subtle line that rotates
    ctx.save();
    ctx.rotate(spin);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-ball.radius * 0.5, 0);
    ctx.lineTo(ball.radius * 0.5, 0);
    ctx.stroke();
    ctx.restore();
    
    // Main shine highlight
    ctx.beginPath();
    ctx.arc(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
    
    // Secondary smaller shine
    ctx.beginPath();
    ctx.arc(ball.radius * 0.2, ball.radius * 0.3, ball.radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    
    // Rim highlight
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,200,200,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

function decayEffects() {
    // Decay peg flashes
    pegFlashes.forEach((value, key) => {
        const newValue = value - 0.06;
        if (newValue <= 0) {
            pegFlashes.delete(key);
        } else {
            pegFlashes.set(key, newValue);
        }
    });
    
    // Decay slot glows (UI layer)
    slotGlows.forEach((value, key) => {
        const newValue = value - 0.03;
        if (newValue <= 0) {
            slotGlows.delete(key);
        } else {
            slotGlows.set(key, newValue);
        }
    });
    
    // Decay anticipation
    if (!getPlinkoState().running) {
        anticipationLevel *= 0.95;
    }
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
