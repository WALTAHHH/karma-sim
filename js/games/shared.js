/**
 * @fileoverview Shared utilities for all mini-games
 * Provides audio, particle, animation, and UI utilities for consistent behavior across games.
 * @module games/shared
 */

// ============ AUDIO SYSTEM ============

/** @type {AudioContext|null} */
let audioCtx = null;

/**
 * Initialize and return the shared AudioContext
 * @returns {AudioContext} The shared audio context
 */
export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/**
 * Play a short tick sound at a given pitch
 * @param {number} [pitch=400] - Frequency in Hz
 */
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

/**
 * Play a reel stop sound for slot machines
 * @param {number} reelIndex - Index of the reel (affects pitch)
 */
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

/**
 * Play a win sound based on rarity tier
 * @param {string} rarity - One of: common, uncommon, rare, epic, legendary
 */
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

/**
 * Play a descending "womp womp" near-miss sound
 */
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

/**
 * Play a generic win chime - customizable rising tones
 * @param {number} [baseFreq=400] - Base frequency in Hz
 * @param {number} [count=3] - Number of tones
 * @param {OscillatorType} [type='triangle'] - Oscillator type
 */
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

/**
 * Play a descending loss sound
 */
export function playLossSound() {
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

/**
 * Play a mechanical motor sound (for claw machines, etc.)
 * @param {number} startFreq - Starting frequency
 * @param {number} endFreq - Ending frequency
 * @param {number} [duration=0.5] - Duration in seconds
 */
export function playMotorSound(startFreq, endFreq, duration = 0.5) {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) { }
}

/**
 * Play a scratch/friction sound
 */
export function playScratchSound() {
    try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
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

// ============ PARTICLE SYSTEM ============

/**
 * Spawn particles in an explosion pattern
 * @param {string} color - CSS color for particles
 * @param {number} count - Number of particles
 * @param {HTMLElement} [container=null] - Container element (defaults to #particles or creates one)
 * @param {Object} [position=null] - Optional spawn position {x: percent, y: percent} or {px: {x, y}} for pixel coords
 */
export function spawnParticles(color, count, container = null, position = null) {
    const targetContainer = container || document.getElementById('particles') || createParticleContainer();
    
    // Determine spawn position
    let leftPos = '50%';
    let topPos = '50%';
    
    if (position) {
        if (position.px) {
            // Pixel coordinates relative to container
            leftPos = `${position.px.x}px`;
            topPos = `${position.px.y}px`;
        } else {
            // Percentage coordinates
            leftPos = `${position.x || 50}%`;
            topPos = `${position.y || 50}%`;
        }
    }
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const velocity = 100 + Math.random() * 150;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 50; // Bias upward
        
        particle.style.cssText = `
            left: ${leftPos};
            top: ${topPos};
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

/**
 * Spawn firework burst particles (multiple bursts)
 * @param {string} color - CSS color for particles
 * @param {HTMLElement} [container=null] - Container element
 */
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

/**
 * Create a default particle container if none exists
 * @returns {HTMLElement} The particle container
 */
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

/**
 * Flash the screen with a color
 * @param {string} color - CSS color for flash
 * @param {number} [opacity=0.3] - Flash opacity (0-1)
 */
export function screenFlash(color, opacity = 0.3) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.background = color;
    flash.style.opacity = opacity;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 400);
}

/**
 * Apply shake animation to an element
 * @param {HTMLElement} element - Element to shake
 * @param {number} [duration=500] - Shake duration in ms
 */
export function shakeScreen(element, duration = 500) {
    if (!element) return;
    element.classList.add('mega-shake');
    setTimeout(() => {
        element.classList.remove('mega-shake');
    }, duration);
}

// ============ ANIMATION HELPERS ============

/**
 * Promise-based sleep/delay
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Animate a number change in an element with smooth transition
 * @param {HTMLElement} element - Element containing the number
 * @param {number} newValue - Target value
 * @param {number} [duration=600] - Animation duration in ms
 */
export function animateNumberChange(element, newValue, duration = 600) {
    if (!element) return;
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

/**
 * Generic easing function (ease-out cubic)
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value (0-1)
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Generic easing function (ease-in-out cubic)
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value (0-1)
 */
export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============ KARMA DISPLAY ============

/**
 * Standard karma display update with delta animation
 * @param {HTMLElement} displayEl - Element showing karma amount
 * @param {HTMLElement} deltaEl - Element showing +/- delta
 * @param {number} newValue - New karma value
 * @param {number} [delta=0] - Change amount to display
 */
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

/**
 * Create a standard game overlay container
 * @param {string} [className=''] - Additional CSS classes
 * @returns {HTMLElement} Overlay div element
 */
export function createGameOverlay(className = '') {
    const overlay = document.createElement('div');
    overlay.className = `game-overlay ${className}`.trim();
    return overlay;
}

/**
 * Create particle container for a specific game
 * @param {HTMLElement} parentElement - Parent to append container to
 * @returns {HTMLElement} Particle container
 */
export function createParticleContainerFor(parentElement) {
    const container = document.createElement('div');
    container.className = 'particle-container';
    parentElement.appendChild(container);
    return container;
}

/**
 * Animate and remove an overlay with fadeout
 * @param {HTMLElement} overlay - Overlay to close
 * @param {Function} [callback] - Called after removal
 */
export function closeOverlay(overlay, callback) {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        overlay.remove();
        if (callback) callback();
    }, 300);
}

// ============ COLOR UTILITIES ============

/**
 * Rarity colors shared across games
 * @type {Object.<string, {color: string, glow: string}>}
 */
export const RARITY_COLORS = {
    common: { color: '#888888', glow: 'rgba(136,136,136,0.5)' },
    uncommon: { color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
    rare: { color: '#60a5fa', glow: 'rgba(96,165,250,0.5)' },
    epic: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
    legendary: { color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' }
};

/**
 * Lighten a hex color
 * @param {string} hex - Hex color (e.g., '#ff0000')
 * @param {number} percent - Percent to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Darken a hex color
 * @param {string} hex - Hex color (e.g., '#ff0000')
 * @param {number} percent - Percent to darken (0-100)
 * @returns {string} Darkened hex color
 */
export function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Convert hex color to RGBA
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = (num >> 16) & 0xFF;
    const G = (num >> 8) & 0xFF;
    const B = num & 0xFF;
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
}

// ============ RANDOM UTILITIES ============

/**
 * Get a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array
 * @template T
 * @param {T[]} array - Array to pick from
 * @returns {T} Random element
 */
export function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array in place (Fisher-Yates)
 * @template T
 * @param {T[]} array - Array to shuffle
 * @returns {T[]} Same array, shuffled
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// ============ DEBUG HELPERS ============

/**
 * Get the current debug mode state
 * @returns {boolean} Whether debug mode is enabled
 */
export function isDebugMode() {
    return window.debugMode === true;
}
