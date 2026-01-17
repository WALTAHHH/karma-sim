// World Events System
// Major historical events that influence gameplay based on year and country

export const worldEvents = [
    // === PRE-INDUSTRIAL ERA (1800-1849) ===
    {
        id: 'napoleonic_wars',
        name: 'Napoleonic Wars',
        years: [1800, 1815],
        affectedCountries: ['France', 'UK', 'Germany', 'Russia', 'Spain', 'Italy', 'Austria', 'Netherlands', 'Poland'],
        effects: {
            health: -0.10,
            volatility: 0.15
        },
        description: 'Europe is engulfed in war as Napoleon seeks to dominate the continent.',
        birthNarrative: 'The thunder of cannons echoes across Europe.'
    },
    {
        id: 'latin_american_independence',
        name: 'Latin American Independence Wars',
        years: [1810, 1830],
        affectedCountries: ['Mexico', 'Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile', 'Venezuela', 'Ecuador', 'Bolivia'],
        effects: {
            volatility: 0.12,
            connections: 0.05
        },
        description: 'Colonial peoples rise up against Spanish and Portuguese rule.',
        birthNarrative: 'The colonies stir with revolutionary fervor.'
    },
    {
        id: 'irish_famine',
        name: 'Irish Famine',
        years: [1845, 1852],
        affectedCountries: ['Ireland', 'UK'],
        effects: {
            health: -0.20,
            wealth: -0.15,
            volatility: 0.10
        },
        description: 'A devastating potato blight causes mass starvation and emigration.',
        birthNarrative: 'Famine grips the land, and many flee for survival.'
    },

    // === INDUSTRIAL REVOLUTION (1850-1899) ===
    {
        id: 'american_civil_war',
        name: 'American Civil War',
        years: [1861, 1865],
        affectedCountries: ['USA'],
        effects: {
            health: -0.12,
            volatility: 0.18
        },
        description: 'A nation tears itself apart over slavery and states\' rights.',
        birthNarrative: 'Brother fights brother in a war that will define the nation.'
    },
    {
        id: 'meiji_restoration',
        name: 'Meiji Restoration',
        years: [1868, 1912],
        affectedCountries: ['Japan'],
        effects: {
            education: 0.10,
            wealth: 0.05,
            volatility: 0.08
        },
        description: 'Japan rapidly modernizes, transforming from feudal to industrial.',
        birthNarrative: 'An ancient nation awakens to a new era of change.'
    },
    {
        id: 'scramble_for_africa',
        name: 'Scramble for Africa',
        years: [1881, 1914],
        affectedCountries: ['Nigeria', 'Kenya', 'South_Africa', 'Egypt', 'Ethiopia', 'Ghana', 'Tanzania', 'Uganda', 'Zimbabwe', 'Zambia'],
        effects: {
            wealth: -0.08,
            health: -0.05,
            volatility: 0.12
        },
        description: 'European powers carve up the African continent.',
        birthNarrative: 'Colonial powers redraw borders without regard for those who live there.'
    },

    // === EARLY MODERN (1900-1945) ===
    {
        id: 'world_war_1',
        name: 'The Great War',
        years: [1914, 1918],
        affectedCountries: ['UK', 'France', 'Germany', 'Russia', 'Italy', 'Austria', 'Turkey', 'USA', 'Australia', 'Canada', 'New_Zealand', 'India', 'South_Africa'],
        effects: {
            health: -0.15,
            volatility: 0.20
        },
        description: 'The war to end all wars claims millions of lives.',
        birthNarrative: 'A generation marches into the trenches.'
    },
    {
        id: 'russian_revolution',
        name: 'Russian Revolution',
        years: [1917, 1922],
        affectedCountries: ['Russia'],
        effects: {
            volatility: 0.25,
            wealth: -0.10
        },
        description: 'The old order collapses as revolution sweeps Russia.',
        birthNarrative: 'The tsar falls, and a new order rises from the chaos.'
    },
    {
        id: 'spanish_flu',
        name: 'Spanish Flu Pandemic',
        years: [1918, 1920],
        affectedCountries: 'all',
        effects: {
            health: -0.18
        },
        description: 'A deadly pandemic sweeps the globe.',
        birthNarrative: 'A plague stalks the world, claiming rich and poor alike.'
    },
    {
        id: 'great_depression',
        name: 'Great Depression',
        years: [1929, 1939],
        affectedCountries: 'all',
        effects: {
            wealth: -0.15,
            health: -0.05,
            education: -0.08
        },
        description: 'Economic collapse brings widespread poverty and hardship.',
        birthNarrative: 'Breadlines form as the world economy crumbles.'
    },
    {
        id: 'world_war_2',
        name: 'World War II',
        years: [1939, 1945],
        affectedCountries: ['UK', 'France', 'Germany', 'Russia', 'Italy', 'Japan', 'USA', 'Poland', 'China', 'Netherlands', 'Belgium', 'Australia', 'Canada', 'India', 'Philippines', 'Indonesia', 'Vietnam'],
        effects: {
            health: -0.18,
            volatility: 0.22
        },
        description: 'The world is consumed by total war.',
        birthNarrative: 'Bombs fall from the sky as nations clash in total war.'
    },
    {
        id: 'holocaust',
        name: 'The Holocaust',
        years: [1941, 1945],
        affectedCountries: ['Germany', 'Poland', 'Netherlands', 'Austria', 'Hungary', 'Czechia', 'Romania'],
        effects: {
            health: -0.25,
            volatility: 0.20
        },
        description: 'Systematic genocide claims millions of lives.',
        birthNarrative: 'Darkness descends as humanity commits unspeakable atrocities.'
    },

    // === COLD WAR (1946-1990) ===
    {
        id: 'indian_independence',
        name: 'Indian Independence & Partition',
        years: [1947, 1948],
        affectedCountries: ['India', 'Pakistan', 'Bangladesh'],
        effects: {
            volatility: 0.18,
            connections: -0.08
        },
        description: 'The British Empire withdraws, leaving partition and bloodshed.',
        birthNarrative: 'A subcontinent divided, with millions displaced.'
    },
    {
        id: 'korean_war',
        name: 'Korean War',
        years: [1950, 1953],
        affectedCountries: ['Republic_of_Korea', 'China', 'USA'],
        effects: {
            health: -0.12,
            volatility: 0.15
        },
        description: 'The Cold War turns hot on the Korean peninsula.',
        birthNarrative: 'The peninsula becomes a battleground for superpowers.'
    },
    {
        id: 'cultural_revolution',
        name: 'Cultural Revolution',
        years: [1966, 1976],
        affectedCountries: ['China'],
        effects: {
            education: -0.15,
            volatility: 0.20,
            connections: -0.10
        },
        description: 'Political upheaval tears through Chinese society.',
        birthNarrative: 'Red Guards march, and intellectuals are sent to the countryside.'
    },
    {
        id: 'vietnam_war',
        name: 'Vietnam War',
        years: [1955, 1975],
        affectedCountries: ['Vietnam', 'USA', 'Cambodia', 'Laos'],
        effects: {
            health: -0.15,
            volatility: 0.18
        },
        description: 'A long and bloody conflict in Southeast Asia.',
        birthNarrative: 'Napalm and helicopters fill the skies.'
    },
    {
        id: 'civil_rights_movement',
        name: 'Civil Rights Movement',
        years: [1954, 1968],
        affectedCountries: ['USA'],
        effects: {
            connections: 0.08,
            volatility: 0.10
        },
        description: 'The struggle for equality reshapes American society.',
        birthNarrative: 'Marchers demand justice and equality under the law.'
    },
    {
        id: 'oil_crisis',
        name: 'Oil Crisis',
        years: [1973, 1974],
        affectedCountries: 'all',
        effects: {
            wealth: -0.08,
            volatility: 0.08
        },
        description: 'Oil embargoes cause economic turmoil.',
        birthNarrative: 'Gas lines stretch for blocks as oil prices soar.'
    },
    {
        id: 'iranian_revolution',
        name: 'Iranian Revolution',
        years: [1978, 1979],
        affectedCountries: ['Iran'],
        effects: {
            volatility: 0.20,
            connections: -0.08
        },
        description: 'The Shah is overthrown in an Islamic revolution.',
        birthNarrative: 'The monarchy falls, and a new order takes its place.'
    },
    {
        id: 'soviet_afghan_war',
        name: 'Soviet-Afghan War',
        years: [1979, 1989],
        affectedCountries: ['Russia', 'Pakistan'],
        effects: {
            health: -0.10,
            volatility: 0.15
        },
        description: 'The Soviet Union invades Afghanistan.',
        birthNarrative: 'Mountains become battlefields in a Cold War proxy fight.'
    },
    {
        id: 'apartheid',
        name: 'Apartheid Era',
        years: [1948, 1991],
        affectedCountries: ['South_Africa'],
        effects: {
            connections: -0.12,
            education: -0.10,
            volatility: 0.12
        },
        description: 'Racial segregation divides South African society.',
        birthNarrative: 'The color of your skin determines your fate.'
    },

    // === CONTEMPORARY (1991-2025) ===
    {
        id: 'soviet_collapse',
        name: 'Soviet Union Collapse',
        years: [1991, 1993],
        affectedCountries: ['Russia', 'Ukraine', 'Kazakhstan', 'Belarus', 'Georgia', 'Armenia', 'Azerbaijan', 'Moldova', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan', 'Latvia', 'Lithuania', 'Estonia'],
        effects: {
            volatility: 0.18,
            wealth: -0.10
        },
        description: 'The Soviet Union dissolves, reshaping world order.',
        birthNarrative: 'An empire crumbles, and new nations emerge from the ruins.'
    },
    {
        id: 'rwandan_genocide',
        name: 'Rwandan Genocide',
        years: [1994, 1994],
        affectedCountries: ['Rwanda', 'Burundi'],
        effects: {
            health: -0.25,
            connections: -0.15,
            volatility: 0.25
        },
        description: 'Mass atrocities claim hundreds of thousands of lives.',
        birthNarrative: 'Machetes and hatred tear communities apart.'
    },
    {
        id: 'asian_financial_crisis',
        name: 'Asian Financial Crisis',
        years: [1997, 1998],
        affectedCountries: ['Thailand', 'Indonesia', 'Malaysia', 'Philippines', 'Republic_of_Korea', 'Singapore'],
        effects: {
            wealth: -0.12,
            volatility: 0.12
        },
        description: 'Currency collapse triggers economic turmoil.',
        birthNarrative: 'Tigers stumble as markets crash across Asia.'
    },
    {
        id: 'war_on_terror',
        name: 'War on Terror',
        years: [2001, 2021],
        affectedCountries: ['USA', 'Iraq', 'Pakistan'],
        effects: {
            health: -0.08,
            volatility: 0.12
        },
        description: 'Global conflict follows the September 11 attacks.',
        birthNarrative: 'Towers fall, and the world changes forever.'
    },
    {
        id: 'global_financial_crisis',
        name: 'Global Financial Crisis',
        years: [2008, 2009],
        affectedCountries: 'all',
        effects: {
            wealth: -0.12,
            education: -0.05
        },
        description: 'Banks collapse and economies spiral into recession.',
        birthNarrative: 'Lehman falls, and the dominoes begin to tumble.'
    },
    {
        id: 'arab_spring',
        name: 'Arab Spring',
        years: [2010, 2012],
        affectedCountries: ['Egypt', 'Tunisia', 'Libya', 'Syria', 'Yemen', 'Bahrain'],
        effects: {
            volatility: 0.18,
            connections: 0.05
        },
        description: 'Popular uprisings sweep across the Arab world.',
        birthNarrative: 'The streets fill with protesters demanding change.'
    },
    {
        id: 'syrian_civil_war',
        name: 'Syrian Civil War',
        years: [2011, 2025],
        affectedCountries: ['Syria', 'Turkey', 'Lebanon', 'Jordan'],
        effects: {
            health: -0.18,
            wealth: -0.15,
            volatility: 0.22
        },
        description: 'A devastating civil war displaces millions.',
        birthNarrative: 'Cities crumble as war tears a nation apart.'
    },
    {
        id: 'covid_pandemic',
        name: 'COVID-19 Pandemic',
        years: [2020, 2023],
        affectedCountries: 'all',
        effects: {
            health: -0.10,
            wealth: -0.05,
            connections: -0.08
        },
        description: 'A global pandemic reshapes daily life.',
        birthNarrative: 'The world locks down as a virus spreads.'
    }
];

// Get active world events for a given year and country
export function getActiveWorldEvents(year, countryId) {
    return worldEvents.filter(event => {
        // Check year range
        if (year < event.years[0] || year > event.years[1]) {
            return false;
        }
        // Check if country is affected
        if (event.affectedCountries === 'all') {
            return true;
        }
        return event.affectedCountries.includes(countryId);
    });
}

// Get combined effects from all active world events
export function getWorldEventEffects(year, countryId) {
    const activeEvents = getActiveWorldEvents(year, countryId);

    const combined = {
        wealth: 0,
        education: 0,
        health: 0,
        connections: 0,
        volatility: 0
    };

    for (const event of activeEvents) {
        if (event.effects) {
            for (const [stat, value] of Object.entries(event.effects)) {
                combined[stat] = (combined[stat] || 0) + value;
            }
        }
    }

    return combined;
}

// Get narrative text for active world events
export function getWorldEventNarrative(year, countryId) {
    const activeEvents = getActiveWorldEvents(year, countryId);

    if (activeEvents.length === 0) {
        return null;
    }

    // Return narrative from the most significant event (first one found)
    const primaryEvent = activeEvents[0];
    return primaryEvent.birthNarrative || primaryEvent.description;
}

// Get a specific world event by ID
export function getWorldEventById(eventId) {
    return worldEvents.find(e => e.id === eventId);
}

// Get all events active during a specific year (regardless of country)
export function getEventsForYear(year) {
    return worldEvents.filter(event =>
        year >= event.years[0] && year <= event.years[1]
    );
}

// Validate world events data
export function validateWorldEvents() {
    const warnings = [];

    worldEvents.forEach(event => {
        if (!event.id) warnings.push('Event missing id');
        if (!event.name) warnings.push(`Event ${event.id} missing name`);
        if (!event.years || event.years.length !== 2) {
            warnings.push(`Event ${event.id} has invalid years`);
        }
        if (event.years && event.years[0] > event.years[1]) {
            warnings.push(`Event ${event.id} has startYear > endYear`);
        }
        if (!event.affectedCountries) {
            warnings.push(`Event ${event.id} missing affectedCountries`);
        }
    });

    if (warnings.length > 0) {
        console.warn('World event validation warnings:', warnings);
    }

    return warnings.length === 0;
}
