// Tarot Card Component for Karma Sim
// Hindu/Vedic inspired choice presentation

// Card name mappings based on choice context
const CARD_ARCHETYPES = {
    // Positive/growth cards
    wisdom: { name: 'The Seeker', symbol: '☸', color: 'var(--tarot-indigo)' },
    knowledge: { name: 'The Scholar', symbol: '📿', color: 'var(--tarot-indigo)' },
    truth: { name: 'The Witness', symbol: '👁', color: 'var(--tarot-purple)' },
    
    // Material/wealth cards
    wealth: { name: 'The Merchant', symbol: '🪷', color: 'var(--tarot-gold)' },
    prosperity: { name: 'The Harvest', symbol: '🌾', color: 'var(--tarot-gold)' },
    ambition: { name: 'The Climber', symbol: '🏔', color: 'var(--tarot-gold)' },
    
    // Social/connection cards
    connection: { name: 'The Bridge', symbol: '🙏', color: 'var(--tarot-lotus)' },
    family: { name: 'The Hearth', symbol: '🏠', color: 'var(--tarot-lotus)' },
    love: { name: 'The Lotus', symbol: '❤', color: 'var(--tarot-lotus)' },
    
    // Health/vitality cards
    health: { name: 'The Vessel', symbol: '🫀', color: 'var(--tarot-green)' },
    rest: { name: 'The Dreamer', symbol: '🌙', color: 'var(--tarot-purple)' },
    strength: { name: 'The Warrior', symbol: '⚔', color: 'var(--tarot-green)' },
    
    // Transformation/risk cards
    change: { name: 'The Wanderer', symbol: '🌀', color: 'var(--tarot-purple)' },
    risk: { name: 'The Gambler', symbol: '🎲', color: 'var(--tarot-red)' },
    sacrifice: { name: 'The Offering', symbol: '🔥', color: 'var(--tarot-red)' },
    
    // Default/neutral
    default: { name: 'The Path', symbol: 'ॐ', color: 'var(--tarot-indigo)' }
};

// Keywords to archetype mapping for choice analysis
const KEYWORD_MAP = {
    // Wisdom/Knowledge
    study: 'knowledge', learn: 'knowledge', education: 'knowledge', book: 'knowledge',
    think: 'wisdom', consider: 'wisdom', reflect: 'wisdom', meditate: 'wisdom',
    truth: 'truth', honest: 'truth', reveal: 'truth',
    
    // Wealth/Ambition
    money: 'wealth', gold: 'wealth', rich: 'wealth', earn: 'wealth', invest: 'wealth',
    work: 'ambition', career: 'ambition', job: 'ambition', business: 'ambition',
    grow: 'prosperity', harvest: 'prosperity', save: 'prosperity',
    
    // Social/Connection
    friend: 'connection', help: 'connection', community: 'connection', together: 'connection',
    family: 'family', parent: 'family', child: 'family', home: 'family',
    love: 'love', heart: 'love', marry: 'love', partner: 'love',
    
    // Health/Rest
    health: 'health', heal: 'health', doctor: 'health', medicine: 'health',
    rest: 'rest', sleep: 'rest', relax: 'rest', peace: 'rest',
    strong: 'strength', fight: 'strength', defend: 'strength', protect: 'strength',
    
    // Change/Risk
    leave: 'change', move: 'change', new: 'change', travel: 'change', journey: 'change',
    risk: 'risk', gamble: 'risk', chance: 'risk', bet: 'risk',
    give: 'sacrifice', sacrifice: 'sacrifice', lose: 'sacrifice', cost: 'sacrifice'
};

/**
 * Analyze choice text to determine card archetype
 */
function analyzeChoiceText(text) {
    const lowerText = text.toLowerCase();
    const scores = {};
    
    for (const [keyword, archetype] of Object.entries(KEYWORD_MAP)) {
        if (lowerText.includes(keyword)) {
            scores[archetype] = (scores[archetype] || 0) + 1;
        }
    }
    
    // Find highest scoring archetype
    let bestArchetype = 'default';
    let bestScore = 0;
    
    for (const [archetype, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestArchetype = archetype;
        }
    }
    
    return CARD_ARCHETYPES[bestArchetype];
}

/**
 * Extract effect preview from option data
 */
function formatEffectPreview(option) {
    if (!option.preview) return null;
    
    const parts = [];
    
    // Use preview description if available
    if (option.preview.description) {
        return option.preview.description;
    }
    
    // Or build from gains/risks
    if (option.preview.gains) {
        parts.push(`+${option.preview.gains}`);
    }
    if (option.preview.risks) {
        parts.push(`-${option.preview.risks}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Create a single tarot card element
 */
export function createTarotCard(option, index, onSelect) {
    const archetype = analyzeChoiceText(option.text);
    const effectPreview = formatEffectPreview(option);
    
    // Card container (for 3D flip)
    const card = document.createElement('div');
    card.className = 'tarot-card';
    card.setAttribute('data-index', index);
    
    // Inner container for flip animation
    const cardInner = document.createElement('div');
    cardInner.className = 'tarot-card-inner';
    
    // === CARD BACK ===
    const cardBack = document.createElement('div');
    cardBack.className = 'tarot-card-face tarot-card-back';
    
    // Mandala pattern (CSS will handle the design)
    const mandala = document.createElement('div');
    mandala.className = 'tarot-mandala';
    mandala.innerHTML = `
        <div class="mandala-ring ring-1"></div>
        <div class="mandala-ring ring-2"></div>
        <div class="mandala-ring ring-3"></div>
        <div class="mandala-center">ॐ</div>
    `;
    cardBack.appendChild(mandala);
    
    // Corner decorations
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach(pos => {
        const corner = document.createElement('div');
        corner.className = `tarot-corner tarot-corner-${pos}`;
        corner.innerHTML = '☸';
        cardBack.appendChild(corner);
    });
    
    // === CARD FRONT ===
    const cardFront = document.createElement('div');
    cardFront.className = 'tarot-card-face tarot-card-front';
    cardFront.style.setProperty('--card-accent', archetype.color);
    
    // Top border decoration
    const topBorder = document.createElement('div');
    topBorder.className = 'tarot-border tarot-border-top';
    topBorder.innerHTML = `<span class="border-symbol">ॐ</span><span class="border-symbol">${archetype.symbol}</span><span class="border-symbol">ॐ</span>`;
    cardFront.appendChild(topBorder);
    
    // Card name
    const cardName = document.createElement('div');
    cardName.className = 'tarot-name';
    cardName.textContent = archetype.name;
    cardFront.appendChild(cardName);
    
    // Symbol area (placeholder for future art)
    const symbolArea = document.createElement('div');
    symbolArea.className = 'tarot-symbol-area';
    symbolArea.innerHTML = `<span class="tarot-main-symbol">${archetype.symbol}</span>`;
    cardFront.appendChild(symbolArea);
    
    // Flavor text (the choice description)
    const flavorText = document.createElement('div');
    flavorText.className = 'tarot-flavor';
    flavorText.textContent = option.text;
    cardFront.appendChild(flavorText);
    
    // Effect preview
    if (effectPreview) {
        const effectEl = document.createElement('div');
        effectEl.className = 'tarot-effect';
        effectEl.textContent = effectPreview;
        cardFront.appendChild(effectEl);
    }
    
    // Bottom border decoration
    const bottomBorder = document.createElement('div');
    bottomBorder.className = 'tarot-border tarot-border-bottom';
    bottomBorder.innerHTML = `<span class="lotus-symbol">❁</span>`;
    cardFront.appendChild(bottomBorder);
    
    // Assemble card
    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    card.appendChild(cardInner);
    
    // Event listeners
    card.addEventListener('click', () => {
        if (card.classList.contains('revealed') && !card.classList.contains('selecting') && !card.classList.contains('dismissed')) {
            selectCard(card, index, onSelect);
        }
    });
    
    return card;
}

/**
 * Handle card selection
 */
function selectCard(card, index, onSelect) {
    const container = card.closest('.tarot-spread');
    if (!container) return;
    
    // Mark this card as selecting
    card.classList.add('selecting');
    
    // Dismiss other cards
    const allCards = container.querySelectorAll('.tarot-card');
    allCards.forEach(c => {
        if (c !== card) {
            c.classList.add('dismissed');
        }
    });
    
    // After animation, trigger callback
    setTimeout(() => {
        onSelect(index);
    }, 600);
}

/**
 * Create a spread of tarot cards for event choices
 */
export function createTarotSpread(options, onChoice) {
    const spread = document.createElement('div');
    spread.className = 'tarot-spread';
    spread.setAttribute('data-card-count', options.length);
    
    options.forEach((option, index) => {
        const card = createTarotCard(option, index, onChoice);
        spread.appendChild(card);
    });
    
    return spread;
}

/**
 * Reveal cards with staggered animation
 */
export function revealCards(spreadElement, delay = 300) {
    const cards = spreadElement.querySelectorAll('.tarot-card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('revealed');
        }, delay * (index + 1));
    });
}

/**
 * Show tarot card choices (main entry point)
 * Replaces showChoices for event selection
 */
export function showTarotChoices(options, onChoice, containerEl) {
    // Clear container
    containerEl.innerHTML = '';
    
    // Create and append spread
    const spread = createTarotSpread(options, onChoice);
    containerEl.appendChild(spread);
    
    // Reveal cards after brief delay for dramatic effect
    setTimeout(() => {
        revealCards(spread);
    }, 200);
}
