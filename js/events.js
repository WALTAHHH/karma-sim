// Event definitions and outcome resolution

import { getAgencyChance, getVarianceMultiplier } from './karma.js';
import { clampStat } from './life.js';
import {
    getArchetype,
    getNextStage,
    getPreviewConfig,
    TRADEOFF_ARCHETYPES
} from './tradeoffs.js';
import {
    getRegionalCluster,
    getRegionalThemes
} from './regions.js';
import {
    applyTagModifiers,
    getTagVarianceModifier
} from './tags.js';

// Event structure (extended for trade-offs, era variants, and regional events):
// {
//   id: string,
//   stage: 'childhood' | 'young_adult' | 'middle' | 'late',
//   type: 'choice' | 'forced',
//   requirements: { stat: '>N' | '<N' | '=N' } (optional),
//   prompt: string,
//
//   // ERA VARIANTS - event changes based on time period
//   eraVariants: {                        // (optional)
//     pre_industrial: { prompt, options },
//     industrial_revolution: { prompt, options },
//     early_modern: { prompt, options },
//     cold_war: { prompt, options },
//     contemporary: { prompt, options }
//   },
//
//   // REGIONAL - event only appears in specific regions
//   region: 'east_asia' | 'south_asia' | ... (optional),
//   themes: ['theme1', 'theme2'],         // Match regional themes (optional)
//
//   tradeoff: {                           // (optional)
//     archetype: 'money_health' | 'passion_safety' | 'now_later' |
//                'stability_opportunity' | 'family_mobility' | 'self_others',
//     intensity: 'mild' | 'moderate' | 'severe',
//     clarity: 'transparent' | 'partial' | 'hidden'
//   },
//   options: [{
//     text: string,
//     preview: {                          // (optional)
//       gains: ['stat'],
//       risks: ['stat'],
//       description: string
//     },
//     outcomes: [{
//       weight: number,
//       effects: { stat: delta },
//       karma: number,
//       description: string,
//       hiddenCost: {                     // (optional)
//         trigger: 'immediate' | 'next_stage' | 'delayed',
//         delay: number,                  // for 'delayed' trigger
//         effects: { stat: delta },
//         description: string
//       }
//     }]
//   }]
// }

export const events = [
    // === CHILDHOOD (0-18) ===
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

    // === YOUNG ADULT (18-35) ===
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

    // === MIDDLE AGE (35-55) ===
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

    // === MIGRATION EVENTS ===
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

    // Push Events - Forces driving people away
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

    // Pull Events - Opportunities drawing people forward
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
                    { weight: 40, effects: { education: +1, connections: -1 }, karma: 0, description: 'The world teaches lessons no school can.', special: 'migrate' },
                    { weight: 35, effects: { education: +1, wealth: -1 }, karma: 0, description: 'Rich in experience, poor in pocket.', special: 'migrate' },
                    { weight: 25, effects: { education: +2, connections: +1 }, karma: 1, description: 'You find yourself and friends along the way.', special: 'migrate' }
                ]
            },
            {
                text: 'Stay grounded',
                preview: { gains: ['connections'], risks: [], description: 'Bloom where planted' },
                outcomes: [
                    { weight: 50, effects: { connections: +1 }, karma: 0, description: 'Contentment in the familiar.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'Stability has its rewards.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'But you always wonder what if...' }
                ]
            }
        ]
    },

    // Post-Migration Adaptation Events (require special: 'post_migration' flag set after migrating)
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

    // Second-Generation Events (for children of immigrants)
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

    // === LINEAGE EVENTS ===
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

    // === LATE LIFE (55+) ===
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

    // === MONEY VS HEALTH ===
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

    // === PASSION VS SAFETY ===
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

    // === NOW VS LATER (Short-term vs Long-term) ===
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

    // === STABILITY VS OPPORTUNITY ===
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

    // === FAMILY VS MOBILITY ===
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

    // === SELF VS OTHERS ===
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

    // === INDUSTRIAL REVOLUTION (1850-1920) ===
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

    // === EARLY MODERN (1920-1950) ===
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

    // === COLD WAR (1950-1990) ===
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
                            { weight: 30, effects: { connections: +1, wealth: -1 }, karma: 1, description: 'Freedom and community, if not stability.' },
                            { weight: 30, effects: { health: -1, connections: +1 }, karma: 0, description: 'Experimentation has costs.' },
                            { weight: 25, effects: { education: +1 }, karma: 1, description: 'Consciousness expands.' },
                            { weight: 15, effects: { connections: -1, health: -1 }, karma: -1, description: 'Lost years in a haze.' }
                        ]
                    },
                    {
                        text: 'Stay conventional',
                        outcomes: [
                            { weight: 45, effects: { wealth: +1 }, karma: 0, description: 'The straight path has rewards.' },
                            { weight: 35, effects: {}, karma: 0, description: 'Rebellion passes you by.' },
                            { weight: 20, effects: { connections: -1 }, karma: 0, description: 'Square in a round world.' }
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

    // === CONTEMPORARY (1990+) ===
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

    // === EAST ASIA ===
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

    // === SOUTH ASIA ===
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

    // === LATIN AMERICA ===
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

    // === WESTERN EUROPE ===
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

    // === EASTERN EUROPE ===
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

    // === MIDDLE EAST ===
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
                    { weight: 45, effects: { connections: +1 }, karma: 0, description: 'Family approves.' },
                    { weight: 35, effects: {}, karma: 0, description: 'The familiar path.' },
                    { weight: 20, effects: { health: -1 }, karma: 0, description: 'Constraints chafe.' }
                ]
            },
            {
                text: 'Pursue modern path',
                outcomes: [
                    { weight: 35, effects: { education: +1 }, karma: 0, description: 'New opportunities open.' },
                    { weight: 35, effects: { connections: -1 }, karma: 0, description: 'Elders disapprove.' },
                    { weight: 30, effects: { wealth: +1 }, karma: 0, description: 'The new economy rewards you.' }
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

    // === SUB-SAHARAN AFRICA ===
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

    // === NORTH AMERICA ===
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
    },
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

// Death events - triggered at end of life
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

// ============================================
// CONSEQUENCE CHAINS - Linked Narrative Arcs
// ============================================

// Chain definitions - trigger event + outcome -> sequence of follow-up events
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

// Chain follow-up events
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

// Check if an outcome triggers a consequence chain
export function checkForChainTrigger(eventId, outcome) {
    for (const chain of Object.values(consequenceChains)) {
        if (chain.triggerEventId === eventId && chain.triggerOutcomeMatch(outcome)) {
            return chain;
        }
    }
    return null;
}

// Get chain event by ID
export function getChainEvent(eventId) {
    return chainEvents.find(e => e.id === eventId) || null;
}

// Process active chains - returns event to trigger if any chain is ready
export function processChains(activeChains, eventCount) {
    for (const activeChain of activeChains) {
        // Find next event in chain sequence
        for (const chainStep of activeChain.remainingSteps) {
            if (chainStep.triggerAfterEvents <= eventCount - activeChain.startEventCount) {
                // This step is ready
                const event = getChainEvent(chainStep.eventId);
                if (event) {
                    // Remove this step from remaining
                    activeChain.remainingSteps = activeChain.remainingSteps.filter(
                        s => s.eventId !== chainStep.eventId
                    );
                    return { event, chainId: activeChain.chainId };
                }
            }
        }
    }
    return null;
}

// Initialize a new active chain
export function initializeActiveChain(chain, currentEventCount) {
    return {
        chainId: chain.id,
        chainName: chain.name,
        startEventCount: currentEventCount,
        remainingSteps: chain.chain.map(step => ({
            eventId: step.eventId,
            triggerAfterEvents: step.delay
        }))
    };
}

// Get events for a specific life stage
export function getEventsForStage(stage) {
    return events.filter(e => e.stage === stage);
}

// Check if character meets event requirements
export function meetsRequirements(event, life) {
    if (!event.requirements) return true;

    for (const [stat, condition] of Object.entries(event.requirements)) {
        const value = life[stat];
        if (condition.startsWith('>')) {
            if (value <= parseInt(condition.slice(1))) return false;
        } else if (condition.startsWith('<')) {
            if (value >= parseInt(condition.slice(1))) return false;
        } else if (condition.startsWith('=')) {
            if (value !== parseInt(condition.slice(1))) return false;
        }
    }
    return true;
}

// Check if an event is available for this region
function meetsRegionalRequirements(event, life) {
    // If event has no regional requirements, it's universal
    if (!event.region && !event.themes) return true;

    const countryId = life.country?.id || life.country;
    const playerRegion = getRegionalCluster(countryId);
    const playerThemes = getRegionalThemes(countryId);

    // Check if event is for a specific region
    if (event.region) {
        if (event.region !== playerRegion.id) return false;
    }

    // Check if event themes match player's regional themes
    if (event.themes && event.themes.length > 0) {
        const hasMatchingTheme = event.themes.some(t => playerThemes.includes(t));
        if (!hasMatchingTheme) return false;
    }

    return true;
}

// Apply era variant to event if available
function applyEraVariant(event, life) {
    if (!event.eraVariants) return event;

    const eraId = life.era?.id || 'contemporary';

    // Check if there's a variant for this era
    const variant = event.eraVariants[eraId];
    if (!variant) return event;

    // Create a new event with the era-specific content merged in
    return {
        ...event,
        prompt: variant.prompt || event.prompt,
        options: variant.options || event.options
    };
}

// Select an event for the current state
export function selectEvent(stage, life, usedEventIds) {
    const stageEvents = getEventsForStage(stage);

    // Filter by requirements and regional availability
    const available = stageEvents.filter(e =>
        !usedEventIds.has(e.id) &&
        meetsRequirements(e, life) &&
        meetsRegionalRequirements(e, life)
    );

    if (available.length === 0) {
        // Fallback: try events without regional requirements
        const universalFallback = stageEvents.filter(e =>
            !usedEventIds.has(e.id) &&
            meetsRequirements(e, life) &&
            !e.region && !e.themes
        );
        if (universalFallback.length > 0) {
            const selected = universalFallback[Math.floor(Math.random() * universalFallback.length)];
            return applyEraVariant(selected, life);
        }
        // Last resort: any unused event from stage
        const fallback = stageEvents.filter(e => !usedEventIds.has(e.id));
        if (fallback.length === 0) return null;
        const selected = fallback[Math.floor(Math.random() * fallback.length)];
        return applyEraVariant(selected, life);
    }

    // Decide between choice and forced based on karma
    const agencyChance = getAgencyChance();
    const preferChoice = Math.random() < agencyChance;

    const choiceEvents = available.filter(e => e.type === 'choice');
    const forcedEvents = available.filter(e => e.type === 'forced');

    let selected;
    if (preferChoice && choiceEvents.length > 0) {
        selected = choiceEvents[Math.floor(Math.random() * choiceEvents.length)];
    } else if (!preferChoice && forcedEvents.length > 0) {
        selected = forcedEvents[Math.floor(Math.random() * forcedEvents.length)];
    } else {
        selected = available[Math.floor(Math.random() * available.length)];
    }

    // Apply era variant if available
    return applyEraVariant(selected, life);
}

// Apply stat modifiers to outcome weights
// High stats favor positive outcomes, low stats favor negative outcomes
// This creates punishing consequences for low stats and rewards for high stats
function applyStatModifiers(life, outcomes) {
    if (!life) return outcomes;

    return outcomes.map(outcome => {
        const effects = outcome.effects || {};
        let weightModifier = 1.0;

        for (const [stat, delta] of Object.entries(effects)) {
            const currentStat = life[stat];
            if (currentStat === undefined) continue;

            // Punishing scale: stats dramatically affect outcome odds
            if (currentStat === 5) {
                // Max stat: +35% to positive outcomes, -35% to negative
                weightModifier *= delta > 0 ? 1.35 : 0.65;
            } else if (currentStat === 4) {
                // High stat: +20% to positive outcomes, -20% to negative
                weightModifier *= delta > 0 ? 1.20 : 0.80;
            } else if (currentStat === 2) {
                // Low stat: +20% to negative outcomes, -20% to positive
                weightModifier *= delta < 0 ? 1.20 : 0.80;
            } else if (currentStat === 1) {
                // Min stat: +40% to negative outcomes, -40% to positive
                weightModifier *= delta < 0 ? 1.40 : 0.60;
            }
            // Stat = 3 is neutral, no modifier
        }

        return {
            ...outcome,
            weight: Math.max(1, Math.round(outcome.weight * weightModifier))
        };
    });
}

// Resolve outcome based on weights, karma, player stats, and active tags
// Returns { outcome, hiddenCost? } where hiddenCost is prepared for queuing if present
export function resolveOutcome(option, currentStage = null, life = null) {
    // Get base variance from karma
    let varianceMult = getVarianceMultiplier();

    // Apply tag variance modifier (risk_taker increases, cautious decreases)
    const tagVarianceMod = getTagVarianceModifier(life);
    varianceMult *= tagVarianceMod;

    // Apply stat modifiers first - this creates the punishing/rewarding dynamic
    const statModifiedOutcomes = applyStatModifiers(life, option.outcomes);

    // Apply tag modifiers - character traits bias outcomes
    const tagModifiedOutcomes = applyTagModifiers(life, statModifiedOutcomes);

    // Adjust weights based on variance multiplier
    // Higher variance = more extreme outcomes
    // Lower variance = more median outcomes
    const adjustedWeights = tagModifiedOutcomes.map((o, i) => {
        const isExtreme = i === 0 || i === tagModifiedOutcomes.length - 1;
        if (isExtreme) {
            return o.weight * varianceMult;
        }
        return o.weight * (2 - varianceMult);
    });

    const total = adjustedWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    let selectedOutcome = tagModifiedOutcomes[tagModifiedOutcomes.length - 1];
    for (let i = 0; i < tagModifiedOutcomes.length; i++) {
        random -= adjustedWeights[i];
        if (random <= 0) {
            selectedOutcome = tagModifiedOutcomes[i];
            break;
        }
    }

    // Prepare hidden cost if present
    let preparedHiddenCost = null;
    if (selectedOutcome.hiddenCost) {
        preparedHiddenCost = prepareHiddenCost(selectedOutcome.hiddenCost, currentStage);
    }

    return {
        outcome: selectedOutcome,
        hiddenCost: preparedHiddenCost
    };
}

// Prepare a hidden cost for queuing based on its trigger type
export function prepareHiddenCost(hiddenCost, currentStage) {
    const prepared = {
        trigger: hiddenCost.trigger,
        effects: { ...hiddenCost.effects },
        description: hiddenCost.description,
        revealed: false
    };

    switch (hiddenCost.trigger) {
        case 'immediate':
            // Will be revealed right after outcome
            break;
        case 'next_stage':
            // Set target stage
            prepared.targetStage = getNextStage(currentStage);
            break;
        case 'delayed':
            // Set countdown
            prepared.eventsRemaining = hiddenCost.delay || 3;
            break;
    }

    return prepared;
}

// Legacy wrapper for backward compatibility - returns just the outcome object
export function resolveOutcomeLegacy(option) {
    const result = resolveOutcome(option);
    return result.outcome;
}

// Apply outcome effects to life
export function applyOutcome(life, outcome) {
    const newLife = { ...life };

    if (outcome.effects) {
        for (const [stat, delta] of Object.entries(outcome.effects)) {
            if (stat in newLife && typeof newLife[stat] === 'number') {
                newLife[stat] = clampStat(newLife[stat] + delta);
            }
        }
    }

    return newLife;
}

// === CRISIS EVENTS ===
// These trigger when stats are dangerously low, creating punishing spiral dynamics

const crisisEvents = [
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

// Check if a crisis event should trigger based on stat levels
// Returns a crisis event or null
export function selectCrisisEvent(life, usedEventIds) {
    const crisisCandidates = [];

    // Check health crisis (40% at 1, 20% at 2)
    if (life.health === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'health'));
    } else if (life.health === 2 && Math.random() < 0.20) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'health'));
    }

    // Check wealth crisis (40% at 1)
    if (life.wealth === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'wealth'));
    }

    // Check connections crisis (40% at 1)
    if (life.connections === 1 && Math.random() < 0.40) {
        crisisCandidates.push(...crisisEvents.filter(e => e.crisisStat === 'connections'));
    }

    // Filter out already used events
    const available = crisisCandidates.filter(e => !usedEventIds.has(e.id));

    if (available.length === 0) return null;

    // Return a random crisis event from available candidates
    return available[Math.floor(Math.random() * available.length)];
}

// Get appropriate death event
export function selectDeathEvent(life) {
    const matching = deathEvents.filter(e => !e.requirements || meetsRequirements(e, life));
    return matching[Math.floor(Math.random() * matching.length)];
}

// Apply hidden cost effects to life (same as outcome effects)
export function applyHiddenCost(life, hiddenCost) {
    const newLife = { ...life };

    if (hiddenCost.effects) {
        for (const [stat, delta] of Object.entries(hiddenCost.effects)) {
            if (stat in newLife && typeof newLife[stat] === 'number') {
                newLife[stat] = clampStat(newLife[stat] + delta);
            }
        }
    }

    return newLife;
}

// Process pending hidden costs and return those that should be revealed
export function processPendingHiddenCosts(pendingCosts, currentStage) {
    const toReveal = [];
    const remaining = [];

    for (const cost of pendingCosts) {
        // Check stage-based triggers
        if (cost.trigger === 'next_stage' && cost.targetStage === currentStage) {
            toReveal.push(cost);
            continue;
        }

        // Check and decrement delayed triggers
        if (cost.trigger === 'delayed') {
            cost.eventsRemaining--;
            if (cost.eventsRemaining <= 0) {
                toReveal.push(cost);
                continue;
            }
        }

        remaining.push(cost);
    }

    return { toReveal, remaining };
}

// Get trade-off info for an event (for UI display)
export function getEventTradeoffInfo(event) {
    if (!event.tradeoff) return null;

    const archetype = getArchetype(event.tradeoff.archetype);
    const clarityConfig = getPreviewConfig(event.tradeoff.clarity);

    return {
        archetype: archetype,
        intensity: event.tradeoff.intensity,
        clarity: event.tradeoff.clarity,
        clarityConfig: clarityConfig
    };
}

// Check if an event has trade-off metadata
export function hasTradeoff(event) {
    return event && event.tradeoff && event.tradeoff.archetype;
}

// Get events filtered by trade-off archetype (useful for testing)
export function getEventsByArchetype(archetype) {
    return events.filter(e => e.tradeoff && e.tradeoff.archetype === archetype);
}
