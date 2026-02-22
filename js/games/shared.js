// Shared utilities for all mini-games
// Extracted from gachaUI.js for reuse across games

// ============ AUDIO SYSTEM ============
let audioCtx = null;

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function playTick(pitch = 400) {
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

export function playReelStop(reelIndex) {
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

export function playWinSound(rarity) {
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

export function playNearMiss() {
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

// Generic win chime - customizable
export function playChime(baseFreq = 400, count = 3, type = 'triangle') {
    try {
        const ctx = initAudio();
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = baseFreq + (i * 100);
                osc.type = type;
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            }, i * 100);
        }
    } catch (e) { }
}

// ============ PARTICLE SYSTEM ============

export function spawnParticles(color, count, container = null) {
    const targetContainer = container || document.getElementById('particles') || createParticleContainer();
    
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
        targetContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
}

export function spawnFireworks(color, container = null) {
    const targetContainer = container || document.getElementById('particles') || createParticleContainer();
    
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
                targetContainer.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }
        }, burst * 200);
    }
}

function createParticleContainer() {
    let container = document.getElementById('game-particles');
    if (!container) {
        container = document.createElement('div');
        container.id = 'game-particles';
        container.className = 'particle-container';
        document.body.appendChild(container);
    }
    return container;
}

// ============ SCREEN EFFECTS ============

export function screenFlash(color, opacity = 0.3) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.background = color;
    flash.style.opacity = opacity;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 400);
}

export function shakeScreen(element) {
    if (!element) return;
    element.classList.add('mega-shake');
    setTimeout(() => {
        element.classList.remove('mega-shake');
    }, 500);
}

// ============ ANIMATION HELPERS ============

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Animate a number change in an element
export function animateNumberChange(element, newValue, duration = 600) {
    const current = parseInt(element.textContent) || 0;
    const diff = newValue - current;
    const steps = Math.min(Math.abs(diff), 20);
    const stepValue = diff / steps;
    const stepDuration = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
        step++;
        element.textContent = Math.round(current + stepValue * step);
        if (step >= steps) {
            clearInterval(interval);
            element.textContent = Math.floor(newValue);
        }
    }, stepDuration);
}

// ============ KARMA DISPLAY ============

// Standard karma display update with delta animation
export function updateKarmaDisplay(displayEl, deltaEl, newValue, delta = 0) {
    if (delta !== 0 && deltaEl) {
        deltaEl.textContent = delta > 0 ? `+${delta}` : delta;
        deltaEl.className = `karma-delta ${delta > 0 ? 'positive' : 'negative'}`;
        deltaEl.classList.add('show');
        
        setTimeout(() => deltaEl.classList.remove('show'), 1500);
    }
    
    if (displayEl) {
        animateNumberChange(displayEl, newValue);
    }
}

// ============ COMMON UI PATTERNS ============

// Create a standard game overlay container
export function createGameOverlay(className = '') {
    const overlay = document.createElement('div');
    overlay.className = `game-overlay ${className}`.trim();
    return overlay;
}

// Create particle container for a specific game
export function createParticleContainerFor(parentElement) {
    const container = document.createElement('div');
    container.className = 'particle-container';
    parentElement.appendChild(container);
    return container;
}

// Standard close overlay animation
export function closeOverlay(overlay, callback) {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        overlay.remove();
        if (callback) callback();
    }, 300);
}

// ============ RARITY COLORS (shared across games) ============

export const RARITY_COLORS = {
    common: { color: '#888888', glow: 'rgba(136,136,136,0.5)' },
    uncommon: { color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
    rare: { color: '#60a5fa', glow: 'rgba(96,165,250,0.5)' },
    epic: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
    legendary: { color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' }
};
