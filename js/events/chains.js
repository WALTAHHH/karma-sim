// Consequence chains and chain events

export const consequenceChains = {
    debt_spiral: {
        id: 'debt_spiral',
        name: 'Debt Spiral',
        triggerEventId: 'risky_investment',
        triggerOutcomeMatch: (outcome) => outcome.effects?.wealth <= -1,
        chain: [
            { delay: 1, eventId: 'creditor_pressure' },
            { delay: 3, eventId: 'desperate_measures' },
            { delay: 5, eventId: 'rock_bottom_or_recovery' }
        ]
    },
    mentorship_arc: {
        id: 'mentorship_arc',
        name: 'Mentorship',
        triggerEventId: 'childhood_friendship',
        triggerOutcomeMatch: (outcome) => outcome.karma >= 1 && outcome.effects?.connections >= 1,
        chain: [
            { delay: 2, eventId: 'mentor_advice' },
            { delay: 5, eventId: 'mentor_opportunity' },
            { delay: 8, eventId: 'mentor_legacy' }
        ]
    },
    health_decline: {
        id: 'health_decline',
        name: 'Health Decline',
        triggerEventId: 'overtime_promotion',
        triggerOutcomeMatch: (outcome) => outcome.hiddenCost?.effects?.health <= -1,
        chain: [
            { delay: 2, eventId: 'chronic_condition_begins' },
            { delay: 4, eventId: 'treatment_decision' },
            { delay: 7, eventId: 'long_term_health_outcome' }
        ]
    },
    career_advancement: {
        id: 'career_advancement',
        name: 'Career Advancement',
        triggerEventId: 'job_offer',
        triggerOutcomeMatch: (outcome) => outcome.effects?.wealth >= 1,
        chain: [
            { delay: 2, eventId: 'career_recognition' },
            { delay: 5, eventId: 'leadership_opportunity' }
        ]
    },
    family_estrangement: {
        id: 'family_estrangement',
        name: 'Family Estrangement',
        triggerEventId: 'family_needs_you',
        triggerOutcomeMatch: (outcome) => outcome.effects?.connections <= -1,
        chain: [
            { delay: 3, eventId: 'family_silence' },
            { delay: 6, eventId: 'reconciliation_chance' }
        ]
    },
    community_hero: {
        id: 'community_hero',
        name: 'Community Hero',
        triggerEventId: 'community_crisis',
        triggerOutcomeMatch: (outcome) => outcome.karma >= 2,
        chain: [
            { delay: 2, eventId: 'local_recognition' },
            { delay: 5, eventId: 'leadership_mantle' }
        ]
    },
    immigration_journey: {
        id: 'immigration_journey',
        name: 'Immigration Journey',
        triggerEventId: 'opportunity_abroad',
        triggerOutcomeMatch: (outcome) => outcome.effects?.connections <= -1,
        chain: [
            { delay: 1, eventId: 'culture_shock_event' },
            { delay: 3, eventId: 'finding_community_abroad' },
            { delay: 6, eventId: 'roots_or_return' }
        ]
    },
    entrepreneurial_path: {
        id: 'entrepreneurial_path',
        name: 'Entrepreneurial Path',
        triggerEventId: 'startup_dream',
        triggerOutcomeMatch: (outcome) => outcome.effects?.wealth >= 1,
        chain: [
            { delay: 2, eventId: 'business_crossroads' },
            { delay: 5, eventId: 'expansion_or_exit' }
        ]
    }
};

export const chainEvents = [
    // Debt spiral chain
    {
        id: 'creditor_pressure',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'Creditors come calling. The debts you accumulated have come due.',
        options: [
            {
                text: 'Negotiate terms',
                outcomes: [
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'Extended payments, but the burden remains.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Burning bridges to buy time.' },
                    { weight: 25, effects: {}, karma: 1, description: 'A reasonable arrangement is reached.' }
                ]
            },
            {
                text: 'Avoid and delay',
                outcomes: [
                    { weight: 45, effects: { health: -1 }, karma: -1, description: 'The stress takes its toll.' },
                    { weight: 35, effects: { wealth: -1, connections: -1 }, karma: -1, description: 'Things only get worse.' },
                    { weight: 20, effects: {}, karma: 0, description: 'You buy some time.' }
                ]
            }
        ]
    },
    {
        id: 'desperate_measures',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'Backed into a corner, desperate options present themselves.',
        options: [
            {
                text: 'Take a risky opportunity',
                outcomes: [
                    { weight: 30, effects: { wealth: +2 }, karma: -1, description: 'A gamble pays off, ethics questionable.' },
                    { weight: 40, effects: { health: -1 }, karma: 0, description: 'The stress is unbearable.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'It falls through.' }
                ]
            },
            {
                text: 'Seek help from others',
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'Help comes, but at the cost of pride.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 1, description: 'Generosity from unexpected quarters.' },
                    { weight: 25, effects: {}, karma: 0, description: 'No one can help.' }
                ]
            }
        ]
    },
    {
        id: 'rock_bottom_or_recovery',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'The crisis reaches its culmination.',
        options: [{
            text: 'Face the outcome',
            outcomes: [
                { weight: 35, effects: { wealth: +1, health: +1 }, karma: 1, description: 'You emerge stronger, wiser.' },
                { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Rock bottom, but stable.' },
                { weight: 30, effects: { connections: +1 }, karma: 1, description: 'The struggle brought true friends.' }
            ]
        }]
    },

    // Mentorship chain
    {
        id: 'mentor_advice',
        stage: 'young_adult',
        type: 'forced',
        chainOnly: true,
        prompt: 'An older friend offers hard-won wisdom.',
        options: [{
            text: 'Listen carefully',
            outcomes: [
                { weight: 45, effects: { education: +1 }, karma: 0, description: 'Their words shape your thinking.' },
                { weight: 35, effects: { connections: +1 }, karma: 1, description: 'The bond deepens.' },
                { weight: 20, effects: {}, karma: 0, description: 'Good advice, hard to follow.' }
            ]
        }]
    },
    {
        id: 'mentor_opportunity',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'Your mentor opens a door you could never have reached alone.',
        options: [
            {
                text: 'Seize the opportunity',
                outcomes: [
                    { weight: 50, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'Their faith in you was justified.' },
                    { weight: 30, effects: { education: +1 }, karma: 0, description: 'A learning experience.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The pressure is intense.' }
                ]
            },
            {
                text: 'Defer to others',
                outcomes: [
                    { weight: 50, effects: {}, karma: 1, description: 'Humble, but a missed chance.' },
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Your mentor appreciates your character.' }
                ]
            }
        ]
    },
    {
        id: 'mentor_legacy',
        stage: 'late',
        type: 'forced',
        chainOnly: true,
        prompt: 'Your mentor passes, leaving you their legacy to carry forward.',
        options: [{
            text: 'Honor their memory',
            outcomes: [
                { weight: 50, effects: { connections: +1 }, karma: 2, description: 'You become the mentor now.' },
                { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Tangible legacy received.' },
                { weight: 20, effects: { health: -1 }, karma: 1, description: 'The loss weighs heavy.' }
            ]
        }]
    },

    // Health decline chain
    {
        id: 'chronic_condition_begins',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'Your body begins to show signs of wear from past strains.',
        options: [{
            text: 'Acknowledge the symptoms',
            outcomes: [
                { weight: 40, effects: { health: -1 }, karma: 0, description: 'The decline has begun.' },
                { weight: 35, effects: {}, karma: 0, description: 'Manageable, for now.' },
                { weight: 25, effects: { wealth: -1 }, karma: 0, description: 'Medical expenses begin.' }
            ]
        }]
    },
    {
        id: 'treatment_decision',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'Treatment options exist, but each has costs.',
        options: [
            {
                text: 'Pursue aggressive treatment',
                outcomes: [
                    { weight: 40, effects: { health: +1, wealth: -2 }, karma: 0, description: 'Expensive but effective.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Partial improvement.' },
                    { weight: 25, effects: { health: -1, wealth: -1 }, karma: 0, description: 'Side effects complicate matters.' }
                ]
            },
            {
                text: 'Manage conservatively',
                outcomes: [
                    { weight: 40, effects: {}, karma: 0, description: 'Status quo maintained.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'Gradual decline continues.' },
                    { weight: 25, effects: { health: +1 }, karma: 0, description: 'Sometimes less is more.' }
                ]
            }
        ]
    },
    {
        id: 'long_term_health_outcome',
        stage: 'late',
        type: 'forced',
        chainOnly: true,
        prompt: 'Years of health challenges reach their resolution.',
        options: [{
            text: 'Accept the outcome',
            outcomes: [
                { weight: 35, effects: { health: +1 }, karma: 1, description: 'Remission brings renewed appreciation for life.' },
                { weight: 35, effects: { health: -1 }, karma: 0, description: 'The condition becomes your constant companion.' },
                { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Illness brought those who matter closer.' }
            ]
        }]
    },

    // Career advancement chain
    {
        id: 'career_recognition',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'Your work has not gone unnoticed.',
        options: [{
            text: 'Accept the recognition',
            outcomes: [
                { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Reward for effort.' },
                { weight: 30, effects: { connections: +1 }, karma: 0, description: 'New doors open.' },
                { weight: 20, effects: { health: -1 }, karma: 0, description: 'Higher expectations follow.' }
            ]
        }]
    },
    {
        id: 'leadership_opportunity',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'A leadership position is offered.',
        options: [
            {
                text: 'Accept leadership',
                outcomes: [
                    { weight: 40, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'Power and responsibility.' },
                    { weight: 35, effects: { health: -1, wealth: +1 }, karma: 0, description: 'The weight of command.' },
                    { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Leadership creates distance.' }
                ]
            },
            {
                text: 'Decline',
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Peace in the familiar.' },
                    { weight: 50, effects: {}, karma: 0, description: 'Another path awaits.' }
                ]
            }
        ]
    },

    // Family estrangement chain
    {
        id: 'family_silence',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'The silence from family grows deafening.',
        options: [{
            text: 'Endure the distance',
            outcomes: [
                { weight: 40, effects: { health: -1 }, karma: 0, description: 'Isolation takes its toll.' },
                { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Chosen family fills the void.' },
                { weight: 25, effects: {}, karma: -1, description: 'Time passes in cold separation.' }
            ]
        }]
    },
    {
        id: 'reconciliation_chance',
        stage: 'late',
        type: 'choice',
        chainOnly: true,
        prompt: 'An unexpected opening appears for reconciliation.',
        options: [
            {
                text: 'Reach out',
                outcomes: [
                    { weight: 45, effects: { connections: +2 }, karma: 2, description: 'Family restored.' },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Partial healing.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The wounds were too deep.' }
                ]
            },
            {
                text: 'Maintain distance',
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Peace in separation.' },
                    { weight: 50, effects: {}, karma: -1, description: 'Some doors close forever.' }
                ]
            }
        ]
    },

    // Community hero chain
    {
        id: 'local_recognition',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'Your community remembers your sacrifice.',
        options: [{
            text: 'Accept gracefully',
            outcomes: [
                { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Respect earned.' },
                { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Opportunities arise from reputation.' },
                { weight: 20, effects: {}, karma: 0, description: 'A quiet acknowledgment.' }
            ]
        }]
    },
    {
        id: 'leadership_mantle',
        stage: 'late',
        type: 'choice',
        chainOnly: true,
        prompt: 'The community looks to you for continued leadership.',
        options: [
            {
                text: 'Lead again',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 2, description: 'Service defines your later years.' },
                    { weight: 35, effects: { health: -1 }, karma: 1, description: 'Exhausting but meaningful.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 1, description: 'Personal cost for public good.' }
                ]
            },
            {
                text: 'Pass the torch',
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Graceful transition.' },
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Mentoring the next generation.' }
                ]
            }
        ]
    },

    // Immigration journey chain
    {
        id: 'culture_shock_event',
        stage: 'young_adult',
        type: 'forced',
        chainOnly: true,
        prompt: 'Everything is different here. The culture, the customs, the language.',
        options: [{
            text: 'Adapt as best you can',
            outcomes: [
                { weight: 40, effects: { health: -1 }, karma: 0, description: 'The stress of displacement.' },
                { weight: 35, effects: { education: +1 }, karma: 0, description: 'Learning through immersion.' },
                { weight: 25, effects: { connections: -1 }, karma: 0, description: 'Isolation in a sea of strangers.' }
            ]
        }]
    },
    {
        id: 'finding_community_abroad',
        stage: 'middle',
        type: 'forced',
        chainOnly: true,
        prompt: 'You find others from your homeland, building bridges between worlds.',
        options: [{
            text: 'Join the diaspora community',
            outcomes: [
                { weight: 50, effects: { connections: +1 }, karma: 0, description: 'A home away from home.' },
                { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Network brings opportunity.' },
                { weight: 20, effects: { health: +1 }, karma: 1, description: 'Belonging heals.' }
            ]
        }]
    },
    {
        id: 'roots_or_return',
        stage: 'late',
        type: 'choice',
        chainOnly: true,
        prompt: 'After years abroad, you must decide where your heart truly lies.',
        options: [
            {
                text: 'Put down permanent roots',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'This is home now.' },
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Acceptance brings peace.' }
                ]
            },
            {
                text: 'Return to homeland',
                outcomes: [
                    { weight: 40, effects: { connections: -1, health: +1 }, karma: 0, description: 'Full circle.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Family reunited.' },
                    { weight: 25, effects: {}, karma: 0, description: 'Neither here nor there.' }
                ]
            }
        ]
    },

    // Entrepreneurial path chain
    {
        id: 'business_crossroads',
        stage: 'middle',
        type: 'choice',
        chainOnly: true,
        prompt: 'Your business reaches a critical juncture.',
        options: [
            {
                text: 'Double down and expand',
                outcomes: [
                    { weight: 35, effects: { wealth: +2 }, karma: 0, description: 'Calculated risk pays off.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'Success costs sleep.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Overreach leads to setback.' }
                ]
            },
            {
                text: 'Stabilize and consolidate',
                outcomes: [
                    { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Steady growth.' },
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Sustainable success.' }
                ]
            }
        ]
    },
    {
        id: 'expansion_or_exit',
        stage: 'late',
        type: 'choice',
        chainOnly: true,
        prompt: 'Offers come for your business. Sell now or keep building?',
        options: [
            {
                text: 'Sell and retire',
                outcomes: [
                    { weight: 50, effects: { wealth: +2, health: +1 }, karma: 0, description: 'Golden parachute.' },
                    { weight: 50, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Clean break.' }
                ]
            },
            {
                text: 'Keep building',
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'The work continues.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'No rest for the driven.' },
                    { weight: 25, effects: { connections: +1 }, karma: 1, description: 'Building a legacy.' }
                ]
            }
        ]
    }
];
