/**
 * @fileoverview Plinko Physics & Game Logic
 * Juicy 2D physics with bouncy ball and pegs
 * @module games/plinko
 */

/** @constant {number} Cost in karma to play */
const PLINKO_COST = 3;
const BASE_PAYOUT = 3;

// Multiplier slots at bottom - edges are high variance
const MULTIPLIERS = [10, 0, 5, 0.5, 3, 1, 2, 1, 3, 0.5, 5, 0, 10];

// Physics constants - tuned for satisfying feel
const GRAVITY = 0.28;           // Slightly heavier for more weight
const BOUNCE_DAMPING = 0.72;    // Bouncy but not floaty
const BOUNCE_RANDOMNESS = 0.12; // Enough chaos, but feels fair
const BALL_RADIUS = 8;
const PEG_RADIUS = 6;
const FRICTION = 0.995;         // Less friction = more momentum

// Board layout
const ROWS = 12;
const COLS = 13; // Bottom slots

// Lucky peg config
const LUCKY_PEG_CHANCE = 0.03;  // 3% chance per game

// Game state
let gameState = {
    ball: null,
    pegs: [],
    slots: [],
    animationId: null,
    running: false,
    result: null,
    onPegHit: null,
    onSlotLand: null,
    onBallMove: null,
    onNearMiss: null,
    boardWidth: 400,
    boardHeight: 500,
    // Juice state
    hitStreak: 0,
    lastHitTime: 0,
    luckyPegIndex: -1,
    ballTrail: [],
    slowMo: false,
    slowMoTimer: 0
};

// Initialize game board
export function initPlinkoBoard(width, height) {
    const pegs = [];
    const slots = [];
    
    const pegSpacingX = width / (COLS + 1);
    const pegSpacingY = (height - 100) / (ROWS + 2);
    const startY = 60;
    
    // Maybe spawn a lucky peg this game
    const totalPegs = (ROWS * (ROWS + 5)) / 2; // Triangular number
    const luckyIndex = Math.random() < LUCKY_PEG_CHANCE ? 
        Math.floor(Math.random() * totalPegs) : -1;
    let pegIndex = 0;
    
    // Create peg pyramid
    for (let row = 0; row < ROWS; row++) {
        const pegsInRow = row + 3; // Start with 3, grow each row
        const rowWidth = pegsInRow * pegSpacingX;
        const startX = (width - rowWidth) / 2 + pegSpacingX / 2;
        
        for (let col = 0; col < pegsInRow; col++) {
            const isLucky = pegIndex === luckyIndex;
            pegs.push({
                x: startX + col * pegSpacingX,
                y: startY + row * pegSpacingY,
                radius: PEG_RADIUS,
                row: row,
                col: col,
                hit: false,
                hitTime: 0,
                hitCount: 0,
                pulseScale: 1,
                glowIntensity: 0,
                isLucky: isLucky
            });
            pegIndex++;
        }
    }
    
    // Create slots at bottom
    const slotWidth = width / COLS;
    const slotY = height - 50;
    
    for (let i = 0; i < COLS; i++) {
        const mult = MULTIPLIERS[i];
        slots.push({
            x: slotWidth / 2 + i * slotWidth,
            y: slotY,
            width: slotWidth - 4,
            height: 40,
            multiplier: mult,
            index: i,
            lit: false,
            glowIntensity: 0,
            isJackpot: mult === 10,
            isBust: mult === 0
        });
    }
    
    gameState.pegs = pegs;
    gameState.slots = slots;
    gameState.boardWidth = width;
    gameState.boardHeight = height;
    gameState.luckyPegIndex = luckyIndex;
    
    return { pegs, slots, MULTIPLIERS, hasLuckyPeg: luckyIndex >= 0 };
}

// Drop ball from position
export function dropBall(dropX, canvasHeight, callbacks = {}) {
    gameState.ball = {
        x: dropX,
        y: 15,
        vx: (Math.random() - 0.5) * 0.5, // Tiny random initial velocity
        vy: 0,
        radius: BALL_RADIUS,
        // Juice properties
        spin: 0,              // Visual rotation
        stretch: 1,           // Squash/stretch based on velocity
        lastBounceTime: 0,
        bounceCount: 0
    };
    
    // Reset juice state
    gameState.running = true;
    gameState.result = null;
    gameState.hitStreak = 0;
    gameState.lastHitTime = 0;
    gameState.ballTrail = [];
    gameState.slowMo = false;
    gameState.slowMoTimer = 0;
    
    // Callbacks
    gameState.onPegHit = callbacks.onPegHit;
    gameState.onSlotLand = callbacks.onSlotLand;
    gameState.onBallMove = callbacks.onBallMove;
    gameState.onNearMiss = callbacks.onNearMiss;
    
    // Reset peg hit states
    gameState.pegs.forEach(peg => {
        peg.hit = false;
        peg.hitTime = 0;
        peg.hitCount = 0;
        peg.pulseScale = 1;
        peg.glowIntensity = 0;
    });
    
    // Reset slot glows
    gameState.slots.forEach(slot => {
        slot.lit = false;
        slot.glowIntensity = 0;
    });
    
    // Start physics loop
    runPhysics(canvasHeight);
    
    return gameState.ball;
}

// Physics simulation
function runPhysics(canvasHeight) {
    if (!gameState.running) return;
    
    const ball = gameState.ball;
    const now = Date.now();
    
    // Slow-mo effect for dramatic moments
    const timeScale = gameState.slowMo ? 0.3 : 1;
    
    // Record trail position
    gameState.ballTrail.push({ x: ball.x, y: ball.y, time: now });
    // Keep only recent trail points (last 200ms)
    gameState.ballTrail = gameState.ballTrail.filter(p => now - p.time < 200);
    
    // Apply gravity (scaled by time)
    ball.vy += GRAVITY * timeScale;
    
    // Apply friction
    ball.vx *= Math.pow(FRICTION, timeScale);
    
    // Move ball
    ball.x += ball.vx * timeScale;
    ball.y += ball.vy * timeScale;
    
    // Update spin based on horizontal velocity (visual only)
    ball.spin += ball.vx * 0.15 * timeScale;
    
    // Calculate stretch based on velocity (squash/stretch effect)
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const targetStretch = 1 + Math.min(speed * 0.02, 0.3);
    ball.stretch = ball.stretch + (targetStretch - ball.stretch) * 0.3;
    
    // Decay hit streak if no recent hits
    if (now - gameState.lastHitTime > 300) {
        gameState.hitStreak = Math.max(0, gameState.hitStreak - 1);
    }
    
    // Check peg collisions
    gameState.pegs.forEach((peg, pegIndex) => {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball.radius + peg.radius;
        
        if (dist < minDist && dist > 0) {
            // Collision! Reflect velocity
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Relative velocity
            const relVel = ball.vx * nx + ball.vy * ny;
            
            // Only bounce if moving toward peg
            if (relVel < 0) {
                // Calculate impact strength for effects
                const impactStrength = Math.abs(relVel);
                
                // Reflect with damping
                const bounce = (1 + BOUNCE_DAMPING) * relVel;
                ball.vx -= bounce * nx;
                ball.vy -= bounce * ny;
                
                // Add randomness for unpredictability
                ball.vx += (Math.random() - 0.5) * BOUNCE_RANDOMNESS * Math.abs(ball.vy);
                
                // Push ball out of peg
                const overlap = minDist - dist;
                ball.x += nx * overlap;
                ball.y += ny * overlap;
                
                // Add spin from glancing hits
                ball.spin += (nx * ball.vy - ny * ball.vx) * 0.1;
                
                // Squash on impact
                ball.stretch = 0.7;
                
                // Track bounce
                ball.bounceCount++;
                ball.lastBounceTime = now;
                
                // Mark peg as hit with enhanced state
                if (!peg.hit || now - peg.hitTime > 80) {
                    peg.hit = true;
                    peg.hitTime = now;
                    peg.hitCount++;
                    peg.pulseScale = 1.4; // Pop effect
                    peg.glowIntensity = Math.min(1, impactStrength * 0.3);
                    
                    // Track hit streak
                    gameState.hitStreak = Math.min(gameState.hitStreak + 1, 10);
                    gameState.lastHitTime = now;
                    
                    if (gameState.onPegHit) {
                        gameState.onPegHit(peg, {
                            row: peg.row,
                            impactStrength,
                            hitStreak: gameState.hitStreak,
                            isLucky: peg.isLucky,
                            ballVelocity: speed,
                            progress: peg.y / canvasHeight // How far down the board
                        });
                    }
                }
            }
        }
        
        // Decay peg effects
        peg.pulseScale = 1 + (peg.pulseScale - 1) * 0.85;
        peg.glowIntensity *= 0.92;
    });
    
    // Wall bounces
    const boardPadding = 20;
    if (ball.x < boardPadding + ball.radius) {
        ball.x = boardPadding + ball.radius;
        ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
        ball.spin -= 0.5; // Wall spin
    }
    if (ball.x > gameState.boardWidth - boardPadding - ball.radius) {
        ball.x = gameState.boardWidth - boardPadding - ball.radius;
        ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
        ball.spin += 0.5; // Wall spin
    }
    
    // Near-miss detection for jackpot slots (10x)
    const jackpotSlots = gameState.slots.filter(s => s.isJackpot);
    const approachingBottom = ball.y > canvasHeight - 150;
    
    if (approachingBottom) {
        jackpotSlots.forEach(slot => {
            const distToSlot = Math.abs(ball.x - slot.x);
            if (distToSlot < 40) {
                slot.glowIntensity = Math.max(slot.glowIntensity, 1 - distToSlot / 40);
            }
        });
    }
    
    // Check slot landing
    const slotY = canvasHeight - 60;
    if (ball.y > slotY) {
        // Find which slot
        const landedSlot = gameState.slots.find(slot => {
            return ball.x > slot.x - slot.width / 2 && 
                   ball.x < slot.x + slot.width / 2;
        });
        
        if (landedSlot) {
            gameState.running = false;
            
            // Check for near misses (adjacent to jackpot)
            const jackpotIndices = [0, 12];
            const isNearMiss = !landedSlot.isJackpot && 
                jackpotIndices.some(ji => Math.abs(landedSlot.index - ji) === 1);
            
            gameState.result = {
                slot: landedSlot,
                multiplier: landedSlot.multiplier,
                payout: BASE_PAYOUT * landedSlot.multiplier,
                bounceCount: ball.bounceCount,
                isNearMiss,
                isBust: landedSlot.isBust,
                isJackpot: landedSlot.isJackpot
            };
            landedSlot.lit = true;
            
            // Trigger slow-mo for big wins (will be handled in UI)
            if (landedSlot.multiplier >= 5) {
                gameState.slowMo = true;
            }
            
            if (gameState.onSlotLand) {
                gameState.onSlotLand(landedSlot, gameState.result);
            }
            
            // Near miss callback
            if (isNearMiss && gameState.onNearMiss) {
                gameState.onNearMiss(landedSlot);
            }
            return;
        }
    }
    
    // Update slot glows (decay)
    gameState.slots.forEach(slot => {
        slot.glowIntensity *= 0.95;
    });
    
    // Notify ball position with extra data
    if (gameState.onBallMove) {
        gameState.onBallMove(ball, {
            trail: gameState.ballTrail,
            hitStreak: gameState.hitStreak,
            progress: ball.y / canvasHeight,
            speed
        });
    }
    
    // Handle slow-mo timer
    if (gameState.slowMo) {
        gameState.slowMoTimer++;
        if (gameState.slowMoTimer > 60) { // ~1 second of slow-mo
            gameState.slowMo = false;
            gameState.slowMoTimer = 0;
        }
    }
    
    // Continue physics
    gameState.animationId = requestAnimationFrame(() => runPhysics(canvasHeight));
}

// Stop game
export function stopPlinko() {
    gameState.running = false;
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
}

// Get game state
export function getPlinkoState() {
    return {
        ball: gameState.ball,
        pegs: gameState.pegs,
        slots: gameState.slots,
        running: gameState.running,
        result: gameState.result,
        // Juice state
        ballTrail: gameState.ballTrail,
        hitStreak: gameState.hitStreak,
        slowMo: gameState.slowMo,
        luckyPegIndex: gameState.luckyPegIndex
    };
}

// Get cost and payouts
export function getPlinkoCost() {
    return PLINKO_COST;
}

export function getPlinkoBasePayout() {
    return BASE_PAYOUT;
}

export function getPlinkoMultipliers() {
    return MULTIPLIERS;
}

// Get multiplier rarity for theming
export function getMultiplierRarity(mult) {
    if (mult === 10) return 'legendary';
    if (mult === 5) return 'epic';
    if (mult === 3) return 'rare';
    if (mult >= 1) return 'uncommon';
    if (mult === 0.5) return 'common';
    return 'lose'; // 0x
}

// Get drop positions (left, center, right bias)
export function getDropPositions(canvasWidth) {
    const center = canvasWidth / 2;
    const spread = canvasWidth * 0.2;
    
    return {
        left: center - spread,
        center: center,
        right: center + spread,
        random: center + (Math.random() - 0.5) * spread * 2
    };
}
