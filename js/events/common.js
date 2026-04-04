// Shared imports and utilities for event modules

import { getAgencyChance, getVarianceMultiplier } from '../karma.js';
import { clampStat } from '../life.js';
import {
    getArchetype,
    getNextStage,
    getPreviewConfig,
    TRADEOFF_ARCHETYPES
} from '../tradeoffs.js';
import {
    getRegionalCluster,
    getRegionalThemes
} from '../regions.js';
import {
    applyTagModifiers,
    getTagVarianceModifier
} from '../tags.js';

// Re-export for use by other event modules
export {
    getAgencyChance,
    getVarianceMultiplier,
    clampStat,
    getArchetype,
    getNextStage,
    getPreviewConfig,
    TRADEOFF_ARCHETYPES,
    getRegionalCluster,
    getRegionalThemes,
    applyTagModifiers,
    getTagVarianceModifier
};

// Event structure documentation (for reference):
// {
//   id: string,
//   stage: 'childhood' | 'young_adult' | 'middle' | 'late',
//   type: 'choice' | 'forced',
//   requirements: { stat: '>N' | '<N' | '=N' } (optional),
//   prompt: string,
//   eraVariants: { ... } (optional),
//   region: string (optional),
//   themes: string[] (optional),
//   tradeoff: { archetype, intensity, clarity } (optional),
//   options: [{
//     text: string,
//     preview: { gains, risks, description } (optional),
//     outcomes: [{
//       weight: number,
//       effects: { stat: delta },
//       karma: number,
//       description: string,
//       hiddenCost: { trigger, delay, effects, description } (optional)
//     }]
//   }]
// }
