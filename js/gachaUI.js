// Gacha UI - JUICY Slot Machine
// Deep juice pass: staggered stops, anticipation, symbol matching, cascading rewards

import { 
    RARITIES, REWARD_POOL, PULL_COST, MULTI_PULL_COST, MULTI_PULL_COUNT,
    doPull, doMultiPull, applyReward, getGachaState,
    debugForcePull, debugResetGacha, debugSetPity, debugGetState
} from './gacha.js';

let gachaContainer = null;
let isAnimating = false;
let currentKarma = 0;
let spendFn = null;
let addFn = null;

// Rarity-mapped symbols - visual progression
const RARITY_SYMBOLS = {
    common: ['🪨', '🍂', '🌿'],
    uncommon: ['🍀', '💚', '🌟'],
    rare: ['💎', '💠', '🔷'],
    epic: ['🔮', '👑', '⚡'],
    legendary: ['🌌', '✨', '🏆']
};

// All symbols for spinning
const ALL_SYMBOLS = Object.values(RARITY_SYMBOLS).flat();

// Audio context for sound effects
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// Synthesized sound effects
function playTick(pitch = 400) {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = pitch;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) { /* Audio not supported */ }
}

function playReelStop(reelIndex) {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 150 + reelIndex * 50;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
}

function playWinSound(rarity) {
    try {
        const ctx = initAudio();
        const frequencies = {
            common: [300],
            uncommon: [400, 500],
            rare: [400, 500, 600],
            epic: [400, 500, 600, 800],
            legendary: [400, 500, 600, 800, 1000, 1200]
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
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }, i * 80);
        });
    } catch (e) { }
}

function playNearMiss() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
}

// Create the gacha machine UI
export function showGachaMachine(karma, spendKarmaFn, addKarmaFn, onClose) {
    hideGachaMachine();
    
    currentKarma = karma;
    spendFn = spendKarmaFn;
    addFn = addKarmaFn;
    
    gachaContainer = document.createElement('div');
    gachaContainer.className = 'gacha-overlay';
    gachaContainer.innerHTML = `
        <div class="gacha-machine">
            <div class="gacha-header">
                <h2 class="gacha-title">✨ KARMA SLOTS ✨</h2>
                <div class="gacha-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount" id="karma-display">${karma}</span>
                    <span class="karma-delta" id="karma-delta"></span>
                </div>
            </div>
            
            <div class="gacha-display">
                <div class="slot-machine" id="slot-machine">
                    <div class="slot-frame">
                        <div class="slot-window">
                            <div class="slot-reel-container">
                                <div class="slot-reel" id="slot-reel-1"></div>
                            </div>
                            <div class="slot-reel-container">
                                <div class="slot-reel" id="slot-reel-2"></div>
                            </div>
                            <div class="slot-reel-container">
                                <div class="slot-reel" id="slot-reel-3"></div>
                            </div>
                        </div>
                        <div class="slot-payline"></div>
                        <div class="slot-shine"></div>
                    </div>
                    <div class="lever-container" id="lever-container">
                        <div class="lever" id="lever">
                            <div class="lever-handle"></div>
                            <div class="lever-ball"></div>
                        </div>
                    </div>
                </div>
                <div class="result-display" id="result-display"></div>
                <div class="near-miss-indicator" id="near-miss"></div>
            </div>
            
            <div class="gacha-buttons">
                <button class="gacha-btn pull-single" id="btn-pull-single">
                    <span class="btn-text">PULL</span>
                    <span class="btn-cost">${PULL_COST} ☯</span>
                </button>
                <button class="gacha-btn pull-multi" id="btn-pull-multi">
                    <span class="btn-text">×${MULTI_PULL_COUNT}</span>
                    <span class="btn-cost">${MULTI_PULL_COST} ☯</span>
                    <span class="btn-bonus">SAVE ${PULL_COST * MULTI_PULL_COUNT - MULTI_PULL_COST}!</span>
                </button>
            </div>
            
            <div class="gacha-rates">
                <span class="rate-toggle" id="rate-toggle">▼ Drop Rates</span>
                <div class="rates-panel" id="rates-panel">
                    ${Object.entries(RARITIES).map(([key, r]) => `
                        <div class="rate-row">
                            <span class="rate-symbols">${RARITY_SYMBOLS[key].join('')}</span>
                            <span class="rate-name" style="color: ${r.color}">${r.name}</span>
                            <span class="rate-pct">${r.weight}%</span>
                        </div>
                    `).join('')}
                    <div class="rate-note">Pity: Rare+ guaranteed every 50 pulls</div>
                </div>
            </div>
            
            <div class="gacha-footer">
                <button class="gacha-btn-secondary" id="btn-inventory">📦 Inventory</button>
                <button class="gacha-btn-secondary" id="btn-close">Close</button>
            </div>
            
            <div class="gacha-debug" id="gacha-debug" style="display: none;">
                <div class="debug-title">🔧 Debug Controls</div>
                <div class="debug-row">
                    <button class="debug-btn" data-rarity="common">Common</button>
                    <button class="debug-btn" data-rarity="uncommon">Uncommon</button>
                    <button class="debug-btn" data-rarity="rare">Rare</button>
                    <button class="debug-btn" data-rarity="epic">Epic</button>
                    <button class="debug-btn" data-rarity="legendary">Legendary</button>
                </div>
                <div class="debug-row">
                    <button class="debug-btn" id="debug-pity-50">Pity→50</button>
                    <button class="debug-btn" id="debug-reset">Reset</button>
                    <button class="debug-btn" id="debug-add-karma">+50 Karma</button>
                </div>
                <div class="debug-stats" id="debug-stats"></div>
            </div>
        </div>
        <div class="particle-container" id="particles"></div>
    `;
    
    document.body.appendChild(gachaContainer);
    
    initializeReels();
    bindEvents(onClose);
    
    if (window.debugMode) {
        document.getElementById('gacha-debug').style.display = 'block';
        updateDebugStats();
    }
    
    updateButtonStates();
}

function initializeReels() {
    for (let i = 1; i <= 3; i++) {
        const reel = document.getElementById(`slot-reel-${i}`);
        reel.innerHTML = '';
        // Create many symbols for smooth scrolling
        for (let j = 0; j < 30; j++) {
            const symbol = document.createElement('div');
            symbol.className = 'slot-symbol';
            symbol.textContent = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
            symbol.dataset.index = j;
            reel.appendChild(symbol);
        }
    }
}

function bindEvents(onClose) {
    document.getElementById('btn-pull-single').addEventListener('click', () => {
        if (!isAnimating && currentKarma >= PULL_COST) handlePull();
    });
    
    document.getElementById('btn-pull-multi').addEventListener('click', () => {
        if (!isAnimating && currentKarma >= MULTI_PULL_COST) handleMultiPull();
    });
    
    document.getElementById('lever-container').addEventListener('click', () => {
        if (!isAnimating && currentKarma >= PULL_COST) handlePull();
    });
    
    document.getElementById('btn-close').addEventListener('click', () => {
        hideGachaMachine();
        if (onClose) onClose();
    });
    
    document.getElementById('rate-toggle').addEventListener('click', () => {
        document.getElementById('rates-panel').classList.toggle('open');
    });
    
    document.getElementById('btn-inventory').addEventListener('click', showInventory);
    
    // Debug bindings
    document.querySelectorAll('.debug-btn[data-rarity]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (isAnimating) return;
            isAnimating = true;
            const rarity = btn.dataset.rarity;
            await animatePull(rarity);
            const result = debugForcePull(rarity);
            await showPullResult(result.reward, result.rarity);
            updateDebugStats();
            isAnimating = false;
        });
    });
    
    document.getElementById('debug-pity-50')?.addEventListener('click', () => {
        debugSetPity(50);
        updateDebugStats();
    });
    
    document.getElementById('debug-reset')?.addEventListener('click', () => {
        debugResetGacha();
        updateDebugStats();
    });
    
    document.getElementById('debug-add-karma')?.addEventListener('click', () => {
        currentKarma += 50;
        addFn(50);
        updateKarmaDisplay(currentKarma, 50);
        updateButtonStates();
    });
}

async function handlePull() {
    isAnimating = true;
    updateButtonStates();
    
    // Deduct karma immediately for feel
    currentKarma -= PULL_COST;
    spendFn(PULL_COST);
    updateKarmaDisplay(currentKarma, -PULL_COST);
    
    // Determine result first so we can rig the reels
    const result = doPull(currentKarma + PULL_COST, () => {}); // Already spent
    
    if (result.success) {
        await animatePull(result.reward.rarity);
        await showPullResult(result.reward, result.rarity);
        
        // Apply reward (might give karma back)
        const karmaGain = result.reward.type === 'karma' ? result.reward.value : 0;
        if (karmaGain > 0) {
            currentKarma += karmaGain;
            addFn(karmaGain);
            updateKarmaDisplay(currentKarma, karmaGain);
        }
    }
    
    isAnimating = false;
    updateButtonStates();
}

async function handleMultiPull() {
    isAnimating = true;
    updateButtonStates();
    
    currentKarma -= MULTI_PULL_COST;
    spendFn(MULTI_PULL_COST);
    updateKarmaDisplay(currentKarma, -MULTI_PULL_COST);
    
    const result = doMultiPull(currentKarma + MULTI_PULL_COST, () => {});
    
    if (result.success) {
        await showMultiPullResults(result.results);
    }
    
    isAnimating = false;
    updateButtonStates();
}

async function animatePull(targetRarity) {
    const machine = document.getElementById('slot-machine');
    const lever = document.getElementById('lever');
    
    // Pull lever animation
    lever.classList.add('pulled');
    await sleep(200);
    
    // Machine shake on start
    machine.classList.add('starting');
    playTick(200);
    await sleep(100);
    machine.classList.remove('starting');
    
    lever.classList.remove('pulled');
    
    // Get target symbols for this rarity
    const targetSymbols = RARITY_SYMBOLS[targetRarity];
    
    // Spin each reel with staggered timing
    const reels = [1, 2, 3].map(i => document.getElementById(`slot-reel-${i}`));
    const reelContainers = document.querySelectorAll('.slot-reel-container');
    
    // Start all reels spinning
    reels.forEach((reel, i) => {
        reel.classList.add('spinning');
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
    });
    
    machine.classList.add('spinning');
    
    // Tick sounds while spinning
    const tickInterval = setInterval(() => playTick(300 + Math.random() * 100), 100);
    
    // Base spin time
    await sleep(800);
    
    // Stop reels one by one with increasing drama
    for (let i = 0; i < 3; i++) {
        const reel = reels[i];
        const container = reelContainers[i];
        const isLastReel = i === 2;
        
        // Set the landing symbol
        const symbols = reel.querySelectorAll('.slot-symbol');
        const landingSymbol = targetSymbols[Math.floor(Math.random() * targetSymbols.length)];
        const landIndex = 15 + Math.floor(Math.random() * 5); // Land somewhere in middle
        symbols[landIndex].textContent = landingSymbol;
        symbols[landIndex].dataset.rarity = targetRarity;
        
        // Calculate stop position
        const symbolHeight = 60;
        const stopPosition = -(landIndex * symbolHeight - symbolHeight);
        
        if (isLastReel) {
            // EXTRA DRAMA for last reel
            clearInterval(tickInterval);
            
            // Slow tick-tick-tick
            for (let t = 0; t < 6; t++) {
                await sleep(150 + t * 50);
                playTick(250 - t * 20);
                reel.style.transition = 'transform 0.15s ease-out';
                reel.style.transform = `translateY(${stopPosition + (6-t) * symbolHeight}px)`;
            }
            
            // Final dramatic pause
            await sleep(400);
        }
        
        // Stop reel with bounce
        reel.classList.remove('spinning');
        reel.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        reel.style.transform = `translateY(${stopPosition}px)`;
        
        playReelStop(i);
        container.classList.add('stopped');
        
        // Highlight landed symbol
        symbols[landIndex].classList.add('landed');
        
        if (!isLastReel) {
            await sleep(400 + i * 200); // Increasing delay between reels
        }
    }
    
    clearInterval(tickInterval);
    machine.classList.remove('spinning');
    
    // Check for matching symbols (near miss detection)
    const landedSymbols = document.querySelectorAll('.slot-symbol.landed');
    const landedTexts = Array.from(landedSymbols).map(s => s.textContent);
    
    // If 2 match but not 3, it's a near miss
    if (new Set(landedTexts).size === 2) {
        showNearMiss();
    }
    
    // All symbols glow with rarity color
    const rarityColor = RARITIES[targetRarity].color;
    landedSymbols.forEach(s => {
        s.style.setProperty('--rarity-color', rarityColor);
        s.classList.add('matched');
    });
    
    playWinSound(targetRarity);
    
    await sleep(600);
    
    // Reset for next spin
    reelContainers.forEach(c => c.classList.remove('stopped'));
    landedSymbols.forEach(s => {
        s.classList.remove('landed', 'matched');
    });
}

function showNearMiss() {
    const indicator = document.getElementById('near-miss');
    indicator.textContent = 'SO CLOSE!';
    indicator.classList.add('show');
    playNearMiss();
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1000);
}

async function showPullResult(reward, rarity) {
    const display = document.getElementById('result-display');
    
    // Build reveal with staged animation
    display.innerHTML = `
        <div class="result-card ${reward.rarity}" style="--rarity-color: ${rarity.color}; --rarity-glow: ${rarity.glow}">
            <div class="result-rarity">${rarity.name}</div>
            <div class="result-icon-container">
                <div class="result-icon">${reward.icon}</div>
                <div class="result-icon-bg">${reward.icon}</div>
            </div>
            <div class="result-name">${reward.name}</div>
            <div class="result-desc">${reward.description}</div>
        </div>
    `;
    
    display.classList.add('show');
    
    // Spawn particles based on rarity
    const particleCounts = { common: 5, uncommon: 12, rare: 25, epic: 40, legendary: 60 };
    spawnParticles(rarity.color, particleCounts[reward.rarity] || 10);
    
    // Screen effects for high rarity
    if (reward.rarity === 'legendary') {
        screenFlash(rarity.color);
        shakeScreen();
        spawnFireworks(rarity.color);
    } else if (reward.rarity === 'epic') {
        screenFlash(rarity.color, 0.15);
    }
    
    await sleep(2500);
    display.classList.remove('show');
}

async function showMultiPullResults(results) {
    const display = document.getElementById('result-display');
    
    // Sort by rarity (best last for drama)
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const sorted = [...results].sort((a, b) => 
        rarityOrder.indexOf(a.reward.rarity) - rarityOrder.indexOf(b.reward.rarity)
    );
    
    let totalKarmaGain = 0;
    
    for (let i = 0; i < sorted.length; i++) {
        const { reward, rarity } = sorted[i];
        const isLast = i === sorted.length - 1;
        const isHighRarity = ['rare', 'epic', 'legendary'].includes(reward.rarity);
        
        display.innerHTML = `
            <div class="result-card mini ${reward.rarity}" style="--rarity-color: ${rarity.color}; --rarity-glow: ${rarity.glow}">
                <div class="result-count">${i + 1}/${MULTI_PULL_COUNT}</div>
                <div class="result-icon">${reward.icon}</div>
                <div class="result-name">${reward.name}</div>
            </div>
        `;
        
        display.classList.add('show');
        
        if (isHighRarity) {
            spawnParticles(rarity.color, reward.rarity === 'legendary' ? 40 : 20);
            playWinSound(reward.rarity);
        } else {
            playTick(400);
        }
        
        // Track karma gains
        if (reward.type === 'karma') {
            totalKarmaGain += reward.value;
        }
        
        await sleep(isHighRarity ? 600 : 300);
    }
    
    // Apply total karma gain
    if (totalKarmaGain > 0) {
        currentKarma += totalKarmaGain;
        addFn(totalKarmaGain);
        updateKarmaDisplay(currentKarma, totalKarmaGain);
    }
    
    // Show summary
    const best = sorted[sorted.length - 1];
    const rarityCounts = {};
    results.forEach(r => {
        rarityCounts[r.reward.rarity] = (rarityCounts[r.reward.rarity] || 0) + 1;
    });
    
    display.innerHTML = `
        <div class="result-summary">
            <div class="summary-title">COMPLETE!</div>
            <div class="summary-best">
                <span class="best-label">Best:</span>
                <span class="best-icon">${best.reward.icon}</span>
                <span style="color: ${best.rarity.color}">${best.reward.name}</span>
            </div>
            <div class="summary-breakdown">
                ${Object.entries(RARITIES).map(([key, r]) => {
                    const count = rarityCounts[key] || 0;
                    return count > 0 ? `<span class="breakdown-item" style="color: ${r.color}">${count}× ${r.name}</span>` : '';
                }).filter(Boolean).join('')}
            </div>
        </div>
    `;
    
    if (['epic', 'legendary'].includes(best.reward.rarity)) {
        spawnFireworks(best.rarity.color);
    }
    
    await sleep(3000);
    display.classList.remove('show');
}

function spawnParticles(color, count) {
    const container = document.getElementById('particles');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const velocity = 100 + Math.random() * 150;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 50; // Bias upward
        
        particle.style.cssText = `
            left: 50%;
            top: 50%;
            background: ${color};
            box-shadow: 0 0 6px ${color}, 0 0 12px ${color};
            --dx: ${dx}px;
            --dy: ${dy}px;
            animation-delay: ${Math.random() * 0.2}s;
        `;
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
}

function spawnFireworks(color) {
    const container = document.getElementById('particles');
    
    // Multiple bursts
    for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            const centerX = 30 + Math.random() * 40;
            const centerY = 30 + Math.random() * 40;
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework';
                
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 80 + Math.random() * 60;
                
                particle.style.cssText = `
                    left: ${centerX}%;
                    top: ${centerY}%;
                    background: ${color};
                    box-shadow: 0 0 4px ${color}, 0 0 8px ${color};
                    --dx: ${Math.cos(angle) * velocity}px;
                    --dy: ${Math.sin(angle) * velocity}px;
                `;
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }
        }, burst * 200);
    }
}

function screenFlash(color, opacity = 0.3) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.background = color;
    flash.style.opacity = opacity;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 400);
}

function shakeScreen() {
    document.querySelector('.gacha-machine').classList.add('mega-shake');
    setTimeout(() => {
        document.querySelector('.gacha-machine').classList.remove('mega-shake');
    }, 500);
}

function updateKarmaDisplay(newValue, delta = 0) {
    const display = document.getElementById('karma-display');
    const deltaEl = document.getElementById('karma-delta');
    
    if (delta !== 0) {
        deltaEl.textContent = delta > 0 ? `+${delta}` : delta;
        deltaEl.className = `karma-delta ${delta > 0 ? 'positive' : 'negative'}`;
        deltaEl.classList.add('show');
        
        setTimeout(() => deltaEl.classList.remove('show'), 1500);
    }
    
    // Animate number change
    const current = parseInt(display.textContent) || 0;
    const diff = newValue - current;
    const steps = Math.min(Math.abs(diff), 20);
    const stepValue = diff / steps;
    
    let step = 0;
    const interval = setInterval(() => {
        step++;
        display.textContent = Math.round(current + stepValue * step);
        if (step >= steps) {
            clearInterval(interval);
            display.textContent = Math.floor(newValue);
        }
    }, 30);
}

function updateButtonStates() {
    const singleBtn = document.getElementById('btn-pull-single');
    const multiBtn = document.getElementById('btn-pull-multi');
    
    const canSingle = currentKarma >= PULL_COST && !isAnimating;
    const canMulti = currentKarma >= MULTI_PULL_COST && !isAnimating;
    
    singleBtn.disabled = !canSingle;
    multiBtn.disabled = !canMulti;
    
    singleBtn.classList.toggle('disabled', !canSingle);
    multiBtn.classList.toggle('disabled', !canMulti);
}

function updateDebugStats() {
    const state = debugGetState();
    const stats = document.getElementById('debug-stats');
    if (stats) {
        stats.innerHTML = `
            Pulls: ${state.pullCount} | Pity: ${state.pity} | Karma: ${currentKarma}<br>
            ${Object.entries(state.stats || {}).map(([k, v]) => `${k}: ${v}`).join(' | ')}
        `;
    }
}

function showInventory() {
    const state = getGachaState();
    const display = document.getElementById('result-display');
    
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
    
    display.innerHTML = `
        <div class="inventory-panel">
            <div class="inventory-title">📦 Collection (${state.inventory.length})</div>
            <div class="inventory-grid">
                ${sortedItems.map(item => `
                    <div class="inventory-item" style="--rarity-color: ${RARITIES[item.rarity].color}">
                        <span class="item-icon">${item.icon}</span>
                        <span class="item-count">×${item.count}</span>
                        <span class="item-rarity-dot"></span>
                    </div>
                `).join('') || '<div class="empty">Nothing yet. Pull!</div>'}
            </div>
            <button class="gacha-btn-secondary inventory-close" onclick="this.closest('.result-display').classList.remove('show')">Close</button>
        </div>
    `;
    
    display.classList.add('show');
}

export function hideGachaMachine() {
    if (gachaContainer) {
        gachaContainer.remove();
        gachaContainer = null;
    }
}

export function setDebugMode(enabled) {
    window.debugMode = enabled;
    const debugPanel = document.getElementById('gacha-debug');
    if (debugPanel) {
        debugPanel.style.display = enabled ? 'block' : 'none';
        if (enabled) updateDebugStats();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
