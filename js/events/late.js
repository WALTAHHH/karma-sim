// Late stage events

export const lateEvents = [
{
        id: 'return_home',
        stage: 'late',
        type: 'choice',
        special: 'migration_return',  // Only shows if migrated
        prompt: 'You consider returning to the land of your birth.',
        options: [
            {
                text: 'Go back home',
                preview: { gains: ['connections'], risks: [], description: 'Full circle' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'You return to where it all began.', special: 'return_home' },
                    { weight: 30, effects: { connections: +1, health: +1 }, karma: 1, description: 'Home welcomes you back.', special: 'return_home' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Home has changed. So have you.', special: 'return_home' }
                ]
            },
            {
                text: 'Stay where you are',
                preview: { gains: [], risks: [], description: 'This is home now' },
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Your new home is home enough.' },
                    { weight: 30, effects: { connections: +1 }, karma: 0, description: 'Your roots have grown deep here.' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Regret lingers.' }
                ]
            }
        ]
    },

    // === EXPANDED MIGRATION EVENTS ===

    // Push Events - Forces driving people away,
{
        id: 'nostalgia_weighs',
        stage: 'late',
        type: 'choice',
        special: 'post_migration',
        prompt: 'The smells, the sounds, the faces of home haunt your dreams. You ache for what was.',
        options: [
            {
                text: 'Visit the homeland',
                preview: { gains: ['health'], risks: ['wealth'], description: 'Reconnect with roots' },
                outcomes: [
                    { weight: 45, effects: { health: +1, wealth: -1 }, karma: 0, description: 'The visit heals something inside.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Old bonds rekindled.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Home has changed. The ache deepens.' }
                ]
            },
            {
                text: 'Accept where you are',
                preview: { gains: ['connections'], risks: [], description: 'Present over past' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Your new home is home enough.' },
                    { weight: 30, effects: { health: +1 }, karma: 0, description: 'Peace comes with acceptance.' },
                    { weight: 20, effects: { education: +1 }, karma: 0, description: 'Wisdom from living between worlds.' }
                ]
            }
        ]
    },

    // Second-Generation Events (for children of immigrants),
{
        id: 'childless_reflection',
        stage: 'late',
        type: 'choice',
        special: 'childless_check',  // Only shows if no children
        prompt: 'In quiet moments, you reflect on the life you built. No children carry your name forward.',
        options: [
            {
                text: 'Find meaning elsewhere',
                preview: { description: 'Legacy takes many forms' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Your impact lives in those you mentored, befriended, helped along the way.' },
                    { weight: 35, effects: { education: +1 }, karma: 1, description: 'You created something lasting. Ideas. Work. Art.' },
                    { weight: 20, effects: { health: +1 }, karma: 1, description: 'Freedom has its own rewards. Peace settles in.' }
                ]
            },
            {
                text: 'Sit with the regret',
                preview: { description: 'Be honest about the loss' },
                outcomes: [
                    { weight: 40, effects: { health: -1 }, karma: 0, description: 'The ache of the road not taken. It never fully fades.' },
                    { weight: 35, effects: {}, karma: 0, description: 'You wonder. What if? Who would they have been?' },
                    { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Bitterness seeps into the quiet hours.' }
                ]
            },
            {
                text: 'Nurture the next generation anyway',
                preview: { description: 'Invest in others\' children' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 2, description: 'Nieces, nephews, students, neighbors. You shape lives nonetheless.' },
                    { weight: 30, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Your generosity creates bonds that matter.' },
                    { weight: 20, effects: { health: +1 }, karma: 1, description: 'Watching them grow fills something inside you.' }
                ]
            }
        ]
    },
{
        id: 'child_milestone',
        stage: 'late',
        type: 'choice',
        special: 'has_children',  // Only shows if has children
        prompt: 'Your child reaches a milestone in their own life. A graduation, a wedding, a child of their own.',
        options: [
            {
                text: 'Celebrate openly',
                preview: { description: 'Share in their triumph' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 2, description: 'Joy radiates between generations. They carry on what you began.' },
                    { weight: 30, effects: { health: +1 }, karma: 1, description: 'Pride keeps the years at bay.' },
                    { weight: 20, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'You give generously to mark the occasion.' }
                ]
            },
            {
                text: 'Step back gracefully',
                preview: { description: 'Let them have their moment' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Your quiet pride speaks volumes. They know what you feel.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'The cycle continues without you at the center. That is as it should be.' },
                    { weight: 20, effects: {}, karma: 1, description: 'You watch from the edges. Content.' }
                ]
            },
            {
                text: 'Reflect on your own journey',
                preview: { description: 'Their milestone mirrors your own past' },
                outcomes: [
                    { weight: 45, effects: { health: +1 }, karma: 1, description: 'Memory and present intertwine. Life makes sense, looking back.' },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'You share stories of your own crossing. The bond deepens.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Nostalgia cuts both ways. Some memories still sting.' }
                ]
            }
        ]
    },

    // === LATE LIFE (55+) ===,
{
        id: 'body_slowing',
        stage: 'late',
        type: 'choice',
        prompt: 'Age makes itself known.',
        options: [
            {
                text: 'Accept it gracefully',
                preview: { description: 'Adapt to your changing body' },
                outcomes: [
                    { weight: 45, effects: {}, karma: 1, description: 'You adapt gracefully.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Vulnerability brings others closer.' },
                    { weight: 20, effects: { health: +1 }, karma: 1, description: 'Acceptance brings peace.' }
                ]
            },
            {
                text: 'Fight against it',
                preview: { description: 'Refuse to slow down' },
                outcomes: [
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The body fades despite your efforts.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'Determination keeps you going.' },
                    { weight: 20, effects: { health: -2 }, karma: 0, description: 'Pushing too hard takes its toll.' },
                    { weight: 10, effects: { health: +1 }, karma: 1, description: 'Defiance works. You stay strong.' }
                ]
            }
        ]
    },
{
        id: 'legacy_question',
        stage: 'late',
        type: 'choice',
        requirements: { wealth: '>2' },
        prompt: 'Decisions about your legacy arise.',
        options: [
            {
                text: 'Share generously',
                outcomes: [
                    { weight: 50, effects: { wealth: -1, connections: +1 }, karma: 2, description: 'Gratitude surrounds you.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 1, description: 'Given freely.' },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Disputes arise over your gifts.' }
                ]
            },
            {
                text: 'Hold resources close',
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: -1, description: 'Security in your final years.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Others grow resentful.' },
                    { weight: 25, effects: {}, karma: 0, description: 'Prudence, perhaps.' }
                ]
            }
        ]
    },
{
        id: 'old_regret',
        stage: 'late',
        type: 'choice',
        prompt: 'An old wrong could still be made right.',
        options: [
            {
                text: 'Seek reconciliation',
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 2, description: 'Healing, at last.' },
                    { weight: 35, effects: {}, karma: 1, description: 'The attempt was enough.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'Reopening wounds takes its toll.' }
                ]
            },
            {
                text: 'Let sleeping dogs lie',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Some things cannot be undone.' },
                    { weight: 30, effects: { health: +1 }, karma: 0, description: 'Peace in acceptance.' },
                    { weight: 20, effects: { health: -1 }, karma: -1, description: 'Regret weighs heavy.' }
                ]
            }
        ]
    },
{
        id: 'final_adventure',
        stage: 'late',
        type: 'choice',
        prompt: 'One last chance to see something new.',
        options: [
            {
                text: 'Take the journey',
                outcomes: [
                    { weight: 45, effects: { health: -1 }, karma: 1, description: 'Worth every moment.' },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'New connections, even now.' },
                    { weight: 20, effects: { health: -2 }, karma: 0, description: 'Perhaps too ambitious.' }
                ]
            },
            {
                text: 'Stay in comfort',
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Familiar surroundings soothe.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Content with what you know.' },
                    { weight: 20, effects: { health: -1 }, karma: -1, description: 'Wondering what could have been.' }
                ]
            }
        ]
    },
{
        id: 'wisdom_sought',
        stage: 'late',
        type: 'choice',
        requirements: { education: '>3' },
        prompt: 'Others seek your perspective on important matters.',
        options: [
            {
                text: 'Share your wisdom freely',
                preview: { description: 'Pass on what you\'ve learned' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Your words carry weight.', tagAxis: { self_vs_others: 1 } },
                    { weight: 30, effects: { health: -1 }, karma: 1, description: 'Teaching takes energy, but fills you with purpose.' },
                    { weight: 20, effects: { connections: +1, education: +1 }, karma: 2, description: 'In teaching, you learn something new yourself.' }
                ]
            },
            {
                text: 'Keep your own counsel',
                preview: { description: 'Let them figure it out themselves' },
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'They listen politely to others instead.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'You conserve your energy.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Your silence is noted.' }
                ]
            }
        ]
    },
{
        id: 'health_decline',
        stage: 'late',
        type: 'choice',
        prompt: 'The inevitable draws closer.',
        options: [
            {
                text: 'Seek every treatment',
                preview: { description: 'Fight for every day' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'Treatment buys time, at a cost.' },
                    { weight: 35, effects: {}, karma: 1, description: 'A reprieve, for now.' },
                    { weight: 25, effects: { health: -1, connections: +1 }, karma: 0, description: 'Others rally around you.' }
                ]
            },
            {
                text: 'Accept what comes',
                preview: { description: 'Focus on quality, not quantity' },
                outcomes: [
                    { weight: 40, effects: { health: -1 }, karma: 0, description: 'Each day a little harder.' },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Peace attracts loved ones closer.' },
                    { weight: 25, effects: {}, karma: 1, description: 'Acceptance brings calm.' }
                ]
            }
        ]
    },
{
        id: 'final_kindness',
        stage: 'late',
        type: 'choice',
        prompt: 'A stranger needs help that would cost you.',
        options: [
            {
                text: 'Offer assistance',
                outcomes: [
                    { weight: 50, effects: { wealth: -1 }, karma: 2, description: 'A final gift to the world.' },
                    { weight: 30, effects: { connections: +1 }, karma: 2, description: 'Kindness returned unexpectedly.' },
                    { weight: 20, effects: { health: -1 }, karma: 1, description: 'It takes more than you have.' }
                ]
            },
            {
                text: 'Preserve what remains',
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'Self-preservation is natural.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Resources for your own care.' },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Others notice the refusal.' }
                ]
            }
        ]
    },
{
        id: 'memories',
        stage: 'late',
        type: 'choice',
        prompt: 'The past visits often now.',
        options: [
            {
                text: 'Share your stories',
                preview: { description: 'Let others into your past' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Sharing stories brings others near.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 30, effects: {}, karma: 1, description: 'The telling brings peace.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Reliving old pain takes its toll.' }
                ]
            },
            {
                text: 'Keep them to yourself',
                preview: { description: 'Some things are just for you' },
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'The past stays where it belongs.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 35, effects: { health: +1 }, karma: 1, description: 'Private reflection brings peace.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Some memories hurt when held alone.' }
                ]
            }
        ]
    },

    // ============================================
    // TRADE-OFF EVENTS WITH HIDDEN COSTS
    // ============================================

    // === MONEY VS HEALTH ===,
{
        id: 'community_crisis',
        stage: 'late',
        type: 'choice',
        tradeoff: {
            archetype: 'self_others',
            intensity: 'severe',
            clarity: 'partial'
        },
        prompt: 'Your community faces a crisis. Your help could make a difference.',
        options: [
            {
                text: 'Give everything you can',
                preview: {
                    gains: ['connections', 'karma'],
                    risks: ['health', 'wealth'],
                    description: 'Sacrifice for the greater good'
                },
                outcomes: [
                    { weight: 35, effects: { connections: +2, wealth: -1 }, karma: 3, description: 'A hero in quiet ways.' },
                    { weight: 35, effects: { connections: +1, health: -1 }, karma: 2, description: 'Your body pays the price of service.' },
                    {
                        weight: 30,
                        effects: { connections: +1, wealth: -1, health: -1 },
                        karma: 2,
                        description: 'Everything you have, given.',
                        hiddenCost: {
                            trigger: 'immediate',
                            effects: { health: -1 },
                            description: 'The effort takes its final toll.'
                        }
                    }
                ]
            },
            {
                text: 'Protect yourself first',
                preview: {
                    gains: ['health'],
                    risks: ['connections'],
                    description: 'Self-preservation in crisis'
                },
                outcomes: [
                    { weight: 40, effects: { health: +1 }, karma: -1, description: 'You survive, intact.' },
                    { weight: 35, effects: {}, karma: -2, description: 'Others notice your absence.' },
                    {
                        weight: 25,
                        effects: { connections: -1 },
                        karma: -2,
                        description: 'The community remembers who stood aside.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 2,
                            effects: { connections: -1 },
                            description: 'Your isolation deepens.'
                        }
                    }
                ]
            }
        ]
    },

    // ============================================
    // ERA-SPECIFIC EVENTS
    // ============================================

    // === PRE-INDUSTRIAL (1700-1850) ===
];
