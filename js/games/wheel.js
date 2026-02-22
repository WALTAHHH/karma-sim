/**
 * @fileoverview Wheel of Fortune Logic
 * Physics-based spin with weighted wedge rewards
 * @module games/wheel
 */

const WHEEL_STATE_KEY = 'karma_simulator_wheel';

/** @constant {number} Cost in karma to spin */
export const SPIN_COST = 3;

// Wedge definitions - size is relative (smaller = rarer)
// Total units should sum to 100 for easy percentage math
export const WEDGES = [
    { id: 'karma_1',    label: '+1',      type: 'karma',   value: 1,   size: 12, rarity: 'common',    color: '#6b7280' },
    { id: 'karma_3',    label: '+3',      type: 'karma',   value: 3,   size: 10, rarity: 'common',    color: '#9ca3af' },
    { id: 'karma_1b',   label: '+1',      type: 'karma',   value: 1,   size: 12, rarity: 'common',    color: '#6b7280' },
    { id: 'karma_5',    label: '+5',      type: 'karma',   value: 5,   size: 9,  rarity: 'uncommon',  color: '#4ade80' },
    { id: 'karma_1c',   label: '+1',      type: 'karma',   value: 1,   size: 12, rarity: 'common',    color: '#6b7280' },
    { id: 'karma_8',    label: '+8',      type: 'karma',   value: 8,   size: 7,  rarity: 'rare',      color: '#60a5fa' },
    { id: 'karma_3b',   label: '+3',      type: 'karma',   value: 3,   size: 10, rarity: 'common',    color: '#9ca3af' },
    { id: 'bust',       label: 'BUST',    type: 'bust',    value: 0,   size: 6,  rarity: 'bust',      color: '#ef4444' },
    { id: 'karma_5b',   label: '+5',      type: 'karma',   value: 5,   size: 9,  rarity: 'uncommon',  color: '#4ade80' },
    { id: 'karma_15',   label: '+15',     type: 'karma',   value: 15,  size: 5,  rarity: 'epic',      color: '#c084fc' },
    { id: 'karma_3c',   label: '+3',      type: 'karma',   value: 3,   size: 10, rarity: 'common',    color: '#9ca3af' },
    { id: 'jackpot',    label: '💎 30',   type: 'jackpot', value: 30,  size: 3,  rarity: 'legendary', color: '#fbbf24' }
];

// Pre-calculate wedge angles
let wedgeAngles = [];
export function calculateWedgeAngles() {
    const totalSize = WEDGES.reduce((sum, w) => sum + w.size, 0);
    let currentAngle = 0;
    wedgeAngles = WEDGES.map(wedge => {
        const startAngle = currentAngle;
        const sweepAngle = (wedge.size / totalSize) * 360;
        currentAngle += sweepAngle;
        return {
            ...wedge,
            startAngle,
            endAngle: currentAngle,
            midAngle: startAngle + sweepAngle / 2
        };
    });
    return wedgeAngles;
}

// Initialize on load
calculateWedgeAngles();

export function getWedgeAngles() {
    return wedgeAngles;
}

// Determine which wedge the pointer is on at a given rotation
// Pointer is at top (0°), so we need to find which wedge is at 360 - rotation
export function getWedgeAtRotation(rotation) {
    // Normalize rotation to 0-360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    // Pointer is at top (0°), wheel rotates clockwise
    // So the wedge under pointer is at angle (360 - rotation) from start
    const pointerAngle = (360 - normalizedRotation) % 360;
    
    for (const wedge of wedgeAngles) {
        if (pointerAngle >= wedge.startAngle && pointerAngle < wedge.endAngle) {
            return wedge;
        }
    }
    // Fallback to first wedge (shouldn't happen)
    return wedgeAngles[0];
}

// Physics simulation state
export class WheelSpinner {
    constructor() {
        this.rotation = 0;           // Current rotation in degrees
        this.velocity = 0;           // Degrees per frame
        this.isSpinning = false;
        this.friction = 0.985;       // Velocity decay per frame
        this.minVelocity = 0.1;      // Stop threshold
        this.lastWedgeIndex = -1;    // For tick detection
        this.onTick = null;          // Callback when passing wedge boundary
        this.onStop = null;          // Callback when stopped
        this.onUpdate = null;        // Callback each frame
    }
    
    // Start a spin with initial velocity
    spin(initialVelocity = 15 + Math.random() * 10) {
        if (this.isSpinning) return;
        
        this.velocity = initialVelocity;
        this.isSpinning = true;
        this.lastWedgeIndex = this.getCurrentWedgeIndex();
        
        this.animate();
    }
    
    getCurrentWedgeIndex() {
        const wedge = getWedgeAtRotation(this.rotation);
        return wedgeAngles.indexOf(wedge);
    }
    
    animate() {
        if (!this.isSpinning) return;
        
        // Apply velocity
        this.rotation += this.velocity;
        
        // Check for wedge boundary crossing (for tick sound)
        const currentIndex = this.getCurrentWedgeIndex();
        if (currentIndex !== this.lastWedgeIndex) {
            this.lastWedgeIndex = currentIndex;
            if (this.onTick) {
                this.onTick(this.velocity, wedgeAngles[currentIndex]);
            }
        }
        
        // Apply friction (increases as it slows for drama)
        const frictionModifier = this.velocity < 5 ? 0.97 : this.friction;
        this.velocity *= frictionModifier;
        
        // Update callback
        if (this.onUpdate) {
            this.onUpdate(this.rotation, this.velocity);
        }
        
        // Check if stopped
        if (this.velocity < this.minVelocity) {
            this.velocity = 0;
            this.isSpinning = false;
            
            const finalWedge = getWedgeAtRotation(this.rotation);
            if (this.onStop) {
                this.onStop(finalWedge);
            }
            return;
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
    
    // Force stop (for cleanup)
    forceStop() {
        this.velocity = 0;
        this.isSpinning = false;
    }
    
    // Get current rotation
    getRotation() {
        return this.rotation;
    }
    
    // Reset
    reset() {
        this.rotation = 0;
        this.velocity = 0;
        this.isSpinning = false;
    }
}

// State management
function getWheelState() {
    try {
        const stored = localStorage.getItem(WHEEL_STATE_KEY);
        return stored ? JSON.parse(stored) : {
            totalSpins: 0,
            totalWon: 0,
            totalLost: 0,
            jackpots: 0,
            busts: 0,
            biggestWin: 0
        };
    } catch (e) {
        return { totalSpins: 0, totalWon: 0, totalLost: 0, jackpots: 0, busts: 0, biggestWin: 0 };
    }
}

function saveWheelState(state) {
    try {
        localStorage.setItem(WHEEL_STATE_KEY, JSON.stringify(state));
    } catch (e) {}
}

// Record a spin result
export function recordSpin(wedge) {
    const state = getWheelState();
    state.totalSpins++;
    
    if (wedge.type === 'bust') {
        state.busts++;
        state.totalLost += SPIN_COST;
    } else {
        const net = wedge.value - SPIN_COST;
        if (net > 0) {
            state.totalWon += net;
        } else {
            state.totalLost += Math.abs(net);
        }
        
        if (wedge.type === 'jackpot') {
            state.jackpots++;
        }
        
        if (wedge.value > state.biggestWin) {
            state.biggestWin = wedge.value;
        }
    }
    
    saveWheelState(state);
    return state;
}

export function getStats() {
    return getWheelState();
}

export function resetStats() {
    localStorage.removeItem(WHEEL_STATE_KEY);
}
