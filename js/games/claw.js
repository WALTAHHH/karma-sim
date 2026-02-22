/**
 * @fileoverview Claw Machine Game Logic
 * Physics, prize generation, grab mechanics
 * @module games/claw
 */

import { RARITIES, REWARD_POOL } from '../gacha.js';

/** @constant {number} Cost in karma to play */
const CLAW_COST = 5;
const POSITION_TIME_LIMIT = 10000; // 10 seconds to position

// Grip chances by rarity (base %, can be modified by aim precision)
const GRIP_CHANCES = {
    common: 85,
    uncommon: 70,
    rare: 55,
    epic: 40,
    legendary: 25
};

// Slip chances during ascent (checked multiple times)
const SLIP_CHANCES = {
    common: 5,
    uncommon: 10,
    rare: 15,
    epic: 25,
    legendary: 35
};

// Prize sizes (affects grab hitbox and visual)
const PRIZE_SIZES = {
    common: 40,
    uncommon: 35,
    rare: 30,
    epic: 25,
    legendary: 18
};

// Game state
let gameState = {
    phase: 'idle', // idle, positioning, dropping, grabbing, ascending, returning, result
    claw: {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        open: true,
        swayAngle: 0,
        swayVelocity: 0
    },
    prizes: [],
    grabbedPrize: null,
    positionTimer: 0,
    result: null,
    callbacks: {}
};

// Initialize the claw machine
export function initClawMachine(width, height) {
    const centerX = width / 2;
    const clawRestY = 60;
    
    gameState.claw = {
        x: centerX,
        y: clawRestY,
        restY: clawRestY,
        targetX: centerX,
        targetY: clawRestY,
        open: true,
        swayAngle: 0,
        swayVelocity: 0,
        width: 50,
        grabRadius: 25
    };
    
    // Generate prizes
    gameState.prizes = generatePrizes(width, height);
    gameState.phase = 'idle';
    gameState.grabbedPrize = null;
    gameState.result = null;
    
    return {
        claw: gameState.claw,
        prizes: gameState.prizes
    };
}

// Generate prizes scattered in the pit
function generatePrizes(width, height) {
    const prizes = [];
    const pitTop = 200;
    const pitBottom = height - 80;
    const pitLeft = 40;
    const pitRight = width - 40;
    
    // Rarity weights for prize generation
    const rarityWeights = {
        common: 40,
        uncommon: 30,
        rare: 15,
        epic: 10,
        legendary: 5
    };
    
    // Generate 12-18 prizes
    const prizeCount = 12 + Math.floor(Math.random() * 7);
    
    for (let i = 0; i < prizeCount; i++) {
        const rarity = rollRarity(rarityWeights);
        const size = PRIZE_SIZES[rarity];
        
        // Get a random reward from the pool for this rarity
        const rewardsOfRarity = REWARD_POOL.filter(r => r.rarity === rarity);
        const reward = rewardsOfRarity[Math.floor(Math.random() * rewardsOfRarity.length)];
        
        // Position with some clustering and overlap
        let x, y, buried;
        
        // Legendary is always center-ish
        if (rarity === 'legendary') {
            x = width / 2 + (Math.random() - 0.5) * 60;
            y = pitTop + 80 + Math.random() * 100;
            buried = Math.random() < 0.5; // 50% chance buried
        } else {
            x = pitLeft + Math.random() * (pitRight - pitLeft);
            y = pitTop + Math.random() * (pitBottom - pitTop - 40);
            buried = Math.random() < 0.2; // 20% chance buried
        }
        
        prizes.push({
            id: i,
            x,
            y,
            size,
            rarity,
            reward,
            buried, // Partially under other prizes
            rotation: Math.random() * Math.PI * 2,
            wobble: 0,
            wobbleVelocity: 0,
            grabbed: false,
            slipping: false
        });
    }
    
    // Sort by Y so lower prizes render behind
    prizes.sort((a, b) => a.y - b.y);
    
    return prizes;
}

function rollRarity(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(weights)) {
        roll -= weight;
        if (roll <= 0) return rarity;
    }
    return 'common';
}

// Start a new game attempt
export function startClawGame(callbacks = {}) {
    gameState.callbacks = callbacks;
    gameState.phase = 'positioning';
    gameState.positionTimer = Date.now();
    gameState.grabbedPrize = null;
    gameState.result = null;
    gameState.claw.open = true;
    
    // Reset any grabbed state
    gameState.prizes.forEach(p => {
        p.grabbed = false;
        p.slipping = false;
    });
    
    return gameState;
}

// Move claw left/right
export function moveClaw(direction, canvasWidth) {
    if (gameState.phase !== 'positioning') return;
    
    const speed = 5;
    const minX = 50;
    const maxX = canvasWidth - 50;
    
    if (direction === 'left') {
        gameState.claw.x = Math.max(minX, gameState.claw.x - speed);
    } else if (direction === 'right') {
        gameState.claw.x = Math.min(maxX, gameState.claw.x + speed);
    }
    
    // Add sway from movement
    gameState.claw.swayVelocity += (direction === 'left' ? -0.02 : 0.02);
}

// Drop the claw
export function dropClaw(canvasHeight) {
    if (gameState.phase !== 'positioning') return false;
    
    gameState.phase = 'dropping';
    gameState.claw.targetY = canvasHeight - 130; // Drop to prize level
    
    if (gameState.callbacks.onDrop) {
        gameState.callbacks.onDrop();
    }
    
    return true;
}

// Update claw physics and state
export function updateClaw(deltaTime, canvasWidth, canvasHeight) {
    const claw = gameState.claw;
    
    // Sway physics (damped oscillation)
    const swayDamping = 0.98;
    const swaySpring = 0.003;
    
    claw.swayVelocity -= claw.swayAngle * swaySpring;
    claw.swayVelocity *= swayDamping;
    claw.swayAngle += claw.swayVelocity;
    claw.swayAngle = Math.max(-0.3, Math.min(0.3, claw.swayAngle));
    
    // Phase-specific logic
    switch (gameState.phase) {
        case 'positioning':
            // Check time limit
            const elapsed = Date.now() - gameState.positionTimer;
            if (elapsed > POSITION_TIME_LIMIT) {
                dropClaw(canvasHeight);
            }
            break;
            
        case 'dropping':
            // Move claw down
            const dropSpeed = 4;
            if (claw.y < claw.targetY) {
                claw.y += dropSpeed;
                if (gameState.callbacks.onClawMove) {
                    gameState.callbacks.onClawMove(claw);
                }
            } else {
                // Reached bottom, try to grab
                claw.y = claw.targetY;
                attemptGrab();
            }
            break;
            
        case 'grabbing':
            // Brief pause while claw closes
            claw.open = false;
            setTimeout(() => {
                gameState.phase = 'ascending';
            }, 300);
            gameState.phase = 'ascending-wait';
            break;
            
        case 'ascending-wait':
            // Waiting for grab animation
            break;
            
        case 'ascending':
            // Move claw up with potential slippage
            const ascendSpeed = 2.5;
            if (claw.y > claw.restY) {
                claw.y -= ascendSpeed;
                
                // Update grabbed prize position
                if (gameState.grabbedPrize) {
                    gameState.grabbedPrize.y = claw.y + 30;
                    gameState.grabbedPrize.x = claw.x + Math.sin(claw.swayAngle) * 10;
                    gameState.grabbedPrize.wobble = Math.sin(Date.now() / 100) * 3;
                    
                    // Slip check at intervals
                    if (Math.random() < 0.02) { // ~2% per frame
                        checkSlip();
                    }
                }
                
                if (gameState.callbacks.onClawMove) {
                    gameState.callbacks.onClawMove(claw);
                }
            } else {
                // Reached top, return to center
                gameState.phase = 'returning';
            }
            break;
            
        case 'returning':
            // Move to drop chute (center-left)
            const returnSpeed = 3;
            const chuteX = 60;
            
            if (claw.x > chuteX + 5) {
                claw.x -= returnSpeed;
                claw.swayVelocity -= 0.01;
                
                if (gameState.grabbedPrize) {
                    gameState.grabbedPrize.x = claw.x + Math.sin(claw.swayAngle) * 10;
                    
                    // Extra slip chances near the end (DRAMA!)
                    if (Math.random() < 0.03) {
                        checkSlip();
                    }
                }
            } else {
                // Reached chute - drop prize!
                finishGame(true);
            }
            break;
    }
    
    return gameState;
}

// Attempt to grab a prize at current claw position
function attemptGrab() {
    gameState.phase = 'grabbing';
    
    const claw = gameState.claw;
    const grabX = claw.x;
    const grabY = claw.y + 20;
    
    // Find closest prize within grab radius
    let closestPrize = null;
    let closestDist = Infinity;
    
    for (const prize of gameState.prizes) {
        const dx = prize.x - grabX;
        const dy = prize.y - grabY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Check if within grab range (scaled by prize size)
        const grabRange = claw.grabRadius + prize.size / 2;
        if (dist < grabRange && dist < closestDist) {
            closestPrize = prize;
            closestDist = dist;
        }
    }
    
    if (closestPrize) {
        // Try to grip the prize
        const baseGrip = GRIP_CHANCES[closestPrize.rarity];
        
        // Precision bonus: closer to center = better grip
        const precision = 1 - (closestDist / (claw.grabRadius + closestPrize.size / 2));
        const precisionBonus = precision * 15; // Up to +15% for perfect aim
        
        // Buried penalty
        const buriedPenalty = closestPrize.buried ? 15 : 0;
        
        const finalGripChance = baseGrip + precisionBonus - buriedPenalty;
        const roll = Math.random() * 100;
        
        if (roll < finalGripChance) {
            // Successful grip!
            gameState.grabbedPrize = closestPrize;
            closestPrize.grabbed = true;
            
            if (gameState.callbacks.onGrab) {
                gameState.callbacks.onGrab(closestPrize, true);
            }
        } else {
            // Grip failed
            if (gameState.callbacks.onGrab) {
                gameState.callbacks.onGrab(closestPrize, false);
            }
        }
    } else {
        // Grabbed nothing
        if (gameState.callbacks.onGrab) {
            gameState.callbacks.onGrab(null, false);
        }
    }
}

// Check if prize slips during ascent
function checkSlip() {
    if (!gameState.grabbedPrize) return;
    
    const prize = gameState.grabbedPrize;
    const slipChance = SLIP_CHANCES[prize.rarity];
    
    if (Math.random() * 100 < slipChance) {
        // IT'S SLIPPING!
        prize.slipping = true;
        
        if (gameState.callbacks.onSlip) {
            gameState.callbacks.onSlip(prize);
        }
        
        // 50% chance it actually falls
        setTimeout(() => {
            if (gameState.grabbedPrize === prize && Math.random() < 0.5) {
                // It fell!
                dropPrize();
            } else {
                // Caught it!
                prize.slipping = false;
                if (gameState.callbacks.onCatch) {
                    gameState.callbacks.onCatch(prize);
                }
            }
        }, 500);
    }
}

// Prize falls back
function dropPrize() {
    if (!gameState.grabbedPrize) return;
    
    const prize = gameState.grabbedPrize;
    prize.grabbed = false;
    prize.slipping = false;
    
    // Prize falls back to pit
    prize.y = 350 + Math.random() * 50;
    
    if (gameState.callbacks.onDrop) {
        gameState.callbacks.onDrop(prize);
    }
    
    gameState.grabbedPrize = null;
    
    // Continue ascending with nothing
}

// Finish the game
function finishGame(reachedChute) {
    const prize = gameState.grabbedPrize;
    
    gameState.claw.open = true;
    gameState.phase = 'result';
    
    if (prize && reachedChute) {
        // WIN!
        gameState.result = {
            success: true,
            prize: prize.reward,
            rarity: prize.rarity
        };
        
        // Remove prize from machine
        const idx = gameState.prizes.indexOf(prize);
        if (idx > -1) {
            gameState.prizes.splice(idx, 1);
        }
        
        if (gameState.callbacks.onWin) {
            gameState.callbacks.onWin(prize.reward, prize.rarity);
        }
    } else {
        // LOSE
        gameState.result = {
            success: false,
            prize: null,
            rarity: null
        };
        
        if (gameState.callbacks.onLose) {
            gameState.callbacks.onLose();
        }
    }
    
    gameState.grabbedPrize = null;
}

// Reset claw to starting position
export function resetClaw(canvasWidth) {
    const centerX = canvasWidth / 2;
    gameState.claw.x = centerX;
    gameState.claw.y = gameState.claw.restY;
    gameState.claw.open = true;
    gameState.claw.swayAngle = 0;
    gameState.claw.swayVelocity = 0;
    gameState.phase = 'idle';
    gameState.grabbedPrize = null;
    gameState.result = null;
    
    // Reset prize states
    gameState.prizes.forEach(p => {
        p.grabbed = false;
        p.slipping = false;
    });
}

// Stop the game
export function stopClawGame() {
    gameState.phase = 'idle';
    gameState.callbacks = {};
}

// Getters
export function getClawState() {
    return {
        phase: gameState.phase,
        claw: gameState.claw,
        prizes: gameState.prizes,
        grabbedPrize: gameState.grabbedPrize,
        result: gameState.result,
        timeRemaining: gameState.phase === 'positioning' 
            ? Math.max(0, POSITION_TIME_LIMIT - (Date.now() - gameState.positionTimer))
            : 0
    };
}

export function getClawCost() {
    return CLAW_COST;
}

export function getGripChances() {
    return { ...GRIP_CHANCES };
}

export function getPrizeSizes() {
    return { ...PRIZE_SIZES };
}
