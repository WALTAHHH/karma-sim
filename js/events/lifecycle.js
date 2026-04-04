// Death and crisis events

export const deathEvents = [
    {
        id: 'peaceful_end',
        requirements: { health: '>2' },
        prompt: 'Sleep takes you gently.',
        description: 'You slip away peacefully.'
    },
    {
        id: 'illness_end',
        requirements: { health: '<3' },
        prompt: 'The struggle ends.',
        description: 'Your body finally rests.'
    },
    {
        id: 'surrounded',
        requirements: { connections: '>3' },
        prompt: 'Familiar faces surround you.',
        description: 'You are not alone at the end.'
    },
    {
        id: 'alone',
        requirements: { connections: '<2' },
        prompt: 'Silence fills the room.',
        description: 'You face the end alone.'
    },
    {
        id: 'sudden',
        prompt: 'It comes without warning.',
        description: 'Swift and unexpected.'
    }
];

// === CRISIS EVENTS ===
// These trigger when stats are dangerously low, creating punishing spiral dynamics

export const crisisEvents = [
    // --- HEALTH CRISIS (health 1-2) ---
    {
        id: 'health_crisis_illness',
        type: 'forced',
        crisisStat: 'health',
        prompt: 'Your weakened body betrays you. Illness takes hold with a vengeance.',
        options: [{
            text: 'Endure',
            outcomes: [
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'The sickness worsens. You feel yourself slipping.' },
                { weight: 30, effects: {}, karma: 0, description: 'You cling to life, barely.' },
                { weight: 20, effects: { health: +1 }, karma: 1, description: 'Against all odds, you rally.' }
            ]
        }]
    },
    {
        id: 'health_crisis_treatment',
        type: 'choice',
        crisisStat: 'health',
        prompt: 'Your body is failing. There may be a way to recover, but at a cost.',
        options: [
            {
                text: 'Seek expensive treatment',
                outcomes: [
                    { weight: 50, effects: { health: +1, wealth: -1 }, karma: 0, description: 'The treatment works, but drains your resources.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'The treatment fails. Money wasted.' },
                    { weight: 20, effects: { health: +2, wealth: -1 }, karma: 0, description: 'A full recovery. Worth every coin.' }
                ],
                preview: { description: 'Trade wealth for a chance at health' }
            },
            {
                text: 'Ask others for help',
                outcomes: [
                    { weight: 40, effects: { health: +1, connections: -1 }, karma: 0, description: 'Help comes, but you owe favors now.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'They try, but cannot save you from this.' },
                    { weight: 25, effects: { health: +1 }, karma: 1, description: 'True friends ask nothing in return.' }
                ],
                preview: { description: 'Rely on your connections' }
            },
            {
                text: 'Suffer through it alone',
                outcomes: [
                    { weight: 60, effects: { health: -1 }, karma: 0, description: 'Pride has a price. Your condition worsens.' },
                    { weight: 40, effects: {}, karma: 1, description: 'Stubbornness keeps you alive, barely.' }
                ],
                preview: { description: 'Refuse to burden others' }
            }
        ]
    },
    {
        id: 'health_crisis_collapse',
        type: 'forced',
        crisisStat: 'health',
        prompt: 'You collapse. Your body has reached its limit.',
        options: [{
            text: 'Fight to survive',
            outcomes: [
                { weight: 45, effects: { health: -1 }, karma: 0, description: 'Darkness creeps at the edges of your vision.' },
                { weight: 35, effects: {}, karma: 0, description: 'You claw your way back to consciousness.' },
                { weight: 20, effects: { health: -1, wealth: -1 }, karma: 0, description: 'Emergency care saves you, but at great cost.' }
            ]
        }]
    },

    // --- POVERTY CRISIS (wealth 1) ---
    {
        id: 'poverty_crisis_hunger',
        type: 'forced',
        crisisStat: 'wealth',
        prompt: 'Hunger gnaws at you. There is not enough to eat.',
        options: [{
            text: 'Endure the hunger',
            outcomes: [
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'Your body weakens from malnutrition.' },
                { weight: 30, effects: {}, karma: 0, description: 'You scrape by on what little you find.' },
                { weight: 20, effects: { connections: +1 }, karma: 1, description: 'A stranger shares their food with you.' }
            ]
        }]
    },
    {
        id: 'poverty_crisis_desperate',
        type: 'choice',
        crisisStat: 'wealth',
        prompt: 'Desperation claws at you. You need resources to survive.',
        options: [
            {
                text: 'Take what isn\'t yours',
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: -2, description: 'You survive. The guilt lingers.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Caught. Your reputation suffers.' },
                    { weight: 25, effects: { health: -1 }, karma: -1, description: 'A confrontation goes badly. You pay in blood.' }
                ],
                preview: { description: 'Resort to theft' }
            },
            {
                text: 'Beg for help',
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Charity saves you, this time.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'No one helps. The streets are cold.' },
                    { weight: 20, effects: { wealth: +1, connections: +1 }, karma: 1, description: 'Someone sees your worth and offers a hand up.' }
                ],
                preview: { description: 'Humble yourself and ask' }
            },
            {
                text: 'Sell what little you have',
                outcomes: [
                    { weight: 50, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'You part with something precious. It hurts.' },
                    { weight: 30, effects: {}, karma: 0, description: 'No buyers. No relief.' },
                    { weight: 20, effects: { wealth: +1 }, karma: 0, description: 'A fair price for what you offer.' }
                ],
                preview: { description: 'Liquidate your possessions' }
            }
        ]
    },
    {
        id: 'poverty_crisis_debt',
        type: 'forced',
        crisisStat: 'wealth',
        prompt: 'Creditors come calling. There is nothing left to give.',
        options: [{
            text: 'Face them',
            outcomes: [
                { weight: 45, effects: { connections: -1 }, karma: 0, description: 'Your reputation crumbles with your finances.' },
                { weight: 35, effects: { health: -1 }, karma: 0, description: 'The encounter turns violent.' },
                { weight: 20, effects: {}, karma: 0, description: 'They leave empty-handed, for now.' }
            ]
        }]
    },

    // --- ISOLATION CRISIS (connections 1) ---
    {
        id: 'isolation_crisis_alone',
        type: 'forced',
        crisisStat: 'connections',
        prompt: 'When trouble comes, there is no one to call. You face it alone.',
        options: [{
            text: 'Manage on your own',
            outcomes: [
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'Without help, everything is harder.' },
                { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Problems that friends could solve cost you dearly.' },
                { weight: 20, effects: {}, karma: 1, description: 'Solitude builds a certain strength.' }
            ]
        }]
    },
    {
        id: 'isolation_crisis_reconnect',
        type: 'choice',
        crisisStat: 'connections',
        prompt: 'The loneliness is crushing. A chance to reconnect appears, but bridges have burned.',
        options: [
            {
                text: 'Reach out to someone from your past',
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'They remember the good times. A friendship rekindles.' },
                    { weight: 35, effects: {}, karma: 0, description: 'They have moved on. The door stays closed.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'The rejection stings deeply.' }
                ],
                preview: { description: 'Risk rejection to reconnect' }
            },
            {
                text: 'Seek new connections',
                outcomes: [
                    { weight: 45, effects: { connections: +1, wealth: -1 }, karma: 0, description: 'Making friends costs time and money you can barely spare.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Trust is hard to build when you have so little to offer.' },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Someone sees past your circumstances.' }
                ],
                preview: { description: 'Start fresh with strangers' }
            },
            {
                text: 'Embrace solitude',
                outcomes: [
                    { weight: 50, effects: { health: -1 }, karma: 0, description: 'Humans are not meant to be alone. It takes a toll.' },
                    { weight: 30, effects: {}, karma: 0, description: 'You learn to live with the silence.' },
                    { weight: 20, effects: { education: +1 }, karma: 0, description: 'In solitude, you turn to learning.' }
                ],
                preview: { description: 'Accept your isolation' }
            }
        ]
    },
    {
        id: 'isolation_crisis_vulnerable',
        type: 'forced',
        crisisStat: 'connections',
        prompt: 'Without allies, you are vulnerable. Someone takes advantage.',
        options: [{
            text: 'Endure the exploitation',
            outcomes: [
                { weight: 50, effects: { wealth: -1 }, karma: 0, description: 'They take what they want. You have no one to turn to.' },
                { weight: 30, effects: { health: -1 }, karma: 0, description: 'The powerlessness wounds more than the loss.' },
                { weight: 20, effects: {}, karma: 1, description: 'You weather the storm, somehow.' }
            ]
        }]
    }
];
