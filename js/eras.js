// Era definitions and modifiers
// Eras define time periods that can be unlocked for birth year selection

export const ERA_UNLOCK_COST = 10;
export const DEFAULT_ERA_ID = 'contemporary';

// Era definitions with modifiers
// Earlier eras generally have lower health/education baselines and higher volatility
export const eras = [
    {
        id: 'pre_industrial',
        name: 'Pre-Industrial',
        description: 'Before the age of machines',
        startYear: 1800,
        endYear: 1849,
        modifiers: {
            wealth: -0.05,
            education: -0.15,
            health: -0.20,
            connections: 0.05,
            volatility: 0.15
        },
        // Era context for birth narratives
        worldMood: 'an age of empires and agricultural life',
        technologies: ['horse-drawn carriages', 'sailing ships', 'oil lamps', 'handloom weaving'],
        socialMovements: ['abolitionism', 'early workers\' movements', 'Romanticism'],
        historicalContext: [
            'Napoleonic wars reshape Europe',
            'the Americas fight for independence',
            'empires expand across the globe',
            'revolution stirs in the hearts of the oppressed'
        ]
    },
    {
        id: 'industrial_revolution',
        name: 'Industrial Revolution',
        description: 'The age of steam and factories',
        startYear: 1850,
        endYear: 1899,
        modifiers: {
            wealth: 0,
            education: -0.10,
            health: -0.15,
            connections: 0,
            volatility: 0.12
        },
        worldMood: 'an era of steam, iron, and rapid change',
        technologies: ['steam engines', 'railways', 'telegraphs', 'gas lighting', 'photography'],
        socialMovements: ['labor unions', 'women\'s suffrage beginnings', 'nationalism'],
        historicalContext: [
            'factories transform the landscape',
            'railways connect distant cities',
            'empires carve up continents',
            'the old order gives way to industry'
        ]
    },
    {
        id: 'early_modern',
        name: 'Early Modern',
        description: 'World wars and great change',
        startYear: 1900,
        endYear: 1945,
        modifiers: {
            wealth: -0.03,
            education: -0.05,
            health: -0.10,
            connections: 0,
            volatility: 0.15
        },
        worldMood: 'a turbulent age of world wars and revolution',
        technologies: ['automobiles', 'airplanes', 'radio', 'electricity', 'telephones'],
        socialMovements: ['women\'s suffrage', 'labor rights', 'communism', 'fascism'],
        historicalContext: [
            'the Great War shatters a generation',
            'empires collapse and nations are born',
            'the Great Depression grips the world',
            'another world war engulfs humanity'
        ]
    },
    {
        id: 'cold_war',
        name: 'Cold War',
        description: 'Superpowers and nuclear tension',
        startYear: 1946,
        endYear: 1990,
        modifiers: {
            wealth: 0,
            education: 0,
            health: -0.03,
            connections: -0.02,
            volatility: 0.08
        },
        worldMood: 'an age of superpowers and atomic anxiety',
        technologies: ['television', 'jet aircraft', 'computers', 'space travel', 'nuclear power'],
        socialMovements: ['civil rights', 'decolonization', 'environmentalism', 'counterculture'],
        historicalContext: [
            'the world divides into two blocs',
            'humanity reaches for the stars',
            'colonies break free and nations emerge',
            'the shadow of the bomb looms over all'
        ]
    },
    {
        id: 'contemporary',
        name: 'Contemporary',
        description: 'The modern world',
        startYear: 1991,
        endYear: 2025,
        modifiers: {
            wealth: 0.03,
            education: 0.05,
            health: 0.05,
            connections: 0.03,
            volatility: 0.02
        },
        worldMood: 'an interconnected world of rapid change',
        technologies: ['the internet', 'smartphones', 'social media', 'renewable energy', 'AI'],
        socialMovements: ['globalization', 'climate activism', 'digital rights', 'identity politics'],
        historicalContext: [
            'the Cold War ends and borders shift',
            'the internet connects the world',
            'climate change becomes undeniable',
            'a pandemic reshapes daily life'
        ]
    }
];

// Get a random historical context for an era
export function getRandomHistoricalContext(era) {
    if (!era.historicalContext || era.historicalContext.length === 0) {
        return 'the world continues turning';
    }
    return era.historicalContext[Math.floor(Math.random() * era.historicalContext.length)];
}

// Get a random technology for an era
export function getRandomTechnology(era) {
    if (!era.technologies || era.technologies.length === 0) {
        return 'new inventions';
    }
    return era.technologies[Math.floor(Math.random() * era.technologies.length)];
}

// Get era by ID
export function getEraById(id) {
    return eras.find(e => e.id === id);
}

// Get era for a specific year
export function getEraForYear(year) {
    return eras.find(e => year >= e.startYear && year <= e.endYear);
}

// Get all years within an era
export function getYearsInEra(era) {
    const years = [];
    for (let year = era.startYear; year <= era.endYear; year += 5) {
        years.push(year);
    }
    return years;
}

// Get all years from a list of eras
export function getYearsFromEras(eraList) {
    const allYears = [];
    eraList.forEach(era => {
        allYears.push(...getYearsInEra(era));
    });
    return allYears.sort((a, b) => a - b);
}

// Select a random year from unlocked eras
export function selectRandomYear(unlockedEras) {
    if (!unlockedEras || unlockedEras.length === 0) {
        // Fallback to contemporary if nothing unlocked
        const contemporary = getEraById(DEFAULT_ERA_ID);
        return selectRandomYearFromEra(contemporary);
    }

    // First pick a random era, then pick a year from it
    const randomEra = unlockedEras[Math.floor(Math.random() * unlockedEras.length)];
    return selectRandomYearFromEra(randomEra);
}

// Select random year from a specific era
export function selectRandomYearFromEra(era) {
    const years = getYearsInEra(era);
    return years[Math.floor(Math.random() * years.length)];
}

// Get era modifiers
export function getEraModifiers(era) {
    return era.modifiers || {
        wealth: 0,
        education: 0,
        health: 0,
        connections: 0,
        volatility: 0
    };
}

// Validate eras data
export function validateEras() {
    const warnings = [];

    eras.forEach(era => {
        if (!era.id) warnings.push('Era missing id');
        if (!era.name) warnings.push(`Era ${era.id} missing name`);
        if (!era.startYear) warnings.push(`Era ${era.id} missing startYear`);
        if (!era.endYear) warnings.push(`Era ${era.id} missing endYear`);
        if (era.startYear > era.endYear) {
            warnings.push(`Era ${era.id} has startYear > endYear`);
        }
        if (!era.modifiers) warnings.push(`Era ${era.id} missing modifiers`);
    });

    // Check default era exists
    if (!getEraById(DEFAULT_ERA_ID)) {
        warnings.push(`Default era ${DEFAULT_ERA_ID} not found`);
    }

    // Check for year gaps or overlaps
    const sortedEras = [...eras].sort((a, b) => a.startYear - b.startYear);
    for (let i = 0; i < sortedEras.length - 1; i++) {
        const current = sortedEras[i];
        const next = sortedEras[i + 1];
        if (current.endYear >= next.startYear) {
            warnings.push(`Eras ${current.id} and ${next.id} overlap`);
        } else if (current.endYear + 1 < next.startYear) {
            warnings.push(`Gap between eras ${current.id} and ${next.id}`);
        }
    }

    if (warnings.length > 0) {
        console.warn('Era validation warnings:', warnings);
    }

    return warnings.length === 0;
}
