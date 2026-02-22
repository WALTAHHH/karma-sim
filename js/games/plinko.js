// Plinko Physics & Game Logic
// Simple 2D physics with bouncy ball and pegs

const PLINKO_COST = 3;
const BASE_PAYOUT = 3;

// Multiplier slots at bottom - edges are high variance
const MULTIPLIERS = [10, 0, 5, 0.5, 3, 1, 2, 1, 3, 0.5, 5, 0, 10];

// Physics constants
const GRAVITY = 0.25;
const BOUNCE_DAMPING = 0.7;
const BOUNCE_RANDOMNESS = 0.15;
const BALL_RADIUS = 8;
const PEG_RADIUS = 6;
const FRICTION = 0.99;

// Board layout
const ROWS = 12;
const COLS = 13; // Bottom slots

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
    onBallMove: null
};

// Initialize game board
export function initPlinkoBoard(width, height) {
    const pegs = [];
    const slots = [];
    
    const pegSpacingX = width / (COLS + 1);
    const pegSpacingY = (height - 100) / (ROWS + 2);
    const startY = 60;
    
    // Create peg pyramid
    for (let row = 0; row < ROWS; row++) {
        const pegsInRow = row + 3; // Start with 3, grow each row
        const rowWidth = pegsInRow * pegSpacingX;
        const startX = (width - rowWidth) / 2 + pegSpacingX / 2;
        
        for (let col = 0; col < pegsInRow; col++) {
            pegs.push({
                x: startX + col * pegSpacingX,
                y: startY + row * pegSpacingY,
                radius: PEG_RADIUS,
                hit: false,
                hitTime: 0
            });
        }
    }
    
    // Create slots at bottom
    const slotWidth = width / COLS;
    const slotY = height - 50;
    
    for (let i = 0; i < COLS; i++) {
        slots.push({
            x: slotWidth / 2 + i * slotWidth,
            y: slotY,
            width: slotWidth - 4,
            height: 40,
            multiplier: MULTIPLIERS[i],
            index: i,
            lit: false
        });
    }
    
    gameState.pegs = pegs;
    gameState.slots = slots;
    
    return { pegs, slots, MULTIPLIERS };
}

// Drop ball from position
export function dropBall(dropX, canvasHeight, callbacks = {}) {
    gameState.ball = {
        x: dropX,
        y: 15,
        vx: (Math.random() - 0.5) * 0.5, // Tiny random initial velocity
        vy: 0,
        radius: BALL_RADIUS
    };
    
    gameState.running = true;
    gameState.result = null;
    gameState.onPegHit = callbacks.onPegHit;
    gameState.onSlotLand = callbacks.onSlotLand;
    gameState.onBallMove = callbacks.onBallMove;
    
    // Reset peg hit states
    gameState.pegs.forEach(peg => {
        peg.hit = false;
        peg.hitTime = 0;
    });
    
    // Start physics loop
    runPhysics(canvasHeight);
    
    return gameState.ball;
}

// Physics simulation
function runPhysics(canvasHeight) {
    if (!gameState.running) return;
    
    const ball = gameState.ball;
    
    // Apply gravity
    ball.vy += GRAVITY;
    
    // Apply friction
    ball.vx *= FRICTION;
    
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Check peg collisions
    gameState.pegs.forEach(peg => {
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
                
                // Mark peg as hit
                if (!peg.hit || Date.now() - peg.hitTime > 100) {
                    peg.hit = true;
                    peg.hitTime = Date.now();
                    
                    if (gameState.onPegHit) {
                        gameState.onPegHit(peg);
                    }
                }
            }
        }
    });
    
    // Wall bounces
    const boardPadding = 20;
    if (ball.x < boardPadding + ball.radius) {
        ball.x = boardPadding + ball.radius;
        ball.vx = Math.abs(ball.vx) * BOUNCE_DAMPING;
    }
    if (ball.x > 380 - boardPadding - ball.radius) { // Assuming ~400 width
        ball.x = 380 - boardPadding - ball.radius;
        ball.vx = -Math.abs(ball.vx) * BOUNCE_DAMPING;
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
            gameState.result = {
                slot: landedSlot,
                multiplier: landedSlot.multiplier,
                payout: BASE_PAYOUT * landedSlot.multiplier
            };
            landedSlot.lit = true;
            
            if (gameState.onSlotLand) {
                gameState.onSlotLand(landedSlot, gameState.result);
            }
            return;
        }
    }
    
    // Notify ball position
    if (gameState.onBallMove) {
        gameState.onBallMove(ball);
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
        result: gameState.result
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
