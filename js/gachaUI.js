// Gacha UI - Flashy slot machine visuals
// Handles all the eye candy for the pull experience

import { 
    RARITIES, REWARD_POOL, PULL_COST, MULTI_PULL_COST, MULTI_PULL_COUNT,
    doPull, doMultiPull, applyReward, getGachaState,
    debugForcePull, debugResetGacha, debugSetPity, debugGetState
} from './gacha.js';

let gachaContainer = null;
let isAnimating = false;

// Create the gacha machine UI
export function showGachaMachine(karma, spendKarmaFn, addKarmaFn, onClose) {
    // Remove existing if any
    hideGachaMachine();
    
    gachaContainer = document.createElement('div');
    gachaContainer.className = 'gacha-overlay';
    gachaContainer.innerHTML = `
        <div class="gacha-machine">
            <div class="gacha-header">
                <h2 class="gacha-title">✨ KARMA SLOTS ✨</h2>
                <div class="gacha-karma-display">
                    <span class="karma-icon">☯</span>
                    <span class="karma-amount">${karma}</span>
                </div>
            </div>
            
            <div class="gacha-display">
                <div class="slot-machine">
                    <div class="slot-window">
                        <div class="slot-reel" id="slot-reel-1"></div>
                        <div class="slot-reel" id="slot-reel-2"></div>
                        <div class="slot-reel" id="slot-reel-3"></div>
                    </div>
                    <div class="slot-shine"></div>
                </div>
                <div class="result-display" id="result-display"></div>
            </div>
            
            <div class="gacha-buttons">
                <button class="gacha-btn pull-single" id="btn-pull-single">
                    <span class="btn-text">PULL x1</span>
                    <span class="btn-cost">${PULL_COST} ☯</span>
                </button>
                <button class="gacha-btn pull-multi" id="btn-pull-multi">
                    <span class="btn-text">PULL x${MULTI_PULL_COUNT}</span>
                    <span class="btn-cost">${MULTI_PULL_COST} ☯</span>
                    <span class="btn-bonus">BONUS!</span>
                </button>
            </div>
            
            <div class="gacha-rates">
                <span class="rate-toggle" id="rate-toggle">▼ Drop Rates</span>
                <div class="rates-panel" id="rates-panel">
                    ${Object.entries(RARITIES).map(([key, r]) => `
                        <div class="rate-row">
                            <span class="rate-name" style="color: ${r.color}">${r.name}</span>
                            <span class="rate-pct">${r.weight}%</span>
                        </div>
                    `).join('')}
                    <div class="rate-note">Pity: Guaranteed Rare+ every 50 pulls</div>
                </div>
            </div>
            
            <div class="gacha-footer">
                <button class="gacha-btn-secondary" id="btn-inventory">📦 Inventory</button>
                <button class="gacha-btn-secondary" id="btn-close">✕ Close</button>
            </div>
            
            <div class="gacha-debug" id="gacha-debug" style="display: none;">
                <div class="debug-title">🔧 Debug Tools</div>
                <div class="debug-row">
                    <button class="debug-btn" data-rarity="common">Force Common</button>
                    <button class="debug-btn" data-rarity="uncommon">Force Uncommon</button>
                    <button class="debug-btn" data-rarity="rare">Force Rare</button>
                </div>
                <div class="debug-row">
                    <button class="debug-btn" data-rarity="epic">Force Epic</button>
                    <button class="debug-btn" data-rarity="legendary">Force Legendary</button>
                </div>
                <div class="debug-row">
                    <button class="debug-btn" id="debug-pity-50">Set Pity 50</button>
                    <button class="debug-btn" id="debug-reset">Reset Gacha</button>
                </div>
                <div class="debug-stats" id="debug-stats"></div>
            </div>
        </div>
        <div class="particle-container" id="particles"></div>
    `;
    
    document.body.appendChild(gachaContainer);
    
    // Initialize slot reels with symbols
    initializeReels();
    
    // Bind events
    document.getElementById('btn-pull-single').addEventListener('click', () => {
        if (isAnimating) return;
        handlePull(false, karma, spendKarmaFn, addKarmaFn);
    });
    
    document.getElementById('btn-pull-multi').addEventListener('click', () => {
        if (isAnimating) return;
        handleMultiPull(karma, spendKarmaFn, addKarmaFn);
    });
    
    document.getElementById('btn-close').addEventListener('click', () => {
        hideGachaMachine();
        if (onClose) onClose();
    });
    
    document.getElementById('rate-toggle').addEventListener('click', () => {
        document.getElementById('rates-panel').classList.toggle('open');
    });
    
    document.getElementById('btn-inventory').addEventListener('click', showInventory);
    
    // Debug button bindings
    document.querySelectorAll('.debug-btn[data-rarity]').forEach(btn => {
        btn.addEventListener('click', () => {
            const result = debugForcePull(btn.dataset.rarity);
            showPullResult(result.reward, result.rarity);
            updateDebugStats();
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
    
    // Show debug panel if debug mode is active
    if (window.debugMode) {
        document.getElementById('gacha-debug').style.display = 'block';
        updateDebugStats();
    }
    
    updateButtonStates(karma);
}

function initializeReels() {
    const symbols = ['✨', '💎', '🌟', '🎲', '🍀', '👑', '🔮', '⚡', '🌌', '🎰'];
    
    for (let i = 1; i <= 3; i++) {
        const reel = document.getElementById(`slot-reel-${i}`);
        // Create extra symbols for animation
        for (let j = 0; j < 20; j++) {
            const symbol = document.createElement('div');
            symbol.className = 'slot-symbol';
            symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            reel.appendChild(symbol);
        }
    }
}

async function handlePull(isFree, karma, spendKarmaFn, addKarmaFn) {
    if (karma < PULL_COST && !isFree) {
        shakeButton('btn-pull-single');
        return;
    }
    
    isAnimating = true;
    updateButtonStates(0); // Disable buttons
    
    // Start reel animation
    await spinReels();
    
    // Do the actual pull
    const result = doPull(karma, spendKarmaFn);
    
    if (result.success) {
        await showPullResult(result.reward, result.rarity);
        applyReward(result.reward, addKarmaFn);
        updateKarmaDisplay(karma - PULL_COST + (result.reward.type === 'karma' ? result.reward.value : 0));
    }
    
    isAnimating = false;
    updateButtonStates(karma - PULL_COST);
}

async function handleMultiPull(karma, spendKarmaFn, addKarmaFn) {
    if (karma < MULTI_PULL_COST) {
        shakeButton('btn-pull-multi');
        return;
    }
    
    isAnimating = true;
    updateButtonStates(0);
    
    const result = doMultiPull(karma, spendKarmaFn);
    
    if (result.success) {
        await showMultiPullResults(result.results, addKarmaFn);
        updateKarmaDisplay(karma - MULTI_PULL_COST);
    }
    
    isAnimating = false;
    updateButtonStates(karma - MULTI_PULL_COST);
}

async function spinReels() {
    const reels = [1, 2, 3].map(i => document.getElementById(`slot-reel-${i}`));
    
    // Add spinning class
    reels.forEach((reel, i) => {
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        setTimeout(() => {
            reel.style.transition = `transform ${1 + i * 0.3}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reel.style.transform = `translateY(-${800 + i * 100}px)`;
        }, 50);
    });
    
    // Play spin sound effect (visual only for now)
    document.querySelector('.slot-machine').classList.add('spinning');
    
    await sleep(1800);
    
    document.querySelector('.slot-machine').classList.remove('spinning');
}

async function showPullResult(reward, rarity) {
    const display = document.getElementById('result-display');
    
    // Build result HTML
    display.innerHTML = `
        <div class="result-card" style="--rarity-color: ${rarity.color}; --rarity-glow: ${rarity.glow}">
            <div class="result-rarity">${rarity.name}</div>
            <div class="result-icon">${reward.icon}</div>
            <div class="result-name">${reward.name}</div>
            <div class="result-desc">${reward.description}</div>
        </div>
    `;
    
    display.classList.add('show');
    
    // Spawn particles for rare+
    if (['rare', 'epic', 'legendary'].includes(reward.rarity)) {
        spawnParticles(rarity.color, reward.rarity === 'legendary' ? 50 : 25);
    }
    
    // Screen flash for legendary
    if (reward.rarity === 'legendary') {
        screenFlash(rarity.color);
    }
    
    await sleep(2000);
    display.classList.remove('show');
}

async function showMultiPullResults(results, addKarmaFn) {
    const display = document.getElementById('result-display');
    
    // Sort by rarity (best last)
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const sorted = [...results].sort((a, b) => 
        rarityOrder.indexOf(a.reward.rarity) - rarityOrder.indexOf(b.reward.rarity)
    );
    
    // Show each result quickly
    for (let i = 0; i < sorted.length; i++) {
        const { reward, rarity } = sorted[i];
        
        display.innerHTML = `
            <div class="result-card mini" style="--rarity-color: ${rarity.color}; --rarity-glow: ${rarity.glow}">
                <div class="result-count">${i + 1}/${MULTI_PULL_COUNT}</div>
                <div class="result-icon">${reward.icon}</div>
                <div class="result-name">${reward.name}</div>
            </div>
        `;
        
        display.classList.add('show');
        
        if (['epic', 'legendary'].includes(reward.rarity)) {
            spawnParticles(rarity.color, 20);
        }
        
        applyReward(reward, addKarmaFn);
        
        await sleep(400);
    }
    
    // Show summary
    const best = sorted[sorted.length - 1];
    display.innerHTML = `
        <div class="result-summary">
            <div class="summary-title">PULL COMPLETE!</div>
            <div class="summary-best">Best: <span style="color: ${best.rarity.color}">${best.reward.name}</span></div>
            <div class="summary-stats">
                ${Object.entries(RARITIES).map(([key, r]) => {
                    const count = results.filter(x => x.reward.rarity === key).length;
                    return count > 0 ? `<span style="color: ${r.color}">${r.name}: ${count}</span>` : '';
                }).filter(Boolean).join(' · ')}
            </div>
        </div>
    `;
    
    await sleep(2500);
    display.classList.remove('show');
}

function spawnParticles(color, count) {
    const container = document.getElementById('particles');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${50 + (Math.random() - 0.5) * 40}%;
            top: ${50 + (Math.random() - 0.5) * 40}%;
            background: ${color};
            box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
            --dx: ${(Math.random() - 0.5) * 200}px;
            --dy: ${(Math.random() - 0.5) * 200}px;
            animation-delay: ${Math.random() * 0.3}s;
        `;
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
}

function screenFlash(color) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.background = color;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 500);
}

function shakeButton(id) {
    const btn = document.getElementById(id);
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
}

function updateButtonStates(karma) {
    const singleBtn = document.getElementById('btn-pull-single');
    const multiBtn = document.getElementById('btn-pull-multi');
    
    singleBtn.disabled = karma < PULL_COST || isAnimating;
    multiBtn.disabled = karma < MULTI_PULL_COST || isAnimating;
    
    singleBtn.classList.toggle('disabled', karma < PULL_COST);
    multiBtn.classList.toggle('disabled', karma < MULTI_PULL_COST);
}

function updateKarmaDisplay(karma) {
    const display = document.querySelector('.karma-amount');
    if (display) display.textContent = Math.floor(karma);
}

function updateDebugStats() {
    const state = debugGetState();
    const stats = document.getElementById('debug-stats');
    if (stats) {
        stats.innerHTML = `
            Pulls: ${state.pullCount} | Pity: ${state.pity}<br>
            ${Object.entries(state.stats).map(([k, v]) => `${k}: ${v}`).join(' | ')}
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
    
    display.innerHTML = `
        <div class="inventory-panel">
            <div class="inventory-title">📦 Inventory (${state.inventory.length} items)</div>
            <div class="inventory-grid">
                ${Object.values(grouped).map(item => `
                    <div class="inventory-item" style="border-color: ${RARITIES[item.rarity].color}">
                        <span class="item-icon">${item.icon}</span>
                        <span class="item-count">x${item.count}</span>
                    </div>
                `).join('') || '<div class="empty">No items yet</div>'}
            </div>
            <button class="gacha-btn-secondary" onclick="document.getElementById('result-display').classList.remove('show')">Close</button>
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

// Toggle debug mode
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
