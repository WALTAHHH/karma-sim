// Middle stage events

export const middleEvents = [
{
        id: 'career_crossroads',
        stage: 'middle',
        type: 'choice',
        prompt: 'Your position becomes uncertain.',
        options: [
            {
                text: 'Adapt to changes',
                outcomes: [
                    { weight: 40, effects: { education: +1 }, karma: 0, description: 'You learn new ways.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The stress takes its toll.', tagAxis: { tradition_vs_change: 1 } },
                    { weight: 25, effects: { wealth: +1 }, karma: 1, description: 'Change brings opportunity.', tagAxis: { tradition_vs_change: 1 }, grantsTag: 'progressive' }
                ]
            },
            {
                text: 'Hold your ground',
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Loyalty is remembered.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'The world moves on without you.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 25, effects: {}, karma: 0, description: 'Stubbornness serves you this time.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'traditionalist' }
                ]
            }
        ]
    },
{
        id: 'family_obligation',
        stage: 'middle',
        type: 'choice',
        prompt: 'A family member needs significant support.',
        options: [
            {
                text: 'Provide support',
                outcomes: [
                    { weight: 45, effects: { wealth: -1, connections: +1 }, karma: 2, description: 'Sacrifice strengthens bonds.', tagAxis: { family_vs_career: 1, self_vs_others: 1 } },
                    { weight: 35, effects: { wealth: -1, health: -1 }, karma: 1, description: 'You give more than you can afford.', tagAxis: { family_vs_career: 1, self_vs_others: 1 }, grantsTag: 'family_oriented' },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'They recover, grateful.', tagAxis: { family_vs_career: 1, self_vs_others: 1 } }
                ]
            },
            {
                text: 'Maintain boundaries',
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: -1, description: 'Distance grows.', tagAxis: { family_vs_career: -1, self_vs_others: -1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'Others step in.', tagAxis: { self_vs_others: -1 } },
                    { weight: 25, effects: { wealth: +1 }, karma: -1, description: 'Resources preserved, relationship strained.', tagAxis: { family_vs_career: -1, self_vs_others: -1 }, grantsTag: 'pragmatist' }
                ]
            }
        ]
    },
{
        id: 'community_role',
        stage: 'middle',
        type: 'choice',
        requirements: { connections: '>2' },
        prompt: 'Your community asks you to take on responsibility.',
        options: [
            {
                text: 'Accept the role',
                outcomes: [
                    { weight: 45, effects: { connections: +1, health: -1 }, karma: 1, description: 'Service has its costs.', tagAxis: { self_vs_others: 1, social_vs_solitary: 1 } },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'You make a difference.', tagAxis: { self_vs_others: 1, social_vs_solitary: 1 } },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Controversy finds you.', tagAxis: { social_vs_solitary: 1 } }
                ]
            },
            {
                text: 'Decline gracefully',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Life remains your own.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 30, effects: { health: +1 }, karma: 0, description: 'Peace has its rewards.', tagAxis: { social_vs_solitary: -1 }, grantsTag: 'introvert' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Some expected more from you.', tagAxis: { social_vs_solitary: -1 } }
                ]
            }
        ]
    },
{
        id: 'health_crisis',
        stage: 'middle',
        type: 'choice',
        prompt: 'Your health demands attention.',
        options: [
            {
                text: 'Prioritize treatment',
                preview: { description: 'Focus on recovery whatever the cost' },
                outcomes: [
                    { weight: 40, effects: { health: +1, wealth: -1 }, karma: 0, description: 'Expensive, but you recover well.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Treatment drains resources, but stabilizes things.' },
                    { weight: 25, effects: {}, karma: 1, description: 'Caught in time. You beat it.' }
                ]
            },
            {
                text: 'Minimize disruption',
                preview: { description: 'Try to maintain normal life' },
                outcomes: [
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'A new normal emerges.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'You manage it day by day.' },
                    { weight: 25, effects: { health: -2 }, karma: 0, description: 'Delay makes it worse.' },
                    { weight: 10, effects: { connections: +1 }, karma: 0, description: 'Others rally to support you.' }
                ]
            }
        ]
    },
{
        id: 'old_friend_returns',
        stage: 'middle',
        type: 'choice',
        prompt: 'Someone from your past reappears.',
        options: [
            {
                text: 'Reconnect',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Old bonds rekindle.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Too much has changed.' },
                    { weight: 20, effects: { wealth: -1 }, karma: -1, description: 'They need something from you.' }
                ]
            },
            {
                text: 'Let the past rest',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Some doors stay closed.' },
                    { weight: 40, effects: { health: +1 }, karma: 0, description: 'Moving forward serves you.' }
                ]
            }
        ]
    },
{
        id: 'investment_opportunity',
        stage: 'middle',
        type: 'choice',
        requirements: { wealth: '>2' },
        prompt: 'A chance to grow your resources presents itself.',
        options: [
            {
                text: 'Invest significantly',
                outcomes: [
                    { weight: 30, effects: { wealth: +2 }, karma: 0, description: 'Prosperity multiplies.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'The market is unforgiving.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'A wash.', tagAxis: { risk_vs_safety: 1 } }
                ]
            },
            {
                text: 'Stay conservative',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Steady as she goes.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'Patience rewards.', tagAxis: { risk_vs_safety: -1 } }
                ]
            }
        ]
    },
{
        id: 'younger_generation',
        stage: 'middle',
        type: 'choice',
        prompt: 'A younger person seeks your guidance.',
        options: [
            {
                text: 'Share your knowledge',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 2, description: 'Wisdom passes on.', tagAxis: { self_vs_others: 1, social_vs_solitary: 1 } },
                    { weight: 30, effects: {}, karma: 1, description: 'They find their own way.', tagAxis: { self_vs_others: 1 } },
                    { weight: 20, effects: { connections: +1, health: -1 }, karma: 1, description: 'Teaching takes energy.', tagAxis: { self_vs_others: 1, social_vs_solitary: 1 }, grantsTag: 'extrovert' }
                ]
            },
            {
                text: 'They must learn themselves',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Independence is a lesson too.', tagAxis: { self_vs_others: -1 } },
                    { weight: 30, effects: { health: +1 }, karma: 0, description: 'You conserve your energy.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Disappointment lingers.', tagAxis: { self_vs_others: -1 } }
                ]
            }
        ]
    },
{
        id: 'reputation_test',
        stage: 'middle',
        type: 'choice',
        prompt: 'Rumors spread that could harm your standing. Whispers follow you.',
        options: [
            {
                text: 'Address it head-on',
                preview: { description: 'Confront the gossip publicly' },
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Your directness earns respect. The truth wins out.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Your defense sounds desperate. Some believe the worst.' },
                    { weight: 30, effects: {}, karma: 0, description: 'A stalemate. Neither vindication nor ruin.' }
                ]
            },
            {
                text: 'Let it blow over',
                preview: { description: 'Rise above the noise' },
                outcomes: [
                    { weight: 40, effects: {}, karma: 0, description: 'Time proves your character. The talk fades.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Your silence is taken as guilt.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'Holding your tongue while being maligned takes a toll.' }
                ]
            },
            {
                text: 'Work behind the scenes',
                preview: { description: 'Quietly counter the narrative' },
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Allies emerge. The truth spreads through trusted channels.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Rebuilding reputation requires favors and resources.' },
                    { weight: 30, effects: { connections: -1 }, karma: -1, description: 'Your maneuvering is noticed. It looks calculated.' }
                ]
            }
        ]
    },

    // === MIGRATION EVENTS ===,
{
        id: 'family_abroad',
        stage: 'middle',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'moderate',
            clarity: 'transparent'
        },
        prompt: 'Family circumstances call you to another country.',
        options: [
            {
                text: 'Follow family',
                preview: { gains: ['connections'], risks: ['wealth'], description: 'Family comes first' },
                outcomes: [
                    { weight: 50, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'You uproot your life for those you love.', special: 'migrate' },
                    { weight: 30, effects: { connections: +2 }, karma: 2, description: 'The move brings you closer than ever.', special: 'migrate' },
                    { weight: 20, effects: { connections: +1, health: -1 }, karma: 1, description: 'The transition is difficult but worthwhile.', special: 'migrate' }
                ]
            },
            {
                text: 'Remain where you are',
                preview: { gains: ['wealth'], risks: ['connections'], description: 'Your life is here' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: -1, description: 'Distance grows with time.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'You focus on what you\'ve built.' },
                    { weight: 25, effects: {}, karma: 0, description: 'They understand your choice.' }
                ]
            }
        ]
    },
{
        id: 'political_pressure',
        stage: 'middle',
        type: 'choice',
        special: 'migration',
        prompt: 'Political changes make life increasingly difficult.',
        options: [
            {
                text: 'Seek refuge elsewhere',
                preview: { gains: ['health'], risks: ['wealth', 'connections'], description: 'Safety first' },
                outcomes: [
                    { weight: 45, effects: { wealth: -1, connections: -1, health: +1 }, karma: 0, description: 'You escape to start anew.', special: 'migrate' },
                    { weight: 35, effects: { wealth: -2, connections: -1 }, karma: 0, description: 'You lose much but keep your life.', special: 'migrate' },
                    { weight: 20, effects: { connections: -1 }, karma: 1, description: 'Others help you resettle.', special: 'migrate' }
                ]
            },
            {
                text: 'Weather the storm',
                preview: { gains: ['connections'], risks: ['health'], description: 'This is home' },
                outcomes: [
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The stress takes its toll.' },
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'Community bonds strengthen.' },
                    { weight: 25, effects: { health: -1, connections: +1 }, karma: 1, description: 'Survival forges deep ties.' }
                ]
            }
        ]
    },
{
        id: 'political_asylum_seeker',
        stage: 'middle',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'self_others',
            intensity: 'severe',
            clarity: 'hidden'
        },
        prompt: 'Your political views have made you a target. The authorities are watching.',
        options: [
            {
                text: 'Seek asylum abroad',
                preview: { gains: ['health'], risks: ['connections', 'wealth'], description: 'Freedom at a price' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1, connections: -2, health: +1 }, karma: 0, description: 'A new identity in a new land.', special: 'migrate' },
                    { weight: 35, effects: { connections: -2, education: +1 }, karma: 1, description: 'Your voice finds new audiences abroad.', special: 'migrate' },
                    { weight: 25, effects: { wealth: -2, connections: -1 }, karma: 0, description: 'Safety, but profound loss.', special: 'migrate' }
                ]
            },
            {
                text: 'Go underground locally',
                preview: { gains: [], risks: ['health', 'wealth'], description: 'Hide and resist' },
                outcomes: [
                    { weight: 35, effects: { health: -1, connections: +1 }, karma: 2, description: 'Others shelter you at great risk.' },
                    { weight: 35, effects: { health: -2 }, karma: 0, description: 'Living in fear takes its toll.' },
                    { weight: 30, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'The resistance network protects you.' }
                ]
            }
        ]
    },
{
        id: 'environmental_displacement',
        stage: 'middle',
        type: 'choice',
        special: 'migration',
        prompt: 'The land can no longer sustain life. Drought, floods, or disaster have made home uninhabitable. There is no future here.',
        options: [
            {
                text: 'Leave for better land',
                preview: { description: 'Seek somewhere you can survive' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1, connections: -1 }, karma: 0, description: 'You find new ground to stand on. Not home, but livable.', special: 'migrate' },
                    { weight: 35, effects: { connections: -2, health: -1 }, karma: 0, description: 'The journey is long. The welcome, uncertain.', special: 'migrate' },
                    { weight: 25, effects: { connections: +1 }, karma: 0, description: 'Fellow displaced souls become family along the way.', special: 'migrate' }
                ]
            },
            {
                text: 'Organize a community exodus',
                preview: { description: 'We go together or not at all' },
                outcomes: [
                    { weight: 35, effects: { connections: +1, wealth: -1 }, karma: 2, description: 'The community survives intact. A new village takes root.', special: 'migrate', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: { health: -1, connections: +1 }, karma: 1, description: 'The burden of leadership weighs heavy. But bonds hold.', special: 'migrate' },
                    { weight: 30, effects: { wealth: -2 }, karma: 1, description: 'Organizing the exodus drains your resources. Others benefit more than you.', special: 'migrate', tagAxis: { self_vs_others: 1 } }
                ]
            },
            {
                text: 'Stay until the bitter end',
                preview: { description: 'This is home. Even dying, it is home.' },
                outcomes: [
                    { weight: 35, effects: { health: -2 }, karma: 0, description: 'The land takes what it cannot give. You diminish with it.' },
                    { weight: 35, effects: { wealth: -1, health: -1, connections: -1 }, karma: 0, description: 'Eventually, you must leave anyway. Later. Weaker. Alone.', special: 'migrate' },
                    { weight: 30, effects: { health: -1 }, karma: 1, description: 'You witness the end. Someone had to bear witness.', tagAxis: { roots_vs_wings: -1 } }
                ]
            }
        ]
    },

    // Pull Events - Opportunities drawing people forward,
{
        id: 'family_reunion_call',
        stage: 'middle',
        type: 'choice',
        special: 'migration',
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'moderate',
            clarity: 'transparent'
        },
        prompt: 'Relatives abroad sponsor your immigration. They want you close.',
        options: [
            {
                text: 'Join them',
                preview: { gains: ['connections'], risks: ['wealth'], description: 'Family together again' },
                outcomes: [
                    { weight: 50, effects: { connections: +2, wealth: -1 }, karma: 1, description: 'Generations reunited.', special: 'migrate' },
                    { weight: 30, effects: { connections: +1, education: +1 }, karma: 1, description: 'Family network opens new doors.', special: 'migrate' },
                    { weight: 20, effects: { connections: +1, health: +1 }, karma: 1, description: 'No longer alone in the world.', special: 'migrate' }
                ]
            },
            {
                text: 'Stay independent',
                preview: { gains: ['wealth'], risks: ['connections'], description: 'Your own path' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'You build on your own terms.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Distance strains the relationship.' },
                    { weight: 25, effects: {}, karma: 0, description: 'They understand your choice.' }
                ]
            }
        ]
    },
{
        id: 'diaspora_community',
        stage: 'middle',
        type: 'choice',
        special: 'post_migration',
        prompt: 'You find others from your homeland. They have built a community here.',
        options: [
            {
                text: 'Join the diaspora',
                preview: { gains: ['connections', 'health'], risks: [], description: 'Home away from home' },
                outcomes: [
                    { weight: 50, effects: { connections: +1, health: +1 }, karma: 0, description: 'Familiar faces, familiar food, familiar words.' },
                    { weight: 30, effects: { connections: +2 }, karma: 1, description: 'A support network forms.' },
                    { weight: 20, effects: { wealth: +1 }, karma: 0, description: 'Business connections emerge.' }
                ]
            },
            {
                text: 'Integrate with locals',
                preview: { gains: ['education'], risks: ['connections'], description: 'Full assimilation' },
                outcomes: [
                    { weight: 40, effects: { education: +1, connections: -1 }, karma: 0, description: 'You become more local than newcomer.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Local friendships form.' },
                    { weight: 25, effects: { education: +1, health: -1 }, karma: 0, description: 'The effort is exhausting but rewarding.' }
                ]
            }
        ]
    },
{
        id: 'discrimination_faced',
        stage: 'middle',
        type: 'choice',
        special: 'post_migration',
        prompt: 'Your accent, your name, your appearance mark you as different. Some people make sure you know it.',
        options: [
            {
                text: 'Prove them wrong',
                preview: { description: 'Excel despite the barriers' },
                outcomes: [
                    { weight: 40, effects: { education: +1, health: -1 }, karma: 1, description: 'You outwork everyone. Achievement silences some critics.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Success is the best response. But it should not have been necessary.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'The constant pressure to perform twice as well takes its toll.' }
                ]
            },
            {
                text: 'Push back directly',
                preview: { description: 'Confront discrimination when it happens' },
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 2, description: 'Your courage inspires allies to emerge.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Some doors close permanently. You are labeled difficult.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 30, effects: { health: -1 }, karma: 1, description: 'The fight wears you down. But some battles must be fought.', tagAxis: { risk_vs_safety: 1 } }
                ]
            },
            {
                text: 'Find your people',
                preview: { description: 'Seek spaces where you belong' },
                outcomes: [
                    { weight: 45, effects: { connections: +1, health: +1 }, karma: 0, description: 'You build a world within the world. Safe harbor.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Community sustains you when the wider world wounds.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Staying in safe spaces limits opportunity. A trade-off.' }
                ]
            }
        ]
    },
{
        id: 'integration_milestone',
        stage: 'middle',
        type: 'choice',
        special: 'post_migration',
        prompt: 'After years of effort, you feel at home. The language flows. The customs are second nature. A milestone.',
        options: [
            {
                text: 'Celebrate how far you have come',
                preview: { description: 'Mark the achievement' },
                outcomes: [
                    { weight: 50, effects: { health: +1, connections: +1 }, karma: 1, description: 'Truly bicultural now. Both worlds live in you.' },
                    { weight: 30, effects: { connections: +1 }, karma: 0, description: 'Recognition from both communities. You are a bridge.' },
                    { weight: 20, effects: { wealth: +1, connections: +1 }, karma: 0, description: 'Integration opens every door. The hard years paid off.' }
                ]
            },
            {
                text: 'Reflect on what was lost',
                preview: { description: 'Remember the cost of becoming new' },
                outcomes: [
                    { weight: 45, effects: { education: +1 }, karma: 0, description: 'Two perspectives enrich your worldview. Neither is fully home.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The old self fades. You mourn who you used to be.' },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Honesty about the cost helps others on the same path.' }
                ]
            },
            {
                text: 'Reach back to help others',
                preview: { description: 'Guide newcomers through what you survived' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 2, description: 'You become the mentor you needed. The cycle improves.', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: { health: -1, connections: +1 }, karma: 1, description: 'Reliving the struggle through others reopens wounds. But it matters.', tagAxis: { self_vs_others: 1 } },
                    { weight: 20, effects: { connections: +2 }, karma: 2, description: 'A community forms around your guidance. You belong fully now.', tagAxis: { self_vs_others: 1 } }
                ]
            }
        ]
    },
{
        id: 'heritage_rediscovery',
        stage: 'middle',
        type: 'choice',
        special: 'second_generation',
        themes: ['migration', 'identity'],
        prompt: 'You feel the pull to understand where your family came from. The old country calls.',
        options: [
            {
                text: 'Journey to the homeland',
                preview: { gains: ['education', 'health'], risks: ['wealth'], description: 'Find your roots' },
                outcomes: [
                    { weight: 45, effects: { education: +1, health: +1, wealth: -1 }, karma: 1, description: 'Pieces of yourself fall into place.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Family you never knew welcomes you.' },
                    { weight: 20, effects: { education: +1 }, karma: 0, description: 'History becomes personal.' }
                ]
            },
            {
                text: 'Focus on the present',
                preview: { gains: ['wealth'], risks: [], description: 'Forward not backward' },
                outcomes: [
                    { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Your life is here now.' },
                    { weight: 30, effects: {}, karma: 0, description: 'The past can wait.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Questions linger unanswered.' }
                ]
            }
        ]
    },
{
        id: 'cultural_bridge',
        stage: 'middle',
        type: 'choice',
        special: 'second_generation',
        themes: ['migration', 'community'],
        prompt: 'Your unique position lets you connect communities that otherwise wouldn\'t meet.',
        options: [
            {
                text: 'Build bridges',
                preview: { gains: ['connections', 'karma'], risks: ['health'], description: 'Unite two worlds' },
                outcomes: [
                    { weight: 45, effects: { connections: +2, health: -1 }, karma: 2, description: 'Exhausting but meaningful work.' },
                    { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Small connections matter.' },
                    { weight: 20, effects: { education: +1, connections: +1 }, karma: 1, description: 'Your perspective becomes valued.' }
                ]
            },
            {
                text: 'Keep to yourself',
                preview: { gains: ['health'], risks: [], description: 'Not your burden' },
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Self-care isn\'t selfish.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Energy preserved for other goals.' },
                    { weight: 20, effects: {}, karma: -1, description: 'An opportunity passed.' }
                ]
            }
        ]
    },

    // === LINEAGE EVENTS ===,
{
        id: 'child_arrives',
        stage: 'middle',
        type: 'choice',
        special: 'child_birth',  // Special flag for lineage system
        prompt: 'A child comes into your life. Everything shifts.',
        options: [
            {
                text: 'Embrace it fully',
                preview: { description: 'Throw yourself into parenthood' },
                outcomes: [
                    { weight: 45, effects: { connections: +2, wealth: -1 }, karma: 2, description: 'Your world contracts to a crib, a cry, a heartbeat. Nothing else matters.', tagAxis: { family_vs_career: 1 } },
                    { weight: 35, effects: { connections: +1, health: -1 }, karma: 1, description: 'Sleepless devotion. You give everything.', tagAxis: { family_vs_career: 1 } },
                    { weight: 20, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'Total commitment has its costs, but no regrets.' }
                ]
            },
            {
                text: 'Try to balance everything',
                preview: { description: 'Maintain your life while parenting' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'You find a rhythm. Exhausting, but sustainable.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The juggling act takes its toll. Something always slips.' },
                    { weight: 25, effects: { connections: +1, wealth: +1 }, karma: 1, description: 'Against the odds, you make it work.' }
                ]
            },
            {
                text: 'Feel overwhelmed',
                preview: { description: 'Be honest about the struggle' },
                outcomes: [
                    { weight: 40, effects: { connections: +1, health: -1 }, karma: 0, description: 'Parenthood does not come easily. But you show up anyway.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The weight of responsibility nearly crushes you.' },
                    { weight: 25, effects: { connections: +1 }, karma: 1, description: 'Your honesty lets others help. You are not alone.' }
                ]
            }
        ]
    },
{
        id: 'family_planning',
        stage: 'middle',
        type: 'choice',
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'moderate',
            clarity: 'partial'
        },
        prompt: 'The question of children weighs on your mind.',
        options: [
            {
                text: 'Prioritize family',
                preview: { gains: ['connections'], risks: ['wealth'], description: 'Commit to building a family' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'You focus on what matters most to you.' },
                    { weight: 35, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'Family comes with sacrifice.' },
                    { weight: 20, effects: { connections: +1, health: -1 }, karma: 0, description: 'The stress of trying takes its toll.' }
                ]
            },
            {
                text: 'Focus elsewhere',
                preview: { gains: ['wealth'], risks: ['connections'], description: 'Other priorities call' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'You build in other ways.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Time for self-improvement.' },
                    { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Others question your choices.' }
                ]
            }
        ]
    },
{
        id: 'dangerous_opportunity',
        stage: 'middle',
        type: 'choice',
        tradeoff: {
            archetype: 'money_health',
            intensity: 'severe',
            clarity: 'hidden'
        },
        prompt: 'A lucrative but demanding opportunity presents itself.',
        options: [
            {
                text: 'Take the risk',
                preview: {
                    gains: ['wealth'],
                    risks: ['health'],
                    description: 'High reward, unknown cost'
                },
                outcomes: [
                    {
                        weight: 30,
                        effects: { wealth: +2 },
                        karma: 0,
                        description: 'Fortune favors you.',
                        hiddenCost: {
                            trigger: 'next_stage',
                            effects: { health: -1 },
                            description: 'The strain shows itself years later.'
                        }
                    },
                    {
                        weight: 40,
                        effects: { wealth: +1 },
                        karma: 0,
                        description: 'Modest gains, for now.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 4,
                            effects: { health: -2 },
                            description: 'Your body paid a price you did not foresee.'
                        }
                    },
                    { weight: 30, effects: { health: -1, wealth: +1 }, karma: 0, description: 'The cost is immediate and obvious.' }
                ]
            },
            {
                text: 'Stay cautious',
                preview: {
                    gains: ['health'],
                    risks: [],
                    description: 'Safety first'
                },
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Caution serves you.' },
                    { weight: 40, effects: { health: +1 }, karma: 0, description: 'Your body thanks you.' }
                ]
            }
        ]
    },

    // === PASSION VS SAFETY ===,
{
        id: 'startup_leap',
        stage: 'middle',
        type: 'choice',
        requirements: { education: '>2' },
        tradeoff: {
            archetype: 'passion_safety',
            intensity: 'severe',
            clarity: 'partial'
        },
        prompt: 'An exciting venture calls to you, but stability hangs in the balance.',
        options: [
            {
                text: 'Take the leap',
                preview: {
                    gains: ['wealth', 'education'],
                    risks: ['connections'],
                    description: 'Risk everything'
                },
                outcomes: [
                    { weight: 25, effects: { wealth: +2, education: +1 }, karma: 1, description: 'The gamble pays off brilliantly.' },
                    { weight: 35, effects: { wealth: -1, education: +1 }, karma: 0, description: 'Learning, even in failure.' },
                    {
                        weight: 40,
                        effects: { wealth: -2, connections: -1 },
                        karma: -1,
                        description: 'It collapses, taking relationships with it.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 2,
                            effects: { health: -1 },
                            description: 'The failure weighs on you longer than expected.'
                        }
                    }
                ]
            },
            {
                text: 'Stay the course',
                preview: {
                    gains: ['connections'],
                    risks: [],
                    description: 'Steady as she goes'
                },
                outcomes: [
                    { weight: 55, effects: { connections: +1 }, karma: 0, description: 'Stability preserved.' },
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Patience rewards.' }
                ]
            }
        ]
    },

    // === NOW VS LATER (Short-term vs Long-term) ===,
{
        id: 'windfall_choice',
        stage: 'middle',
        type: 'choice',
        tradeoff: {
            archetype: 'now_later',
            intensity: 'moderate',
            clarity: 'hidden'
        },
        prompt: 'Unexpected money comes your way. What do you do with it?',
        options: [
            {
                text: 'Enjoy it now',
                preview: {
                    gains: ['connections'],
                    risks: [],
                    description: 'Life is short'
                },
                outcomes: [
                    {
                        weight: 45,
                        effects: { connections: +1 },
                        karma: 0,
                        description: 'Memories worth making.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 4,
                            effects: { wealth: -1 },
                            description: 'That money would have been useful now.'
                        }
                    },
                    { weight: 30, effects: { health: +1 }, karma: 0, description: 'You live a little.' },
                    { weight: 25, effects: { connections: +1, health: +1 }, karma: 1, description: 'Joy shared is joy doubled.' }
                ]
            },
            {
                text: 'Save for the future',
                preview: {
                    gains: ['wealth'],
                    risks: [],
                    description: 'Patience rewards'
                },
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Discipline adds up.' },
                    {
                        weight: 35,
                        effects: { wealth: +2 },
                        karma: 1,
                        description: 'Compound returns favor the patient.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 5,
                            effects: { connections: -1 },
                            description: 'While you saved, others forgot you.'
                        }
                    },
                    { weight: 20, effects: {}, karma: 0, description: 'An emergency consumes it anyway.' }
                ]
            }
        ]
    },
{
        id: 'risky_investment',
        stage: 'middle',
        type: 'choice',
        requirements: { wealth: '>2' },
        tradeoff: {
            archetype: 'stability_opportunity',
            intensity: 'moderate',
            clarity: 'hidden'
        },
        prompt: 'An opportunity promises great returns, but requires commitment.',
        options: [
            {
                text: 'Commit everything',
                preview: {
                    gains: ['wealth'],
                    risks: [],
                    description: 'Fortune favors the bold'
                },
                outcomes: [
                    { weight: 25, effects: { wealth: +2 }, karma: 0, description: 'It pays off magnificently.' },
                    {
                        weight: 35,
                        effects: { wealth: -1 },
                        karma: 0,
                        description: 'A setback, but not ruin.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 2,
                            effects: { connections: -1 },
                            description: 'Others remember your recklessness.'
                        }
                    },
                    {
                        weight: 40,
                        effects: { wealth: -2 },
                        karma: -1,
                        description: 'Disaster strikes.',
                        hiddenCost: {
                            trigger: 'immediate',
                            effects: { health: -1 },
                            description: 'The stress is overwhelming.'
                        }
                    }
                ]
            },
            {
                text: 'Play it safe',
                preview: {
                    gains: ['connections'],
                    risks: [],
                    description: 'Preserve what you have'
                },
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'Security maintained.' },
                    { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'Steady growth continues.' }
                ]
            }
        ]
    },

    // === FAMILY VS MOBILITY ===,
{
        id: 'family_needs_you',
        stage: 'middle',
        type: 'choice',
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'severe',
            clarity: 'transparent'
        },
        prompt: 'Your family needs you, but your career is elsewhere.',
        options: [
            {
                text: 'Return to family',
                preview: {
                    gains: ['connections'],
                    risks: ['wealth', 'education'],
                    description: 'Duty over ambition'
                },
                outcomes: [
                    { weight: 40, effects: { connections: +2, wealth: -1 }, karma: 2, description: 'Love repaid in presence.' },
                    { weight: 35, effects: { connections: +1, health: -1 }, karma: 1, description: 'The burden is shared, but heavy.' },
                    { weight: 25, effects: { connections: +1, wealth: -1, health: -1 }, karma: 1, description: 'Sacrifice exacts its toll.' }
                ]
            },
            {
                text: 'Stay focused on your path',
                preview: {
                    gains: ['wealth'],
                    risks: ['connections'],
                    description: 'Distance from duty'
                },
                outcomes: [
                    {
                        weight: 35,
                        effects: { wealth: +1 },
                        karma: -1,
                        description: 'Progress, shadowed by guilt.',
                        hiddenCost: {
                            trigger: 'next_stage',
                            effects: { connections: -1 },
                            description: 'Some absences cannot be forgiven.'
                        }
                    },
                    { weight: 40, effects: { wealth: +1, connections: -1 }, karma: -2, description: 'The distance grows permanent.' },
                    { weight: 25, effects: { connections: -1 }, karma: -1, description: 'Others step in. You are not needed.' }
                ]
            }
        ]
    },
{
        id: 'inheritance_strings',
        stage: 'middle',
        type: 'choice',
        requirements: { connections: '>2' },
        tradeoff: {
            archetype: 'family_mobility',
            intensity: 'moderate',
            clarity: 'partial'
        },
        prompt: 'An inheritance is offered, but with expectations attached.',
        options: [
            {
                text: 'Accept with obligations',
                preview: {
                    gains: ['wealth'],
                    risks: ['connections'],
                    description: 'Wealth with strings'
                },
                outcomes: [
                    { weight: 35, effects: { wealth: +2, connections: +1 }, karma: 1, description: 'Family bonds strengthen with shared fortune.' },
                    {
                        weight: 40,
                        effects: { wealth: +1 },
                        karma: 0,
                        description: 'The money comes with invisible chains.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 3,
                            effects: { health: -1 },
                            description: 'Family obligations drain you.'
                        }
                    },
                    { weight: 25, effects: { wealth: +1, connections: -1 }, karma: -1, description: 'Resentments surface.' }
                ]
            },
            {
                text: 'Decline the inheritance',
                preview: {
                    gains: ['health'],
                    risks: ['wealth'],
                    description: 'Freedom from obligation'
                },
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 1, description: 'Freedom has its own value.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Life continues unburdened.' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Some feel rejected by your choice.' }
                ]
            }
        ]
    },

    // === SELF VS OTHERS ===,
{
        id: 'stranger_in_need',
        stage: 'middle',
        type: 'choice',
        tradeoff: {
            archetype: 'self_others',
            intensity: 'moderate',
            clarity: 'transparent'
        },
        prompt: 'A stranger needs help that will cost you significantly.',
        options: [
            {
                text: 'Help them',
                preview: {
                    gains: ['karma'],
                    risks: ['wealth', 'health'],
                    description: 'Compassion over convenience'
                },
                outcomes: [
                    { weight: 35, effects: { wealth: -1 }, karma: 3, description: 'A stranger blessed, a soul enriched.' },
                    { weight: 40, effects: { wealth: -1, connections: +1 }, karma: 2, description: 'Kindness begets connection.' },
                    { weight: 25, effects: { wealth: -1, health: -1 }, karma: 2, description: 'It costs more than expected, but worth it.' }
                ]
            },
            {
                text: 'Tend to your own needs',
                preview: {
                    gains: ['wealth', 'health'],
                    risks: ['karma'],
                    description: 'Self-preservation'
                },
                outcomes: [
                    { weight: 45, effects: {}, karma: -1, description: 'You walk on. The moment passes.' },
                    { weight: 35, effects: { wealth: +1 }, karma: -2, description: 'Resources preserved, conscience pricked.' },
                    {
                        weight: 20,
                        effects: {},
                        karma: 0,
                        description: 'Someone else helps them. Perhaps you are not needed.',
                        hiddenCost: {
                            trigger: 'delayed',
                            delay: 2,
                            effects: { connections: -1 },
                            description: 'Your reputation for coldness precedes you.'
                        }
                    }
                ]
            }
        ]
    },
{
        id: 'union_organizer',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'Workers are organizing for better conditions. Join them?',
                options: [
                    {
                        text: 'Join the union',
                        outcomes: [
                            { weight: 30, effects: { connections: +1 }, karma: 2, description: 'Solidarity with fellow workers.' },
                            { weight: 30, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Blacklisted but supported.' },
                            { weight: 25, effects: { health: -1 }, karma: 1, description: 'Strikebreakers leave their mark.' },
                            { weight: 15, effects: { wealth: +1, connections: +1 }, karma: 2, description: 'The strike succeeds!' }
                        ]
                    },
                    {
                        text: 'Keep your head down',
                        outcomes: [
                            { weight: 45, effects: {}, karma: 0, description: 'You protect your position.' },
                            { weight: 35, effects: { wealth: +1 }, karma: -1, description: 'Management rewards loyalty.' },
                            { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Workers see you as a traitor.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Workers unite for better conditions.',
        options: [{
            text: 'Consider your position',
            outcomes: [
                { weight: 50, effects: { connections: +1 }, karma: 1, description: 'You stand with others.' },
                { weight: 50, effects: {}, karma: 0, description: 'You stay out of it.' }
            ]
        }]
    },
{
        id: 'suffrage_movement',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'The suffrage movement seeks support. Risk reputation for the cause?',
                options: [
                    {
                        text: 'Support the movement',
                        outcomes: [
                            { weight: 35, effects: { connections: +1 }, karma: 2, description: 'You stand on the right side of history.' },
                            { weight: 30, effects: { connections: -1 }, karma: 1, description: 'Society disapproves, but conscience is clear.' },
                            { weight: 20, effects: { health: -1 }, karma: 2, description: 'Protests turn violent.' },
                            { weight: 15, effects: { education: +1 }, karma: 1, description: 'Political awakening.' }
                        ]
                    },
                    {
                        text: 'Stay out of politics',
                        outcomes: [
                            { weight: 50, effects: {}, karma: 0, description: 'Change happens without you.' },
                            { weight: 30, effects: { wealth: +1 }, karma: -1, description: 'Conformity has its rewards.' },
                            { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Reformers remember silence.' }
                        ]
                    }
                ]
            },
            early_modern: {
                prompt: 'The struggle for rights continues. Will you participate?',
                options: [
                    {
                        text: 'Join the cause',
                        outcomes: [
                            { weight: 50, effects: { connections: +1 }, karma: 2, description: 'Victory is achieved.' },
                            { weight: 30, effects: {}, karma: 1, description: 'Progress is slow but sure.' },
                            { weight: 20, effects: { connections: +1 }, karma: 1, description: 'New alliances form.' }
                        ]
                    },
                    {
                        text: 'Focus on personal affairs',
                        outcomes: [
                            { weight: 60, effects: {}, karma: 0, description: 'Others carry the burden.' },
                            { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'You tend to your own.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Political change stirs.',
        options: [{
            text: 'Observe',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'Times change around you.' },
                { weight: 50, effects: { connections: +1 }, karma: 1, description: 'You are swept up in events.' }
            ]
        }]
    },
{
        id: 'wartime_rationing',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            early_modern: {
                prompt: 'War demands sacrifice. Rationing tests everyone.',
                options: [
                    {
                        text: 'Sacrifice willingly',
                        outcomes: [
                            { weight: 45, effects: { health: -1 }, karma: 2, description: 'Your portion goes to the war effort.' },
                            { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Community strengthens in shared hardship.' },
                            { weight: 20, effects: {}, karma: 1, description: 'You manage with less.' }
                        ]
                    },
                    {
                        text: 'Seek black market goods',
                        outcomes: [
                            { weight: 35, effects: { wealth: -1 }, karma: -1, description: 'Comfort at a price.' },
                            { weight: 35, effects: { connections: -1 }, karma: -2, description: 'Neighbors notice and judge.' },
                            { weight: 30, effects: { health: +1 }, karma: -1, description: 'Your family eats well while others go hungry.' }
                        ]
                    }
                ]
            },
            cold_war: {
                prompt: 'Resources are tight. How do you manage?',
                options: [
                    {
                        text: 'Make do with less',
                        outcomes: [
                            { weight: 50, effects: {}, karma: 1, description: 'Discipline serves you.' },
                            { weight: 50, effects: { health: -1 }, karma: 0, description: 'Want leaves its mark.' }
                        ]
                    },
                    {
                        text: 'Find other means',
                        outcomes: [
                            { weight: 50, effects: { wealth: +1 }, karma: -1, description: 'Resources found, integrity questioned.' },
                            { weight: 50, effects: {}, karma: 0, description: 'You manage somehow.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Scarcity demands choices.',
        options: [{
            text: 'Cope',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'You manage.' },
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'Times are hard.' }
            ]
        }]
    },
{
        id: 'fallout_shelter',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'Nuclear anxiety grips the nation. Build a fallout shelter?',
                options: [
                    {
                        text: 'Build the shelter',
                        outcomes: [
                            { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'Peace of mind comes at a cost.' },
                            { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Neighbors think you paranoid.' },
                            { weight: 25, effects: { health: +1 }, karma: 0, description: 'Less anxiety, better sleep.' }
                        ]
                    },
                    {
                        text: 'Live without fear',
                        outcomes: [
                            { weight: 50, effects: { health: +1 }, karma: 1, description: 'You refuse to let fear rule.' },
                            { weight: 30, effects: { connections: +1 }, karma: 0, description: 'Others admire your calm.' },
                            { weight: 20, effects: { health: -1 }, karma: 0, description: 'Anxiety gnaws anyway.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Fear shapes choices.',
        options: [{
            text: 'Decide',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'Times pass.' },
                { weight: 50, effects: { health: -1 }, karma: 0, description: 'Worry takes its toll.' }
            ]
        }]
    },
{
        id: 'corporate_ladder',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'Corporate life offers security but demands conformity. Climb higher?',
                options: [
                    {
                        text: 'Pursue advancement',
                        outcomes: [
                            { weight: 35, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Success exacts its price.' },
                            { weight: 35, effects: { wealth: +1, connections: -1 }, karma: -1, description: 'Stepping over others on the way up.' },
                            { weight: 30, effects: { wealth: +2 }, karma: 0, description: 'The organization rewards loyalty.' }
                        ]
                    },
                    {
                        text: 'Maintain work-life balance',
                        outcomes: [
                            { weight: 45, effects: { health: +1 }, karma: 1, description: 'Family and health preserved.' },
                            { weight: 35, effects: { connections: +1 }, karma: 0, description: 'Time for what matters.' },
                            { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Passed over for promotion.' }
                        ]
                    }
                ]
            },
            contemporary: {
                prompt: 'Career advancement beckons, but at what cost?',
                options: [
                    {
                        text: 'Chase the promotion',
                        outcomes: [
                            { weight: 40, effects: { wealth: +1 }, karma: 0, description: 'The grind pays off.' },
                            { weight: 40, effects: { health: -1, wealth: +1 }, karma: 0, description: 'Burnout threatens.' },
                            { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Personal life suffers.' }
                        ]
                    },
                    {
                        text: 'Prioritize balance',
                        outcomes: [
                            { weight: 50, effects: { health: +1 }, karma: 1, description: 'Wellbeing first.' },
                            { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Relationships flourish.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Career demands attention.',
        options: [{
            text: 'Navigate',
            outcomes: [
                { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Work progresses.' },
                { weight: 50, effects: {}, karma: 0, description: 'Steady as she goes.' }
            ]
        }]
    },
{
        id: 'climate_anxiety',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'Climate change looms. How do you respond?',
                options: [
                    {
                        text: 'Take action',
                        outcomes: [
                            { weight: 40, effects: { connections: +1 }, karma: 2, description: 'Activism connects you to purpose.' },
                            { weight: 30, effects: { wealth: -1 }, karma: 1, description: 'Sustainable living costs more.' },
                            { weight: 20, effects: { health: +1 }, karma: 1, description: 'Action eases anxiety.' },
                            { weight: 10, effects: { health: -1 }, karma: 1, description: 'The weight of the world.' }
                        ]
                    },
                    {
                        text: 'Focus on your own life',
                        outcomes: [
                            { weight: 45, effects: {}, karma: 0, description: 'One person cannot change everything.' },
                            { weight: 35, effects: { health: -1 }, karma: -1, description: 'Guilt and anxiety persist.' },
                            { weight: 20, effects: { wealth: +1 }, karma: -1, description: 'Ignoring the crisis is easier.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'The world changes around you.',
        options: [{
            text: 'Respond',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'Life continues.' },
                { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Community forms around shared concerns.' }
            ]
        }]
    },
{
        id: 'remote_work_revolution',
        stage: 'middle',
        type: 'choice',
        eraVariants: {
            contemporary: {
                prompt: 'Remote work transforms possibilities. Relocate to somewhere cheaper?',
                options: [
                    {
                        text: 'Move somewhere new',
                        outcomes: [
                            { weight: 40, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Cost savings, social distance.' },
                            { weight: 30, effects: { health: +1 }, karma: 0, description: 'Better quality of life.' },
                            { weight: 20, effects: { connections: +1 }, karma: 0, description: 'New community welcomes you.' },
                            { weight: 10, effects: { health: -1 }, karma: 0, description: 'Isolation takes hold.' }
                        ]
                    },
                    {
                        text: 'Stay where you are',
                        outcomes: [
                            { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Roots run deep.' },
                            { weight: 35, effects: {}, karma: 0, description: 'Familiarity comforts.' },
                            { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Costs continue to rise.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Technology enables new choices.',
        options: [{
            text: 'Adapt',
            outcomes: [
                { weight: 50, effects: {}, karma: 0, description: 'Change is constant.' },
                { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'New opportunities emerge.' }
            ]
        }]
    },
{
        id: 'ancestor_duty',
        stage: 'middle',
        type: 'choice',
        region: 'east_asia',
        themes: ['filial_piety'],
        prompt: 'Aging parents need care. Tradition demands you provide it.',
        options: [
            {
                text: 'Fulfill your duty',
                outcomes: [
                    { weight: 45, effects: { connections: +1, wealth: -1 }, karma: 2, description: 'Devotion honored.' },
                    { weight: 35, effects: { health: -1 }, karma: 1, description: 'Caretaking exhausts you.' },
                    { weight: 20, effects: {}, karma: 1, description: 'Balance found.' }
                ]
            },
            {
                text: 'Seek outside help',
                outcomes: [
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'Professional care costs.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Family disapproves.' },
                    { weight: 25, effects: { health: +1 }, karma: 0, description: 'Sanity preserved.' }
                ]
            }
        ]
    },

    // === SOUTH ASIA ===,
{
        id: 'community_obligation',
        stage: 'middle',
        type: 'choice',
        region: 'south_asia',
        themes: ['community', 'caste_dynamics'],
        prompt: 'Your community calls upon you to fulfill an obligation.',
        options: [
            {
                text: 'Honor the commitment',
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Standing in the community rises.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 1, description: 'Costly but respected.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Burden accepted.' }
                ]
            },
            {
                text: 'Prioritize personal needs',
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: -1, description: 'Whispers follow you.' },
                    { weight: 35, effects: { wealth: +1 }, karma: 0, description: 'Resources conserved.' },
                    { weight: 25, effects: {}, karma: 0, description: 'Quietly noted.' }
                ]
            }
        ]
    },
{
        id: 'currency_crisis',
        stage: 'middle',
        type: 'choice',
        region: 'latin_america',
        themes: ['economic_instability'],
        prompt: 'The currency crashes. Life savings evaporate overnight. This is not the first time. How do you survive this one?',
        options: [
            {
                text: 'Convert to dollars immediately',
                preview: { description: 'Move fast while you can' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'You save something. Less than you had, but more than nothing.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Quick thinking preserves what you have. For now.' },
                    { weight: 25, effects: { wealth: +1 }, karma: 0, description: 'You knew this was coming. Preparation pays off.' }
                ]
            },
            {
                text: 'Pool resources with family',
                preview: { description: 'Together we survive' },
                outcomes: [
                    { weight: 45, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Everyone suffers less when the burden is shared.' },
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'The network sustains you. This is what family is for.' },
                    { weight: 20, effects: { wealth: -2, connections: +1 }, karma: 0, description: 'You give more than you receive. But that is how it works.' }
                ]
            },
            {
                text: 'Hustle in the informal economy',
                preview: { description: 'Do what you must to survive' },
                outcomes: [
                    { weight: 40, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Street smarts pay when systems fail.' },
                    { weight: 35, effects: {}, karma: 0, description: 'You adapt. Rebusque becomes a way of life.' },
                    { weight: 25, effects: { wealth: -1 }, karma: -1, description: 'The informal economy is unforgiving too.' }
                ]
            }
        ]
    },
{
        id: 'welfare_choice',
        stage: 'middle',
        type: 'choice',
        region: 'western_europe',
        themes: ['social_welfare'],
        prompt: 'Hard times hit. The welfare system offers support.',
        options: [
            {
                text: 'Accept assistance',
                outcomes: [
                    { weight: 45, effects: { health: +1 }, karma: 0, description: 'Safety net catches you.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Temporary support.' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Stigma attaches.' }
                ]
            },
            {
                text: 'Refuse and struggle on',
                outcomes: [
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'Pride costs.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Difficult times.' },
                    { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Others admire your independence.' }
                ]
            }
        ]
    },
{
        id: 'privatization',
        stage: 'middle',
        type: 'choice',
        region: 'eastern_europe',
        themes: ['transition', 'resourcefulness'],
        prompt: 'State assets are privatizing. Vouchers offer a chance at ownership.',
        options: [
            {
                text: 'Invest your vouchers',
                outcomes: [
                    { weight: 30, effects: { wealth: +2 }, karma: 0, description: 'Lucky timing creates wealth.' },
                    { weight: 40, effects: {}, karma: 0, description: 'Modest returns.' },
                    { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Scammed by oligarchs.' }
                ]
            },
            {
                text: 'Sell vouchers for cash',
                outcomes: [
                    { weight: 50, effects: { wealth: +1 }, karma: 0, description: 'Immediate needs met.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Quick money, nothing more.' },
                    { weight: 20, effects: { wealth: -1 }, karma: 0, description: 'Regretting later.' }
                ]
            }
        ]
    },
{
        id: 'pilgrimage',
        stage: 'middle',
        type: 'choice',
        region: 'middle_east',
        themes: ['religious_influence'],
        prompt: 'The pilgrimage calls. A journey of faith awaits.',
        options: [
            {
                text: 'Make the pilgrimage',
                outcomes: [
                    { weight: 45, effects: { health: +1 }, karma: 2, description: 'Spiritual renewal.' },
                    { weight: 35, effects: { wealth: -1, connections: +1 }, karma: 1, description: 'Costly but meaningful.' },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Fellowship with believers.' }
                ]
            },
            {
                text: 'Postpone the journey',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Another year, perhaps.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Resources conserved.' },
                    { weight: 20, effects: { health: -1 }, karma: -1, description: 'Spiritual yearning unfulfilled.' }
                ]
            }
        ]
    },

    // === SUB-SAHARAN AFRICA ===,
{
        id: 'healthcare_crisis',
        stage: 'middle',
        type: 'choice',
        region: 'north_america',
        themes: ['self_reliance'],
        prompt: 'Medical bills threaten to overwhelm you. The system is complex, the costs staggering. How do you navigate this?',
        options: [
            {
                text: 'Fight through the insurance maze',
                preview: { description: 'Paperwork, appeals, phone calls' },
                outcomes: [
                    { weight: 40, effects: { wealth: -1, health: -1 }, karma: 0, description: 'Hours on hold. Denied. Appeal. Approved. Exhausting.' },
                    { weight: 35, effects: { wealth: -1 }, karma: 0, description: 'Insurance covers most. Most.' },
                    { weight: 25, effects: { education: +1 }, karma: 0, description: 'You learn to work the system. A grim expertise.' }
                ]
            },
            {
                text: 'Go public with your struggle',
                preview: { description: 'Crowdfunding, social media, asking for help' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Community rallies. Strangers donate. The shame fades in gratitude.' },
                    { weight: 35, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Crowdfunding covers the bills. The stress of publicity does not help healing.' },
                    { weight: 25, effects: { connections: -1 }, karma: 0, description: 'The campaign falls flat. You are not sympathetic enough, not viral enough.' }
                ]
            },
            {
                text: 'Delay treatment, cut costs',
                preview: { description: 'Skip tests, split pills, wait it out' },
                outcomes: [
                    { weight: 35, effects: { health: -2 }, karma: 0, description: 'What was treatable becomes something worse.' },
                    { weight: 35, effects: { wealth: +1, health: -1 }, karma: 0, description: 'You save money. The condition lingers. A dark trade.' },
                    { weight: 30, effects: { health: -1 }, karma: 0, description: 'It was not that serious after all. This time.' }
                ]
            }
        ]
    }
];
