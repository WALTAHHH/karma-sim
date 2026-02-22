// Wheel of Fortune UI - MAXIMUM JUICE
// Tick-tick-tick is everything

import {
    WEDGES, SPIN_COST, 
    calculateWedgeAngles, getWedgeAngles, getWedgeAtRotation,
    WheelSpinner, recordSpin, getStats
} from './wheel.js';

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

let wheelContainer = null;
let spinner = null;
let currentKarma = 0;
let spendFn = null;
let addFn = null;
let isSpinning = false;

// Canvas for wheel rendering
let wheelCanvas = null;
let wheelCtx = null;
const WHEEL_RADIUS = 150;
const CENTER = WHEEL_RADIUS + 10;

// Audio context for precise tick timing
let audioCtx = null;

export function showWheelGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hideWheelGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    
    // Initialize spinner
    spinner = new WheelSpinner();
    
    wheelContainer = document.createElement('div');
    wheelContainer.className = 'wheel-overlay';
    wheelContainer.innerHTML = `
        <div class="wheel-machine">
            <div class="wheel-header">
                <h2 class="wheel-title">🎡 WHEEL OF FATE 🎡</h2>
                <div class="wheel-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="wheel-karma">${karma}</span>
                    <span class="karma-delta" id="wheel-karma-delta"></span>
                </div>
            </div>
            
            <div class="wheel-stage">
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel-pointer-shadow"></div>
                    <canvas id="wheel-canvas" width="${CENTER * 2}" height="${CENTER * 2}"></canvas>
                    <div class="wheel-center">
                        <div class="wheel-center-inner">☯</div>
                    </div>
                </div>
                
                <div class="wheel-result" id="wheel-result">
                    <div class="result-content"></div>
                </div>
            </div>
            
            <div class="wheel-controls">
                <button class="wheel-spin-btn" id="btn-spin">
                    <span class="spin-text">SPIN</span>
                    <span class="spin-cost">${SPIN_COST} ☯</span>
                </button>
            </div>
            
            <div class="wheel-stats" id="wheel-stats">
                <span class="stat">Spins: <span id="stat-spins">0</span></span>
                <span class="stat">Won: <span id="stat-won">0</span>☯</span>
                <span class="stat">🏆: <span id="stat-jackpots">0</span></span>
            </div>
            
            <div class="wheel-footer">
                <button class="wheel-btn-secondary" id="btn-wheel-close">Back to Hub</button>
            </div>
        </div>
        <div class="wheel-particles" id="wheel-particles"></div>
    `;
    
    document.body.appendChild(wheelContainer);
    
    // Setup canvas
    wheelCanvas = document.getElementById('wheel-canvas');
    wheelCtx = wheelCanvas.getContext('2d');
    
    // Draw initial wheel
    drawWheel(0);
    
    // Bind events
    bindEvents(onClose);
    updateButtonState();
    updateStats();
}

function bindEvents(onClose) {
    document.getElementById('btn-spin').addEventListener('click', handleSpin);
    
    // Click on wheel also spins
    wheelCanvas.addEventListener('click', handleSpin);
    
    document.getElementById('btn-wheel-close').addEventListener('click', () => {
        hideWheelGame();
        if (onClose) onClose();
    });
}

async function handleSpin() {
    if (isSpinning || currentKarma < SPIN_COST) return;
    
    isSpinning = true;
    updateButtonState();
    
    // Deduct karma immediately
    currentKarma -= SPIN_COST;
    spendFn(SPIN_COST);
    updateKarmaLocal(currentKarma, -SPIN_COST);
    
    // Clear any previous result
    const resultEl = document.getElementById('wheel-result');
    resultEl.classList.remove('show', 'bust', 'jackpot', 'win');
    
    // Initialize audio context on user gesture
    audioCtx = initAudio();
    
    // Setup spinner callbacks
    spinner.onTick = (velocity, wedge) => {
        // Tick pitch varies with speed - slower = lower pitch
        const pitch = 200 + Math.min(velocity * 20, 400);
        playWheelTick(pitch, velocity);
        
        // Visual feedback - brief highlight
        flashWedge(wedge);
    };
    
    spinner.onUpdate = (rotation, velocity) => {
        drawWheel(rotation);
        
        // Pointer wobble at slow speeds
        if (velocity < 3 && velocity > 0.5) {
            const wobble = Math.sin(Date.now() / 50) * (3 - velocity) * 2;
            const pointer = document.querySelector('.wheel-pointer');
            if (pointer) {
                pointer.style.transform = `translateX(-50%) rotate(${wobble}deg)`;
            }
        }
    };
    
    spinner.onStop = async (wedge) => {
        // Reset pointer
        const pointer = document.querySelector('.wheel-pointer');
        if (pointer) pointer.style.transform = 'translateX(-50%)';
        
        // Record and show result
        recordSpin(wedge);
        await showResult(wedge);
        
        isSpinning = false;
        updateButtonState();
        updateStats();
    };
    
    // Spin with random velocity (15-25 degrees per frame)
    const initialVelocity = 18 + Math.random() * 8;
    spinner.spin(initialVelocity);
    
    // Initial spin sound
    playSpinStart();
}

function playWheelTick(pitch, velocity) {
    try {
        const ctx = audioCtx || initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Lower velocity = longer, more dramatic ticks
        const duration = velocity < 2 ? 0.15 : velocity < 5 ? 0.08 : 0.04;
        const volume = velocity < 3 ? 0.2 : 0.12;
        
        osc.frequency.value = pitch;
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playSpinStart() {
    try {
        const ctx = audioCtx || initAudio();
        // Whoosh sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
}

function flashWedge(wedge) {
    // Re-draw wheel with highlighted wedge
    const canvas = wheelCanvas;
    if (!canvas) return;
    
    // This is handled in drawWheel via a flash state
    wedge._flash = true;
    setTimeout(() => { wedge._flash = false; }, 50);
}

function drawWheel(rotation) {
    const ctx = wheelCtx;
    const wedges = getWedgeAngles();
    
    ctx.clearRect(0, 0, CENTER * 2, CENTER * 2);
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw wedges
    wedges.forEach((wedge, i) => {
        const startRad = (wedge.startAngle - 90) * Math.PI / 180;
        const endRad = (wedge.endAngle - 90) * Math.PI / 180;
        
        // Wedge fill
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, WHEEL_RADIUS, startRad, endRad);
        ctx.closePath();
        
        // Color with potential flash
        let fillColor = wedge.color;
        if (wedge._flash) {
            fillColor = lightenColor(wedge.color, 40);
        }
        
        // Gradient for depth
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, WHEEL_RADIUS);
        gradient.addColorStop(0, lightenColor(fillColor, 20));
        gradient.addColorStop(0.7, fillColor);
        gradient.addColorStop(1, darkenColor(fillColor, 20));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Wedge border
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.save();
        const midAngle = (wedge.startAngle + wedge.endAngle) / 2 - 90;
        ctx.rotate(midAngle * Math.PI / 180);
        ctx.translate(WHEEL_RADIUS * 0.65, 0);
        ctx.rotate(Math.PI / 2);
        
        ctx.fillStyle = wedge.rarity === 'legendary' ? '#000' : '#fff';
        ctx.font = `bold ${wedge.size > 8 ? 16 : 14}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(wedge.label, 0, 0);
        ctx.shadowBlur = 0;
        
        ctx.restore();
    });
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
}

async function showResult(wedge) {
    const resultEl = document.getElementById('wheel-result');
    const contentEl = resultEl.querySelector('.result-content');
    const particleContainer = document.getElementById('wheel-particles');
    
    // Determine result type
    const isBust = wedge.type === 'bust';
    const isJackpot = wedge.type === 'jackpot';
    const isHighWin = wedge.value >= 8;
    
    // Result content
    if (isBust) {
        contentEl.innerHTML = `
            <div class="result-icon bust">💀</div>
            <div class="result-text bust">BUST!</div>
            <div class="result-value bust">Lost ${SPIN_COST}☯</div>
        `;
        resultEl.classList.add('bust');
        playNearMiss();
        shakeScreen(wheelContainer.querySelector('.wheel-machine'));
        
    } else if (isJackpot) {
        contentEl.innerHTML = `
            <div class="result-icon jackpot">💎</div>
            <div class="result-text jackpot">JACKPOT!</div>
            <div class="result-value jackpot">+${wedge.value}☯</div>
        `;
        resultEl.classList.add('jackpot');
        
        // MAXIMUM celebration
        screenFlash('#fbbf24', 0.4);
        shakeScreen(wheelContainer.querySelector('.wheel-machine'));
        spawnFireworks('#fbbf24', particleContainer);
        playWinSound('legendary');
        
        // Add karma
        await sleep(500);
        currentKarma += wedge.value;
        addFn(wedge.value);
        updateKarmaLocal(currentKarma, wedge.value);
        
    } else {
        const rarity = wedge.rarity || 'common';
        const rarityColor = RARITY_COLORS[rarity]?.color || wedge.color;
        
        contentEl.innerHTML = `
            <div class="result-icon win" style="color: ${rarityColor}">✨</div>
            <div class="result-text win">WIN!</div>
            <div class="result-value win" style="color: ${rarityColor}">+${wedge.value}☯</div>
        `;
        resultEl.classList.add('win');
        
        // Celebration based on rarity
        if (isHighWin) {
            screenFlash(rarityColor, 0.2);
            spawnParticles(rarityColor, 25, particleContainer);
            playWinSound(rarity);
        } else {
            spawnParticles(rarityColor, 10, particleContainer);
            playChime(400, 2);
        }
        
        // Add karma
        await sleep(300);
        currentKarma += wedge.value;
        addFn(wedge.value);
        updateKarmaLocal(currentKarma, wedge.value);
    }
    
    resultEl.classList.add('show');
    
    // Auto-hide after delay
    await sleep(isBust ? 2000 : isJackpot ? 3500 : 2500);
    resultEl.classList.remove('show', 'bust', 'jackpot', 'win');
}

function updateKarmaLocal(newValue, delta = 0) {
    const display = document.getElementById('wheel-karma');
    const deltaEl = document.getElementById('wheel-karma-delta');
    updateKarmaDisplay(display, deltaEl, newValue, delta);
}

function updateButtonState() {
    const btn = document.getElementById('btn-spin');
    const canSpin = currentKarma >= SPIN_COST && !isSpinning;
    
    btn.disabled = !canSpin;
    btn.classList.toggle('disabled', !canSpin);
    btn.classList.toggle('spinning', isSpinning);
    
    if (isSpinning) {
        btn.querySelector('.spin-text').textContent = 'SPINNING...';
    } else {
        btn.querySelector('.spin-text').textContent = 'SPIN';
    }
}

function updateStats() {
    const stats = getStats();
    const spinsEl = document.getElementById('stat-spins');
    const wonEl = document.getElementById('stat-won');
    const jackpotsEl = document.getElementById('stat-jackpots');
    
    if (spinsEl) spinsEl.textContent = stats.totalSpins;
    if (wonEl) wonEl.textContent = stats.totalWon;
    if (jackpotsEl) jackpotsEl.textContent = stats.jackpots;
}

// Color utilities
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

export function hideWheelGame() {
    if (spinner) {
        spinner.forceStop();
        spinner = null;
    }
    if (wheelContainer) {
        wheelContainer.remove();
        wheelContainer = null;
    }
    wheelCanvas = null;
    wheelCtx = null;
}
