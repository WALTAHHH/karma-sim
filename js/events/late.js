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

    // === NEW LATE-STAGE EVENTS ===

    // Generational values - tradition_vs_change axis
    {
        id: 'generational_values',
        stage: 'late',
        type: 'choice',
        prompt: 'The younger generation does things very differently. You struggle to understand—or accept.',
        options: [
            {
                text: 'Hold firm to what you know',
                preview: { description: 'Tradition has value they cannot see' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'They call you stubborn. Perhaps you are.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Certainty is its own comfort.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 25, effects: { connections: +1 }, karma: 1, description: 'Some seek you out for precisely this wisdom.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'traditionalist' }
                ]
            },
            {
                text: 'Try to learn their ways',
                preview: { description: 'Perhaps they know something you do not' },
                outcomes: [
                    { weight: 40, effects: { education: +1 }, karma: 1, description: 'Old dogs can learn. It just takes longer.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Your openness surprises them. Bridges form.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'The pace of change exhausts you.', tagAxis: { tradition_vs_change: -1 } }
                ]
            }
        ]
    },

    // Late wanderlust - roots_vs_wings axis, wanderer/rooted grants
    {
        id: 'late_wanderlust',
        stage: 'late',
        type: 'choice',
        prompt: 'Your grandchildren have scattered. Friends pass on. You realize nothing ties you here anymore.',
        options: [
            {
                text: 'Travel while you still can',
                preview: { description: 'See what remains unseen' },
                outcomes: [
                    { weight: 35, effects: { health: -1, education: +1 }, karma: 1, description: 'Every place teaches something. Even now.', tagAxis: { roots_vs_wings: 1 }, grantsTag: 'wanderer' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'You meet others on the road. Fellow seekers.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Money spent on memories. Worth it.', tagAxis: { roots_vs_wings: 1 } }
                ]
            },
            {
                text: 'Deepen where you are planted',
                preview: { description: 'Home is home for a reason' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'Community knows your name. That matters.', tagAxis: { roots_vs_wings: -1 }, grantsTag: 'rooted' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Familiar ground eases the burden of age.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 25, effects: {}, karma: 0, description: 'You watch the seasons turn. One more time.', tagAxis: { roots_vs_wings: -1 } }
                ]
            }
        ]
    },

    // Tradition keeper (middle-stage event moved to late with late variant)
    {
        id: 'tradition_keeper_late',
        stage: 'late',
        type: 'choice',
        prompt: 'An old tradition is dying. You may be the last who remembers it properly.',
        options: [
            {
                text: 'Preserve it faithfully',
                preview: { description: 'Some things must not be lost' },
                outcomes: [
                    { weight: 40, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'Time and money spent on memory. The tradition lives.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: { education: +1 }, karma: 1, description: 'Teaching others, you understand it more deeply yourself.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'traditionalist' },
                    { weight: 25, effects: {}, karma: 0, description: 'You try. Whether it takes root remains to be seen.' }
                ]
            },
            {
                text: 'Let it evolve',
                preview: { description: 'Adaptation is how traditions survive' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 0, description: 'The young make it their own. Different, but alive.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'Watching it change hurts. But change is life.' },
                    { weight: 25, effects: { education: +1, connections: +1 }, karma: 1, description: 'New and old merge. Something better emerges.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'progressive' }
                ]
            },
            {
                text: 'Let it go',
                preview: { description: 'Not everything deserves to survive' },
                outcomes: [
                    { weight: 40, effects: {}, karma: 0, description: 'It fades. Perhaps that is natural.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'One less burden to carry.' },
                    { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Others hoped you would care more.' }
                ]
            }
        ]
    },

    // Passing the torch
    {
        id: 'passing_torch',
        stage: 'late',
        type: 'choice',
        requirements: { education: '>2' },
        prompt: 'Someone young shows promise in your field. They could carry your work forward.',
        options: [
            {
                text: 'Mentor them intensively',
                preview: { description: 'Pass on everything you know' },
                outcomes: [
                    { weight: 45, effects: { connections: +1, health: -1 }, karma: 2, description: 'Your knowledge lives on in them.', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: { education: +1 }, karma: 1, description: 'Teaching deepens your own understanding.', tagAxis: { self_vs_others: 1 } },
                    { weight: 20, effects: { connections: +1 }, karma: 2, description: 'They surpass you. That is the point.', tagAxis: { self_vs_others: 1 }, grantsTag: 'generous' }
                ]
            },
            {
                text: 'Let them find their own way',
                preview: { description: 'Independence is the best teacher' },
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'They struggle, but grow.', tagAxis: { self_vs_others: -1 } },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'You conserve your remaining energy.' },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'They wonder why you did not help more.', tagAxis: { self_vs_others: -1 } }
                ]
            }
        ]
    },

    // Old debts
    {
        id: 'old_debts',
        stage: 'late',
        type: 'choice',
        prompt: 'Someone from your past seeks you out. They remember a kindness—or a wrong.',
        options: [
            {
                text: 'Face them openly',
                preview: { description: 'Whatever comes, meet it head on' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'Old accounts settle. Peace follows.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The past carries weight you had forgotten.' },
                    { weight: 25, effects: { wealth: +1 }, karma: 1, description: 'A debt repaid, unexpectedly.' }
                ]
            },
            {
                text: 'Avoid the encounter',
                preview: { description: 'Some chapters are best left closed' },
                outcomes: [
                    { weight: 40, effects: {}, karma: 0, description: 'They move on. So do you.' },
                    { weight: 35, effects: { health: -1 }, karma: -1, description: 'Avoidance has its own weight.' },
                    { weight: 25, effects: { connections: -1 }, karma: 0, description: 'They take your silence as an answer.' }
                ]
            }
        ]
    },

    // Downsizing life
    {
        id: 'downsizing_life',
        stage: 'late',
        type: 'choice',
        prompt: 'Your home has grown too large. Too many rooms, too many memories, too many stairs.',
        options: [
            {
                text: 'Move somewhere smaller',
                preview: { description: 'Simplify while you can choose' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1, health: +1 }, karma: 0, description: 'Less to maintain. More to live.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'The new place suits your needs.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 25, effects: { connections: -1 }, karma: 0, description: 'You leave behind more than a house.', tagAxis: { tradition_vs_change: -1 } }
                ]
            },
            {
                text: 'Stay in the family home',
                preview: { description: 'This is where life happened' },
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Grandchildren visit where their parents grew up.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: { wealth: -1, health: -1 }, karma: 0, description: 'Maintenance becomes a burden.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 30, effects: { health: +1 }, karma: 1, description: 'Every room holds a story. You are not ready to close the book.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'rooted' }
                ]
            }
        ]
    },

    // === ERA VARIANTS FOR LATE STAGE ===

    // Plague survival - late stage era variant
    {
        id: 'plague_survival_late',
        stage: 'late',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'The plague returns to your village. At your age, survival is unlikely. But perhaps that changes what you do.',
                options: [
                    {
                        text: 'Tend to the dying',
                        preview: { description: 'If death comes anyway, let it come doing good' },
                        outcomes: [
                            { weight: 40, effects: { health: -2, connections: +1 }, karma: 3, description: 'Your final days bring comfort to others.', tagAxis: { self_vs_others: 2 } },
                            { weight: 35, effects: { connections: +1 }, karma: 2, description: 'Somehow you survive. The village remembers.' },
                            { weight: 25, effects: { health: -1 }, karma: 2, description: 'Service unto the end. A life well-closed.' }
                        ]
                    },
                    {
                        text: 'Retreat to safety',
                        preview: { description: 'Preserve what days remain' },
                        outcomes: [
                            { weight: 40, effects: { health: +1 }, karma: 0, description: 'You outlive the outbreak. Alone.', tagAxis: { self_vs_others: -1 } },
                            { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Those who stayed remember your absence.' },
                            { weight: 25, effects: {}, karma: 0, description: 'Neither hero nor coward. Just alive.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Disease threatens your community. What role do you play?',
        options: [
            {
                text: 'Help where you can',
                outcomes: [
                    { weight: 50, effects: { health: -1, connections: +1 }, karma: 2, description: 'Service in the twilight.' },
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Your experience guides others.' }
                ]
            }
        ]
    },

    // Digital divide - contemporary/digital era variant
    {
        id: 'digital_divide',
        stage: 'late',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'The world has moved online. Banking, communication, even medical appointments. You feel left behind.',
                options: [
                    {
                        text: 'Learn the new ways',
                        preview: { description: 'Adapt or be forgotten' },
                        outcomes: [
                            { weight: 35, effects: { education: +1, health: -1 }, karma: 1, description: 'Frustrating hours at the screen. But you learn.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'progressive' },
                            { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Video calls bring distant faces close. Worth it.' },
                            { weight: 30, effects: { education: +1 }, karma: 0, description: 'Never fluent, but functional. That is enough.' }
                        ]
                    },
                    {
                        text: 'Rely on others to help',
                        preview: { description: 'Let family handle it' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Grandchildren explain patiently. A new kind of bond.', tagAxis: { social_vs_solitary: 1 } },
                            { weight: 35, effects: { connections: -1 }, karma: 0, description: 'You become a burden. They have their own lives.' },
                            { weight: 25, effects: { wealth: -1 }, karma: 0, description: 'You pay someone to manage what you cannot.' }
                        ]
                    },
                    {
                        text: 'Refuse to participate',
                        preview: { description: 'The old ways worked fine' },
                        outcomes: [
                            { weight: 35, effects: { health: +1 }, karma: 0, description: 'Peace in simplicity. Some doors close.', tagAxis: { tradition_vs_change: 1 } },
                            { weight: 35, effects: { connections: -1, wealth: -1 }, karma: 0, description: 'The world moves on without you. Literally.' },
                            { weight: 30, effects: {}, karma: 0, description: 'You manage. Barely. On the margins.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'traditionalist' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Technology reshapes daily life. How do you respond?',
        options: [
            {
                text: 'Adapt',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 0, description: 'You learn what you must.' },
                    { weight: 50, effects: {}, karma: 0, description: 'Changes come whether you want them or not.' }
                ]
            }
        ]
    },

    // Industrial revolution late variant - factory closure
    {
        id: 'factory_closure_late',
        stage: 'late',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'The factory that employed you for decades is closing. Your skills are obsolete. Your body is worn.',
                options: [
                    {
                        text: 'Seek the workhouse',
                        preview: { description: 'At least there is food and shelter' },
                        outcomes: [
                            { weight: 40, effects: { health: -1, wealth: -1 }, karma: 0, description: 'The workhouse takes what pride remains.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'Survival, barely.' },
                            { weight: 25, effects: { connections: +1 }, karma: 0, description: 'Fellow workers share the burden.' }
                        ]
                    },
                    {
                        text: 'Rely on family',
                        preview: { description: 'They owe you for years of sacrifice' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Family takes you in. Dignity preserved.' },
                            { weight: 35, effects: { health: +1 }, karma: 1, description: 'Rest at last, surrounded by those you raised.' },
                            { weight: 25, effects: { connections: -1 }, karma: -1, description: 'They have their own struggles. You are a burden.' }
                        ]
                    },
                    {
                        text: 'Share what wisdom you have',
                        preview: { description: 'The young need guidance for the new machines' },
                        outcomes: [
                            { weight: 35, effects: { education: +1, connections: +1 }, karma: 1, description: 'Your experience still has value.', tagAxis: { tradition_vs_change: 1 } },
                            { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'A small wage for your knowledge.' },
                            { weight: 30, effects: { connections: -1 }, karma: 0, description: 'They have no patience for old methods.', tagAxis: { tradition_vs_change: -1 } }
                        ]
                    }
                ]
            }
        },
        prompt: 'Economic change leaves you behind. How do you survive?',
        options: [
            {
                text: 'Adapt as best you can',
                outcomes: [
                    { weight: 50, effects: { health: -1 }, karma: 0, description: 'Age makes adaptation harder.' },
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Others help you through.' }
                ]
            }
        ]
    },

    // Cold War late variant - witness to history
    {
        id: 'cold_war_twilight',
        stage: 'late',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'You have lived through world wars, nuclear fears, and the space race. The young ask: what was it like?',
                options: [
                    {
                        text: 'Share the stories',
                        preview: { description: 'History lives in those who witnessed it' },
                        outcomes: [
                            { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Your memories become their lessons.', tagAxis: { social_vs_solitary: 1 } },
                            { weight: 35, effects: { education: +1 }, karma: 1, description: 'Telling helps you understand what you lived through.', tagAxis: { tradition_vs_change: 1 } },
                            { weight: 20, effects: { health: -1 }, karma: 0, description: 'Some memories are heavy to carry again.' }
                        ]
                    },
                    {
                        text: 'Let the past rest',
                        preview: { description: 'Some things are better forgotten' },
                        outcomes: [
                            { weight: 45, effects: { health: +1 }, karma: 0, description: 'Peace in moving forward.', tagAxis: { social_vs_solitary: -1 } },
                            { weight: 35, effects: {}, karma: 0, description: 'The young have their own futures to make.' },
                            { weight: 20, effects: { connections: -1 }, karma: -1, description: 'They wanted to know you. You closed the door.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'The younger generation wants to understand what you lived through.',
        options: [
            {
                text: 'Share your perspective',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Experience shared.' },
                    { weight: 50, effects: {}, karma: 0, description: 'Some things are hard to explain.' }
                ]
            }
        ]
    }
];
