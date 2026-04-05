// Young adult stage events

export const young_adultEvents = [
{
        id: 'leave_home',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'The time comes to decide your path.',
        options: [
            {
                text: 'Leave for the city',
                outcomes: [
                    { weight: 40, effects: { connections: -1, wealth: +1 }, karma: 0, description: 'Opportunity awaits, but at a cost.', tagAxis: { roots_vs_wings: 1, family_vs_career: -1 } },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'City life proves harsh.', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 25, effects: { wealth: +1, education: +1 }, karma: 1, description: 'You find your footing and more.', tagAxis: { roots_vs_wings: 1, family_vs_career: -1 } }
                ]
            },
            {
                text: 'Stay close to home',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Family remains close.', tagAxis: { roots_vs_wings: -1, family_vs_career: 1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'Life goes on as expected.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Opportunities are scarce here.', tagAxis: { roots_vs_wings: -1, family_vs_career: 1 } }
                ]
            }
        ]
    },
{
        id: 'job_offer',
        stage: 'young_adult',
        type: 'choice',
        requirements: { education: '>2' },
        prompt: 'A contact offers you a position in another region.',
        options: [
            {
                text: 'Accept and relocate',
                outcomes: [
                    { weight: 45, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'New opportunities, old ties severed.', tagAxis: { roots_vs_wings: 1, family_vs_career: -1 } },
                    { weight: 35, effects: { wealth: +1 }, karma: 1, description: 'The move pays off.', tagAxis: { roots_vs_wings: 1, family_vs_career: -1 } },
                    { weight: 20, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Success, but at what cost?', tagAxis: { roots_vs_wings: 1, family_vs_career: -1 }, grantsTag: 'career_driven' }
                ]
            },
            {
                text: 'Decline politely',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Your loyalty is noted.', tagAxis: { roots_vs_wings: -1, family_vs_career: 1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'Another door closes.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 20, effects: { wealth: -1 }, karma: -1, description: 'You wonder what might have been.', tagAxis: { family_vs_career: 1 } }
                ]
            }
        ]
    },
{
        id: 'risky_venture',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'An acquaintance proposes a risky venture.',
        options: [
            {
                text: 'Take the risk',
                outcomes: [
                    { weight: 25, effects: { wealth: +2 }, karma: 0, description: 'It pays off handsomely.', tagAxis: { risk_vs_safety: 1 }, grantsTag: 'risk_taker' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'A costly lesson.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 25, effects: { wealth: -1, connections: -1 }, karma: -1, description: 'Failure and blame follow.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 15, effects: { wealth: +1, connections: +1 }, karma: 1, description: 'Success breeds new alliances.', tagAxis: { risk_vs_safety: 1 } }
                ]
            },
            {
                text: 'Play it safe',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Caution preserved your position.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 25, effects: { wealth: +1 }, karma: 0, description: 'Slow and steady.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 15, effects: {}, karma: 1, description: 'You watched it fail from safety.', tagAxis: { risk_vs_safety: -1 }, grantsTag: 'cautious' }
                ]
            }
        ]
    },
{
        id: 'romantic_choice',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'Two paths diverge in matters of the heart.',
        options: [
            {
                text: 'Follow passion',
                outcomes: [
                    { weight: 40, effects: { connections: +1, health: +1 }, karma: 1, description: 'Love finds a way.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 35, effects: { wealth: -1, connections: +1 }, karma: 0, description: 'Rich in love, if nothing else.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 25, effects: { health: -1 }, karma: -1, description: 'Heartbreak leaves its mark.', tagAxis: { risk_vs_safety: 1 } }
                ]
            },
            {
                text: 'Choose stability',
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'A practical arrangement.', tagAxis: { risk_vs_safety: -1, self_vs_others: -1 } },
                    { weight: 35, effects: { connections: +1, wealth: +1 }, karma: 0, description: 'Comfort and companionship.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Something is always missing.', tagAxis: { risk_vs_safety: -1 } }
                ]
            }
        ]
    },
{
        id: 'health_scare',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'Your body sends a warning.',
        options: [
            {
                text: 'Take it seriously',
                preview: { description: 'Seek proper care and make changes' },
                outcomes: [
                    { weight: 45, effects: { wealth: -1 }, karma: 0, description: 'Treatment is costly, but you catch it early.' },
                    { weight: 35, effects: { health: +1 }, karma: 1, description: 'A wake-up call heeded. You make lasting changes.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 20, effects: {}, karma: 0, description: 'False alarm, but you learned to listen.' }
                ]
            },
            {
                text: 'Push through it',
                preview: { description: 'Ignore it and carry on' },
                outcomes: [
                    { weight: 35, effects: {}, karma: 0, description: 'A close call, nothing more.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The damage is done.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 30, effects: { health: -2 }, karma: -1, description: 'Ignoring the signs makes it worse.' }
                ]
            }
        ]
    },
{
        id: 'unexpected_inheritance',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'Word comes of a distant relative\'s passing. There may be an inheritance.',
        options: [
            {
                text: 'Claim your share',
                preview: { description: 'Assert your rights to the estate' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'A modest inheritance arrives.' },
                    { weight: 25, effects: { wealth: +2 }, karma: 0, description: 'More than you expected.' },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Family disputes follow.', tagAxis: { self_vs_others: -1 } },
                    { weight: 15, effects: {}, karma: 0, description: 'The estate was already claimed.' }
                ]
            },
            {
                text: 'Let others have it',
                preview: { description: 'Step aside for family who need it more' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Your generosity is remembered.', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: {}, karma: 1, description: 'You make peace with the decision.' },
                    { weight: 20, effects: { wealth: +1 }, karma: 1, description: 'Others insist you take a share anyway.' }
                ]
            }
        ]
    },
{
        id: 'mentor_appears',
        stage: 'young_adult',
        type: 'choice',
        requirements: { connections: '>2' },
        prompt: 'Someone influential takes an interest in you.',
        options: [
            {
                text: 'Accept their guidance',
                outcomes: [
                    { weight: 50, effects: { education: +1, connections: +1 }, karma: 1, description: 'Their wisdom opens doors.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 0, description: 'A useful connection.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Their enemies become yours.', tagAxis: { social_vs_solitary: 1 } }
                ]
            },
            {
                text: 'Forge your own path',
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'Independence has its price.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 35, effects: { education: +1 }, karma: 1, description: 'Self-reliance serves you well.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Harder without help.', tagAxis: { social_vs_solitary: -1 } }
                ]
            }
        ]
    },
{
        id: 'skill_training',
        stage: 'young_adult',
        type: 'choice',
        prompt: 'An opportunity to develop new skills arises.',
        options: [
            {
                text: 'Invest the time',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 0, description: 'New capabilities emerge.' },
                    { weight: 30, effects: { education: +1, health: -1 }, karma: 0, description: 'Growth, but exhausting.' },
                    { weight: 20, effects: {}, karma: 0, description: 'The training doesn\'t stick.' }
                ]
            },
            {
                text: 'Focus on what you know',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Familiar ground remains.' },
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'Expertise in your field pays.' }
                ]
            }
        ]
    },

    // === MIDDLE AGE (35-55) ===,
{
        id: 'opportunity_abroad',
        stage: 'young_adult',
        type: 'choice',
        special: 'migration',  // Flag for migration system
        tradeoff: {
            archetype: 'stability_opportunity',
            intensity: 'severe',
            clarity: 'partial'
        },
        prompt: 'A significant opportunity arises in another country.',
        options: [
            {
                text: 'Relocate abroad',
                preview: { gains: ['wealth', 'education'], risks: ['connections'], description: 'Start fresh somewhere new' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1, connections: -2 }, karma: 0, description: 'You build a new life far from home.', special: 'migrate' },
                    { weight: 35, effects: { education: +1, connections: -1 }, karma: 0, description: 'New horizons expand your mind.', special: 'migrate' },
                    { weight: 25, effects: { wealth: +1, education: +1, connections: -2 }, karma: 1, description: 'The gamble pays off handsomely.', special: 'migrate' }
                ]
            },
            {
                text: 'Stay where you are',
                preview: { gains: ['connections'], risks: [], description: 'Roots run deep' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'You strengthen your local ties.' },
                    { weight: 35, effects: {}, karma: 0, description: 'The opportunity passes.' },
                    { weight: 20, effects: { connections: +1, wealth: -1 }, karma: 0, description: 'Security comes at a price.' }
                ]
            }
        ]
    },
{
        id: 'war_refugee',
        stage: 'young_adult',
        type: 'choice',
        special: 'migration',
        prompt: 'War erupts. Bombs fall. Your neighborhood is no longer safe. There is no staying.',
        options: [
            {
                text: 'Flee immediately',
                preview: { description: 'Run with nothing but your life' },
                outcomes: [
                    { weight: 40, effects: { wealth: -2, connections: -2 }, karma: 0, description: 'You escape with nothing but your life. Everything else burns.', special: 'migrate' },
                    { weight: 35, effects: { connections: -2, health: -1 }, karma: 0, description: 'The harrowing journey leaves marks that never fade.', special: 'migrate' },
                    { weight: 25, effects: { connections: -1, health: +1 }, karma: 0, description: 'Speed saves you. You reach safety while others still debate.', special: 'migrate' }
                ]
            },
            {
                text: 'Gather what you can first',
                preview: { description: 'Risk delay to save something' },
                outcomes: [
                    { weight: 35, effects: { wealth: -1, connections: -2, health: -1 }, karma: 0, description: 'You save some essentials. The delay costs you.', special: 'migrate' },
                    { weight: 35, effects: { wealth: -1, connections: -1 }, karma: 0, description: 'Documents, photos, heirlooms. Not everything, but something.', special: 'migrate' },
                    { weight: 30, effects: { health: -2, connections: -1 }, karma: 0, description: 'You waited too long. The price was almost too high.', special: 'migrate' }
                ]
            },
            {
                text: 'Help others escape first',
                preview: { description: 'The elderly, the children, the trapped' },
                outcomes: [
                    { weight: 35, effects: { wealth: -2, connections: +1, health: -1 }, karma: 3, description: 'You lose everything material. But faces remember you.', special: 'migrate', tagAxis: { self_vs_others: 2 } },
                    { weight: 35, effects: { connections: -1, health: -2 }, karma: 2, description: 'The cost is severe. Some you helped did not make it anyway.', special: 'migrate', tagAxis: { self_vs_others: 1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 2, description: 'Together, somehow, more of you survive the crossing.', special: 'migrate', tagAxis: { self_vs_others: 1 }, grantsTag: 'generous' }
                ]
            }
        ]
    },
{
        id: 'economic_collapse',
        stage: 'young_adult',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'stability_opportunity',
            intensity: 'severe',
            clarity: 'partial'
        },
        prompt: 'The economy has collapsed. Your currency is worthless. Jobs have vanished.',
        options: [
            {
                text: 'Emigrate for work',
                preview: { gains: ['wealth'], risks: ['connections'], description: 'Seek fortune elsewhere' },
                outcomes: [
                    { weight: 45, effects: { wealth: +1, connections: -2 }, karma: 0, description: 'Hard work abroad, money sent home.', special: 'migrate' },
                    { weight: 35, effects: { wealth: +2, connections: -2 }, karma: 0, description: 'The gamble pays off.', special: 'migrate' },
                    { weight: 20, effects: { connections: -1 }, karma: 1, description: 'A community of fellow migrants supports you.', special: 'migrate' }
                ]
            },
            {
                text: 'Stay and struggle',
                preview: { gains: ['connections'], risks: ['wealth'], description: 'Weather the crisis' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Community bonds strengthen in hardship.' },
                    { weight: 35, effects: { wealth: -2 }, karma: 0, description: 'Survival becomes a daily battle.' },
                    { weight: 25, effects: { education: +1 }, karma: 0, description: 'Desperation breeds creativity.' }
                ]
            }
        ]
    },
{
        id: 'love_across_borders',
        stage: 'young_adult',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'severe',
            clarity: 'transparent'
        },
        prompt: 'Love has found you, but your beloved lives in another country.',
        options: [
            {
                text: 'Follow your heart abroad',
                preview: { gains: ['connections', 'health'], risks: ['wealth'], description: 'Love conquers distance' },
                outcomes: [
                    { weight: 45, effects: { connections: +1, health: +1, wealth: -1 }, karma: 1, description: 'Together at last.', special: 'migrate' },
                    { weight: 35, effects: { connections: +2, wealth: -1 }, karma: 2, description: 'Love and a new beginning.', special: 'migrate' },
                    { weight: 20, effects: { connections: +1, health: +1 }, karma: 1, description: 'Worth every sacrifice.', special: 'migrate' }
                ]
            },
            {
                text: 'Let love go',
                preview: { gains: ['wealth'], risks: ['health'], description: 'Be practical' },
                outcomes: [
                    { weight: 40, effects: { health: -1 }, karma: 0, description: 'Some wounds never fully heal.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'You focus on building your life.' },
                    { weight: 25, effects: { connections: +1 }, karma: 0, description: 'New love eventually finds you.' }
                ]
            }
        ]
    },
{
        id: 'wanderlust_calls',
        stage: 'young_adult',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'passion_safety',
            intensity: 'moderate',
            clarity: 'hidden'
        },
        prompt: 'Something stirs within you. The world calls. You want to see what lies beyond the horizon.',
        options: [
            {
                text: 'Set out for adventure',
                preview: { gains: ['education'], risks: ['wealth'], description: 'See the world' },
                outcomes: [
                    { weight: 40, effects: { education: +1, connections: -1 }, karma: 0, description: 'The world teaches lessons no school can.', special: 'migrate', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 35, effects: { education: +1, wealth: -1 }, karma: 0, description: 'Rich in experience, poor in pocket.', special: 'migrate', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 25, effects: { education: +2, connections: +1 }, karma: 1, description: 'You find yourself and friends along the way. A wanderer at heart.', special: 'migrate', tagAxis: { roots_vs_wings: 1 }, grantsTag: 'wanderer' }
                ]
            },
            {
                text: 'Stay grounded',
                preview: { gains: ['connections'], risks: [], description: 'Bloom where planted' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Contentment in the familiar.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Stability has its rewards.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'But you always wonder what if...', tagAxis: { roots_vs_wings: -1 }, grantsTag: 'rooted' }
                ]
            }
        ]
    },

    // Post-Migration Adaptation Events (require special: 'post_migration' flag set after migrating),
{
        id: 'culture_shock',
        stage: 'young_adult',
        type: 'choice',
        special: 'post_migration',
        prompt: 'Everything is strange here. The customs, the assumptions, the unwritten rules you never learned. You are visibly lost.',
        options: [
            {
                text: 'Throw yourself into learning',
                preview: { description: 'Immerse despite the exhaustion' },
                outcomes: [
                    { weight: 40, effects: { education: +1, health: -1 }, karma: 0, description: 'Exhausting, but you learn faster than most.' },
                    { weight: 35, effects: { education: +1, connections: +1 }, karma: 1, description: 'Your effort impresses locals. They help.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'The constant vigilance wears you down.' }
                ]
            },
            {
                text: 'Seek out others like you',
                preview: { description: 'Find fellow outsiders' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'A community of the displaced. You belong somewhere.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'The relief of being understood, even briefly.' },
                    { weight: 20, effects: { education: -1 }, karma: 0, description: 'You never quite leave the bubble. Integration stalls.' }
                ]
            },
            {
                text: 'Withdraw and observe',
                preview: { description: 'Watch from the margins' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'Misunderstandings isolate you further.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Silence teaches you. You learn to read the room.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'Loneliness seeps in. The strangeness never quite fades.' }
                ]
            }
        ]
    },
{
        id: 'language_barrier',
        stage: 'young_adult',
        type: 'choice',
        special: 'post_migration',
        prompt: 'The local language eludes you. Every interaction is a struggle.',
        options: [
            {
                text: 'Immerse yourself completely',
                preview: { gains: ['education'], risks: ['health'], description: 'Total immersion' },
                outcomes: [
                    { weight: 45, effects: { education: +2, health: -1 }, karma: 0, description: 'Grueling but effective.' },
                    { weight: 35, effects: { education: +1, connections: +1 }, karma: 1, description: 'Locals appreciate your effort.' },
                    { weight: 20, effects: { education: +1 }, karma: 0, description: 'Slow progress, but progress.' }
                ]
            },
            {
                text: 'Stay in your community',
                preview: { gains: ['connections'], risks: ['education'], description: 'Comfort zone' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Your diaspora community sustains you.' },
                    { weight: 30, effects: { education: -1 }, karma: 0, description: 'Opportunity limited by language.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Some doors remain closed.' }
                ]
            }
        ]
    },
{
        id: 'heritage_shame',
        stage: 'young_adult',
        type: 'choice',
        special: 'second_generation',
        themes: ['migration', 'identity'],
        prompt: 'Your heritage marks you as different. Some part of you wants to hide it.',
        options: [
            {
                text: 'Embrace your heritage',
                preview: { gains: ['connections'], risks: ['health'], description: 'Pride in who you are' },
                outcomes: [
                    { weight: 45, effects: { connections: +1, health: +1 }, karma: 1, description: 'Identity becomes strength.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Some bridges burn.' },
                    { weight: 20, effects: { education: +1 }, karma: 0, description: 'Understanding your roots deepens wisdom.' }
                ]
            },
            {
                text: 'Assimilate fully',
                preview: { gains: ['wealth'], risks: ['connections'], description: 'Blend in completely' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Doors open, but at what cost?' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'Something feels hollow.' },
                    { weight: 25, effects: { education: +1 }, karma: 0, description: 'Cultural fluency in the new world.' }
                ]
            }
        ]
    },
{
        id: 'overtime_promotion',
        stage: 'young_adult',
        type: 'choice',
        tradeoff: {
            archetype: 'money_health',
            intensity: 'moderate',
            clarity: 'partial'
        },
        prompt: 'Your employer offers a promotion, but it demands grueling hours.',
        options: [
            {
                text: 'Accept the promotion',
                preview: {
                    gains: ['wealth'],
                    risks: ['health'],
                    description: 'Advancement at personal cost'
                },
                outcomes: [
                    {
                        weight: 40,
                        effects: { wealth: +1 },
                        karma: 0,
                        description: 'The money flows, but nights grow restless.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 3,
                            effects: { health: -1 },
                            description: 'Years of overwork catch up with you.'
                        }
                    },
                    { weight: 35, effects: { wealth: +2, health: -1 }, karma: 0, description: 'Success, at a visible price.' },
                    { weight: 25, effects: { wealth: +1, connections: +1 }, karma: 1, description: 'You thrive under pressure.' }
                ]
            },
            {
                text: 'Decline politely',
                preview: {
                    gains: ['health'],
                    risks: ['wealth'],
                    description: 'Peace over prosperity'
                },
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Balance preserved.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Life continues unchanged.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Passed over for future opportunities.' }
                ]
            }
        ]
    },
{
        id: 'artistic_calling',
        stage: 'young_adult',
        type: 'choice',
        tradeoff: {
            archetype: 'passion_safety',
            intensity: 'severe',
            clarity: 'transparent'
        },
        prompt: 'You discover a talent that could define you, but it offers no security.',
        options: [
            {
                text: 'Pursue your calling',
                preview: {
                    gains: ['education'],
                    risks: ['wealth', 'connections'],
                    description: 'Follow the uncertain path'
                },
                outcomes: [
                    { weight: 20, effects: { education: +2, connections: +1 }, karma: 2, description: 'Against all odds, your passion resonates.' },
                    { weight: 40, effects: { education: +1, wealth: -1 }, karma: 1, description: 'Joy, if not riches.' },
                    {
                        weight: 40,
                        effects: { wealth: -2 },
                        karma: 0,
                        description: 'Dreams do not pay the bills.',
                        hiddenCost: {
                            trigger: 'next_stage',
                            effects: { health: -1 },
                            description: 'The stress of uncertainty takes root.'
                        }
                    }
                ]
            },
            {
                text: 'Choose the safe path',
                preview: {
                    gains: ['wealth'],
                    risks: ['education'],
                    description: 'Security over meaning'
                },
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Comfort, if not passion.' },
                    { weight: 35, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'A respectable life.' },
                    {
                        weight: 20,
                        effects: {},
                        karma: -1,
                        description: 'A quiet regret settles in.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 5,
                            effects: { health: -1 },
                            description: 'What-ifs haunt your nights.'
                        }
                    }
                ]
            }
        ]
    },
{
        id: 'quick_credential',
        stage: 'young_adult',
        type: 'choice',
        tradeoff: {
            archetype: 'now_later',
            intensity: 'moderate',
            clarity: 'partial'
        },
        prompt: 'A shortcut to credentials appears, but corners must be cut.',
        options: [
            {
                text: 'Take the shortcut',
                preview: {
                    gains: ['wealth'],
                    risks: ['education'],
                    description: 'Speed over depth'
                },
                outcomes: [
                    {
                        weight: 40,
                        effects: { wealth: +1 },
                        karma: -1,
                        description: 'Quick gains, hollow foundation.',
                        hiddenCost: {
                            trigger: 'next_stage',
                            effects: { education: -1 },
                            description: 'Your shortcuts become obvious to others.'
                        }
                    },
                    { weight: 35, effects: { wealth: +1, education: -1 }, karma: -1, description: 'The gap in knowledge shows immediately.' },
                    { weight: 25, effects: { wealth: +1 }, karma: 0, description: 'It works out, this time.' }
                ]
            },
            {
                text: 'Do it properly',
                preview: {
                    gains: ['education'],
                    risks: ['wealth'],
                    description: 'Build real foundations'
                },
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 1, description: 'True understanding takes root.' },
                    { weight: 30, effects: { education: +1, wealth: -1 }, karma: 0, description: 'Time and money well spent.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The long road exhausts you.' }
                ]
            }
        ]
    },

    // === STABILITY VS OPPORTUNITY ===,
{
        id: 'distant_opportunity',
        stage: 'young_adult',
        type: 'choice',
        requirements: { education: '>2' },
        tradeoff: {
            archetype: 'stability_opportunity',
            intensity: 'severe',
            clarity: 'partial'
        },
        prompt: 'An opportunity arises far from everything you know.',
        options: [
            {
                text: 'Take the leap',
                preview: {
                    gains: ['wealth', 'education'],
                    risks: ['connections'],
                    description: 'Growth through displacement'
                },
                outcomes: [
                    { weight: 30, effects: { wealth: +2, education: +1, connections: -1 }, karma: 1, description: 'The gamble pays off spectacularly.' },
                    {
                        weight: 40,
                        effects: { wealth: +1, connections: -2 },
                        karma: 0,
                        description: 'Success, but the old life fades.',
                        hiddenCost: {
                            trigger: 'next_stage',
                            effects: { health: -1 },
                            description: 'Loneliness has a way of manifesting.'
                        }
                    },
                    { weight: 30, effects: { connections: -1 }, karma: 0, description: 'It does not work out. You return diminished.' }
                ]
            },
            {
                text: 'Stay where you are',
                preview: {
                    gains: ['connections', 'health'],
                    risks: ['wealth'],
                    description: 'Familiar ground'
                },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Roots deepen.' },
                    { weight: 30, effects: { health: +1, connections: +1 }, karma: 1, description: 'Contentment in the known.' },
                    {
                        weight: 20,
                        effects: {},
                        karma: -1,
                        description: 'You wonder what might have been.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 3,
                            effects: { health: -1 },
                            description: 'Regret settles into your bones.'
                        }
                    }
                ]
            }
        ]
    },
{
        id: 'arranged_marriage',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'Your family has arranged a marriage to consolidate resources and alliances.',
                options: [
                    {
                        text: 'Accept the arrangement',
                        outcomes: [
                            { weight: 40, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'The union brings stability and new ties.' },
                            { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Duty fulfilled, hearts uncertain.' },
                            { weight: 25, effects: { wealth: +1, health: -1 }, karma: -1, description: 'A loveless union weighs on you.' }
                        ]
                    },
                    {
                        text: 'Refuse and face consequences',
                        outcomes: [
                            { weight: 30, effects: { connections: -2 }, karma: 1, description: 'Your family is shamed, but your heart is free.' },
                            { weight: 40, effects: { wealth: -1, connections: -1 }, karma: 0, description: 'Cast out, you must forge your own path.' },
                            { weight: 30, effects: { connections: -1 }, karma: 1, description: 'Eventually, they understand.' }
                        ]
                    }
                ]
            },
            industrial_revolution: {
                prompt: 'Your family suggests a practical marriage to improve your circumstances.',
                options: [
                    {
                        text: 'Agree to the match',
                        outcomes: [
                            { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'A sensible arrangement.' },
                            { weight: 35, effects: { connections: +1 }, karma: 0, description: 'New in-laws bring opportunities.' },
                            { weight: 20, effects: { health: -1 }, karma: 0, description: 'Duty before happiness.' }
                        ]
                    },
                    {
                        text: 'Marry for love instead',
                        outcomes: [
                            { weight: 50, effects: { connections: -1, health: +1 }, karma: 1, description: 'Love conquers all.' },
                            { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Poor but content.' },
                            { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Your choice wins respect.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'A marriage prospect presents itself.',
        options: [
            {
                text: 'Consider the offer',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Life takes a new direction.' },
                    { weight: 50, effects: {}, karma: 0, description: 'Things do not work out.' }
                ]
            }
        ]
    },
{
        id: 'feudal_obligation',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'The local lord demands labor or military service as is your obligation.',
                options: [
                    {
                        text: 'Fulfill your duty',
                        outcomes: [
                            { weight: 40, effects: { health: -1 }, karma: 0, description: 'Hard labor takes its toll.' },
                            { weight: 30, effects: { connections: +1 }, karma: 1, description: 'You earn respect through service.' },
                            { weight: 20, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Service brings small rewards.' },
                            { weight: 10, effects: { education: +1 }, karma: 0, description: 'You learn skills in service.' }
                        ]
                    },
                    {
                        text: 'Flee to avoid service',
                        outcomes: [
                            { weight: 35, effects: { connections: -2 }, karma: -1, description: 'Branded a deserter, you must hide.' },
                            { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'You lose everything fleeing.' },
                            { weight: 30, effects: { health: +1 }, karma: 0, description: 'Freedom in anonymity.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Obligations to authority must be met.',
        options: [{
            text: 'Face circumstances',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You fulfill your duties.' },
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'It costs you.' }
            ]
        }]
    },
{
        id: 'religious_calling',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'The church offers a path - education, security, purpose. But you must renounce worldly ties.',
                options: [
                    {
                        text: 'Take religious vows',
                        outcomes: [
                            { weight: 40, effects: { education: +2, connections: -1 }, karma: 2, description: 'Learning and devotion fill your days.' },
                            { weight: 35, effects: { education: +1, health: +1 }, karma: 1, description: 'Peace in service.' },
                            { weight: 25, effects: { wealth: +1, education: +1 }, karma: 0, description: 'The institution provides.' }
                        ]
                    },
                    {
                        text: 'Remain in secular life',
                        outcomes: [
                            { weight: 50, effects: {}, karma: 0, description: 'You choose the world over the cloister.' },
                            { weight: 30, effects: { connections: +1 }, karma: 0, description: 'Family and community remain.' },
                            { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Worldly struggles await.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'A spiritual path opens before you.',
        options: [
            {
                text: 'Pursue faith',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 1, description: 'Spirituality guides you.' },
                    { weight: 50, effects: {}, karma: 0, description: 'The path is not for you.' }
                ]
            }
        ]
    },
{
        id: 'factory_opening',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'A new factory offers jobs. Better pay than farming, but the work is dangerous.',
                options: [
                    {
                        text: 'Take the factory job',
                        outcomes: [
                            { weight: 35, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Money flows, but the machines are merciless.' },
                            { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Industry rewards your labor.' },
                            { weight: 20, effects: { health: -2 }, karma: 0, description: 'An accident marks you permanently.' },
                            { weight: 15, effects: { wealth: +2, education: +1 }, karma: 0, description: 'You rise quickly in the new economy.' }
                        ]
                    },
                    {
                        text: 'Stay with traditional work',
                        outcomes: [
                            { weight: 40, effects: { health: +1 }, karma: 0, description: 'Honest labor under the sky.' },
                            { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'The old ways pay less now.' },
                            { weight: 25, effects: { connections: +1 }, karma: 0, description: 'Your community holds together.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'New employment beckons.',
        options: [{
            text: 'Seek opportunity',
            outcomes: [
                { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Change brings opportunity.' },
                { weight: 50, effects: {}, karma: 0, description: 'You stay as you are.' }
            ]
        }]
    },
{
        id: 'immigration_wave',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'Ships bring newcomers seeking opportunity. Competition for work grows fierce.',
                options: [
                    {
                        text: 'Welcome the newcomers',
                        outcomes: [
                            { weight: 40, effects: { connections: +1 }, karma: 2, description: 'Diversity enriches your life.' },
                            { weight: 35, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Sharing costs you, but bonds form.' },
                            { weight: 25, effects: { education: +1 }, karma: 1, description: 'New perspectives expand your mind.' }
                        ]
                    },
                    {
                        text: 'Resent the competition',
                        outcomes: [
                            { weight: 40, effects: {}, karma: -1, description: 'Fear builds walls.' },
                            { weight: 35, effects: { wealth: +1 }, karma: -1, description: 'You hold your ground at others expense.' },
                            { weight: 25, effects: { connections: -1 }, karma: -2, description: 'Division festers.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'New arrivals change your community.',
        options: [{
            text: 'Adapt',
            outcomes: [
                { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Change brings opportunity.' },
                { weight: 50, effects: {}, karma: 0, description: 'Life goes on.' }
            ]
        }]
    },

    // === EARLY MODERN (1920-1950) ===,
{
        id: 'prohibition_opportunity',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            early_modern: {
                prompt: 'Prohibition creates opportunities for those willing to skirt the law.',
                options: [
                    {
                        text: 'Enter the bootlegging trade',
                        outcomes: [
                            { weight: 30, effects: { wealth: +2 }, karma: -2, description: 'Money flows like forbidden liquor.' },
                            { weight: 30, effects: { wealth: +1, health: -1 }, karma: -1, description: 'Profit, but dangerous company.' },
                            { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Law enforcement takes notice.' },
                            { weight: 15, effects: { health: -2 }, karma: -2, description: 'Violence finds you.' }
                        ]
                    },
                    {
                        text: 'Stay on the right side of the law',
                        outcomes: [
                            { weight: 50, effects: {}, karma: 1, description: 'Integrity preserved.' },
                            { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Respect for your principles.' },
                            { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Honest work pays less.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Illegal opportunity presents itself.',
        options: [{
            text: 'Consider options',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You stay clean.' },
                { weight: 50, effects: { wealth: +1 }, karma: -1, description: 'Easy money has costs.' }
            ]
        }]
    },
{
        id: 'dust_bowl_flight',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            early_modern: {
                prompt: 'The land dies. Black blizzards bury farms. There is nothing left to grow. You must decide how to face the exodus.',
                options: [
                    {
                        text: 'Leave early while you still can',
                        preview: { description: 'Go before everyone else' },
                        outcomes: [
                            { weight: 40, effects: { connections: -1 }, karma: 0, description: 'You arrive before the flood of Okies. But you abandoned neighbors.', tagAxis: { roots_vs_wings: 1 } },
                            { weight: 35, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Early arrival means picking the better camps. It costs you trust.' },
                            { weight: 25, effects: {}, karma: 0, description: 'You get ahead of the worst. Others call it desertion.' }
                        ]
                    },
                    {
                        text: 'Stay until the bitter end',
                        preview: { description: 'This is home until it kills you' },
                        outcomes: [
                            { weight: 35, effects: { health: -2, connections: +1 }, karma: 1, description: 'The dust takes your lungs. Your neighbors remember your stubbornness.', tagAxis: { roots_vs_wings: -1 } },
                            { weight: 35, effects: { wealth: -1, health: -1 }, karma: 0, description: 'Nothing left when you finally go. Too late.' },
                            { weight: 30, effects: { connections: +1 }, karma: 1, description: 'You help bury the dead land. Someone had to witness.' }
                        ]
                    },
                    {
                        text: 'Organize the caravan together',
                        preview: { description: 'We go as a community' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1, wealth: -1 }, karma: 2, description: 'Slower. Poorer. But you arrive together.', tagAxis: { self_vs_others: 1 } },
                            { weight: 35, effects: { health: -1, connections: +1 }, karma: 1, description: 'The road is hard, but you share it. That counts.', tagAxis: { self_vs_others: 1 } },
                            { weight: 25, effects: { connections: +1 }, karma: 1, description: 'A new community takes root in California. Born of shared hardship.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Environmental disaster forces change. How do you face it?',
        options: [
            {
                text: 'Go now',
                outcomes: [
                    { weight: 50, effects: { connections: -1 }, karma: 0, description: 'You start over somewhere new.', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 50, effects: {}, karma: 0, description: 'Adaptation is survival.' }
                ]
            },
            {
                text: 'Stay and fight',
                outcomes: [
                    { weight: 50, effects: { health: -1 }, karma: 1, description: 'The land wins in the end.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Community holds together.' }
                ]
            }
        ]
    },
{
        id: 'returning_veteran',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            early_modern: {
                prompt: 'You return from war, changed forever. Home feels foreign. The person who left is not the one who came back.',
                options: [
                    {
                        text: 'Use the GI Bill, build a new future',
                        preview: { description: 'Education as a way forward' },
                        outcomes: [
                            { weight: 40, effects: { education: +2, health: -1 }, karma: 0, description: 'New doors open. Nightmares remain. But you build something.' },
                            { weight: 35, effects: { education: +1, wealth: +1 }, karma: 0, description: 'The military taught discipline. School teaches opportunity.' },
                            { weight: 25, effects: { education: +1, connections: +1 }, karma: 0, description: 'Fellow veterans understand. Campus life finds its rhythm.' }
                        ]
                    },
                    {
                        text: 'Try to forget and resume normal life',
                        preview: { description: 'Push it down and carry on' },
                        outcomes: [
                            { weight: 35, effects: { connections: -1 }, karma: 0, description: 'No one understands what you saw. You stop trying to explain.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'The past leaks through. Sleep is fitful.' },
                            { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'You throw yourself into work. It almost works.' }
                        ]
                    },
                    {
                        text: 'Seek out fellow veterans',
                        preview: { description: 'Only they understand' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1, health: -1 }, karma: 0, description: 'Brotherhood of the scarred. You drink to remember. To forget.' },
                            { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Talking helps. Shared burden, shared healing.' },
                            { weight: 25, effects: { health: -2 }, karma: 0, description: 'Surrounded by those who share the darkness, you sink deeper.' }
                        ]
                    }
                ]
            },
            cold_war: {
                prompt: 'Military service ends. The adjustment to civilian life awaits. You must find your place in a world that moved on without you.',
                options: [
                    {
                        text: 'Use your benefits wisely',
                        preview: { description: 'Build on what you learned' },
                        outcomes: [
                            { weight: 45, effects: { education: +1, wealth: +1 }, karma: 0, description: 'Benefits help you advance. Discipline serves you well.' },
                            { weight: 35, effects: { education: +1 }, karma: 0, description: 'A smooth transition. The system worked for you.' },
                            { weight: 20, effects: { wealth: +1 }, karma: 0, description: 'Skills transfer. You land on your feet.' }
                        ]
                    },
                    {
                        text: 'Struggle with the transition',
                        preview: { description: 'Civilian life is harder than expected' },
                        outcomes: [
                            { weight: 40, effects: { connections: -1 }, karma: 0, description: 'The civilian world makes no sense. You feel lost.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'Structure disappears. You flounder.' },
                            { weight: 25, effects: { connections: +1 }, karma: 0, description: 'Others help you find your footing. Eventually.' }
                        ]
                    },
                    {
                        text: 'Stay connected to military community',
                        preview: { description: 'Never really leave' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Veterans organizations give you purpose.' },
                            { weight: 35, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'Defense sector jobs keep you in the fold.' },
                            { weight: 25, effects: { health: -1 }, karma: 0, description: 'You never quite become a civilian again.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Service shapes you. How do you carry it forward?',
        options: [
            {
                text: 'Build on the experience',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 0, description: 'Experience becomes education.' },
                    { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Skills transfer to civilian life.' }
                ]
            },
            {
                text: 'Struggle with the past',
                outcomes: [
                    { weight: 50, effects: { health: -1 }, karma: 0, description: 'Scars remain.' },
                    { weight: 50, effects: { connections: -1 }, karma: 0, description: 'Distance grows from those who do not understand.' }
                ]
            }
        ]
    },

    // === COLD WAR (1950-1990) ===,
{
        id: 'suburb_opportunity',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'New suburbs promise space, lawns, the American dream. Leave the city?',
                options: [
                    {
                        text: 'Move to the suburbs',
                        outcomes: [
                            { weight: 40, effects: { wealth: -1, health: +1 }, karma: 0, description: 'Mortgage payments, but fresh air.' },
                            { weight: 35, effects: { connections: -1, wealth: -1 }, karma: 0, description: 'Isolation in identical houses.' },
                            { weight: 25, effects: { health: +1, connections: +1 }, karma: 0, description: 'Community forms among new neighbors.' }
                        ]
                    },
                    {
                        text: 'Stay in the city',
                        outcomes: [
                            { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Urban vitality surrounds you.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'Crowding and pollution exact a price.' },
                            { weight: 20, effects: { wealth: +1 }, karma: 0, description: 'Lower costs, more savings.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Housing choices shape life.',
        options: [{
            text: 'Choose your path',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You settle where you are.' },
                { weight: 50, effects: { wealth: -1 }, karma: 0, description: 'Housing costs mount.' }
            ]
        }]
    },
{
        id: 'counterculture_choice',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'The counterculture calls. Drop out, tune in, turn on?',
                options: [
                    {
                        text: 'Embrace the movement',
                        outcomes: [
                            { weight: 30, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'Freedom and community, if not stability.', tagAxis: { tradition_vs_change: -1 } },
                            { weight: 30, effects: { health: -1, connections: +1 }, karma: 0, description: 'Experimentation has costs.', tagAxis: { tradition_vs_change: -1 } },
                            { weight: 25, effects: { education: +1 }, karma: 1, description: 'Consciousness expands. You question everything.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'progressive' },
                            { weight: 15, effects: { connections: -1, health: -1 }, karma: -1, description: 'Lost years in a haze.' }
                        ]
                    },
                    {
                        text: 'Stay conventional',
                        outcomes: [
                            { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'The straight path has rewards.', tagAxis: { tradition_vs_change: 1 } },
                            { weight: 35, effects: {}, karma: 0, description: 'Rebellion passes you by.', tagAxis: { tradition_vs_change: 1 } },
                            { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Square in a round world.', tagAxis: { tradition_vs_change: 1 } }
                        ]
                    }
                ]
            }
        },
        prompt: 'Cultural upheaval presents choices.',
        options: [{
            text: 'Navigate the times',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You find your way.' },
                { weight: 50, effects: { connections: +1 }, karma: 0, description: 'New connections form.' }
            ]
        }]
    },
{
        id: 'draft_notice',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'Your draft number comes up. Vietnam awaits.',
                options: [
                    {
                        text: 'Report for duty',
                        outcomes: [
                            { weight: 30, effects: { health: -2 }, karma: 0, description: 'The jungle takes its toll.' },
                            { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Brotherhood forged in fire.' },
                            { weight: 25, effects: { health: -1, education: +1 }, karma: 0, description: 'You return changed, skilled.' },
                            { weight: 15, effects: { health: -3 }, karma: 0, description: 'War wounds run deep.' }
                        ]
                    },
                    {
                        text: 'Seek alternative',
                        outcomes: [
                            { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Family divided over your choice.' },
                            { weight: 30, effects: { wealth: -1 }, karma: 1, description: 'Fleeing has its costs.' },
                            { weight: 20, effects: { education: +1 }, karma: 0, description: 'Deferment through college.' },
                            { weight: 15, effects: {}, karma: 0, description: 'Your number never gets called.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Military service beckons.',
        options: [{
            text: 'Respond',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You serve.' },
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'Service marks you.' }
            ]
        }]
    },

    // === CONTEMPORARY (1990+) ===,
{
        id: 'social_media_fame',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'Your post goes viral. Sudden fame beckons.',
                options: [
                    {
                        text: 'Pursue the spotlight',
                        outcomes: [
                            { weight: 25, effects: { wealth: +2, connections: +1 }, karma: 0, description: 'Influencer life treats you well.' },
                            { weight: 35, effects: { connections: +1, health: -1 }, karma: 0, description: 'Fame brings scrutiny and stress.' },
                            { weight: 25, effects: { wealth: +1 }, karma: -1, description: 'Clout chasing changes you.' },
                            { weight: 15, effects: { health: -2, connections: -1 }, karma: -1, description: 'Cancellation comes swiftly.' }
                        ]
                    },
                    {
                        text: 'Step back from attention',
                        outcomes: [
                            { weight: 50, effects: { health: +1 }, karma: 1, description: 'Privacy preserved.' },
                            { weight: 30, effects: {}, karma: 0, description: 'The moment passes.' },
                            { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Wondering what might have been.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Attention finds you.',
        options: [{
            text: 'Navigate fame',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'The spotlight fades.' },
                { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Recognition brings opportunity.' }
            ]
        }]
    },
{
        id: 'gig_economy',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'Traditional jobs are scarce. The gig economy offers flexibility without security.',
                options: [
                    {
                        text: 'Embrace gig work',
                        outcomes: [
                            { weight: 35, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Freedom and precarity in equal measure.' },
                            { weight: 35, effects: {}, karma: 0, description: 'Making it work, day by day.' },
                            { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'The algorithm turns against you.' },
                            { weight: 10, effects: { wealth: +2 }, karma: 0, description: 'Hustle culture pays off.' }
                        ]
                    },
                    {
                        text: 'Seek traditional employment',
                        outcomes: [
                            { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'Stability found.' },
                            { weight: 35, effects: {}, karma: 0, description: 'The search continues.' },
                            { weight: 25, effects: { connections: +1 }, karma: 0, description: 'Workplace community forms.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Work has changed.',
        options: [{
            text: 'Find your way',
            outcomes: [
                { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'You adapt.' },
                { weight: 50, effects: {}, karma: 0, description: 'Work is work.' }
            ]
        }]
    },
{
        id: 'student_debt_crossroads',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'College promises opportunity but costs a fortune. Take on debt?',
                options: [
                    {
                        text: 'Take the loans',
                        outcomes: [
                            { weight: 35, effects: { education: +2, wealth: -1 }, karma: 0, description: 'Degree earned, debt accumulated.' },
                            { weight: 30, effects: { education: +1, wealth: -2 }, karma: 0, description: 'The burden weighs heavy for years.' },
                            { weight: 20, effects: { education: +2, wealth: +1 }, karma: 0, description: 'Investment pays off eventually.' },
                            { weight: 15, effects: { education: +1, health: -1 }, karma: 0, description: 'Financial stress affects everything.' }
                        ]
                    },
                    {
                        text: 'Skip college',
                        outcomes: [
                            { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Working while others study.' },
                            { weight: 35, effects: {}, karma: 0, description: 'Finding another path.' },
                            { weight: 20, effects: { education: +1 }, karma: 0, description: 'Self-education proves valuable.' },
                            { weight: 10, effects: { wealth: +2 }, karma: 0, description: 'Entrepreneurship succeeds.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Education demands investment.',
        options: [{
            text: 'Choose wisely',
            outcomes: [
                { weight: 50, effects: { education: +1 }, karma: 0, description: 'Learning continues.' },
                { weight: 50, effects: {}, karma: 0, description: 'Life is the teacher.' }
            ]
        }]
    },
{
        id: 'algorithmic_fate',
        stage: 'young_adult',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'Algorithms shape what you see, who you meet, what opportunities find you. The feed knows you better than you know yourself.',
                options: [
                    {
                        text: 'Embrace the feed',
                        preview: { description: 'Let the algorithm guide you' },
                        outcomes: [
                            { weight: 35, effects: { connections: +1, wealth: +1 }, karma: 0, description: 'The algorithm serves you well. Opportunity flows.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'Endless scroll. Comparison traps. Hours vanish.' },
                            { weight: 30, effects: { connections: -1 }, karma: 0, description: 'Echo chambers shape your reality. You lose perspective.' }
                        ]
                    },
                    {
                        text: 'Curate carefully',
                        preview: { description: 'Try to control your exposure' },
                        outcomes: [
                            { weight: 40, effects: { education: +1 }, karma: 0, description: 'Intentional use yields learning without the toxicity.' },
                            { weight: 35, effects: {}, karma: 0, description: 'The effort to resist is constant. A draw.' },
                            { weight: 25, effects: { health: +1 }, karma: 1, description: 'Boundaries protect your peace.' }
                        ]
                    },
                    {
                        text: 'Disconnect deliberately',
                        preview: { description: 'Resist the algorithmic pull' },
                        outcomes: [
                            { weight: 35, effects: { health: +1, connections: -1 }, karma: 0, description: 'Peace, but you miss things. Social circles wonder where you went.' },
                            { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Opportunities pass you by. The network moves without you.' },
                            { weight: 30, effects: { health: +1, education: +1 }, karma: 1, description: 'Books, conversations, presence. The old ways still work.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Technology shapes your world.',
        options: [
            {
                text: 'Engage with it',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'New tools, new connections.' },
                    { weight: 50, effects: {}, karma: 0, description: 'You adapt to the times.' }
                ]
            },
            {
                text: 'Keep your distance',
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Some prefer the old ways.' },
                    { weight: 50, effects: { connections: -1 }, karma: 0, description: 'The world moves on without you.' }
                ]
            }
        ]
    },

    // ============================================
    // REGIONAL EVENTS
    // ============================================

    // === EAST ASIA ===,
{
        id: 'family_honor_choice',
        stage: 'young_adult',
        type: 'choice',
        region: 'east_asia',
        themes: ['honor', 'filial_piety'],
        prompt: 'Your choice could bring honor or shame to your family name.',
        options: [
            {
                text: 'Prioritize family honor',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Family pride preserved.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 1, description: 'Personal sacrifice for collective good.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The weight of expectations.' }
                ]
            },
            {
                text: 'Follow your own path',
                outcomes: [
                    { weight: 35, effects: { connections: -2 }, karma: 0, description: 'Family ties strain.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Liberation from expectation.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Individual success follows.' }
                ]
            }
        ]
    },
{
        id: 'family_arranged_match',
        stage: 'young_adult',
        type: 'choice',
        region: 'south_asia',
        themes: ['arranged_marriage', 'family_honor'],
        prompt: 'Your family has found a suitable match. The decision weighs heavily.',
        options: [
            {
                text: 'Accept the arrangement',
                outcomes: [
                    { weight: 40, effects: { connections: +1, wealth: +1 }, karma: 0, description: 'Families unite prosperously.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Duty fulfilled, love may grow.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'Compatibility is lacking.' }
                ]
            },
            {
                text: 'Refuse the match',
                outcomes: [
                    { weight: 35, effects: { connections: -2 }, karma: 0, description: 'Scandal and disappointment.' },
                    { weight: 35, effects: { health: +1 }, karma: 1, description: 'Freedom to choose.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Eventually forgiven.' }
                ]
            }
        ]
    },
{
        id: 'diaspora_pull',
        stage: 'young_adult',
        type: 'choice',
        region: 'south_asia',
        themes: ['migration'],
        prompt: 'Relatives abroad offer to sponsor your move overseas.',
        options: [
            {
                text: 'Emigrate',
                outcomes: [
                    { weight: 35, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'New world, old ties fade.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Opportunities abound.' },
                    { weight: 30, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Homesickness and prosperity.' }
                ]
            },
            {
                text: 'Stay home',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Family bonds strengthen.' },
                    { weight: 35, effects: {}, karma: 0, description: 'The familiar comforts.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Opportunities pass by.' }
                ]
            }
        ]
    },

    // === LATIN AMERICA ===,
{
        id: 'informal_economy',
        stage: 'young_adult',
        type: 'choice',
        region: 'latin_america',
        themes: ['resilience', 'entrepreneurship'],
        prompt: 'Formal jobs are scarce. The informal economy offers survival.',
        options: [
            {
                text: 'Work informally',
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'Hustle pays.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Day by day.' },
                    { weight: 25, effects: { wealth: +1, health: -1 }, karma: 0, description: 'No safety net.' }
                ]
            },
            {
                text: 'Hold out for formal work',
                outcomes: [
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'The wait is costly.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Time to study while waiting.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Patience rewarded.' }
                ]
            }
        ]
    },

    // === WESTERN EUROPE ===,
{
        id: 'gap_year_abroad',
        stage: 'young_adult',
        type: 'choice',
        region: 'western_europe',
        themes: ['individualism', 'work_life_balance'],
        prompt: 'Before settling down, a year to explore the world beckons.',
        options: [
            {
                text: 'Take the gap year',
                outcomes: [
                    { weight: 40, effects: { education: +1, wealth: -1 }, karma: 1, description: 'Horizons expand.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Friends across continents.' },
                    { weight: 25, effects: { health: +1 }, karma: 0, description: 'Rest before the race begins.' }
                ]
            },
            {
                text: 'Start career immediately',
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Head start on peers.' },
                    { weight: 35, effects: {}, karma: 0, description: 'The conventional path.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Wondering what you missed.' }
                ]
            }
        ]
    },
{
        id: 'union_membership',
        stage: 'young_adult',
        type: 'choice',
        region: 'western_europe',
        themes: ['social_welfare', 'class_mobility'],
        prompt: 'Your workplace has strong union presence. Join?',
        options: [
            {
                text: 'Join the union',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Solidarity with workers.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Collective bargaining pays.' },
                    { weight: 20, effects: {}, karma: 0, description: 'Membership maintained.' }
                ]
            },
            {
                text: 'Stay independent',
                outcomes: [
                    { weight: 45, effects: {}, karma: 0, description: 'Going your own way.' },
                    { weight: 35, effects: { wealth: +1 }, karma: -1, description: 'Management notices favorably.' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Coworkers are cool toward you.' }
                ]
            }
        ]
    },

    // === EASTERN EUROPE ===,
{
        id: 'regime_change',
        stage: 'young_adult',
        type: 'choice',
        region: 'eastern_europe',
        themes: ['political_change', 'transition'],
        prompt: 'The old system collapses. Everything you knew changes overnight. The rules are rewritten. How do you position yourself?',
        options: [
            {
                text: 'Seize the new opportunities',
                preview: { description: 'Chaos is a ladder' },
                outcomes: [
                    { weight: 35, effects: { wealth: +2, connections: -1 }, karma: 0, description: 'Opportunity in upheaval. You are not sentimental about the old ways.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Quick adaptation pays. The new economy rewards the nimble.' },
                    { weight: 30, effects: { wealth: -1 }, karma: -1, description: 'You try to play the game. Others play it better.' }
                ]
            },
            {
                text: 'Protect what you have',
                preview: { description: 'Survive the transition intact' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'Old networks dissolve. The Party membership means nothing now.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Chaos brings loss. But you weather it.' },
                    { weight: 25, effects: { health: +1 }, karma: 0, description: 'You keep your head down. Stability in instability.' }
                ]
            },
            {
                text: 'Embrace the new freedoms',
                preview: { description: 'Finally, you can speak. Travel. Dream.' },
                outcomes: [
                    { weight: 40, effects: { education: +1, health: +1 }, karma: 1, description: 'New freedoms open new learning. Books once banned, ideas once forbidden.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Civil society awakens. You find your people.' },
                    { weight: 25, effects: { wealth: -1, education: +1 }, karma: 0, description: 'Freedom does not pay the bills. But it feeds the soul.' }
                ]
            }
        ]
    },
{
        id: 'emigration_pull',
        stage: 'young_adult',
        type: 'choice',
        region: 'eastern_europe',
        themes: ['transition', 'migration'],
        prompt: 'Western Europe promises opportunity. Leave home?',
        options: [
            {
                text: 'Emigrate west',
                outcomes: [
                    { weight: 40, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Better wages, distant family.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'New skills acquired abroad.' },
                    { weight: 25, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Hard work takes its toll.' }
                ]
            },
            {
                text: 'Build life at home',
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Community remains.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Stability in uncertainty.' },
                    { weight: 25, effects: { wealth: +1 }, karma: 0, description: 'Local opportunities emerge.' }
                ]
            }
        ]
    },

    // === MIDDLE EAST ===,
{
        id: 'tradition_vs_modern',
        stage: 'young_adult',
        type: 'choice',
        region: 'middle_east',
        themes: ['tradition_modernity'],
        prompt: 'Tradition and modernity pull in different directions.',
        options: [
            {
                text: 'Embrace tradition',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Family approves.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'The familiar path.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Constraints chafe. But tradition holds.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'traditionalist' }
                ]
            },
            {
                text: 'Pursue modern path',
                outcomes: [
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'New opportunities open.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Elders disapprove.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'The new economy rewards you. Change is your ally.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'progressive' }
                ]
            }
        ]
    },
{
        id: 'family_business_me',
        stage: 'young_adult',
        type: 'choice',
        region: 'middle_east',
        themes: ['family_honor', 'tradition_modernity'],
        prompt: 'The family business expects you to take your place.',
        options: [
            {
                text: 'Join the business',
                outcomes: [
                    { weight: 45, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'Legacy continued.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Comfortable position.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Dreams deferred.' }
                ]
            },
            {
                text: 'Forge your own path',
                outcomes: [
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Family disappointment.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Freedom to learn.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Independence pays off.' }
                ]
            }
        ]
    },
{
        id: 'urban_migration_africa',
        stage: 'young_adult',
        type: 'choice',
        region: 'sub_saharan_africa',
        themes: ['rapid_change', 'entrepreneurship'],
        prompt: 'The city calls with promises of opportunity and danger.',
        options: [
            {
                text: 'Move to the city',
                outcomes: [
                    { weight: 35, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Urban hustle, village ties weaken.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'City life brings learning.' },
                    { weight: 30, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Harsh conditions, but money.' }
                ]
            },
            {
                text: 'Stay in the village',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Community remains strong.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Cleaner air, simpler life.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Limited opportunities.' }
                ]
            }
        ]
    },
{
        id: 'diaspora_opportunity',
        stage: 'young_adult',
        type: 'choice',
        region: 'sub_saharan_africa',
        themes: ['migration', 'entrepreneurship'],
        prompt: 'Relatives in the diaspora offer to help you join them abroad.',
        options: [
            {
                text: 'Accept the opportunity',
                outcomes: [
                    { weight: 35, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'New country, old bonds stretch.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Opportunities to learn.' },
                    { weight: 30, effects: { health: -1 }, karma: 0, description: 'Adaptation is difficult.' }
                ]
            },
            {
                text: 'Remain in homeland',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Contributing to development at home.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Family stays close.' },
                    { weight: 20, effects: { wealth: +1 }, karma: 0, description: 'Local entrepreneurship succeeds.' }
                ]
            }
        ]
    },

    // === NORTH AMERICA ===,
{
        id: 'college_choice',
        stage: 'young_adult',
        type: 'choice',
        region: 'north_america',
        themes: ['opportunity', 'self_reliance'],
        prompt: 'College acceptance arrives. The choice of where to attend shapes your future.',
        options: [
            {
                text: 'Attend prestigious school',
                outcomes: [
                    { weight: 35, effects: { education: +2, wealth: -1 }, karma: 0, description: 'Debt for prestige.' },
                    { weight: 35, effects: { connections: +1, education: +1 }, karma: 0, description: 'Networks that last.' },
                    { weight: 30, effects: { education: +1, health: -1 }, karma: 0, description: 'Pressure takes its toll.' }
                ]
            },
            {
                text: 'Choose affordable option',
                outcomes: [
                    { weight: 45, effects: { education: +1 }, karma: 0, description: 'Solid education, no debt.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Financial freedom early.' },
                    { weight: 20, effects: {}, karma: 0, description: 'Adequate preparation.' }
                ]
            }
        ]
    },
{
        id: 'startup_dream',
        stage: 'young_adult',
        type: 'choice',
        region: 'north_america',
        themes: ['entrepreneurship', 'opportunity'],
        prompt: 'An idea burns bright. Risk everything on a startup?',
        options: [
            {
                text: 'Launch the startup',
                outcomes: [
                    { weight: 20, effects: { wealth: +3 }, karma: 0, description: 'Against all odds, success!' },
                    { weight: 35, effects: { wealth: -1, education: +1 }, karma: 0, description: 'Failure teaches valuable lessons.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'The dream dies.' },
                    { weight: 15, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Modest success, endless hours.' }
                ]
            },
            {
                text: 'Take the stable job',
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Steady income.' },
                    { weight: 35, effects: {}, karma: 0, description: 'The conventional path.' },
                    { weight: 20, effects: { health: -1 }, karma: -1, description: 'Wondering what if.' }
                ]
            }
        ]
    }
];
