/**
 * @fileoverview Claw Machine UI - Canvas rendering with juice
 * Side-view claw machine aesthetic
 * @module games/clawUI
 */

import {
    initClawMachine,
    startClawGame,
    moveClaw,
    dropClaw,
    updateClaw,
    resetClaw,
    stopClawGame,
    getClawState,
    getClawCost
} from './claw.js';

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

import { RARITIES, applyReward } from '../gacha.js';

let clawContainer = null;
let canvas = null;
let ctx = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let onCloseFn = null;
let animationId = null;
let lastTime = 0;

// Key state for smooth movement
let keysHeld = { left: false, right: false };

// Visual effects state
let glowPulse = 0;
let machineHum = 0;

const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 500;

// Colors
const COLORS = {
    machineFrame: '#2a2a4a',
    machineInner: '#1a1a2e',
    glass: 'rgba(100, 150, 255, 0.08)',
    glassEdge: 'rgba(255, 255, 255, 0.15)',
    clawArm: '#888',
    clawClaw: '#aaa',
    clawRope: '#666',
    track: '#444',
    chute: '#333',
    chuteGlow: 'rgba(74, 222, 128, 0.3)'
};

// Prize emoji mapping for visual variety
const PRIZE_EMOJIS = {
    common: ['🎁', '⭐', '🌟', '✨'],
    uncommon: ['💎', '🎲', '🥈', '❤️'],
    rare: ['💠', '🌟', '📚', '🥇'],
    epic: ['🔮', '🎰', '⚡', '👑'],
    legendary: ['🌌', '🎫', '🌠', '🗿']
};

export function showClawGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hideClawGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    onCloseFn = onClose;
    
    clawContainer = document.createElement('div');
    clawContainer.className = 'claw-overlay';
    clawContainer.innerHTML = `
        <div class="claw-game">
            <div class="claw-header">
                <h2 class="claw-title">🎮 KARMA CLAW 🎮</h2>
                <div class="claw-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="claw-karma">${karma}</span>
                    <span class="karma-delta" id="claw-delta"></span>
                </div>
            </div>
            
            <div class="claw-machine-container">
                <canvas id="claw-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
                
                <div class="claw-timer" id="claw-timer">
                    <div class="timer-bar" id="timer-bar"></div>
                    <span class="timer-text" id="timer-text">10.0s</span>
                </div>
                
                <div class="claw-chute-label">
                    <span>DROP ZONE</span>
                </div>
            </div>
            
            <div class="claw-result" id="claw-result"></div>
            
            <div class="claw-controls">
                <button class="claw-control-btn" id="claw-left">◀ LEFT</button>
                <button class="claw-control-btn drop" id="claw-drop">▼ DROP</button>
                <button class="claw-control-btn" id="claw-right">RIGHT ▶</button>
            </div>
            
            <div class="claw-info">
                <div class="info-item">Cost: <span class="cost-value">${getClawCost()}☯</span></div>
                <div class="info-item">Use ← → keys or buttons</div>
            </div>
            
            <div class="claw-footer">
                <button class="claw-btn" id="claw-play">🎮 Play (${getClawCost()}☯)</button>
                <button class="claw-btn secondary" id="claw-close">Back to Hub</button>
            </div>
            
            <div class="claw-debug" id="claw-debug" style="display: none;">
                <div class="debug-title">🔧 Debug</div>
                <div class="debug-row">
                    <button class="debug-btn" data-rarity="common">Grab Common</button>
                    <button class="debug-btn" data-rarity="rare">Grab Rare</button>
                    <button class="debug-btn" data-rarity="legendary">Grab Legendary</button>
                </div>
                <div class="debug-row">
                    <button class="debug-btn" id="debug-show-prizes">Show Prizes</button>
                    <button class="debug-btn" id="debug-100-grip">100% Grip</button>
                </div>
            </div>
        </div>
        <div class="particle-container" id="claw-particles"></div>
    `;
    
    document.body.appendChild(clawContainer);
    
    // Setup canvas
    canvas = document.getElementById('claw-canvas');
    ctx = canvas.getContext('2d');
    
    // Initialize machine
    initClawMachine(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Start render loop
    startRenderLoop();
    
    // Bind events
    bindEvents();
    
    // Show debug panel if enabled
    if (window.debugMode) {
        document.getElementById('claw-debug').style.display = 'block';
    }
    updateButtonStates();
}

function bindEvents() {
    // Control buttons
    document.getElementById('claw-left').addEventListener('mousedown', () => {
        keysHeld.left = true;
    });
    document.getElementById('claw-left').addEventListener('mouseup', () => {
        keysHeld.left = false;
    });
    document.getElementById('claw-left').addEventListener('mouseleave', () => {
        keysHeld.left = false;
    });
    
    document.getElementById('claw-right').addEventListener('mousedown', () => {
        keysHeld.right = true;
    });
    document.getElementById('claw-right').addEventListener('mouseup', () => {
        keysHeld.right = false;
    });
    document.getElementById('claw-right').addEventListener('mouseleave', () => {
        keysHeld.right = false;
    });
    
    document.getElementById('claw-drop').addEventListener('click', handleDrop);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Play button
    document.getElementById('claw-play').addEventListener('click', startGame);
    
    // Close button
    document.getElementById('claw-close').addEventListener('click', () => {
        hideClawGame();
        if (onCloseFn) onCloseFn();
    });
    
    // Debug bindings
    document.querySelectorAll('#claw-debug .debug-btn[data-rarity]').forEach(btn => {
        btn.addEventListener('click', () => {
            handleDebugGrab(btn.dataset.rarity);
        });
    });
    
    document.getElementById('debug-show-prizes')?.addEventListener('click', () => {
        // Show prize locations with labels
        const state = getClawState();
        console.table(state.prizes.map(p => ({
            x: Math.round(p.x),
            y: Math.round(p.y),
            rarity: p.rarity,
            name: p.reward.name
        })));
        alert(`${state.prizes.length} prizes logged to console`);
    });
    
    document.getElementById('debug-100-grip')?.addEventListener('click', () => {
        window._clawDebug100Grip = !window._clawDebug100Grip;
        const btn = document.getElementById('debug-100-grip');
        if (btn) btn.textContent = window._clawDebug100Grip ? '100% Grip ✓' : '100% Grip';
    });
}

/**
 * Debug: Instantly grab a prize of specific rarity
 * @param {string} rarity - Target rarity
 */
async function handleDebugGrab(rarity) {
    const state = getClawState();
    if (state.phase !== 'idle' && state.phase !== 'result') return;
    
    // Find prize of target rarity
    const targetPrize = state.prizes.find(p => p.rarity === rarity);
    if (!targetPrize) {
        alert(`No ${rarity} prize in machine!`);
        return;
    }
    
    // Start game and immediately win with that prize
    resetClaw(CANVAS_WIDTH);
    
    // Simulate win
    playWinSound(rarity);
    shakeScreen(document.querySelector('.claw-game'));
    screenFlash(RARITY_COLORS[rarity]?.color || '#fff', 0.3);
    
    const particles = document.getElementById('claw-particles');
    if (rarity === 'legendary' || rarity === 'epic') {
        spawnFireworks(RARITY_COLORS[rarity].color, particles);
    } else {
        spawnParticles(RARITY_COLORS[rarity].color, 25, particles);
    }
    
    // Apply reward
    applyReward(targetPrize.reward, (amount) => {
        currentKarma += amount;
        addFn(amount);
    });
    
    showResult(true, targetPrize.reward, rarity);
    
    // Remove prize from machine
    const idx = state.prizes.indexOf(targetPrize);
    if (idx > -1) state.prizes.splice(idx, 1);
    
    await sleep(500);
    updateKarmaLocal(currentKarma, targetPrize.reward.type === 'karma' ? targetPrize.reward.value : 0);
    updateButtonStates();
}

function handleKeyDown(e) {
    const state = getClawState();
    if (state.phase !== 'positioning') return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keysHeld.left = true;
        e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        keysHeld.right = true;
        e.preventDefault();
    } else if (e.key === ' ' || e.key === 'ArrowDown') {
        handleDrop();
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keysHeld.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        keysHeld.right = false;
    }
}

function handleDrop() {
    const state = getClawState();
    if (state.phase !== 'positioning') return;
    
    initAudio();
    playClawMotor(800, 200);
    dropClaw(CANVAS_HEIGHT);
}

async function startGame() {
    const state = getClawState();
    if (state.phase !== 'idle' && state.phase !== 'result') return;
    if (currentKarma < getClawCost()) return;
    
    // Spend karma
    currentKarma -= getClawCost();
    spendFn(getClawCost());
    updateKarmaLocal(currentKarma, -getClawCost());
    
    // Hide result
    document.getElementById('claw-result').classList.remove('show');
    
    // Reset claw position
    resetClaw(CANVAS_WIDTH);
    
    // Init audio
    initAudio();
    playTick(300);
    
    // Start game with callbacks
    startClawGame({
        onDrop: () => {
            playClawMotor(400, 300);
        },
        onGrab: (prize, success) => {
            if (success) {
                playTick(600);
                playClawGrab();
            } else {
                playTick(200);
            }
        },
        onSlip: (prize) => {
            playSlipSound();
            shakeScreen(document.querySelector('.claw-game'));
        },
        onCatch: (prize) => {
            playTick(800);
        },
        onWin: async (reward, rarity) => {
            await handleWin(reward, rarity);
        },
        onLose: async () => {
            await handleLose();
        }
    });
    
    updateButtonStates();
}

async function handleWin(reward, rarity) {
    const rarityData = RARITIES[rarity];
    const color = rarityData.color;
    
    // Celebration!
    playWinSound(rarity);
    shakeScreen(document.querySelector('.claw-game'));
    screenFlash(color, 0.3);
    
    const particles = document.getElementById('claw-particles');
    if (rarity === 'legendary' || rarity === 'epic') {
        spawnFireworks(color, particles);
    } else {
        spawnParticles(color, 25, particles);
    }
    
    // Apply reward
    const effectMsg = applyReward(reward, (amount) => {
        currentKarma += amount;
        addFn(amount);
    });
    
    // Show result
    showResult(true, reward, rarity);
    
    await sleep(500);
    updateKarmaLocal(currentKarma, reward.type === 'karma' ? reward.value : 0);
    
    updateButtonStates();
}

async function handleLose() {
    playNearMiss();
    
    showResult(false, null, null);
    
    await sleep(1000);
    updateButtonStates();
}

function showResult(success, reward, rarity) {
    const resultEl = document.getElementById('claw-result');
    
    if (success) {
        const color = RARITIES[rarity].color;
        resultEl.innerHTML = `
            <div class="result-content win ${rarity}" style="--rarity-color: ${color}">
                <div class="result-emoji">${reward.icon}</div>
                <div class="result-rarity">${RARITIES[rarity].name}</div>
                <div class="result-name">${reward.name}</div>
                <div class="result-desc">${reward.description}</div>
            </div>
        `;
    } else {
        resultEl.innerHTML = `
            <div class="result-content lose">
                <div class="result-emoji">😅</div>
                <div class="result-name">Nothing this time...</div>
                <div class="result-desc">The claw is weak today</div>
            </div>
        `;
    }
    
    resultEl.classList.add('show');
}

// Audio effects
function playClawMotor(startFreq, endFreq) {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + 0.5);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

function playClawGrab() {
    try {
        const ctx = initAudio();
        // Clunk sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 100;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
}

function playSlipSound() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
}

// Render loop
function startRenderLoop() {
    lastTime = performance.now();
    
    function render(time) {
        if (!canvas || !ctx) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        // Process held keys
        const state = getClawState();
        if (state.phase === 'positioning') {
            if (keysHeld.left) moveClaw('left', CANVAS_WIDTH);
            if (keysHeld.right) moveClaw('right', CANVAS_WIDTH);
        }
        
        // Update game state
        updateClaw(deltaTime, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Update visual effects
        glowPulse += deltaTime * 0.003;
        machineHum = Math.sin(glowPulse) * 0.5 + 0.5;
        
        // Clear
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw machine
        drawMachine();
        drawPrizes();
        drawClaw();
        drawGlass();
        drawChute();
        
        // Update timer UI
        updateTimerUI();
        
        animationId = requestAnimationFrame(render);
    }
    
    render(performance.now());
}

function drawMachine() {
    // Machine frame
    ctx.fillStyle = COLORS.machineFrame;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 50); // Top bar
    ctx.fillRect(0, 0, 20, CANVAS_HEIGHT); // Left wall
    ctx.fillRect(CANVAS_WIDTH - 20, 0, 20, CANVAS_HEIGHT); // Right wall
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50); // Bottom
    
    // Inner background
    ctx.fillStyle = COLORS.machineInner;
    ctx.fillRect(20, 50, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 100);
    
    // Track at top
    ctx.fillStyle = COLORS.track;
    ctx.fillRect(30, 45, CANVAS_WIDTH - 60, 8);
    
    // Prize pit floor gradient
    const floorGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 120, 0, CANVAS_HEIGHT - 50);
    floorGrad.addColorStop(0, '#252540');
    floorGrad.addColorStop(1, '#1a1a30');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(20, CANVAS_HEIGHT - 120, CANVAS_WIDTH - 40, 70);
}

function drawPrizes() {
    const state = getClawState();
    
    for (const prize of state.prizes) {
        if (prize.grabbed && state.grabbedPrize === prize) continue; // Draw grabbed prize with claw
        
        const color = RARITY_COLORS[prize.rarity].color;
        const glow = RARITY_COLORS[prize.rarity].glow;
        const size = prize.size;
        
        // Calculate bounce scale for visual feedback
        const bounceScale = prize.bouncing ? 1.15 : 1;
        const velocityScale = Math.min(1.2, 1 + (Math.abs(prize.vx || 0) + Math.abs(prize.vy || 0)) * 0.01);
        const finalScale = bounceScale * velocityScale;
        
        ctx.save();
        ctx.translate(prize.x, prize.y);
        ctx.rotate(prize.rotation);
        ctx.scale(finalScale, finalScale);
        
        // Glow effect (pulsing) - enhanced when bouncing
        if (prize.rarity === 'legendary' || prize.rarity === 'epic' || prize.bouncing) {
            const baseGlow = prize.bouncing ? 1.5 : 1.3;
            const pulseSize = size * (baseGlow + Math.sin(glowPulse * 2 + prize.id) * 0.1);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
            gradient.addColorStop(0, prize.bouncing ? 'rgba(255, 255, 255, 0.4)' : glow);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Prize background circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Border - brighter when bouncing
        ctx.strokeStyle = prize.bouncing ? '#fff' : '#ddd';
        ctx.lineWidth = prize.bouncing ? 3 : 2;
        ctx.stroke();
        
        // Emoji
        ctx.restore();
        ctx.save();
        ctx.translate(prize.x, prize.y);
        ctx.scale(finalScale, finalScale);
        
        const emojis = PRIZE_EMOJIS[prize.rarity];
        const emoji = emojis[prize.id % emojis.length];
        ctx.font = `${size * 0.7}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 0);
        
        // Buried overlay
        if (prize.buried) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function drawClaw() {
    const state = getClawState();
    const claw = state.claw;
    
    ctx.save();
    ctx.translate(claw.x, 0);
    
    // Rope/cable
    ctx.strokeStyle = COLORS.clawRope;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(Math.sin(claw.swayAngle) * 5, claw.y - 20);
    ctx.stroke();
    
    // Translate to claw position with sway
    ctx.translate(Math.sin(claw.swayAngle) * 10, claw.y);
    ctx.rotate(claw.swayAngle * 0.3);
    
    // Claw motor box
    ctx.fillStyle = COLORS.clawArm;
    ctx.fillRect(-15, -25, 30, 20);
    
    // Claw arms
    const openAngle = claw.open ? 0.5 : 0.1;
    
    ctx.strokeStyle = COLORS.clawClaw;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    const leftTipX = -8 - Math.sin(openAngle) * 25;
    const leftTipY = Math.cos(openAngle) * 30;
    ctx.lineTo(leftTipX, leftTipY);
    ctx.stroke();
    
    // Left claw tip
    ctx.beginPath();
    ctx.moveTo(leftTipX, leftTipY);
    ctx.lineTo(leftTipX + 5, leftTipY + 8);
    ctx.stroke();
    
    // Right arm
    ctx.beginPath();
    ctx.moveTo(8, 0);
    const rightTipX = 8 + Math.sin(openAngle) * 25;
    const rightTipY = Math.cos(openAngle) * 30;
    ctx.lineTo(rightTipX, rightTipY);
    ctx.stroke();
    
    // Right claw tip
    ctx.beginPath();
    ctx.moveTo(rightTipX, rightTipY);
    ctx.lineTo(rightTipX - 5, rightTipY + 8);
    ctx.stroke();
    
    // Center arm
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 28);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(-4, 36);
    ctx.moveTo(0, 28);
    ctx.lineTo(4, 36);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw grabbed prize attached to claw
    if (state.grabbedPrize) {
        drawGrabbedPrize(state.grabbedPrize, claw);
    }
}

function drawGrabbedPrize(prize, claw) {
    const color = RARITY_COLORS[prize.rarity].color;
    const size = prize.size;
    
    ctx.save();
    ctx.translate(prize.x + prize.wobble, prize.y);
    
    // Slipping effect
    if (prize.slipping) {
        ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
    }
    
    // Glow
    if (prize.rarity === 'legendary' || prize.rarity === 'epic') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
        gradient.addColorStop(0, RARITY_COLORS[prize.rarity].glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Prize
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Emoji
    const emojis = PRIZE_EMOJIS[prize.rarity];
    const emoji = emojis[prize.id % emojis.length];
    ctx.font = `${size * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);
    
    ctx.restore();
}

function drawGlass() {
    // Glass overlay effect
    const gradient = ctx.createLinearGradient(20, 50, CANVAS_WIDTH - 20, 50);
    gradient.addColorStop(0, COLORS.glassEdge);
    gradient.addColorStop(0.1, 'transparent');
    gradient.addColorStop(0.9, 'transparent');
    gradient.addColorStop(1, COLORS.glassEdge);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(20, 50, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 100);
    
    // Glass shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 60);
    ctx.lineTo(30, CANVAS_HEIGHT - 60);
    ctx.stroke();
}

function drawChute() {
    // Drop chute on left
    const chuteX = 20;
    const chuteWidth = 50;
    const chuteTop = 50;
    const chuteBottom = CANVAS_HEIGHT - 50;
    
    // Chute background
    ctx.fillStyle = COLORS.chute;
    ctx.fillRect(chuteX, chuteTop, chuteWidth, chuteBottom - chuteTop);
    
    // Glow when claw is near
    const state = getClawState();
    if (state.phase === 'returning' || state.grabbedPrize) {
        const glowIntensity = state.phase === 'returning' ? 0.5 : 0.3;
        ctx.fillStyle = `rgba(74, 222, 128, ${glowIntensity * (0.5 + machineHum * 0.5)})`;
        ctx.fillRect(chuteX, chuteTop, chuteWidth, chuteBottom - chuteTop);
    }
    
    // Label
    ctx.save();
    ctx.translate(chuteX + chuteWidth / 2, chuteTop + 100);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WIN', 0, 0);
    ctx.restore();
}

function updateTimerUI() {
    const state = getClawState();
    const timerEl = document.getElementById('claw-timer');
    const barEl = document.getElementById('timer-bar');
    const textEl = document.getElementById('timer-text');
    
    if (state.phase === 'positioning') {
        timerEl.classList.add('active');
        const remaining = state.timeRemaining;
        const percent = (remaining / 10000) * 100;
        barEl.style.width = `${percent}%`;
        textEl.textContent = `${(remaining / 1000).toFixed(1)}s`;
        
        // Urgency colors
        if (remaining < 3000) {
            barEl.classList.add('urgent');
        } else {
            barEl.classList.remove('urgent');
        }
    } else {
        timerEl.classList.remove('active');
    }
}

function updateKarmaLocal(newValue, delta = 0) {
    const display = document.getElementById('claw-karma');
    const deltaEl = document.getElementById('claw-delta');
    updateKarmaDisplay(display, deltaEl, newValue, delta);
}

function updateButtonStates() {
    const state = getClawState();
    const canPlay = currentKarma >= getClawCost() && (state.phase === 'idle' || state.phase === 'result');
    const isPositioning = state.phase === 'positioning';
    
    const playBtn = document.getElementById('claw-play');
    playBtn.disabled = !canPlay;
    playBtn.classList.toggle('disabled', !canPlay);
    
    const leftBtn = document.getElementById('claw-left');
    const rightBtn = document.getElementById('claw-right');
    const dropBtn = document.getElementById('claw-drop');
    
    leftBtn.disabled = !isPositioning;
    rightBtn.disabled = !isPositioning;
    dropBtn.disabled = !isPositioning;
    
    leftBtn.classList.toggle('active', isPositioning);
    rightBtn.classList.toggle('active', isPositioning);
    dropBtn.classList.toggle('active', isPositioning);
}

export function hideClawGame() {
    stopClawGame();
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    if (clawContainer) {
        clawContainer.remove();
        clawContainer = null;
    }
    
    canvas = null;
    ctx = null;
    keysHeld = { left: false, right: false };
}
