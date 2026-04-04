// Childhood stage events

export const childhoodEvents = [
{
        id: 'early_illness',
        stage: 'childhood',
        type: 'choice',
        prompt: 'A fever takes hold in your early years.',
        options: [
            {
                text: 'Rest and recover',
                preview: { description: 'Take the time to heal properly' },
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'You recover fully with patience.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Rest makes you stronger.' },
                    { weight: 15, effects: { connections: -1 }, karma: 0, description: 'You miss time with friends while bedridden.' }
                ]
            },
            {
                text: 'Push through it',
                preview: { description: 'Try to carry on as normal' },
                outcomes: [
                    { weight: 40, effects: { health: -1 }, karma: 0, description: 'The illness leaves you weakened.' },
                    { weight: 30, effects: {}, karma: 0, description: 'Sheer will pulls you through.' },
                    { weight: 20, effects: { health: +1 }, karma: 1, description: 'You emerge tougher than before.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 10, effects: { health: -2 }, karma: 0, description: 'You push too hard. It gets worse.' }
                ]
            }
        ]
    },
{
        id: 'family_hardship',
        stage: 'childhood',
        type: 'choice',
        requirements: { wealth: '<4' },
        prompt: 'Your family faces financial strain.',
        options: [
            {
                text: 'Help where you can',
                preview: { description: 'Pitch in to support the family' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Your help is appreciated. Family bonds strengthen.', tagAxis: { family_vs_career: 1, self_vs_others: 1 } },
                    { weight: 35, effects: { education: -1 }, karma: 1, description: 'Less time for school, but you learn other lessons.', tagAxis: { family_vs_career: 1 } },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The burden weighs on you.' }
                ]
            },
            {
                text: 'Focus on your studies',
                preview: { description: 'Keep your head down and work hard at school' },
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 0, description: 'School becomes your escape.', tagAxis: { family_vs_career: -1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'You scrape by.' },
                    { weight: 20, effects: { connections: -1 }, karma: -1, description: 'Your distance is noticed.', tagAxis: { self_vs_others: -1 } }
                ]
            }
        ]
    },
{
        id: 'schoolyard_conflict',
        stage: 'childhood',
        type: 'choice',
        prompt: 'Another child takes something from you.',
        options: [
            {
                text: 'Fight back',
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: -1, description: 'You win but make enemies.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'A draw. Neither wins.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'You lose the fight.', tagAxis: { risk_vs_safety: 1 } }
                ]
            },
            {
                text: 'Let it go',
                outcomes: [
                    { weight: 50, effects: {}, karma: 1, description: 'It stings, but you move on.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Someone notices your restraint.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Others see weakness.', tagAxis: { risk_vs_safety: -1 } }
                ]
            }
        ]
    },
{
        id: 'education_opportunity',
        stage: 'childhood',
        type: 'choice',
        requirements: { education: '>2' },
        prompt: 'A chance to attend a better school arises.',
        options: [
            {
                text: 'Take the opportunity',
                outcomes: [
                    { weight: 55, effects: { education: +1, connections: -1 }, karma: 0, description: 'New school, new challenges, old friends fade.', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 30, effects: { education: +1 }, karma: 1, description: 'You thrive in the new environment.', tagAxis: { roots_vs_wings: 1 } },
                    { weight: 15, effects: { health: -1 }, karma: 0, description: 'The pressure takes a toll.', tagAxis: { roots_vs_wings: 1 } }
                ]
            },
            {
                text: 'Stay where you are',
                outcomes: [
                    { weight: 60, effects: { connections: +1 }, karma: 0, description: 'Your roots grow deeper.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 40, effects: {}, karma: 0, description: 'Life continues as before.', tagAxis: { roots_vs_wings: -1 } }
                ]
            }
        ]
    },
{
        id: 'childhood_friendship',
        stage: 'childhood',
        type: 'choice',
        prompt: 'A lonely child at school seeks your company.',
        options: [
            {
                text: 'Befriend them',
                outcomes: [
                    { weight: 60, effects: { connections: +1 }, karma: 1, description: 'A lasting friendship forms.', tagAxis: { self_vs_others: 1, social_vs_solitary: 1 } },
                    { weight: 25, effects: {}, karma: 1, description: 'You drift apart over time.', tagAxis: { self_vs_others: 1 } },
                    { weight: 15, effects: { connections: -1 }, karma: 0, description: 'Others exclude you both.', tagAxis: { self_vs_others: 1 } }
                ]
            },
            {
                text: 'Keep your distance',
                outcomes: [
                    { weight: 70, effects: {}, karma: 0, description: 'You never learn their story.', tagAxis: { self_vs_others: -1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 0, description: 'You fit in with the others.', tagAxis: { self_vs_others: -1 } }
                ]
            }
        ]
    },
{
        id: 'family_windfall',
        stage: 'childhood',
        type: 'choice',
        requirements: { wealth: '<5' },
        prompt: 'Unexpected fortune comes to your family.',
        options: [
            {
                text: 'Embrace the change',
                preview: { description: 'Let the good fortune transform your life' },
                outcomes: [
                    { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'Your circumstances improve.' },
                    { weight: 35, effects: { wealth: +1, connections: -1 }, karma: 0, description: 'Money changes things. Not all for the better.' },
                    { weight: 20, effects: { wealth: +1, education: +1 }, karma: 0, description: 'New opportunities open up.' }
                ]
            },
            {
                text: 'Stay grounded',
                preview: { description: 'Don\'t let money change who you are' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'You keep your old friends close.', tagAxis: { tradition_vs_change: -1 } },
                    { weight: 30, effects: {}, karma: 0, description: 'Easy come, easy go. But you remain yourself.' },
                    { weight: 20, effects: { wealth: +1, connections: +1 }, karma: 1, description: 'You share the good fortune. Bonds deepen.' }
                ]
            }
        ]
    },
{
        id: 'discovery_talent',
        stage: 'childhood',
        type: 'choice',
        prompt: 'You discover an unexpected talent—something that sets you apart.',
        options: [
            {
                text: 'Pursue it seriously',
                outcomes: [
                    { weight: 45, effects: { education: +1 }, karma: 1, description: 'Your gift begins to flourish.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Practice consumes your time. Friends drift away.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The pressure to perform takes its toll.' }
                ],
                preview: { description: 'Dedicate yourself to developing this gift' }
            },
            {
                text: 'Keep it as a hobby',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'It brings you quiet joy.' },
                    { weight: 40, effects: { connections: +1 }, karma: 0, description: 'Others enjoy watching you.' }
                ],
                preview: { description: 'Enjoy it without the pressure' }
            }
        ]
    },
{
        id: 'sibling_rivalry',
        stage: 'childhood',
        type: 'choice',
        prompt: 'Tension with a sibling reaches a breaking point.',
        options: [
            {
                text: 'Confront them directly',
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 0, description: 'The air clears. Understanding grows.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'Words wound deeper than intended.' },
                    { weight: 25, effects: {}, karma: 0, description: 'Nothing changes.' }
                ],
                preview: { description: 'Address the conflict head-on' }
            },
            {
                text: 'Avoid the conflict',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'The tension lingers beneath the surface.' },
                    { weight: 30, effects: { health: -1 }, karma: 0, description: 'Resentment festers inside you.' },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Time heals what words could not.' }
                ],
                preview: { description: 'Let things cool down on their own' }
            }
        ]
    },
{
        id: 'first_loss',
        stage: 'childhood',
        type: 'choice',
        prompt: 'Someone close to you passes away. Your first brush with mortality.',
        options: [
            {
                text: 'Let yourself grieve',
                preview: { description: 'Feel the loss fully' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Family draws closer in shared sorrow.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'You learn that loss is part of life.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'The sadness settles deep within you.' }
                ]
            },
            {
                text: 'Stay strong for others',
                preview: { description: 'Hold back your tears' },
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 1, description: 'Others lean on your strength.', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The unexpressed grief weighs on you.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 25, effects: {}, karma: 0, description: 'You learn to carry on despite the pain.' }
                ]
            }
        ]
    },
{
        id: 'playground_dare',
        stage: 'childhood',
        type: 'choice',
        prompt: 'Other children dare you to do something dangerous.',
        options: [
            {
                text: 'Accept the dare',
                outcomes: [
                    { weight: 35, effects: { connections: +1 }, karma: 0, description: 'You earn their respect.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'You get hurt, but survive.', tagAxis: { risk_vs_safety: 1 } },
                    { weight: 30, effects: { health: -1, connections: +1 }, karma: -1, description: 'Injured but legendary.', tagAxis: { risk_vs_safety: 1 } }
                ],
                preview: { description: 'Prove yourself to them' }
            },
            {
                text: 'Refuse',
                outcomes: [
                    { weight: 50, effects: {}, karma: 1, description: 'You stand your ground.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 30, effects: { connections: -1 }, karma: 0, description: 'They call you a coward.', tagAxis: { risk_vs_safety: -1 } },
                    { weight: 20, effects: { connections: +1 }, karma: 1, description: 'Someone admires your courage to say no.', tagAxis: { risk_vs_safety: -1 } }
                ],
                preview: { description: 'Walk away from peer pressure' }
            }
        ]
    },
{
        id: 'secret_hideaway',
        stage: 'childhood',
        type: 'choice',
        prompt: 'You discover a secret place—somewhere all your own.',
        options: [
            {
                text: 'Keep it to yourself',
                preview: { description: 'A sanctuary for solitude' },
                outcomes: [
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Peace settles into your bones.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'A refuge when the world overwhelms.' },
                    { weight: 15, effects: { connections: -1 }, karma: 0, description: 'You retreat there more and more.' }
                ]
            },
            {
                text: 'Share it with a friend',
                preview: { description: 'Make it a place for two' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'A shared secret deepens the bond.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 30, effects: { connections: +1, health: +1 }, karma: 1, description: 'Joy is better shared.' },
                    { weight: 20, effects: { connections: -1 }, karma: 0, description: 'They tell others. The magic fades.' }
                ]
            }
        ]
    },
{
        id: 'helping_stranger',
        stage: 'childhood',
        type: 'choice',
        prompt: 'You see someone in trouble—a stranger who needs help.',
        options: [
            {
                text: 'Help them',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 2, description: 'Your kindness is remembered.', tagAxis: { self_vs_others: 1 } },
                    { weight: 30, effects: {}, karma: 1, description: 'They thank you and move on.', tagAxis: { self_vs_others: 1 } },
                    { weight: 20, effects: { health: -1 }, karma: 1, description: 'Helping costs you something.', tagAxis: { self_vs_others: 1 }, grantsTag: 'generous' }
                ],
                preview: { description: 'Extend a hand to someone in need' }
            },
            {
                text: 'Walk past',
                outcomes: [
                    { weight: 60, effects: {}, karma: -1, description: 'The moment passes. You wonder what happened to them.', tagAxis: { self_vs_others: -1 } },
                    { weight: 40, effects: {}, karma: 0, description: 'Someone else steps in.', tagAxis: { self_vs_others: -1 } }
                ],
                preview: { description: 'Mind your own business' }
            }
        ]
    },
{
        id: 'caught_lying',
        stage: 'childhood',
        type: 'choice',
        prompt: 'You told a lie and now face the consequences of being caught.',
        options: [
            {
                text: 'Confess everything',
                outcomes: [
                    { weight: 55, effects: {}, karma: 1, description: 'The truth hurts, but trust can be rebuilt.' },
                    { weight: 30, effects: { connections: +1 }, karma: 1, description: 'Your honesty is respected.' },
                    { weight: 15, effects: { connections: -1 }, karma: 0, description: 'Forgiveness does not come easily.' }
                ],
                preview: { description: 'Come clean and accept responsibility' }
            },
            {
                text: 'Maintain the lie',
                outcomes: [
                    { weight: 40, effects: {}, karma: -1, description: 'You escape this time.' },
                    { weight: 35, effects: { connections: -1 }, karma: -1, description: 'They know. Trust erodes.' },
                    { weight: 25, effects: { health: -1 }, karma: -1, description: 'The guilt weighs on you.' }
                ],
                preview: { description: 'Double down and hope for the best' }
            }
        ]
    },
{
        id: 'unexpected_move',
        stage: 'childhood',
        type: 'choice',
        prompt: 'Your family must relocate. Everything familiar slips away.',
        options: [
            {
                text: 'Embrace the fresh start',
                preview: { description: 'See it as an adventure' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'New place, new friends.', tagAxis: { roots_vs_wings: 1, tradition_vs_change: 1 } },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'The new school proves better.' },
                    { weight: 20, effects: { health: +1 }, karma: 1, description: 'The change energizes you.' }
                ]
            },
            {
                text: 'Hold onto what was',
                preview: { description: 'Keep your old connections alive' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'Old friends become memories.', tagAxis: { roots_vs_wings: -1 } },
                    { weight: 35, effects: {}, karma: 0, description: 'You write letters. Some reply.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'The longing for home weighs on you.' }
                ]
            }
        ]
    },
{
        id: 'mentor_figure',
        stage: 'childhood',
        type: 'choice',
        prompt: 'An adult takes special interest in your potential.',
        options: [
            {
                text: 'Accept their guidance',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 1, description: 'Their wisdom shapes you.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 1, description: 'A bond forms across generations.', tagAxis: { social_vs_solitary: 1 } },
                    { weight: 20, effects: {}, karma: 0, description: 'You learn, but grow apart.' }
                ],
                preview: { description: 'Learn from their experience' }
            },
            {
                text: 'Keep your independence',
                outcomes: [
                    { weight: 60, effects: {}, karma: 0, description: 'You forge your own path.', tagAxis: { social_vs_solitary: -1 } },
                    { weight: 40, effects: { health: +1 }, karma: 0, description: 'Self-reliance becomes your strength.', tagAxis: { social_vs_solitary: -1 } }
                ],
                preview: { description: 'Figure things out yourself' }
            }
        ]
    },
{
        id: 'childhood_injustice',
        stage: 'childhood',
        type: 'choice',
        prompt: 'You witness something deeply unfair happening to another child.',
        options: [
            {
                text: 'Speak up',
                outcomes: [
                    { weight: 40, effects: { connections: +1 }, karma: 2, description: 'Your voice makes a difference.', tagAxis: { self_vs_others: 1, risk_vs_safety: 1 } },
                    { weight: 35, effects: {}, karma: 1, description: 'Nothing changes, but you tried.', tagAxis: { self_vs_others: 1, risk_vs_safety: 1 } },
                    { weight: 25, effects: { connections: -1 }, karma: 1, description: 'Standing up makes you a target too.', tagAxis: { self_vs_others: 1, risk_vs_safety: 1 } }
                ],
                preview: { description: 'Stand against injustice' }
            },
            {
                text: 'Stay silent',
                outcomes: [
                    { weight: 50, effects: {}, karma: -1, description: 'The moment haunts you.', tagAxis: { self_vs_others: -1, risk_vs_safety: -1 } },
                    { weight: 30, effects: { connections: +1 }, karma: 0, description: 'You stay safe in the crowd.', tagAxis: { self_vs_others: -1, risk_vs_safety: -1 } },
                    { weight: 20, effects: { health: -1 }, karma: -1, description: 'Guilt becomes a quiet companion.', tagAxis: { self_vs_others: -1 } }
                ],
                preview: { description: 'Protect yourself by staying quiet' }
            }
        ]
    },

    // === YOUNG ADULT (18-35) ===,
{
        id: 'between_two_worlds',
        stage: 'childhood',
        type: 'choice',
        special: 'second_generation',
        themes: ['migration', 'identity'],
        prompt: 'At home, one language and culture. At school, another. You live between two worlds. Neither fully claims you.',
        options: [
            {
                text: 'Learn to code-switch',
                preview: { description: 'Become fluent in both worlds' },
                outcomes: [
                    { weight: 45, effects: { education: +1 }, karma: 0, description: 'Two languages, two perspectives. You contain multitudes.' },
                    { weight: 35, effects: { health: -1 }, karma: 0, description: 'The constant translation is exhausting.' },
                    { weight: 20, effects: { connections: +1 }, karma: 0, description: 'You bridge communities others cannot.' }
                ]
            },
            {
                text: 'Lean into school culture',
                preview: { description: 'Fit in outside, whatever the cost inside' },
                outcomes: [
                    { weight: 40, effects: { connections: +1, health: -1 }, karma: 0, description: 'You pass. Almost. The accent at home embarrasses you now.' },
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'Success at school, distance at home.' },
                    { weight: 25, effects: { connections: +1 }, karma: -1, description: 'You reject your parents\' world. The loss comes later.' }
                ]
            },
            {
                text: 'Hold tight to home culture',
                preview: { description: 'Stay rooted in your parents\' world' },
                outcomes: [
                    { weight: 40, effects: { connections: +1, education: -1 }, karma: 0, description: 'Family bonds strengthen. School feels foreign.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Identity feels solid. You know who you are.' },
                    { weight: 25, effects: { connections: -1 }, karma: 0, description: 'Peers see you as different. Outsider.' }
                ]
            }
        ]
    },
{
        id: 'plague_outbreak',
        stage: 'childhood',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'Plague sweeps through your village. The church bells toll constantly. Your family must decide how to survive.',
                options: [
                    {
                        text: 'Flee to the countryside',
                        preview: { description: 'Escape before it spreads' },
                        outcomes: [
                            { weight: 40, effects: { wealth: -1 }, karma: 0, description: 'You escape, leaving everything behind.' },
                            { weight: 35, effects: { health: +1 }, karma: 0, description: 'Distance saves you. Fresh air and isolation work.' },
                            { weight: 25, effects: { connections: -2 }, karma: 0, description: 'You live. Your neighbors do not remember you fondly.' }
                        ]
                    },
                    {
                        text: 'Barricade and pray',
                        preview: { description: 'Seal the house and trust in God' },
                        outcomes: [
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'It enters anyway. One is taken. Others survive.' },
                            { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Your household weathers it together.' },
                            { weight: 30, effects: { health: -2 }, karma: 0, description: 'The walls could not keep it out.' }
                        ]
                    },
                    {
                        text: 'Help tend the sick',
                        preview: { description: 'Risk yourself for others' },
                        outcomes: [
                            { weight: 30, effects: { health: -2, connections: +1 }, karma: 2, description: 'Exposure takes its toll. But you are remembered.', tagAxis: { self_vs_others: 1 } },
                            { weight: 35, effects: { health: -1 }, karma: 1, description: 'You see death up close. It marks you.', tagAxis: { self_vs_others: 1 } },
                            { weight: 35, effects: { connections: +1 }, karma: 2, description: 'Somehow, you are spared. Your service is not forgotten.', tagAxis: { self_vs_others: 1 } }
                        ]
                    }
                ]
            },
            industrial_revolution: {
                prompt: 'Cholera spreads through the crowded tenements. The water is bad. The air is worse.',
                options: [
                    {
                        text: 'Boil everything',
                        preview: { description: 'Your parents heard rumors about water' },
                        outcomes: [
                            { weight: 45, effects: { health: +1 }, karma: 0, description: 'Old wisdom saves you. The boiled water spares your household.' },
                            { weight: 35, effects: {}, karma: 0, description: 'You avoid the worst. Many neighbors are not so fortunate.' },
                            { weight: 20, effects: { health: -1 }, karma: 0, description: 'Precautions help, but not enough.' }
                        ]
                    },
                    {
                        text: 'Crowd into the workhouse',
                        preview: { description: 'Seek shelter where there is food' },
                        outcomes: [
                            { weight: 40, effects: { health: -1 }, karma: 0, description: 'Crowded conditions spread sickness faster.' },
                            { weight: 35, effects: { health: -2 }, karma: 0, description: 'The workhouse becomes a charnel house.' },
                            { weight: 25, effects: { wealth: +1 }, karma: 0, description: 'You survive. The hardship teaches grim lessons.' }
                        ]
                    },
                    {
                        text: 'Stay put and hope',
                        preview: { description: 'Wait for it to pass' },
                        outcomes: [
                            { weight: 40, effects: { health: -1 }, karma: 0, description: 'The unsanitary conditions claim their toll.' },
                            { weight: 35, effects: {}, karma: 0, description: 'Luck favors your family this time.' },
                            { weight: 25, effects: { health: -2, connections: -1 }, karma: 0, description: 'Loss visits your door.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Disease spreads through your community. How does your family respond?',
        options: [
            {
                text: 'Take precautions',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'You do what you can.' },
                    { weight: 50, effects: { health: -1 }, karma: 0, description: 'Illness touches your life anyway.' }
                ]
            },
            {
                text: 'Help others',
                outcomes: [
                    { weight: 50, effects: { health: -1, connections: +1 }, karma: 1, description: 'Service in dark times.', tagAxis: { self_vs_others: 1 } },
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Community strengthens.' }
                ]
            }
        ]
    },
{
        id: 'famine_year',
        stage: 'childhood',
        type: 'choice',
        eraVariants: {
            pre_industrial: {
                prompt: 'The harvest fails. Hunger stalks the land. There is not enough for everyone.',
                options: [
                    {
                        text: 'Share what little you have',
                        preview: { description: 'The community survives together or not at all' },
                        outcomes: [
                            { weight: 35, effects: { health: -2, connections: +1 }, karma: 2, description: 'Starvation nearly claims you. But neighbors remember.', tagAxis: { self_vs_others: 1 } },
                            { weight: 40, effects: { health: -1, connections: +1 }, karma: 1, description: 'Everyone suffers equally. Bonds form in hunger.', tagAxis: { self_vs_others: 1 } },
                            { weight: 25, effects: { health: -1 }, karma: 1, description: 'Shared hardship. Shared survival.' }
                        ]
                    },
                    {
                        text: 'Hoard your family\'s stores',
                        preview: { description: 'Your own must come first' },
                        outcomes: [
                            { weight: 40, effects: { connections: -1 }, karma: -1, description: 'Your family eats while others watch. Resentment grows.' },
                            { weight: 35, effects: { health: +1, connections: -1 }, karma: -1, description: 'You survive stronger than most. The cost is not forgiven.' },
                            { weight: 25, effects: {}, karma: 0, description: 'You scrape by. Others do not ask where your food came from.' }
                        ]
                    },
                    {
                        text: 'Forage and scavenge',
                        preview: { description: 'Find what the land still offers' },
                        outcomes: [
                            { weight: 40, effects: { education: +1, health: -1 }, karma: 0, description: 'You learn which roots and bark sustain life. A bitter education.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'The wild provides little. But something.' },
                            { weight: 25, effects: { health: -2 }, karma: 0, description: 'You eat what you should not. The sickness follows.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Hard times test your family. How do you face scarcity?',
        options: [
            {
                text: 'Tighten your belt',
                outcomes: [
                    { weight: 50, effects: { health: -1 }, karma: 0, description: 'Scarcity marks you.' },
                    { weight: 50, effects: {}, karma: 0, description: 'You survive.' }
                ]
            },
            {
                text: 'Help others in need',
                outcomes: [
                    { weight: 50, effects: { health: -1, connections: +1 }, karma: 1, description: 'Generosity in hardship.', tagAxis: { self_vs_others: 1 } },
                    { weight: 50, effects: { connections: +1 }, karma: 1, description: 'Community pulls through together.' }
                ]
            }
        ]
    },

    // === INDUSTRIAL REVOLUTION (1850-1920) ===,
{
        id: 'tenement_conditions',
        stage: 'childhood',
        type: 'choice',
        eraVariants: {
            industrial_revolution: {
                prompt: 'Your family lives in a cramped tenement. Disease spreads easily in the squalor. Childhood here demands choices.',
                options: [
                    {
                        text: 'Work to help the family',
                        preview: { description: 'Earn while others play' },
                        outcomes: [
                            { weight: 40, effects: { wealth: +1, education: -1 }, karma: 0, description: 'Work, not school, defines your childhood. You learn other lessons.' },
                            { weight: 35, effects: { health: -1 }, karma: 0, description: 'The factory takes from your small body.' },
                            { weight: 25, effects: { connections: +1 }, karma: 1, description: 'Fellow workers become companions. Solidarity born young.' }
                        ]
                    },
                    {
                        text: 'Sneak off to school when possible',
                        preview: { description: 'Steal hours for learning' },
                        outcomes: [
                            { weight: 40, effects: { education: +1 }, karma: 0, description: 'Letters and numbers light a path out.' },
                            { weight: 35, effects: { health: -1, education: +1 }, karma: 0, description: 'Running between work and school exhausts you.' },
                            { weight: 25, effects: { education: +1, connections: +1 }, karma: 0, description: 'A teacher sees your hunger for knowledge.' }
                        ]
                    },
                    {
                        text: 'Run with the street children',
                        preview: { description: 'Find family among the lost' },
                        outcomes: [
                            { weight: 40, effects: { connections: +1, health: -1 }, karma: 0, description: 'The streets teach survival. Neighbors become family.' },
                            { weight: 35, effects: { connections: +1 }, karma: 0, description: 'A gang of urchins. You belong somewhere.' },
                            { weight: 25, effects: { health: -2 }, karma: -1, description: 'Illness and trouble find you in the alleys.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'Urban life shapes your youth. How do you survive?',
        options: [
            {
                text: 'Work hard',
                outcomes: [
                    { weight: 50, effects: { wealth: +1, health: -1 }, karma: 0, description: 'Hardship marks you.' },
                    { weight: 50, effects: {}, karma: 0, description: 'You manage.' }
                ]
            },
            {
                text: 'Find community',
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Neighbors become family.' },
                    { weight: 50, effects: { health: -1, connections: +1 }, karma: 0, description: 'Shared struggle.' }
                ]
            }
        ]
    },
{
        id: 'space_race_inspiration',
        stage: 'childhood',
        type: 'choice',
        eraVariants: {
            cold_war: {
                prompt: 'Humanity reaches for the stars. You watch rockets launch on television. A man walks on the moon. What does it stir in you?',
                options: [
                    {
                        text: 'Devour everything about space',
                        preview: { description: 'Let wonder become obsession' },
                        outcomes: [
                            { weight: 45, effects: { education: +1 }, karma: 1, description: 'Science captures your imagination. You build rockets from bottles, map the constellations.' },
                            { weight: 35, effects: { education: +1, connections: -1 }, karma: 0, description: 'Books about space replace friends. You dream of places no one around you understands.' },
                            { weight: 20, effects: { education: +2 }, karma: 1, description: 'A calling crystallizes. The future belongs to the stars.' }
                        ]
                    },
                    {
                        text: 'Share the wonder with others',
                        preview: { description: 'Bring friends and family into the dream' },
                        outcomes: [
                            { weight: 45, effects: { connections: +1 }, karma: 1, description: 'Watching launches becomes a family ritual. Shared wonder.' },
                            { weight: 35, effects: { education: +1, connections: +1 }, karma: 1, description: 'You explain the science to younger siblings. Teaching begins early.' },
                            { weight: 20, effects: { health: +1 }, karma: 0, description: 'Hope and wonder fill your youth. The future feels bright.' }
                        ]
                    },
                    {
                        text: 'Question what it all means',
                        preview: { description: 'Wonder or weapons? Progress or pride?' },
                        outcomes: [
                            { weight: 40, effects: { education: +1 }, karma: 0, description: 'The rockets that reach the moon could destroy cities. You learn to hold two truths.' },
                            { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Your doubts make others uncomfortable. Not everyone wants to question progress.' },
                            { weight: 25, effects: { education: +1 }, karma: 0, description: 'Critical thinking develops young. You see more than most.' }
                        ]
                    }
                ]
            }
        },
        prompt: 'The world changes around you. Humanity reaches for something new.',
        options: [
            {
                text: 'Let it inspire you',
                outcomes: [
                    { weight: 50, effects: { education: +1 }, karma: 0, description: 'Inspiration strikes.' },
                    { weight: 50, effects: { health: +1 }, karma: 0, description: 'Hope fills you.' }
                ]
            },
            {
                text: 'Stay grounded',
                outcomes: [
                    { weight: 50, effects: {}, karma: 0, description: 'Life continues.' },
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Your attention stays on those around you.' }
                ]
            }
        ]
    },
{
        id: 'examination_pressure',
        stage: 'childhood',
        type: 'choice',
        region: 'east_asia',
        themes: ['education_pressure', 'filial_piety'],
        prompt: 'The examination system determines your future. Intense study consumes your youth. How do you face this pressure?',
        options: [
            {
                text: 'Dedicate yourself completely',
                preview: { description: 'Sacrifice everything for the exam' },
                outcomes: [
                    { weight: 40, effects: { education: +2, health: -1 }, karma: 0, description: 'Success through sacrifice. Your rank opens doors.' },
                    { weight: 35, effects: { education: +2, connections: -1 }, karma: 0, description: 'Academic success, social isolation. Friends become memories.' },
                    { weight: 25, effects: { education: +1, health: -2 }, karma: 0, description: 'You break yourself trying. It was never going to be enough.' }
                ]
            },
            {
                text: 'Find balance where you can',
                preview: { description: 'Study hard but protect something of yourself' },
                outcomes: [
                    { weight: 40, effects: { education: +1 }, karma: 0, description: 'Adequate results. Exhaustion. But you survived intact.' },
                    { weight: 35, effects: { education: +1, health: +1 }, karma: 0, description: 'Not the top, but healthy. Some things matter more.' },
                    { weight: 25, effects: { education: +1, connections: +1 }, karma: 0, description: 'Friends who understand. You kept both.' }
                ]
            },
            {
                text: 'Resist the system',
                preview: { description: 'Refuse to let the exam define you' },
                outcomes: [
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Disappointment from family. You are the one who did not try hard enough.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Your mental health survives. Other paths will have to open.' },
                    { weight: 30, effects: { education: +1, connections: -1 }, karma: 1, description: 'You find your own way to learn. Not the expected path.', tagAxis: { tradition_vs_change: 1 } }
                ]
            }
        ]
    },
{
        id: 'extended_family_network',
        stage: 'childhood',
        type: 'choice',
        region: 'latin_america',
        themes: ['family_centrality'],
        prompt: 'Extended family surrounds you. Aunts, uncles, cousins, compadres - all play a role. How do you grow within this web?',
        options: [
            {
                text: 'Embrace the network fully',
                preview: { description: 'Family is everything' },
                outcomes: [
                    { weight: 45, effects: { connections: +2 }, karma: 0, description: 'Never alone. Always supported. Always watched.' },
                    { weight: 35, effects: { connections: +1, wealth: +1 }, karma: 0, description: 'Family provides. Birthdays, quinceañeras, Sunday dinners. You belong.' },
                    { weight: 20, effects: { connections: +1, health: -1 }, karma: 0, description: 'Drama and support in equal measure. Family is complicated.' }
                ]
            },
            {
                text: 'Carve out private space',
                preview: { description: 'Need some room to breathe' },
                outcomes: [
                    { weight: 40, effects: { connections: +1, health: +1 }, karma: 0, description: 'You find balance. Loved but not smothered.' },
                    { weight: 35, effects: { health: +1 }, karma: 0, description: 'Independence develops. Some elders disapprove.' },
                    { weight: 25, effects: { connections: -1 }, karma: 0, description: 'Whispers about you being "different". The network notices.' }
                ]
            },
            {
                text: 'Become the helper',
                preview: { description: 'Take care of younger cousins, run errands' },
                outcomes: [
                    { weight: 45, effects: { connections: +1 }, karma: 1, description: 'You earn your place through service. Everyone relies on you.', tagAxis: { self_vs_others: 1 } },
                    { weight: 35, effects: { connections: +1, education: -1 }, karma: 0, description: 'Family duties leave little time for studies.' },
                    { weight: 20, effects: { health: -1, connections: +1 }, karma: 0, description: 'The weight of expectations settles young on your shoulders.' }
                ]
            }
        ]
    },
{
        id: 'village_elder_wisdom',
        stage: 'childhood',
        type: 'choice',
        region: 'sub_saharan_africa',
        themes: ['community', 'ubuntu'],
        prompt: 'The village elders share wisdom. Stories carry lessons across generations. The firelight flickers. How do you receive what they offer?',
        options: [
            {
                text: 'Listen with full attention',
                preview: { description: 'Absorb the old ways completely' },
                outcomes: [
                    { weight: 45, effects: { education: +1 }, karma: 1, description: 'Ancestral knowledge passes to you. You carry what they know.' },
                    { weight: 35, effects: { connections: +1, education: +1 }, karma: 1, description: 'The elders notice. You are being prepared for something.' },
                    { weight: 20, effects: { connections: +1 }, karma: 0, description: 'Community embraces you as one who remembers.' }
                ]
            },
            {
                text: 'Ask questions, even uncomfortable ones',
                preview: { description: 'Challenge as a form of respect' },
                outcomes: [
                    { weight: 40, effects: { education: +1 }, karma: 0, description: 'Questions sharpen understanding. Some elders appreciate this.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Your questioning is seen as disrespect. Not everyone understands.' },
                    { weight: 25, effects: { education: +1, connections: +1 }, karma: 1, description: 'An elder recognizes a future leader in your curiosity.' }
                ]
            },
            {
                text: 'Drift away in your own thoughts',
                preview: { description: 'The modern world calls louder' },
                outcomes: [
                    { weight: 40, effects: { connections: -1 }, karma: 0, description: 'The elders notice your absence even when present.' },
                    { weight: 35, effects: {}, karma: 0, description: 'Lessons stored for later, perhaps. Unrealized wisdom.' },
                    { weight: 25, effects: { health: -1 }, karma: 0, description: 'You feel caught between worlds. Neither fully claims you.' }
                ]
            }
        ]
    }
];
