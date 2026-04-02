# Forced Events Redesign

## Design Philosophy

**Core principle**: The point isn't to let players "win" these events. It's to let them decide *how they face* them.

### Key Tenets
1. **Partial agency** — Choices matter, but within constraints  
2. **No false hope** — Don't pretend you can avoid war or plague
3. **Character expression** — Choices reveal WHO you are, not just what happens
4. **Double-edged outcomes** — Every choice has tradeoffs
5. **Era-appropriate** — No "self-care" in 1850

---

## Implementation Summary

**All 22 forced events in the main events array have been transformed to choice events.**

Chain events (10) and crisis events (6) remain forced by design - these are triggered by specific game state conditions and represent consequences of prior choices.

---

## Design Patterns Used (Choice Archetypes)

### Fight/Flight/Freeze
Used for: `war_refugee`, `plague_outbreak`, `famine_year`, `environmental_displacement`
- Flee immediately vs. gather essentials vs. help others
- Physical survival with moral dimensions

### Self/Others  
Used for: `discrimination_faced`, `integration_milestone`, `culture_shock`, `famine_year`
- Prove yourself alone vs. find community vs. push back
- Trade-off between personal advancement and collective support

### Resistance/Acceptance/Adaptation
Used for: `examination_pressure`, `regime_change`, `algorithmic_fate`
- Embrace the system vs. resist vs. find balance
- How you relate to forces beyond your control

### Engage/Withdraw/Transform
Used for: `child_arrives`, `childless_reflection`, `child_milestone`, `returning_veteran`
- Throw yourself in vs. step back vs. reflect
- How you process major life transitions

### Pride/Pragmatism/Community
Used for: `healthcare_crisis`, `currency_crisis`, `tenement_conditions`
- Fight the system vs. cut corners vs. lean on others
- Survival strategies under structural pressure

---

## Events Transformed

### Priority 1: Universal/Contemporary ✅
- `reputation_test` → Address head-on / Let it blow over / Work behind the scenes
- `child_arrives` → Embrace fully / Balance everything / Feel overwhelmed
- `childless_reflection` → Find meaning elsewhere / Sit with regret / Nurture others
- `child_milestone` → Celebrate openly / Step back gracefully / Reflect on journey
- `algorithmic_fate` → Embrace feed / Curate carefully / Disconnect deliberately

### Priority 2: Migration System ✅
- `war_refugee` → Flee immediately / Gather essentials / Help others escape
- `environmental_displacement` → Leave for better land / Organize community / Stay until end
- `culture_shock` → Throw yourself into learning / Seek others like you / Withdraw and observe
- `discrimination_faced` → Prove them wrong / Push back directly / Find your people
- `integration_milestone` → Celebrate / Reflect on loss / Reach back to help
- `between_two_worlds` → Code-switch / Lean into school / Hold tight to home

### Priority 3: Historical Eras ✅
- `plague_outbreak` → Flee / Barricade / Help tend sick (era-specific variants)
- `famine_year` → Share what you have / Hoard / Forage
- `tenement_conditions` → Work to help family / Sneak off to school / Run with street children
- `dust_bowl_flight` → Leave early / Stay until end / Organize caravan together
- `returning_veteran` → Use GI Bill / Try to forget / Seek fellow veterans
- `space_race_inspiration` → Devour everything / Share wonder / Question meaning

### Priority 4: Regional Events ✅
- `examination_pressure` (East Asia) → Dedicate completely / Find balance / Resist
- `extended_family_network` (Latin America) → Embrace fully / Carve private space / Become helper
- `currency_crisis` (Latin America) → Convert to dollars / Pool with family / Hustle informally
- `regime_change` (Eastern Europe) → Seize opportunities / Protect what you have / Embrace freedoms
- `village_elder_wisdom` (Africa) → Listen fully / Ask questions / Drift away
- `healthcare_crisis` (North America) → Fight insurance / Go public / Delay treatment

---

## Difficult Cases

### `child_arrives`
**Challenge**: The child IS arriving - this isn't a choice event about whether to have children (that's handled by `family_planning`). 
**Solution**: Made it about *posture* toward parenthood: embrace fully, try to balance, or be honest about feeling overwhelmed. All options acknowledge the child exists.

### `war_refugee` / `environmental_displacement`
**Challenge**: You can't "choose" not to flee war or environmental collapse.
**Solution**: Kept the catastrophe unavoidable but gave choice about *timing* and *priorities* - flee immediately vs gather essentials vs help others. The war/disaster still happens; you just choose how you face it.

### `space_race_inspiration`
**Challenge**: A positive event - hard to add meaningful choice without making it negative.
**Solution**: Choices reflect different ways of engaging with wonder: obsessive focus, shared experience, or critical questioning. All valid, all have trade-offs.

### `examination_pressure` (East Asia)
**Challenge**: Needed to be culturally authentic - can't pretend exam culture doesn't exist.
**Solution**: Choices include "resist the system" but with realistic consequences (family disappointment, closed doors). Resisting isn't presented as heroic - just one option with its own costs.

---

## Remaining Forced Events

These remain forced by design:

### Chain Events (10)
- `rock_bottom_or_recovery` - Narrative culmination
- `mentor_advice` - Wisdom arrives unbidden
- `mentor_legacy` - Death triggers inheritance
- `chronic_condition_begins` - Hidden cost revealed
- `long_term_health_outcome` - Consequence materializes
- `career_recognition` - External recognition
- `family_silence` - Distance manifests
- `local_recognition` - Community responds
- `culture_shock_event` - Initial disorientation
- `finding_community_abroad` - Natural progression

### Crisis Events (6)
These trigger at low stats (health/wealth/connections = 1) and are punishing by design:
- `health_crisis_illness`, `health_crisis_collapse`
- `poverty_crisis_hunger`, `poverty_crisis_debt`
- `isolation_crisis_alone`, `isolation_crisis_vulnerable`

The crisis events that already HAD choices (`health_crisis_treatment`, `poverty_crisis_desperate`, `isolation_crisis_reconnect`) retained them.

---

## Testing Notes

- Verified all 22 main forced events transformed to choice
- JS module loads correctly
- Events export count: 127 events
- Chain events: 10 forced remaining (intentional)
- Crisis events: 6 forced, 3 choice (as designed)

---

## Future Considerations

1. **Chain events**: Some narrative chain events (`mentor_advice`, `mentor_legacy`) could potentially become choices - but might diminish the feeling of life happening to you

2. **Death events**: Currently all forced. Could add deathbed choices, but might feel gamified.

3. **New events**: Future events should follow these patterns - even "forced" circumstances offer choice in response.
