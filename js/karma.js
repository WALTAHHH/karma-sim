// Karma persistence and influence calculations

const KARMA_KEY = 'karma_simulator_karma';
const TOTAL_KARMA_EARNED_KEY = 'karma_simulator_total_earned';
const MIN_KARMA = -100;
const MAX_KARMA = 100;

export function getKarma() {
    const stored = localStorage.getItem(KARMA_KEY);
    return stored ? parseInt(stored, 10) : 0;
}

export function setKarma(value) {
    const clamped = Math.max(MIN_KARMA, Math.min(MAX_KARMA, value));
    localStorage.setItem(KARMA_KEY, clamped.toString());
    return clamped;
}

export function adjustKarma(delta) {
    return setKarma(getKarma() + delta);
}

export function resetKarma() {
    localStorage.removeItem(KARMA_KEY);
}

export function spendKarma(amount) {
    const current = getKarma();
    if (current >= amount) {
        return setKarma(current - amount);
    }
    return false;
}

// === Total Karma Earned (Lifetime) ===
// This tracks ALL karma ever earned, not current balance
// Used for unlocking games and showing progression

export function getTotalKarmaEarned() {
    const stored = localStorage.getItem(TOTAL_KARMA_EARNED_KEY);
    return stored ? parseInt(stored, 10) : 0;
}

export function addToTotalKarmaEarned(amount) {
    if (amount <= 0) return getTotalKarmaEarned();
    const current = getTotalKarmaEarned();
    const newTotal = current + amount;
    localStorage.setItem(TOTAL_KARMA_EARNED_KEY, newTotal.toString());
    return newTotal;
}

export function resetTotalKarmaEarned() {
    localStorage.removeItem(TOTAL_KARMA_EARNED_KEY);
}

// Karma influence on starting conditions
// Returns a modifier (-0.15 to +0.15) for probability biasing
export function getStartingConditionBias() {
    const karma = getKarma();
    // Diminishing returns: use sqrt-like curve
    const normalized = karma / MAX_KARMA; // -1 to 1
    const sign = normalized >= 0 ? 1 : -1;
    return sign * Math.sqrt(Math.abs(normalized)) * 0.15;
}

// Karma influence on agency (choice vs forced events)
// Returns probability (0.4 to 0.8) of getting a choice event
export function getAgencyChance() {
    const karma = getKarma();
    const normalized = karma / MAX_KARMA; // -1 to 1
    // Base 60% choice events, +/- 20% based on karma
    return 0.6 + (normalized * 0.2);
}

// Karma influence on outcome variance
// Returns a multiplier (0.7 to 1.3) for outcome weight adjustment
// Higher karma = outcomes cluster toward median (less extreme)
export function getVarianceMultiplier() {
    const karma = getKarma();
    const normalized = karma / MAX_KARMA; // -1 to 1
    // High karma reduces variance (multiply extreme outcomes by less)
    // Low karma increases variance
    return 1 - (normalized * 0.3);
}

// Apply karma bias to a weighted distribution
// Shifts weights toward higher indices for positive karma
export function biasWeights(weights, bias) {
    if (Math.abs(bias) < 0.01) return weights;

    const shifted = [...weights];
    const len = weights.length;

    if (bias > 0) {
        // Positive karma: shift probability mass upward
        for (let i = 0; i < len - 1; i++) {
            const shift = shifted[i] * bias;
            shifted[i] -= shift;
            shifted[i + 1] += shift;
        }
    } else {
        // Negative karma: shift probability mass downward
        for (let i = len - 1; i > 0; i--) {
            const shift = shifted[i] * Math.abs(bias);
            shifted[i] -= shift;
            shifted[i - 1] += shift;
        }
    }

    return shifted;
}
