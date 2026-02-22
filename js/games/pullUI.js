/**
 * @fileoverview Pull UI - Dramatic single-card reveal experience
 * Anticipation → Crack → REVEAL!
 * @module games/pullUI
 */

import {
    RARITIES,
    getPullCost,
    getMultiPullCost,
    getMultiPullCount,
    getGachaState,
    doPull,
    debugForcePull,
    debugResetGacha,
    debugSetPity,
    debugGetState,
    getRarityTier,
    getAnticipationDuration,
    getCrackDuration
} from './pull.js';

import {
    initAudio,
    playTick,
    playWinSound,
    playChime,
    spawnParticles,
    spawnFireworks,
    screenFlash,
    shakeScreen,
    sleep,
    updateKarmaDisplay,
    RARITY_COLORS
} from './shared.js';

let pullContainer = null;
let isAnimating = false;
let currentKarma = 0;
let spendFn = null;
let addFn = null;

// Dramatic sounds specific to pull
function playBuildupSound(intensity) {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Rising pitch for buildup
        osc.frequency.setValueAtTime(100 + intensity * 50, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200 + intensity * 100, ctx.currentTime + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05 + intensity * 0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
}

function playCrackSound() {
    try {
        const ctx = initAudio();
        // Sharp crack
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        
        // Sub-bass thump
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 60;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.15);
    } catch (e) { }
}

function playRevealBurst(rarity) {
    try {
        const ctx = initAudio();
        const frequencies = {
            common: [200, 300, 400],
            uncommon: [300, 400, 500, 600],
            rare: [400, 500, 600, 700, 800],
            epic: [400, 500, 600, 800, 1000, 1200],
            legendary: [400, 500, 600, 800, 1000, 1200, 1400, 1600]
        };
        const freqs = frequencies[rarity] || [400];
        
        freqs.forEach((freq, i) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = rarity === 'legendary' ? 'sine' : 'triangle';
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            }, i * 50);
        });
    } catch (e) { }
}

// Create the pull game UI
export function showPullGame(karma, spendKarmaFn, addKarmaFn, onClose) {
    hidePullGame();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    
    pullContainer = document.createElement('div');
    pullContainer.className = 'pull-overlay';
    pullContainer.innerHTML = `
        <div class="pull-machine">
            <div class="pull-header">
                <h2 class="pull-title">✨ KARMA PULL ✨</h2>
                <div class="pull-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="pull-karma-display">${karma}</span>
                    <span class="karma-delta" id="pull-karma-delta"></span>
                </div>
            </div>
            
            <div class="pull-stage" id="pull-stage">
                <div class="card-container" id="card-container">
                    <div class="pull-card" id="pull-card">
                        <div class="card-back">
                            <div class="card-pattern"></div>
                            <div class="card-symbol">?</div>
                        </div>
                        <div class="card-front" id="card-front">
                            <!-- Filled during reveal -->
                        </div>
                        <div class="card-glow" id="card-glow"></div>
                        <div class="card-cracks" id="card-cracks"></div>
                    </div>
                </div>
                <div class="particles-layer" id="pull-particles"></div>
                <div class="silhouette-layer" id="silhouette-layer"></div>
            </div>
            
            <div class="pull-instruction" id="pull-instruction">
                <span class="instruction-text">Tap to Pull</span>
            </div>
            
            <div class="pull-buttons">
                <button class="pull-btn pull-single" id="btn-pull">
                    <span class="btn-text">PULL</span>
                    <span class="btn-cost">${getPullCost()} ☯</span>
                </button>
            </div>
            
            <div class="pull-rates">
                <span class="rate-toggle" id="pull-rate-toggle">▼ Drop Rates</span>
                <div class="rates-panel" id="pull-rates-panel">
                    ${Object.entries(RARITIES).map(([key, r]) => `
                        <div class="rate-row">
                            <span class="rate-dot" style="background: ${r.color}"></span>
                            <span class="rate-name" style="color: ${r.color}">${r.name}</span>
                            <span class="rate-pct">${r.weight}%</span>
                        </div>
                    `).join('')}
                    <div class="rate-note">Pity: Rare+ guaranteed every 50 pulls</div>
                </div>
            </div>
            
            <div class="pull-footer">
                <button class="pull-btn-secondary" id="btn-inventory">📦 Collection</button>
                <button class="pull-btn-secondary" id="btn-close">Back to Hub</button>
            </div>
            
            <div class="pull-debug" id="pull-debug" style="display: none;">
                <div class="debug-title">🔧 Debug</div>
                <div class="debug-row">
                    <button class="debug-btn" data-rarity="common">Com</button>
                    <button class="debug-btn" data-rarity="uncommon">Unc</button>
                    <button class="debug-btn" data-rarity="rare">Rare</button>
                    <button class="debug-btn" data-rarity="epic">Epic</button>
                    <button class="debug-btn" data-rarity="legendary">Leg</button>
                </div>
                <div class="debug-stats" id="pull-debug-stats"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(pullContainer);
    
    bindEvents(onClose);
    
    if (window.debugMode) {
        document.getElementById('pull-debug').style.display = 'block';
        updateDebugStats();
    }
    
    updateButtonStates();
}

function bindEvents(onClose) {
    const pullBtn = document.getElementById('btn-pull');
    const stage = document.getElementById('pull-stage');
    
    pullBtn.addEventListener('click', () => {
        if (!isAnimating && currentKarma >= getPullCost()) handlePull();
    });
    
    // Tap stage to pull too
    stage.addEventListener('click', () => {
        if (!isAnimating && currentKarma >= getPullCost()) handlePull();
    });
    
    document.getElementById('btn-close').addEventListener('click', () => {
        hidePullGame();
        if (onClose) onClose();
    });
    
    document.getElementById('pull-rate-toggle').addEventListener('click', () => {
        document.getElementById('pull-rates-panel').classList.toggle('open');
    });
    
    document.getElementById('btn-inventory').addEventListener('click', showInventory);
    
    // Debug bindings
    document.querySelectorAll('#pull-debug .debug-btn[data-rarity]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (isAnimating) return;
            const rarity = btn.dataset.rarity;
            const result = debugForcePull(rarity);
            await runPullAnimation(result.reward, result.rarity, rarity);
            updateDebugStats();
        });
    });
}

async function handlePull() {
    isAnimating = true;
    updateButtonStates();
    
    // Deduct karma
    currentKarma -= getPullCost();
    spendFn(getPullCost());
    updateKarmaDisplayLocal(currentKarma, -getPullCost());
    
    // Determine result
    const result = doPull();
    
    await runPullAnimation(result.reward, result.rarity, result.rarityKey);
    
    // Apply karma gain if any
    const karmaGain = result.reward.type === 'karma' ? result.reward.value : 0;
    if (karmaGain > 0) {
        currentKarma += karmaGain;
        addFn(karmaGain);
        updateKarmaDisplayLocal(currentKarma, karmaGain);
    }
    
    isAnimating = false;
    updateButtonStates();
}

async function runPullAnimation(reward, rarityObj, rarityKey) {
    const card = document.getElementById('pull-card');
    const cardContainer = document.getElementById('card-container');
    const stage = document.getElementById('pull-stage');
    const instruction = document.getElementById('pull-instruction');
    const glow = document.getElementById('card-glow');
    const cracks = document.getElementById('card-cracks');
    const particles = document.getElementById('pull-particles');
    const silhouette = document.getElementById('silhouette-layer');
    
    const color = rarityObj.color;
    const tier = getRarityTier(rarityKey);
    
    // Hide instruction
    instruction.classList.add('hidden');
    
    // Reset card state
    card.className = 'pull-card';
    cracks.innerHTML = '';
    particles.innerHTML = '';
    silhouette.innerHTML = '';
    glow.style.boxShadow = 'none';
    
    // ===== PHASE 1: ANTICIPATION =====
    card.classList.add('anticipating');
    cardContainer.classList.add('active');
    stage.classList.add('pulling');
    
    const anticipationDuration = getAnticipationDuration(rarityKey);
    const buildupSteps = 8;
    const stepDuration = anticipationDuration / buildupSteps;
    
    // Buildup glow and particles based on rarity
    for (let i = 0; i < buildupSteps; i++) {
        await sleep(stepDuration);
        
        const intensity = (i + 1) / buildupSteps;
        const glowSize = 10 + (intensity * tier * 8);
        const glowOpacity = 0.2 + (intensity * 0.4);
        
        glow.style.boxShadow = `0 0 ${glowSize}px ${glowSize/2}px ${color}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}`;
        
        playBuildupSound(i);
        
        // Spawn hint particles (more for higher rarity)
        if (i > 4 && tier >= 2) {
            spawnAnticipationParticle(particles, color, tier);
        }
        if (i > 5 && tier >= 3) {
            spawnAnticipationParticle(particles, color, tier);
        }
        if (i > 6 && tier >= 4) {
            spawnAnticipationParticle(particles, color, tier);
            spawnAnticipationParticle(particles, color, tier);
        }
    }
    
    // Show silhouette tease for rare+
    if (tier >= 3) {
        silhouette.innerHTML = `<div class="silhouette-icon" style="color: ${color}20">${reward.icon}</div>`;
        silhouette.classList.add('active');
        await sleep(300);
        silhouette.classList.remove('active');
    }
    
    // ===== PHASE 2: CRACK =====
    card.classList.remove('anticipating');
    card.classList.add('cracking');
    
    playCrackSound();
    
    // Generate cracks
    const crackCount = 3 + tier;
    for (let i = 0; i < crackCount; i++) {
        const crack = document.createElement('div');
        crack.className = 'crack-line';
        crack.style.cssText = `
            --crack-angle: ${(360 / crackCount) * i + Math.random() * 30}deg;
            --crack-length: ${30 + Math.random() * 40}%;
            --crack-color: ${color};
            animation-delay: ${i * 50}ms;
        `;
        cracks.appendChild(crack);
    }
    
    const crackDuration = getCrackDuration(rarityKey);
    await sleep(crackDuration / 2);
    
    // Intensify cracks
    playCrackSound();
    cracks.classList.add('intense');
    glow.style.boxShadow = `0 0 ${30 + tier * 15}px ${15 + tier * 8}px ${color}`;
    
    await sleep(crackDuration / 2);
    
    // ===== PHASE 3: REVEAL =====
    card.classList.remove('cracking');
    card.classList.add('revealing');
    
    // Fill card front
    const cardFront = document.getElementById('card-front');
    cardFront.innerHTML = `
        <div class="reveal-content" style="--rarity-color: ${color}">
            <div class="reveal-rarity">${rarityObj.name}</div>
            <div class="reveal-icon-container">
                <div class="reveal-icon">${reward.icon}</div>
                <div class="reveal-icon-glow">${reward.icon}</div>
            </div>
            <div class="reveal-name">${reward.name}</div>
            <div class="reveal-desc">${reward.description}</div>
        </div>
    `;
    
    // Clear cracks
    cracks.innerHTML = '';
    cracks.classList.remove('intense');
    
    playRevealBurst(rarityKey);
    
    // Particles explosion
    const particleCount = { common: 15, uncommon: 25, rare: 40, epic: 60, legendary: 100 };
    spawnRevealParticles(particles, color, particleCount[rarityKey] || 20);
    
    // Screen effects for high rarity
    if (rarityKey === 'legendary') {
        screenFlash(color, 0.4);
        shakeScreen(document.querySelector('.pull-machine'));
        spawnFireworks(color, particles);
        
        // Extra legendary celebration
        await sleep(200);
        spawnFireworks(color, particles);
        await sleep(200);
        spawnFireworks(color, particles);
    } else if (rarityKey === 'epic') {
        screenFlash(color, 0.25);
        shakeScreen(document.querySelector('.pull-machine'));
    } else if (rarityKey === 'rare') {
        screenFlash(color, 0.15);
    }
    
    // Hold reveal
    await sleep(rarityKey === 'legendary' ? 3500 : rarityKey === 'epic' ? 2500 : 2000);
    
    // Reset
    card.classList.remove('revealing');
    card.classList.add('resetting');
    cardContainer.classList.remove('active');
    stage.classList.remove('pulling');
    
    await sleep(400);
    
    card.classList.remove('resetting');
    glow.style.boxShadow = 'none';
    cardFront.innerHTML = '';
    particles.innerHTML = '';
    instruction.classList.remove('hidden');
}

function spawnAnticipationParticle(container, color, tier) {
    const particle = document.createElement('div');
    particle.className = 'anticipation-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    const startX = 50 + Math.cos(angle) * distance;
    const startY = 50 + Math.sin(angle) * distance;
    
    particle.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        background: ${color};
        box-shadow: 0 0 8px ${color};
        --end-x: ${50 - startX}%;
        --end-y: ${50 - startY}%;
        animation-duration: ${0.6 + Math.random() * 0.4}s;
    `;
    
    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function spawnRevealParticles(container, color, count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'reveal-particle';
        
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const velocity = 80 + Math.random() * 120;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 30;
        const size = 3 + Math.random() * 5;
        
        particle.style.cssText = `
            left: 50%;
            top: 50%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size * 2}px ${color};
            --dx: ${dx}px;
            --dy: ${dy}px;
            animation-delay: ${Math.random() * 0.15}s;
        `;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
    }
}

function updateKarmaDisplayLocal(newValue, delta = 0) {
    const display = document.getElementById('pull-karma-display');
    const deltaEl = document.getElementById('pull-karma-delta');
    updateKarmaDisplay(display, deltaEl, newValue, delta);
}

function updateButtonStates() {
    const pullBtn = document.getElementById('btn-pull');
    const canPull = currentKarma >= getPullCost() && !isAnimating;
    
    pullBtn.disabled = !canPull;
    pullBtn.classList.toggle('disabled', !canPull);
}

function updateDebugStats() {
    const state = debugGetState();
    const stats = document.getElementById('pull-debug-stats');
    if (stats) {
        stats.innerHTML = `Pulls: ${state.pullCount} | Pity: ${state.pity}`;
    }
}

function showInventory() {
    const state = getGachaState();
    const stage = document.getElementById('pull-stage');
    
    const grouped = {};
    state.inventory.forEach(item => {
        if (!grouped[item.id]) {
            grouped[item.id] = { ...item, count: 0 };
        }
        grouped[item.id].count++;
    });
    
    const sortedItems = Object.values(grouped).sort((a, b) => {
        const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
        return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    });
    
    const overlay = document.createElement('div');
    overlay.className = 'inventory-overlay';
    overlay.innerHTML = `
        <div class="inventory-panel">
            <div class="inventory-title">📦 Collection (${state.inventory.length})</div>
            <div class="inventory-grid">
                ${sortedItems.map(item => `
                    <div class="inventory-item" style="--rarity-color: ${RARITIES[item.rarity].color}">
                        <span class="item-icon">${item.icon}</span>
                        <span class="item-count">×${item.count}</span>
                    </div>
                `).join('') || '<div class="empty">Nothing yet. Pull!</div>'}
            </div>
            <button class="pull-btn-secondary inventory-close">Close</button>
        </div>
    `;
    
    pullContainer.appendChild(overlay);
    
    overlay.querySelector('.inventory-close').addEventListener('click', () => {
        overlay.remove();
    });
}

export function hidePullGame() {
    if (pullContainer) {
        pullContainer.remove();
        pullContainer = null;
    }
}

export function setDebugMode(enabled) {
    window.debugMode = enabled;
    const debugPanel = document.getElementById('pull-debug');
    if (debugPanel) {
        debugPanel.style.display = enabled ? 'block' : 'none';
        if (enabled) updateDebugStats();
    }
}
