# Event Drafts - Variety Pass

Generated from audit of event distribution gaps.

## Identified Gaps

1. **Late stage severely thin** (only 13 events vs 49 young_adult, 41 middle)
2. **tradition_vs_change axis underused** (only 11 uses vs 54 self_vs_others)
3. **No era variants in late stage** 
4. **wanderer/rooted tags have no direct grantsTag paths**

---

## Draft Events

### 1. `generational_values` (Late Stage)
*Fills gap: tradition_vs_change axis, late stage content*

```javascript
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
}
```

### 2. `late_wanderlust` (Late Stage)
*Fills gap: roots_vs_wings for late, wanderer/rooted trait paths*

```javascript
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
                { weight: 35, effects: { health: -1, education: +1 }, karma: 1, description: 'Every place teaches something. Even now.', tagAxis: { roots_vs_wings: -1 }, grantsTag: 'wanderer' },
                { weight: 35, effects: { connections: +1 }, karma: 0, description: 'You meet others on the road. Fellow seekers.' },
                { weight: 30, effects: { wealth: -1 }, karma: 0, description: 'Money spent on memories. Worth it.', tagAxis: { roots_vs_wings: -1 } }
            ]
        },
        {
            text: 'Deepen where you are planted',
            preview: { description: 'Home is home for a reason' },
            outcomes: [
                { weight: 40, effects: { connections: +1 }, karma: 1, description: 'Community knows your name. That matters.', tagAxis: { roots_vs_wings: 1 }, grantsTag: 'rooted' },
                { weight: 35, effects: { health: +1 }, karma: 0, description: 'Familiar ground eases the burden of age.', tagAxis: { roots_vs_wings: 1 } },
                { weight: 25, effects: {}, karma: 0, description: 'You watch the seasons turn. One more time.', tagAxis: { roots_vs_wings: 1 } }
            ]
        }
    ]
}
```

### 3. `plague_survival_late` (Late Stage, Era Variant)
*Fills gap: era variants in late stage*

```javascript
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
}
```

### 4. `tradition_keeper` (Middle Stage)
*Fills gap: tradition_vs_change more options*

```javascript
{
    id: 'tradition_keeper',
    stage: 'middle',
    type: 'choice',
    prompt: 'An old tradition is dying. You may be one of the last who remembers it properly.',
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
}
```

### 5. `digital_divide` (Late Stage, Era Variant)
*Fills gap: late stage content, contemporary era, tradition_vs_change*

```javascript
{
    id: 'digital_divide',
    stage: 'late',
    type: 'choice',
    eraVariants: {
        digital: {
            prompt: 'The world has moved online. Banking, communication, even medical appointments. You feel left behind.',
            options: [
                {
                    text: 'Learn the new ways',
                    preview: { description: 'Adapt or be forgotten' },
                    outcomes: [
                        { weight: 35, effects: { education: +1, health: -1 }, karma: 1, description: 'Frustrating hours at the screen. But you learn.', tagAxis: { tradition_vs_change: -1 }, grantsTag: 'progressive' },
                        { weight: 35, effects: { connections: +1 }, karma: 1, description: 'Video calls bring distant faces close. Worth it.' },
                        { weight: 30, effects: { education: +1 }, karma: 0, description: 'Never fluent, but functional. That\'s enough.' }
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
}
```

---

## Implementation Notes

1. All drafted events follow existing choice archetypes from `forced-events-redesign.md`
2. Each addresses a specific gap identified in the audit
3. Tag axis assignments intentionally boost underrepresented axes
4. Era variants added to extend historical coverage into late stage
5. `grantsTag` entries added for wanderer/rooted which had none before

## Recommended Next Steps

1. Add these 5 events to appropriate files
2. Consider 3-5 more late stage events (still thin)
3. Add more tradition_vs_change opportunities in childhood
4. Review era variant coverage - cold_war and digital eras need late-stage events
