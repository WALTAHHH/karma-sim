// Tutorial system for first-run experience

const TUTORIAL_KEY = 'karma_simulator_tutorial';

// Tutorial state
let tutorialState = {
    completed: false,
    shownHints: new Set(),
    dismissed: false
};

// Load tutorial state from localStorage
export function loadTutorialState() {
    try {
        const stored = localStorage.getItem(TUTORIAL_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            tutorialState = {
                completed: data.completed || false,
                shownHints: new Set(data.shownHints || []),
                dismissed: data.dismissed || false
            };
        }
    } catch (e) {
        console.error('Failed to load tutorial state:', e);
    }
    return tutorialState;
}

// Save tutorial state to localStorage
function saveTutorialState() {
    try {
        localStorage.setItem(TUTORIAL_KEY, JSON.stringify({
            completed: tutorialState.completed,
            shownHints: [...tutorialState.shownHints],
            dismissed: tutorialState.dismissed
        }));
    } catch (e) {
        console.error('Failed to save tutorial state:', e);
    }
}

// Check if this is the player's first run (no prior lives)
export function isFirstRun() {
    try {
        const tracking = localStorage.getItem('karma_simulator_tracking');
        if (!tracking) return true;
        
        const data = JSON.parse(tracking);
        return !data.totalLives || data.totalLives === 0;
    } catch (e) {
        return true;
    }
}

// Check if tutorial should show (first run and not completed/dismissed)
export function shouldShowTutorial() {
    loadTutorialState();
    return isFirstRun() && !tutorialState.completed && !tutorialState.dismissed;
}

// Check if a specific hint should show
export function shouldShowHint(hintId) {
    if (!shouldShowTutorial()) return false;
    return !tutorialState.shownHints.has(hintId);
}

// Mark a hint as shown
export function markHintShown(hintId) {
    tutorialState.shownHints.add(hintId);
    saveTutorialState();
}

// Mark tutorial as complete (after first death)
export function completeTutorial() {
    tutorialState.completed = true;
    saveTutorialState();
}

// Dismiss tutorial entirely
export function dismissTutorial() {
    tutorialState.dismissed = true;
    saveTutorialState();
    removeAllTooltips();
}

// Show a tutorial tooltip
export function showTutorialTooltip(options) {
    const {
        id,
        text,
        icon = '💡',
        target = null,      // Element to position near
        position = 'center', // 'center', 'top', 'bottom', 'left', 'right'
        autoDismiss = 5000, // Auto-dismiss after ms (0 for manual only)
        onDismiss = null
    } = options;

    // Check if we should show this hint
    if (!shouldShowHint(id)) return null;
    
    // Mark as shown
    markHintShown(id);
    
    // Remove any existing tooltips
    removeAllTooltips();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.id = `tutorial-tooltip-${id}`;
    
    // Add arrow class based on position
    if (position === 'bottom') {
        tooltip.classList.add('arrow-top');
    } else if (position === 'top') {
        tooltip.classList.add('arrow-bottom');
    } else if (position === 'right') {
        tooltip.classList.add('arrow-left');
    }
    
    // Build content
    const iconEl = document.createElement('div');
    iconEl.className = 'tutorial-tooltip-icon';
    iconEl.textContent = icon;
    
    const textEl = document.createElement('div');
    textEl.className = 'tutorial-tooltip-text';
    textEl.textContent = text;
    
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'tutorial-tooltip-dismiss';
    dismissBtn.textContent = 'Got it';
    dismissBtn.addEventListener('click', () => {
        removeTooltip(tooltip);
        if (onDismiss) onDismiss();
    });
    
    tooltip.appendChild(iconEl);
    tooltip.appendChild(textEl);
    tooltip.appendChild(dismissBtn);
    
    document.body.appendChild(tooltip);
    
    // Position the tooltip
    positionTooltip(tooltip, target, position);
    
    // Highlight target element if provided
    if (target) {
        target.classList.add('tutorial-highlight');
        setTimeout(() => target.classList.remove('tutorial-highlight'), 3000);
    }
    
    // Auto-dismiss
    if (autoDismiss > 0) {
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                removeTooltip(tooltip);
                if (onDismiss) onDismiss();
            }
        }, autoDismiss);
    }
    
    return tooltip;
}

// Position tooltip relative to target or center of screen
function positionTooltip(tooltip, target, position) {
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (!target) {
        // Center on screen
        tooltip.style.left = `${(window.innerWidth - tooltipRect.width) / 2}px`;
        tooltip.style.top = `${(window.innerHeight - tooltipRect.height) / 2}px`;
        return;
    }
    
    const targetRect = target.getBoundingClientRect();
    const padding = 20;
    
    let left, top;
    
    switch (position) {
        case 'bottom':
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            top = targetRect.bottom + padding;
            break;
        case 'top':
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            top = targetRect.top - tooltipRect.height - padding;
            break;
        case 'right':
            left = targetRect.right + padding;
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            break;
        case 'left':
            left = targetRect.left - tooltipRect.width - padding;
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            break;
        default:
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            top = targetRect.bottom + padding;
    }
    
    // Keep on screen
    left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left));
    top = Math.max(10, Math.min(window.innerHeight - tooltipRect.height - 10, top));
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// Remove a specific tooltip with animation
function removeTooltip(tooltip) {
    tooltip.classList.add('fade-out');
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 200);
}

// Remove all tutorial tooltips
export function removeAllTooltips() {
    const tooltips = document.querySelectorAll('.tutorial-tooltip');
    tooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    });
}

// Predefined tutorial hints
export const TUTORIAL_HINTS = {
    FIRST_EVENT: {
        id: 'first_event',
        text: 'Your choices shape your karma and stats. Make decisions that reflect who you want to be.',
        icon: '🎭'
    },
    FIRST_STAT_CHANGE: {
        id: 'first_stat_change',
        text: 'Your stats changed! Watch the colored bars above - they show your health, wealth, education, and connections.',
        icon: '📊'
    },
    FIRST_DEATH: {
        id: 'first_death',
        text: 'Your karma carries forward to your next life. Higher karma means better starting conditions and lets you unlock new experiences.',
        icon: '☸'
    }
};
