// DOM rendering utilities

import { getAchievement, achievements, getUnlockedAchievements, getAchievementCount } from './achievements.js';
import { countries } from './countries.js';
import { eras } from './eras.js';
import { jobCategories } from './jobs.js';
import {
    getUnlockedCountries,
    getUnlockedEras,
    getUnlockedJobCategories,
    getUnlockProgress,
    getEraUnlockProgress,
    getJobCategoryUnlockProgress,
    getCountryUnlockCost,
    getEraUnlockCost,
    getJobCategoryUnlockCost
} from './unlocks.js';
import {
    selectBirthArt,
    selectDeathArt,
    selectEventArt,
    selectRevelationArt
} from './asciiArt.js';
import {
    getTagById,
    tags,
    getDiscoveredTags,
    getTagDiscoveryProgress
} from './tags.js';

function getContentEl() {
    return document.getElementById('content');
}

function getChoicesEl() {
    return document.getElementById('choices');
}

export function clear() {
    getContentEl().innerHTML = '';
    getChoicesEl().innerHTML = '';
    // Also remove the life arc if present
    const existingArc = document.querySelector('.life-arc');
    if (existingArc) {
        existingArc.remove();
    }
}

// ============================================
// INLINE STATS DISPLAY (during gameplay)
// ============================================

// Render inline stats in the main game area
export function renderInlineStats(life) {
    const container = document.getElementById('inline-stats');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const stats = [
        { key: 'health', label: 'Health', value: life.health },
        { key: 'wealth', label: 'Wealth', value: life.wealth },
        { key: 'education', label: 'Education', value: life.education },
        { key: 'connections', label: 'Connections', value: life.connections }
    ];

    stats.forEach(stat => {
        const statEl = document.createElement('div');
        statEl.className = 'inline-stat';
        statEl.setAttribute('data-stat', stat.key);

        const labelEl = document.createElement('div');
        labelEl.className = 'inline-stat-label';
        labelEl.textContent = stat.label;

        const valueEl = document.createElement('div');
        valueEl.className = 'inline-stat-value';
        valueEl.textContent = stat.value;

        const barEl = document.createElement('div');
        barEl.className = 'inline-stat-bar';
        for (let i = 1; i <= 5; i++) {
            const pip = document.createElement('div');
            pip.className = `inline-stat-pip ${i <= stat.value ? 'filled ' + stat.key : ''}`;
            barEl.appendChild(pip);
        }

        statEl.appendChild(labelEl);
        statEl.appendChild(valueEl);
        statEl.appendChild(barEl);
        container.appendChild(statEl);
    });
}

// Update inline stats with change feedback
export function updateInlineStats(life, changes = null) {
    const container = document.getElementById('inline-stats');
    if (!container) return;

    const stats = [
        { key: 'health', label: 'Health', value: life.health },
        { key: 'wealth', label: 'Wealth', value: life.wealth },
        { key: 'education', label: 'Education', value: life.education },
        { key: 'connections', label: 'Connections', value: life.connections }
    ];

    stats.forEach(stat => {
        const statEl = container.querySelector(`[data-stat="${stat.key}"]`);
        if (!statEl) return;

        const valueEl = statEl.querySelector('.inline-stat-value');
        const barEl = statEl.querySelector('.inline-stat-bar');

        // Update value
        if (valueEl) {
            valueEl.textContent = stat.value;
        }

        // Update pips
        if (barEl) {
            const pips = barEl.querySelectorAll('.inline-stat-pip');
            pips.forEach((pip, i) => {
                pip.className = `inline-stat-pip ${i < stat.value ? 'filled ' + stat.key : ''}`;
            });
        }

        // Show change indicator if there's a change
        if (changes && changes[stat.key]) {
            const change = changes[stat.key];
            showStatChangeIndicator(statEl, change);
        }
    });
}

// Show floating stat change indicator
function showStatChangeIndicator(statEl, change) {
    // Remove any existing indicator
    const existing = statEl.querySelector('.stat-change-indicator');
    if (existing) existing.remove();

    // Add flash class
    statEl.classList.remove('flash-positive', 'flash-negative');
    void statEl.offsetWidth; // Force reflow for animation restart
    statEl.classList.add(change > 0 ? 'flash-positive' : 'flash-negative');

    // Create and show indicator
    const indicator = document.createElement('div');
    indicator.className = `stat-change-indicator ${change > 0 ? 'positive' : 'negative'}`;
    indicator.textContent = change > 0 ? `+${change}` : `${change}`;
    statEl.appendChild(indicator);

    // Remove indicator after animation
    setTimeout(() => {
        indicator.remove();
        statEl.classList.remove('flash-positive', 'flash-negative');
    }, 1500);
}

// Hide inline stats (when not in gameplay)
export function hideInlineStats() {
    const container = document.getElementById('inline-stats');
    if (container) {
        container.classList.add('hidden');
    }
}

// ============================================
// HELP MODAL
// ============================================

// Show the "How to Play" modal
export function showHelpModal(onClose = null) {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    modal.classList.remove('fade-out');
    
    const closeBtn = document.getElementById('help-modal-close');
    
    // Remove any existing listener and add new one
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', () => {
        hideHelpModal();
        if (onClose) onClose();
    });
    
    // Also close on overlay click (outside modal)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideHelpModal();
            if (onClose) onClose();
        }
    }, { once: true });
}

// Hide the help modal
export function hideHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    
    modal.classList.add('fade-out');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('fade-out');
    }, 300);
}

// Display the title screen / landing page
// Options object can contain: { hasCompletedFirstRun: boolean }
export function showTitleScreen(onBegin, onCollections, runHistory = null, onGacha = null, karma = 0, options = {}) {
    const contentEl = getContentEl();
    const choicesEl = getChoicesEl();

    contentEl.innerHTML = '';
    choicesEl.innerHTML = '';

    // Check if player has completed their first run
    const hasCompletedFirstRun = options.hasCompletedFirstRun || (runHistory && runHistory.length > 0);

    // Create title screen container
    const titleScreen = document.createElement('div');
    titleScreen.className = 'title-screen';

    // Icon (dharma wheel / cycle symbol)
    const icon = document.createElement('div');
    icon.className = 'title-icon';
    icon.textContent = '☸';
    titleScreen.appendChild(icon);

    // Game title
    const title = document.createElement('div');
    title.className = 'title-name';
    title.textContent = 'KARMA';
    titleScreen.appendChild(title);

    // Tagline
    const tagline = document.createElement('div');
    tagline.className = 'title-tagline';
    tagline.textContent = 'Lives echo forward.';
    titleScreen.appendChild(tagline);

    // Menu buttons container
    const menu = document.createElement('div');
    menu.className = 'title-menu';

    // Begin button
    const beginBtn = document.createElement('button');
    beginBtn.className = 'begin-button';
    beginBtn.textContent = 'Begin';
    beginBtn.addEventListener('click', onBegin);
    menu.appendChild(beginBtn);

    // Gacha button (if karma > 0 and callback provided) - only show after first run
    if (onGacha && karma > 0 && hasCompletedFirstRun) {
        const gachaBtn = document.createElement('button');
        gachaBtn.className = 'begin-button gacha-title-btn';
        gachaBtn.innerHTML = '🎮 Game Hub';
        gachaBtn.addEventListener('click', () => onGacha(karma));
        menu.appendChild(gachaBtn);
    }

    // Collections button - only show after first run
    if (hasCompletedFirstRun) {
        const collectionsBtn = document.createElement('button');
        collectionsBtn.className = 'begin-button secondary';
        collectionsBtn.textContent = 'Collections';
        collectionsBtn.addEventListener('click', onCollections);
        menu.appendChild(collectionsBtn);
    }

    // How to Play button - only show after first run
    if (hasCompletedFirstRun) {
        const helpBtn = document.createElement('button');
        helpBtn.className = 'begin-button secondary';
        helpBtn.textContent = 'How to Play';
        helpBtn.addEventListener('click', () => showHelpModal());
        menu.appendChild(helpBtn);
    }

    titleScreen.appendChild(menu);
    contentEl.appendChild(titleScreen);

    // Show run history below if available
    if (runHistory && runHistory.length > 0) {
        showRunHistory(runHistory);
    }
}

// Show country picker screen for players who have unlocked country selection
export function showCountryPicker(unlockedCountries, allCountries, onSelect, onRandom, onCancel) {
    const contentEl = getContentEl();
    const choicesEl = getChoicesEl();

    contentEl.innerHTML = '';
    choicesEl.innerHTML = '';

    // State for tracking selection
    let selectedCountry = null;

    // Title
    const header = document.createElement('div');
    header.className = 'country-picker-header';
    header.innerHTML = '<h2>Choose Your Starting Country</h2><p>Select where your next life begins, or leave it to fate.</p>';
    contentEl.appendChild(header);

    // Country grid
    const grid = document.createElement('div');
    grid.className = 'country-picker-grid';

    // Create confirm button early so it can be referenced in click handlers
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'begin-button disabled';
    confirmBtn.textContent = 'Confirm Selection';
    confirmBtn.disabled = true;
    confirmBtn.addEventListener('click', () => {
        if (selectedCountry) {
            onSelect(selectedCountry);
        }
    });

    // Sort countries: unlocked first, then alphabetically
    const sortedCountries = [...allCountries].sort((a, b) => {
        const aUnlocked = unlockedCountries.some(c => c.id === a.id);
        const bUnlocked = unlockedCountries.some(c => c.id === b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return a.name.localeCompare(b.name);
    });

    sortedCountries.forEach(country => {
        const isUnlocked = unlockedCountries.some(c => c.id === country.id);
        const card = document.createElement('div');
        card.className = 'country-picker-card' + (isUnlocked ? ' unlocked' : ' locked');
        card.setAttribute('data-country-id', country.id);

        if (isUnlocked) {
            card.innerHTML = `<span class="country-name">${country.name}</span>`;
            card.addEventListener('click', () => {
                // Remove selection from other cards
                grid.querySelectorAll('.country-picker-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                // Enable confirm button
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('disabled');
                selectedCountry = country;
            });
        } else {
            card.innerHTML = `<span class="country-name locked-name">?</span>`;
        }

        grid.appendChild(card);
    });

    contentEl.appendChild(grid);

    // Random button
    const randomBtn = document.createElement('button');
    randomBtn.className = 'begin-button';
    randomBtn.textContent = 'Random Country';
    randomBtn.addEventListener('click', onRandom);
    choicesEl.appendChild(randomBtn);

    // Add confirm button to choices
    choicesEl.appendChild(confirmBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'begin-button secondary';
    cancelBtn.textContent = 'Back';
    cancelBtn.addEventListener('click', onCancel);
    choicesEl.appendChild(cancelBtn);
}

export function showText(lines) {
    const contentEl = getContentEl();
    contentEl.innerHTML = '';
    const texts = Array.isArray(lines) ? lines : [lines];
    texts.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        contentEl.appendChild(p);
    });
}

export function appendText(text) {
    const p = document.createElement('p');
    p.textContent = text;
    getContentEl().appendChild(p);
}

// Show outcome with reference to the choice made
// Creates a sense of connection between choice and consequence
export function showOutcomeWithChoice(outcomeText, choiceText = null) {
    const contentEl = getContentEl();
    contentEl.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'outcome-container';
    
    // Echo the choice made (if we have it)
    if (choiceText) {
        const echoEl = document.createElement('div');
        echoEl.className = 'outcome-choice-echo';
        echoEl.textContent = `You chose to ${choiceText.toLowerCase().replace(/^(to )?/, '')}...`;
        container.appendChild(echoEl);
    }
    
    // Show the outcome
    const outcomeEl = document.createElement('p');
    outcomeEl.className = 'outcome-description';
    outcomeEl.textContent = outcomeText;
    container.appendChild(outcomeEl);
    
    contentEl.appendChild(container);
}

// Display ASCII art in the content area
export function showAsciiArt(art, className = '') {
    if (!art) return;

    const contentEl = getContentEl();
    const pre = document.createElement('pre');
    pre.className = 'ascii-art' + (className ? ' ' + className : '');
    pre.textContent = art;
    contentEl.appendChild(pre);
}

// Display birth art based on life context
export function showBirthArt(life) {
    const art = selectBirthArt(life);
    showAsciiArt(art, 'birth-art');
}

// Display death art based on life circumstances
export function showDeathArt(life) {
    const art = selectDeathArt(life);
    showAsciiArt(art, 'death-art');
}

// Display event art based on event type
export function showEventArt(event) {
    const art = selectEventArt(event);
    showAsciiArt(art, 'event-art');
}

export function showChoices(options, onChoice, tradeoffInfo = null) {
    const choicesEl = getChoicesEl();
    choicesEl.innerHTML = '';
    
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice';

        // Add choice text
        const textEl = document.createElement('span');
        textEl.className = 'choice-text';
        textEl.textContent = option.text;
        btn.appendChild(textEl);

        // Add preview hint (shows what this choice is about)
        const previewText = option.preview?.description || null;
        if (previewText) {
            const previewEl = document.createElement('div');
            previewEl.className = 'tradeoff-preview';
            const descEl = document.createElement('span');
            descEl.className = 'preview-desc';
            descEl.textContent = previewText;
            previewEl.appendChild(descEl);
            btn.appendChild(previewEl);
        }

        // Commitment flow: click triggers a brief "committing" state before resolving
        btn.addEventListener('click', () => {
            // Mark this choice as committing
            btn.classList.add('committing');
            choicesEl.classList.add('has-committed');
            
            // Store the choice text for the outcome to reference
            window._lastChoiceText = option.text;
            window._lastChoicePreview = previewText;
            
            // Brief pause to let the commitment feel weighty, then resolve
            setTimeout(() => {
                onChoice(index);
            }, 400);
        });
        
        choicesEl.appendChild(btn);
    });
}

// Create trade-off preview element for choice buttons
// Only shows the description hint - stat changes are hidden from player
function createTradeoffPreview(preview, clarityConfig) {
    if (!preview) return null;
    if (!preview.description) return null;

    const previewEl = document.createElement('div');
    previewEl.className = 'tradeoff-preview';

    const descEl = document.createElement('span');
    descEl.className = 'preview-desc';
    descEl.textContent = preview.description;
    previewEl.appendChild(descEl);

    return previewEl;
}

// Show hidden cost revelation overlay
export function showHiddenCostReveal(cost, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'hidden-cost-overlay';

    const reveal = document.createElement('div');
    reveal.className = 'hidden-cost-reveal';

    // ASCII art for revelation
    const art = selectRevelationArt();
    if (art) {
        const artEl = document.createElement('pre');
        artEl.className = 'ascii-art revelation-art';
        artEl.textContent = art;
        reveal.appendChild(artEl);
    }

    // Header
    const label = document.createElement('div');
    label.className = 'hidden-cost-label';
    label.textContent = 'Consequences Unfold';
    reveal.appendChild(label);

    // Description
    const description = document.createElement('div');
    description.className = 'hidden-cost-description';
    description.textContent = cost.description;
    reveal.appendChild(description);

    // Effects
    if (cost.effects && Object.keys(cost.effects).length > 0) {
        const effects = document.createElement('div');
        effects.className = 'hidden-cost-effects';

        for (const [stat, delta] of Object.entries(cost.effects)) {
            const effectEl = document.createElement('span');
            effectEl.className = delta > 0 ? 'effect-positive' : 'effect-negative';
            const sign = delta > 0 ? '+' : '';
            const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
            effectEl.textContent = `${sign}${delta} ${statName}`;
            effects.appendChild(effectEl);
        }

        reveal.appendChild(effects);
    }

    // Continue button
    const continueBtn = document.createElement('button');
    continueBtn.className = 'hidden-cost-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 500);
    });
    reveal.appendChild(continueBtn);

    overlay.appendChild(reveal);
    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 600);
}

export function showButton(text, onClick, secondary = false) {
    const choicesEl = getChoicesEl();
    if (!secondary) {
        choicesEl.innerHTML = '';
    }
    const btn = document.createElement('button');
    btn.className = 'begin-button' + (secondary ? ' secondary' : '');
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    choicesEl.appendChild(btn);
}

// Show a forced event (single option) with appropriate styling
// These are moments where life happens TO you, not choices you make
export function showForcedEvent(optionText, onClick) {
    const choicesEl = getChoicesEl();
    choicesEl.innerHTML = '';
    
    const btn = document.createElement('button');
    btn.className = 'begin-button forced-event';
    btn.textContent = optionText;
    btn.addEventListener('click', onClick);
    choicesEl.appendChild(btn);
}

// Render the life arc progress indicator
export function renderLifeArc(eventCount, maxEvents) {
    // Remove existing arc if present
    const existingArc = document.querySelector('.life-arc');
    if (existingArc) {
        existingArc.remove();
    }

    const arc = document.createElement('div');
    arc.className = 'life-arc';

    // Create the curved top
    const curve = document.createElement('div');
    curve.className = 'arc-curve';
    arc.appendChild(curve);

    // Create the path with dots
    const path = document.createElement('div');
    path.className = 'arc-path';

    // Birth label
    const birthLabel = document.createElement('span');
    birthLabel.className = 'arc-label birth';
    birthLabel.textContent = 'Birth';
    path.appendChild(birthLabel);

    // Dots container
    const dots = document.createElement('div');
    dots.className = 'arc-dots';

    // Build dots for each event
    for (let i = 0; i < maxEvents; i++) {
        // Add connector before each dot (except first)
        if (i > 0) {
            const connector = document.createElement('span');
            connector.className = 'arc-connector' + (i <= eventCount ? ' completed' : '');
            connector.textContent = '─';
            dots.appendChild(connector);
        }

        // Add dot
        const dot = document.createElement('span');
        dot.className = 'arc-dot';

        if (i < eventCount) {
            dot.className += ' completed';
            dot.textContent = '●';
        } else if (i === eventCount) {
            dot.className += ' current';
            dot.textContent = '●';
        } else {
            dot.textContent = '○';
        }

        dots.appendChild(dot);
    }

    path.appendChild(dots);

    // Death label
    const deathLabel = document.createElement('span');
    deathLabel.className = 'arc-label death';
    deathLabel.textContent = '?';
    path.appendChild(deathLabel);

    arc.appendChild(path);

    return arc;
}

// Insert the life arc into the game area
export function showLifeArc(eventCount, maxEvents) {
    const contentEl = getContentEl();
    const choicesEl = getChoicesEl();

    const arc = renderLifeArc(eventCount, maxEvents);

    // Insert between content and choices
    contentEl.parentNode.insertBefore(arc, choicesEl);
}

export function showKarma(karma, highlight = false) {
    const contentEl = getContentEl();
    const existing = contentEl.querySelector('.karma-display');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'karma-display' + (highlight ? ' highlight' : '');
    div.textContent = `Karma: ${karma}`;
    contentEl.insertBefore(div, contentEl.firstChild);
}

export function showSummary(summary) {
    const contentEl = getContentEl();
    contentEl.innerHTML = '';

    // Title - special message for first run
    const title = document.createElement('p');
    if (summary.isFirstRun) {
        title.innerHTML = '<span style="color: #888;">Your first life has ended.</span>';
    } else {
        title.textContent = 'Your life has ended.';
    }
    contentEl.appendChild(title);

    // First run celebration message
    if (summary.isFirstRun) {
        const celebration = document.createElement('div');
        celebration.style.textAlign = 'center';
        celebration.style.margin = '20px 0';
        celebration.style.padding = '20px';
        celebration.style.background = 'linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)';
        celebration.style.border = '1px solid rgba(251, 191, 36, 0.3)';
        celebration.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">✨</div>
            <div style="color: #fbbf24; font-size: 16px; margin-bottom: 8px;">Karma Earned!</div>
            <div style="color: #888; font-size: 14px;">Your choices echo forward into future lives.</div>
        `;
        contentEl.appendChild(celebration);
    }

    // Death art (if life data available)
    if (summary.life) {
        const art = selectDeathArt(summary.life);
        if (art) {
            const artEl = document.createElement('pre');
            artEl.className = 'ascii-art death-art';
            artEl.textContent = art;
            contentEl.appendChild(artEl);
        }
    }

    // Show newly unlocked achievements
    if (summary.achievements && summary.achievements.length > 0) {
        const achievementSection = document.createElement('div');
        achievementSection.className = 'summary-section';
        achievementSection.style.borderTop = '2px solid #444';
        achievementSection.style.paddingTop = '20px';
        achievementSection.style.marginTop = '20px';
        
        const achievementTitle = document.createElement('div');
        achievementTitle.className = 'summary-label';
        achievementTitle.textContent = '✨ Achievement Unlocked!';
        achievementTitle.style.color = '#aaa';
        achievementTitle.style.fontSize = '16px';
        achievementTitle.style.marginBottom = '12px';
        achievementSection.appendChild(achievementTitle);

        summary.achievements.forEach(achievement => {
            const div = document.createElement('div');
            div.className = 'moment';
            div.style.borderLeftColor = '#666';
            div.style.paddingLeft = '15px';
            div.style.marginBottom = '10px';
            div.innerHTML = `<strong style="color: #ccc;">${achievement.name}</strong><br><span style="color: #888; font-size: 14px;">${achievement.description}</span>`;
            achievementSection.appendChild(div);
        });

        contentEl.appendChild(achievementSection);
    }

    // Starting conditions
    const startSection = document.createElement('div');
    startSection.className = 'summary-section';
    startSection.innerHTML = `
        <div class="summary-label">Beginning</div>
        <div class="summary-value">${summary.startDescription}</div>
    `;
    contentEl.appendChild(startSection);

    // Key moments
    if (summary.moments.length > 0) {
        const momentsSection = document.createElement('div');
        momentsSection.className = 'summary-section';
        momentsSection.innerHTML = `<div class="summary-label">Key moments</div>`;
        summary.moments.forEach(moment => {
            const div = document.createElement('div');
            div.className = 'moment';
            div.textContent = moment;
            momentsSection.appendChild(div);
        });
        contentEl.appendChild(momentsSection);
    }

    // Character traits (if any)
    if (summary.tags && summary.tags.length > 0) {
        const traitsSection = document.createElement('div');
        traitsSection.className = 'summary-section';
        traitsSection.innerHTML = `<div class="summary-label">Character Traits</div>`;

        const traitsContainer = document.createElement('div');
        traitsContainer.className = 'summary-traits';

        summary.tags.forEach(tagId => {
            const tag = getTagById(tagId);
            if (tag) {
                const tagEl = document.createElement('span');
                tagEl.className = 'summary-trait';
                tagEl.innerHTML = `${tag.icon} ${tag.name}`;
                traitsContainer.appendChild(tagEl);
            }
        });

        traitsSection.appendChild(traitsContainer);
        contentEl.appendChild(traitsSection);
    }

    // Ending
    const endSection = document.createElement('div');
    endSection.className = 'summary-section';
    endSection.innerHTML = `
        <div class="summary-label">Ending</div>
        <div class="summary-value">${summary.endDescription}</div>
    `;
    contentEl.appendChild(endSection);

    // Karma change
    const karmaSection = document.createElement('div');
    karmaSection.className = 'summary-section';
    karmaSection.innerHTML = `
        <div class="summary-label">Karma</div>
        <div class="karma-change">
            ${summary.karmaBefore}<span class="arrow">→</span>${summary.karmaAfter}
        </div>
    `;
    contentEl.appendChild(karmaSection);
}

// Show celebratory country unlock overlay
export function showUnlockCelebration(country, onContinue) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'unlock-overlay';

    // Create particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'unlock-particles';

    const colors = ['#4a9eff', '#7b68ee', '#50c878', '#ffd700', '#ff6b6b', '#e0e0e0'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.style.animationDuration = `${1.5 + Math.random() * 1}s`;
        particlesContainer.appendChild(particle);
    }
    overlay.appendChild(particlesContainer);

    // Create reveal content
    const reveal = document.createElement('div');
    reveal.className = 'unlock-reveal';

    const label = document.createElement('div');
    label.className = 'unlock-label';
    label.textContent = 'New Country Unlocked';

    const countryName = document.createElement('div');
    countryName.className = 'unlock-country-name glow-pulse';
    countryName.textContent = country.name;

    const details = document.createElement('div');
    details.className = 'unlock-country-details';
    const incomeLabels = {
        'low': 'Developing Nation',
        'lower-middle': 'Emerging Economy',
        'upper-middle': 'Growing Economy',
        'high': 'Developed Nation'
    };
    const popLabels = {
        'tiny': 'Tiny Population',
        'small': 'Small Population',
        'medium': 'Medium Population',
        'large': 'Large Population',
        'massive': 'Massive Population'
    };
    details.textContent = `${incomeLabels[country.incomeLevel] || 'Unknown'} · ${popLabels[country.populationScale] || 'Unknown'}`;

    const continueBtn = document.createElement('button');
    continueBtn.className = 'unlock-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 500);
    });

    reveal.appendChild(label);
    reveal.appendChild(countryName);
    reveal.appendChild(details);
    reveal.appendChild(continueBtn);
    overlay.appendChild(reveal);

    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 600);
}

// Show celebratory era unlock overlay
export function showEraCelebration(era, onContinue) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'unlock-overlay';

    // Create particles (gold-themed for eras)
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'unlock-particles';

    const colors = ['#ffd700', '#ffb700', '#ff9500', '#ffe066', '#fff4cc', '#e0e0e0'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.style.animationDuration = `${1.5 + Math.random() * 1}s`;
        particlesContainer.appendChild(particle);
    }
    overlay.appendChild(particlesContainer);

    // Create reveal content
    const reveal = document.createElement('div');
    reveal.className = 'unlock-reveal';

    const label = document.createElement('div');
    label.className = 'unlock-label';
    label.textContent = 'New Era Unlocked';

    const eraName = document.createElement('div');
    eraName.className = 'unlock-era-name glow-pulse-gold';
    eraName.textContent = era.name;

    const years = document.createElement('div');
    years.className = 'unlock-era-years';
    years.textContent = `${era.startYear} - ${era.endYear}`;

    const details = document.createElement('div');
    details.className = 'unlock-country-details';
    details.textContent = era.description;

    const continueBtn = document.createElement('button');
    continueBtn.className = 'unlock-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 500);
    });

    reveal.appendChild(label);
    reveal.appendChild(eraName);
    reveal.appendChild(years);
    reveal.appendChild(details);
    reveal.appendChild(continueBtn);
    overlay.appendChild(reveal);

    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 600);
}

// Show celebratory job category unlock overlay
export function showJobCategoryCelebration(category, onContinue) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'unlock-overlay';

    // Create particles (green-themed for careers)
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'unlock-particles';

    const colors = ['#50c878', '#3cb371', '#2e8b57', '#7fffd4', '#98fb98', '#e0e0e0'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.style.animationDuration = `${1.5 + Math.random() * 1}s`;
        particlesContainer.appendChild(particle);
    }
    overlay.appendChild(particlesContainer);

    // Create reveal content
    const reveal = document.createElement('div');
    reveal.className = 'unlock-reveal';

    const label = document.createElement('div');
    label.className = 'unlock-label';
    label.textContent = 'New Career Path Unlocked';

    const categoryName = document.createElement('div');
    categoryName.className = 'unlock-career-name glow-pulse-green';
    categoryName.textContent = category.name;

    const details = document.createElement('div');
    details.className = 'unlock-country-details';
    details.textContent = category.description;

    const continueBtn = document.createElement('button');
    continueBtn.className = 'unlock-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 500);
    });

    reveal.appendChild(label);
    reveal.appendChild(categoryName);
    reveal.appendChild(details);
    reveal.appendChild(continueBtn);
    overlay.appendChild(reveal);

    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 600);
}

// Show celebratory feature unlock overlay
export function showFeatureCelebration(featureName, description, onContinue) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'unlock-overlay';

    // Create particles (purple-themed for features)
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'unlock-particles';

    const colors = ['#9370db', '#8a2be2', '#9932cc', '#ba55d3', '#da70d6', '#e0e0e0'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.style.animationDuration = `${1.5 + Math.random() * 1}s`;
        particlesContainer.appendChild(particle);
    }
    overlay.appendChild(particlesContainer);

    // Create reveal content
    const reveal = document.createElement('div');
    reveal.className = 'unlock-reveal';

    const label = document.createElement('div');
    label.className = 'unlock-label';
    label.textContent = 'Feature Unlocked';

    const nameEl = document.createElement('div');
    nameEl.className = 'unlock-feature-name glow-pulse-purple';
    nameEl.textContent = featureName;

    const details = document.createElement('div');
    details.className = 'unlock-country-details';
    details.textContent = description;

    const continueBtn = document.createElement('button');
    continueBtn.className = 'unlock-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 500);
    });

    reveal.appendChild(label);
    reveal.appendChild(nameEl);
    reveal.appendChild(details);
    reveal.appendChild(continueBtn);
    overlay.appendChild(reveal);

    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 600);
}

// Show first run completion screen with game unlock preview
export function showFirstRunComplete(karma, onContinue, onGameHub) {
    const contentEl = getContentEl();
    const choicesEl = getChoicesEl();

    contentEl.innerHTML = '';
    choicesEl.innerHTML = '';

    // Create celebration container
    const container = document.createElement('div');
    container.className = 'first-run-complete';
    container.style.textAlign = 'center';
    container.style.animation = 'fadeIn 0.8s ease forwards';

    // Celebration header
    const header = document.createElement('div');
    header.style.marginBottom = '30px';
    header.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">✨</div>
        <div style="font-size: 24px; color: #e0e0e0; margin-bottom: 10px;">Welcome to Karma</div>
        <div style="font-size: 14px; color: #888; font-style: italic;">Your journey across lifetimes has begun.</div>
    `;
    container.appendChild(header);

    // Karma display
    const karmaDisplay = document.createElement('div');
    karmaDisplay.style.marginBottom = '30px';
    karmaDisplay.style.padding = '20px';
    karmaDisplay.style.background = '#111';
    karmaDisplay.style.border = '1px solid #333';
    karmaDisplay.innerHTML = `
        <div style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your Karma</div>
        <div style="font-size: 36px; color: #ffd700;">☯ ${karma}</div>
    `;
    container.appendChild(karmaDisplay);

    // Games preview
    const gamesPreview = document.createElement('div');
    gamesPreview.style.marginBottom = '30px';
    gamesPreview.innerHTML = `
        <div style="color: #888; font-size: 14px; margin-bottom: 15px;">More games unlock as you play!</div>
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <div class="game-preview-card unlocked">
                <span style="font-size: 24px;">📍</span>
                <span style="font-size: 11px; color: #4ade80;">PLINKO</span>
            </div>
            <div class="game-preview-card locked">
                <span style="font-size: 24px; opacity: 0.3;">🎰</span>
                <span style="font-size: 11px; color: #555;">LOCKED</span>
            </div>
            <div class="game-preview-card locked">
                <span style="font-size: 24px; opacity: 0.3;">🎡</span>
                <span style="font-size: 11px; color: #555;">LOCKED</span>
            </div>
            <div class="game-preview-card locked">
                <span style="font-size: 24px; opacity: 0.3;">🎴</span>
                <span style="font-size: 11px; color: #555;">LOCKED</span>
            </div>
        </div>
    `;
    container.appendChild(gamesPreview);

    // Add styles for game preview cards
    const style = document.createElement('style');
    style.textContent = `
        .game-preview-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            background: #151515;
            border: 1px solid #333;
            min-width: 60px;
        }
        .game-preview-card.unlocked {
            border-color: #4ade80;
            background: rgba(74, 222, 128, 0.1);
        }
        .game-preview-card.locked {
            opacity: 0.6;
        }
        .first-run-complete {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    contentEl.appendChild(container);

    // Buttons
    if (karma > 0 && onGameHub) {
        const hubBtn = document.createElement('button');
        hubBtn.className = 'begin-button gacha-title-btn';
        hubBtn.innerHTML = '🎮 Game Hub';
        hubBtn.addEventListener('click', () => onGameHub(karma));
        choicesEl.appendChild(hubBtn);
    }

    const continueBtn = document.createElement('button');
    continueBtn.className = 'begin-button secondary';
    continueBtn.textContent = 'Begin Next Life';
    continueBtn.addEventListener('click', onContinue);
    choicesEl.appendChild(continueBtn);
}

// Show tag notification when a character trait is earned
export function showTagNotification(tag, onContinue) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tag-notification-overlay';

    // Create reveal content
    const reveal = document.createElement('div');
    reveal.className = 'tag-notification-reveal';

    const label = document.createElement('div');
    label.className = 'tag-notification-label';
    label.textContent = 'Character Trait Earned';

    const icon = document.createElement('div');
    icon.className = 'tag-notification-icon';
    icon.textContent = tag.icon;

    const nameEl = document.createElement('div');
    nameEl.className = 'tag-notification-name';
    nameEl.textContent = tag.name;

    const flavorEl = document.createElement('div');
    flavorEl.className = 'tag-notification-flavor';
    flavorEl.textContent = tag.flavorText || tag.description;

    const effectsEl = document.createElement('div');
    effectsEl.className = 'tag-notification-effects';
    effectsEl.textContent = 'This will shape your future choices.';

    const continueBtn = document.createElement('button');
    continueBtn.className = 'tag-notification-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            if (onContinue) onContinue();
        }, 400);
    });

    reveal.appendChild(label);
    reveal.appendChild(icon);
    reveal.appendChild(nameEl);
    reveal.appendChild(flavorEl);
    reveal.appendChild(effectsEl);
    reveal.appendChild(continueBtn);
    overlay.appendChild(reveal);

    document.body.appendChild(overlay);

    // Auto-focus the continue button
    setTimeout(() => continueBtn.focus(), 400);
}

export function showRunHistory(runHistory) {
    if (!runHistory || runHistory.length === 0) return;

    // Filter out runs that don't have meaningful data
    const validRuns = runHistory.filter(run => {
        return run.startDescription || run.endDescription || 
               (run.moments && run.moments.length > 0) ||
               (run.karmaBefore !== undefined && run.karmaAfter !== undefined);
    });

    if (validRuns.length === 0) return;

    // Create history container
    const historyContainer = document.createElement('div');
    historyContainer.className = 'run-history-container';
    historyContainer.style.marginTop = '30px';
    historyContainer.style.marginBottom = '20px';
    historyContainer.style.borderTop = '1px solid #222';
    historyContainer.style.paddingTop = '20px';

    // History title
    const historyTitle = document.createElement('div');
    historyTitle.className = 'summary-label';
    historyTitle.textContent = `Previous Lives (${validRuns.length})`;
    historyTitle.style.cursor = 'pointer';
    historyTitle.style.userSelect = 'none';
    historyContainer.appendChild(historyTitle);

    // History content (collapsible)
    const historyContent = document.createElement('div');
    historyContent.className = 'run-history-content';
    historyContent.style.maxHeight = '400px';
    historyContent.style.overflowY = 'auto';
    historyContent.style.overflowX = 'hidden';
    historyContent.style.marginTop = '15px';
    historyContent.style.display = 'none'; // Start collapsed
    historyContent.style.paddingRight = '5px';

    // Toggle functionality
    let isExpanded = false;
    historyTitle.addEventListener('click', () => {
        isExpanded = !isExpanded;
        historyContent.style.display = isExpanded ? 'block' : 'none';
        historyTitle.textContent = isExpanded 
            ? `Previous Lives (${validRuns.length}) ▼`
            : `Previous Lives (${validRuns.length}) ▶`;
    });
    historyTitle.textContent = `Previous Lives (${validRuns.length}) ▶`;

    // Show most recent runs first (reverse order)
    const reversedHistory = [...validRuns].reverse();
    const displayCount = Math.min(20, reversedHistory.length); // Show max 20 most recent

    reversedHistory.slice(0, displayCount).forEach((run, index) => {
        const runEntry = document.createElement('div');
        runEntry.className = 'run-history-entry';
        runEntry.style.marginBottom = '25px';
        runEntry.style.paddingBottom = '20px';
        runEntry.style.borderBottom = '1px solid #1a1a1a';

        // Run number (most recent first)
        const runNumber = document.createElement('div');
        runNumber.className = 'summary-label';
        runNumber.textContent = `Life #${validRuns.length - index}`;
        runNumber.style.color = '#555';
        runNumber.style.fontSize = '12px';
        runEntry.appendChild(runNumber);

        // Beginning
        if (run.startDescription) {
            const startDiv = document.createElement('div');
            startDiv.style.marginTop = '8px';
            startDiv.style.marginBottom = '8px';
            startDiv.innerHTML = `<span style="color: #666; font-size: 13px;">Beginning:</span> <span style="color: #999;">${run.startDescription}</span>`;
            runEntry.appendChild(startDiv);
        }

        // Key moments (if any)
        if (run.moments && run.moments.length > 0) {
            const momentsDiv = document.createElement('div');
            momentsDiv.style.marginTop = '8px';
            momentsDiv.style.marginBottom = '8px';
            momentsDiv.style.paddingLeft = '10px';
            momentsDiv.style.borderLeft = '1px solid #2a2a2a';
            run.moments.slice(0, 2).forEach(moment => {
                const momentP = document.createElement('div');
                momentP.style.color = '#777';
                momentP.style.fontSize = '12px';
                momentP.style.marginTop = '4px';
                momentP.textContent = moment;
                momentsDiv.appendChild(momentP);
            });
            runEntry.appendChild(momentsDiv);
        }

        // Ending
        if (run.endDescription) {
            const endDiv = document.createElement('div');
            endDiv.style.marginTop = '8px';
            endDiv.style.marginBottom = '8px';
            endDiv.innerHTML = `<span style="color: #666; font-size: 13px;">Ending:</span> <span style="color: #999;">${run.endDescription}</span>`;
            runEntry.appendChild(endDiv);
        }

        // Karma change
        if (run.karmaBefore !== undefined && run.karmaAfter !== undefined) {
            const karmaDiv = document.createElement('div');
            karmaDiv.style.marginTop = '8px';
            karmaDiv.style.fontSize = '14px';
            const karmaChange = (run.karmaAfter || 0) - (run.karmaBefore || 0);
            const karmaColor = karmaChange > 0 ? '#7a7' : karmaChange < 0 ? '#a77' : '#888';
            karmaDiv.innerHTML = `<span style="color: #666; font-size: 13px;">Karma:</span> <span style="color: ${karmaColor};">${run.karmaBefore || 0} → ${run.karmaAfter || 0} ${karmaChange !== 0 ? `(${karmaChange > 0 ? '+' : ''}${karmaChange})` : ''}</span>`;
            runEntry.appendChild(karmaDiv);
        }

        // Achievements (if any)
        if (run.achievements && run.achievements.length > 0) {
            const achievementsDiv = document.createElement('div');
            achievementsDiv.style.marginTop = '8px';
            achievementsDiv.style.fontSize = '12px';
            achievementsDiv.style.color = '#888';
            const achievementNames = run.achievements
                .map(id => {
                    const achievement = getAchievement(id);
                    return achievement ? achievement.name : null;
                })
                .filter(name => name !== null)
                .join(', ');
            achievementsDiv.innerHTML = `<span style="color: #666;">✨ Achievements:</span> ${achievementNames}`;
            runEntry.appendChild(achievementsDiv);
        }

        historyContent.appendChild(runEntry);
    });

    if (displayCount < reversedHistory.length) {
        const moreDiv = document.createElement('div');
        moreDiv.style.color = '#555';
        moreDiv.style.fontSize = '12px';
        moreDiv.style.textAlign = 'center';
        moreDiv.style.marginTop = '10px';
        moreDiv.textContent = `... and ${reversedHistory.length - displayCount} more lives`;
        historyContent.appendChild(moreDiv);
    }

    historyContainer.appendChild(historyContent);
    getContentEl().appendChild(historyContainer);
}

// ============================================
// SIDE PANEL RENDERING
// ============================================

// Initialize collapsible panels with full retraction support
export function initCollapsiblePanels() {
    // Handle panel header clicks (collapse/expand)
    const headers = document.querySelectorAll('.panel-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.panel-section');
            const panel = header.closest('#left-panel, #right-panel');

            if (section.classList.contains('collapsed')) {
                // Expand: show section content
                section.classList.remove('collapsed');
            } else {
                // Collapse: hide section and retract panel
                section.classList.add('collapsed');
                if (panel) {
                    panel.classList.add('panel-collapsed');
                }
            }
        });
    });

    // Handle toggle tab clicks (expand from retracted state)
    const toggleTabs = document.querySelectorAll('.panel-toggle-tab');
    toggleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const panelId = tab.getAttribute('data-panel');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.remove('panel-collapsed');
                // Also expand the section content
                const section = panel.querySelector('.panel-section');
                if (section) {
                    section.classList.remove('collapsed');
                }
            }
        });
    });
}

// Tips to show randomly
const tips = [
    "Higher karma improves your starting chances.",
    "Countries affect your available opportunities.",
    "Earlier eras have lower baseline stats.",
    "Your birth circumstances shape, but don't determine, your fate.",
    "Choices compound across a lifetime.",
    "Some jobs are only available in certain eras.",
    "Unlocking new eras opens different historical experiences.",
    "Career paths affect your stat growth.",
    "Health reaching zero means an early end.",
    "Connections can open unexpected doors."
];

// Update the left panel (achievements)
export function updateLeftPanel() {
    const container = document.getElementById('achievements-content');
    if (!container) return;

    const unlocked = getUnlockedAchievements();
    const { unlocked: unlockedCount, total } = getAchievementCount();
    const percentage = Math.round((unlockedCount / total) * 100);

    let html = '';

    // Overall progress
    html += `<div class="panel-row"><span>Progress</span><span class="value">${unlockedCount}/${total}</span></div>`;
    html += `<div class="panel-progress-bar"><div class="panel-progress-fill" style="width: ${percentage}%"></div></div>`;

    // Group achievements by category
    const categories = ['exploration', 'karma', 'life', 'meta'];
    const categoryNames = {
        exploration: 'Exploration',
        karma: 'Karma',
        life: 'Life',
        meta: 'Meta'
    };

    categories.forEach(cat => {
        const catAchievements = achievements.filter(a => a.category === cat);
        const catUnlocked = catAchievements.filter(a => unlocked.has(a.id));

        html += `<div class="achievement-category">`;
        html += `<div class="achievement-category-title">${categoryNames[cat]} (${catUnlocked.length}/${catAchievements.length})</div>`;

        catAchievements.forEach(achievement => {
            const isUnlocked = unlocked.has(achievement.id);
            html += `<div class="achievement-item ${isUnlocked ? 'unlocked' : ''}" title="${isUnlocked ? achievement.description : '???'}">`;
            html += `<span class="icon">${isUnlocked ? '●' : '○'}</span>`;
            html += `<span>${isUnlocked ? achievement.name : '???'}</span>`;
            html += `</div>`;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

// Update the right panel (context-sensitive info)
export function updateRightPanel(state = null, tracking = null) {
    const container = document.getElementById('context-content');
    if (!container) return;

    let html = '';

    // During gameplay - show current life info
    if (state && state.life && state.phase === 'event') {
        html += `<div class="panel-section">`;
        html += `<div class="panel-title">CURRENT LIFE</div>`;

        if (state.life.era) {
            html += `<div class="panel-row"><span>Era</span><span class="value">${state.life.era.name}</span></div>`;
        }
        if (state.life.country) {
            html += `<div class="panel-row"><span>Country</span><span class="value">${state.life.country.name}</span></div>`;
        }
        if (state.life.job) {
            html += `<div class="panel-row"><span>Job</span><span class="value">${state.life.job.name}</span></div>`;
        }

        html += `<div class="panel-row"><span>Stage</span><span class="value">${formatStage(state.currentStage)}</span></div>`;
        html += `<div class="panel-row"><span>Events</span><span class="value">${state.eventCount || 0}/${state.maxEvents || 0}</span></div>`;
        html += `</div>`;

        // Stats
        html += `<div class="panel-section">`;
        html += `<div class="panel-title">STATS</div>`;
        html += renderStatBar('Wealth', state.life.wealth);
        html += renderStatBar('Education', state.life.education);
        html += renderStatBar('Health', state.life.health);
        html += renderStatBar('Connections', state.life.connections);
        html += `</div>`;

        // Character Traits (if any)
        if (state.life.tags && state.life.tags.length > 0) {
            html += `<div class="panel-section">`;
            html += `<div class="panel-title">CHARACTER TRAITS</div>`;
            for (const tagId of state.life.tags) {
                const tag = getTagById(tagId);
                if (tag) {
                    html += `<div class="panel-trait">`;
                    html += `<span class="trait-icon">${tag.icon}</span>`;
                    html += `<span class="trait-name">${tag.name}</span>`;
                    html += `</div>`;
                }
            }
            html += `</div>`;
        }
    }
    // During shop - show unlock progress
    else if (state && state.phase === 'shop') {
        const eraProgress = getEraUnlockProgress();
        const careerProgress = getJobCategoryUnlockProgress();
        const countryProgress = getUnlockProgress();

        html += `<div class="panel-section">`;
        html += `<div class="panel-title">UNLOCK PROGRESS</div>`;
        html += `<div class="panel-row"><span>Eras</span><span class="value">${eraProgress.unlocked}/${eraProgress.total}</span></div>`;
        html += `<div class="panel-row"><span>Careers</span><span class="value">${careerProgress.unlocked}/${careerProgress.total}</span></div>`;
        html += `<div class="panel-row"><span>Countries</span><span class="value">${countryProgress.unlocked}/${countryProgress.total}</span></div>`;
        html += `</div>`;

        html += `<div class="panel-section">`;
        html += `<div class="panel-title">COSTS</div>`;
        html += `<div class="panel-row"><span>Era</span><span class="value">${getEraUnlockCost()} karma</span></div>`;
        html += `<div class="panel-row"><span>Career</span><span class="value">${getJobCategoryUnlockCost()} karma</span></div>`;
        html += `<div class="panel-row"><span>Country</span><span class="value">${getCountryUnlockCost()} karma</span></div>`;
        html += `</div>`;
    }
    // Title screen or other - show statistics and tips
    else {
        html += `<div class="panel-section">`;
        html += `<div class="panel-title">STATISTICS</div>`;

        if (tracking) {
            html += `<div class="panel-row"><span>Lives Lived</span><span class="value">${tracking.totalLives || 0}</span></div>`;
            html += `<div class="panel-row"><span>Total Karma</span><span class="value">${tracking.totalKarma >= 0 ? '+' : ''}${tracking.totalKarma || 0}</span></div>`;
            if (tracking.bestKarma !== undefined) {
                html += `<div class="panel-row"><span>Best Life</span><span class="value">+${tracking.bestKarma}</span></div>`;
            }
            if (tracking.worstKarma !== undefined) {
                html += `<div class="panel-row"><span>Worst Life</span><span class="value">${tracking.worstKarma}</span></div>`;
            }
        } else {
            html += `<div class="panel-row"><span>Lives Lived</span><span class="value">0</span></div>`;
        }
        html += `</div>`;

        // Random tip
        const tip = tips[Math.floor(Math.random() * tips.length)];
        html += `<div class="panel-tip">"${tip}"</div>`;
    }

    container.innerHTML = html;
}

// Helper to format stage names
function formatStage(stage) {
    if (!stage) return 'N/A';
    return stage.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Helper to render a stat bar
function renderStatBar(label, value) {
    let html = `<div class="stat-bar-container">`;
    html += `<div class="stat-bar-label"><span>${label}</span><span>${value}/5</span></div>`;
    html += `<div class="stat-bar">`;
    for (let i = 1; i <= 5; i++) {
        html += `<div class="stat-bar-segment ${i <= value ? 'filled' : ''}"></div>`;
    }
    html += `</div></div>`;
    return html;
}

// ============================================
// COLLECTIONS VIEW
// ============================================

// Icon mappings
const eraIcons = {
    'pre_industrial': '🏛️',
    'industrial_revolution': '⚙️',
    'early_modern': '⚔️',
    'cold_war': '☢️',
    'contemporary': '🌐'
};

const careerIcons = {
    'agriculture': '🌾',
    'labor': '⚒️',
    'services': '🛎️',
    'professional': '💼',
    'creative': '🎨',
    'military': '⚔️',
    'maritime': '⚓',
    'religious': '✝️',
    'science': '🔬',
    'commerce': '💰',
    'healthcare': '⚕️',
    'law': '⚖️'
};

// Show the collections/progress view
export function showCollectionsView(onBack) {
    const contentEl = getContentEl();
    const choicesEl = getChoicesEl();

    contentEl.innerHTML = '';
    choicesEl.innerHTML = '';

    // Back button at TOP
    const backBtn = document.createElement('button');
    backBtn.className = 'begin-button secondary collections-back-btn';
    backBtn.textContent = '← Back';
    backBtn.style.marginBottom = '20px';
    backBtn.addEventListener('click', onBack);
    contentEl.appendChild(backBtn);

    // Title
    const title = document.createElement('p');
    title.textContent = 'Collections';
    title.style.fontSize = '24px';
    title.style.marginBottom = '30px';
    contentEl.appendChild(title);

    // Get unlock data
    const unlockedEras = getUnlockedEras();
    const unlockedEraIds = new Set(unlockedEras.map(e => e.id));

    const unlockedCategories = getUnlockedJobCategories();
    const unlockedCategoryIds = new Set(unlockedCategories.map(c => c.id));

    const unlockedCountries = getUnlockedCountries();
    const unlockedCountryIds = new Set(unlockedCountries.map(c => c.id));

    // Eras section (collapsible)
    const eraProgress = getEraUnlockProgress();
    contentEl.appendChild(createCollapsibleCollectionSection(
        'Eras',
        `${eraProgress.unlocked}/${eraProgress.total}`,
        renderErasGrid(eras, unlockedEraIds),
        true // Start expanded
    ));

    // Careers section (collapsible)
    const careerProgress = getJobCategoryUnlockProgress();
    contentEl.appendChild(createCollapsibleCollectionSection(
        'Careers',
        `${careerProgress.unlocked}/${careerProgress.total}`,
        renderCareersGrid(jobCategories, unlockedCategoryIds),
        false // Start collapsed
    ));

    // Countries section (collapsible)
    const countryProgress = getUnlockProgress();
    contentEl.appendChild(createCollapsibleCollectionSection(
        'Countries',
        `${countryProgress.unlocked}/${countryProgress.total}`,
        renderCountriesGrid(countries, unlockedCountryIds),
        false // Start collapsed
    ));

    // Traits section (collapsible)
    const traitProgress = getTagDiscoveryProgress();
    const discoveredTagIds = new Set(getDiscoveredTags());
    contentEl.appendChild(createCollapsibleCollectionSection(
        'Traits',
        `${traitProgress.discovered}/${traitProgress.total}`,
        renderTraitsGrid(tags, discoveredTagIds),
        false // Start collapsed
    ));

    // Clear the choices area (no bottom back button needed)
    choicesEl.innerHTML = '';
}

// Create a collection section container
function createCollectionSection(title, count, gridElement) {
    const section = document.createElement('div');
    section.className = 'collections-section';

    const header = document.createElement('div');
    header.className = 'collections-header';
    header.innerHTML = `
        <span class="collections-title">${title}</span>
        <span class="collections-count">${count}</span>
    `;
    section.appendChild(header);
    section.appendChild(gridElement);

    return section;
}

// Create a collapsible collection section with dropdown arrow
function createCollapsibleCollectionSection(title, count, gridElement, startExpanded = true) {
    const section = document.createElement('div');
    section.className = 'collections-section collapsible-section';
    if (!startExpanded) {
        section.classList.add('collapsed');
    }

    const header = document.createElement('div');
    header.className = 'collections-header collapsible-header';
    header.style.cursor = 'pointer';
    header.innerHTML = `
        <span class="collections-title">
            <span class="collapse-arrow">${startExpanded ? '▼' : '▶'}</span>
            ${title}
        </span>
        <span class="collections-count">${count}</span>
    `;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'collections-content';
    contentWrapper.style.overflow = 'hidden';
    contentWrapper.style.transition = 'max-height 0.3s ease, opacity 0.2s ease';
    if (!startExpanded) {
        contentWrapper.style.maxHeight = '0';
        contentWrapper.style.opacity = '0';
    } else {
        contentWrapper.style.maxHeight = '2000px';
        contentWrapper.style.opacity = '1';
    }
    contentWrapper.appendChild(gridElement);

    // Toggle on header click
    header.addEventListener('click', () => {
        const isCollapsed = section.classList.contains('collapsed');
        const arrow = header.querySelector('.collapse-arrow');
        
        if (isCollapsed) {
            // Expand
            section.classList.remove('collapsed');
            contentWrapper.style.maxHeight = '2000px';
            contentWrapper.style.opacity = '1';
            arrow.textContent = '▼';
        } else {
            // Collapse
            section.classList.add('collapsed');
            contentWrapper.style.maxHeight = '0';
            contentWrapper.style.opacity = '0';
            arrow.textContent = '▶';
        }
    });

    section.appendChild(header);
    section.appendChild(contentWrapper);

    return section;
}

// Render eras grid
function renderErasGrid(allEras, unlockedIds) {
    const grid = document.createElement('div');
    grid.className = 'unlock-grid';

    allEras.forEach(era => {
        const isUnlocked = unlockedIds.has(era.id);
        const thumb = createThumbnail(
            isUnlocked,
            isUnlocked ? eraIcons[era.id] || '📅' : '?',
            isUnlocked ? era.name : '???',
            isUnlocked ? `era-${era.id}` : '',
            isUnlocked ? { title: era.name, detail: `${era.startYear}-${era.endYear}` } : null
        );
        grid.appendChild(thumb);
    });

    return grid;
}

// Render careers grid
function renderCareersGrid(allCategories, unlockedIds) {
    const grid = document.createElement('div');
    grid.className = 'unlock-grid';

    allCategories.forEach(cat => {
        const isUnlocked = unlockedIds.has(cat.id);
        const thumb = createThumbnail(
            isUnlocked,
            isUnlocked ? careerIcons[cat.id] || '💼' : '?',
            isUnlocked ? cat.name : '???',
            isUnlocked ? `career-${cat.id}` : '',
            isUnlocked ? { title: cat.name, detail: cat.description } : null
        );
        grid.appendChild(thumb);
    });

    return grid;
}

// Render countries grid
function renderCountriesGrid(allCountries, unlockedIds) {
    const grid = document.createElement('div');
    grid.className = 'unlock-grid compact';

    // Sort countries: unlocked first, then alphabetically
    const sortedCountries = [...allCountries].sort((a, b) => {
        const aUnlocked = unlockedIds.has(a.id);
        const bUnlocked = unlockedIds.has(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return a.name.localeCompare(b.name);
    });

    sortedCountries.forEach(country => {
        const isUnlocked = unlockedIds.has(country.id);
        const incomeClass = isUnlocked ? `income-${country.incomeLevel.replace('-', '-')}` : '';
        const thumb = createThumbnail(
            isUnlocked,
            isUnlocked ? country.id : '?',
            isUnlocked ? country.name.substring(0, 8) : '???',
            incomeClass,
            isUnlocked ? {
                title: country.name,
                detail: formatIncomeLevel(country.incomeLevel)
            } : null
        );
        grid.appendChild(thumb);
    });

    return grid;
}

// Render traits grid
function renderTraitsGrid(allTags, discoveredIds) {
    const grid = document.createElement('div');
    grid.className = 'unlock-grid';

    // Group tags by category for display
    const categoryOrder = ['orientation', 'social', 'values'];
    const sortedTags = [...allTags].sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.category);
        const bIndex = categoryOrder.indexOf(b.category);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.name.localeCompare(b.name);
    });

    sortedTags.forEach(tag => {
        const isDiscovered = discoveredIds.has(tag.id);
        const thumb = createThumbnail(
            isDiscovered,
            isDiscovered ? tag.icon : '?',
            isDiscovered ? tag.name : '???',
            isDiscovered ? `trait-${tag.category}` : '',
            isDiscovered ? {
                title: tag.name,
                detail: tag.description
            } : null
        );
        grid.appendChild(thumb);
    });

    return grid;
}

// Create a thumbnail element
function createThumbnail(isUnlocked, icon, label, colorClass, tooltip) {
    const thumb = document.createElement('div');
    thumb.className = `unlock-thumbnail ${isUnlocked ? 'unlocked' : 'locked'} ${colorClass}`;

    const iconEl = document.createElement('div');
    iconEl.className = 'thumb-icon';
    iconEl.textContent = icon;
    thumb.appendChild(iconEl);

    const labelEl = document.createElement('div');
    labelEl.className = 'thumb-label';
    labelEl.textContent = label;
    thumb.appendChild(labelEl);

    if (tooltip && isUnlocked) {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'unlock-tooltip';
        tooltipEl.innerHTML = `
            <div class="tooltip-title">${tooltip.title}</div>
            <div class="tooltip-detail">${tooltip.detail}</div>
        `;
        thumb.appendChild(tooltipEl);
    }

    return thumb;
}

// Format income level for display
function formatIncomeLevel(level) {
    const labels = {
        'low': 'Low Income',
        'lower-middle': 'Lower-Middle Income',
        'upper-middle': 'Upper-Middle Income',
        'high': 'High Income'
    };
    return labels[level] || level;
}
