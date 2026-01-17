// Regional clusters for event differentiation
// Groups countries by cultural/historical context for more authentic gameplay

export const REGIONAL_CLUSTERS = {
    east_asia: {
        id: 'east_asia',
        name: 'East Asia',
        countries: [
            'China', 'Japan', 'Republic_of_Korea', 'Taiwan', 'Hong_Kong',
            'Mongolia', 'North_Korea'
        ],
        themes: ['filial_piety', 'education_pressure', 'honor', 'modernization', 'collectivism'],
        culturalContext: 'Confucian values emphasize family duty, education, and social harmony'
    },
    southeast_asia: {
        id: 'southeast_asia',
        name: 'Southeast Asia',
        countries: [
            'Vietnam', 'Thailand', 'Indonesia', 'Philippines', 'Malaysia',
            'Singapore', 'Myanmar', 'Cambodia', 'Laos', 'Brunei', 'Timor_Leste'
        ],
        themes: ['family_network', 'resilience', 'trade', 'colonial_legacy', 'spirituality'],
        culturalContext: 'Diverse cultures shaped by trade routes, colonialism, and religious traditions'
    },
    south_asia: {
        id: 'south_asia',
        name: 'South Asia',
        countries: [
            'India', 'Pakistan', 'Bangladesh', 'Sri_Lanka', 'Nepal',
            'Bhutan', 'Afghanistan', 'Maldives'
        ],
        themes: ['arranged_marriage', 'caste_dynamics', 'migration', 'family_honor', 'spirituality'],
        culturalContext: 'Ancient civilizations with complex social structures and strong family bonds'
    },
    western_europe: {
        id: 'western_europe',
        name: 'Western Europe',
        countries: [
            'UK', 'France', 'Germany', 'Netherlands', 'Belgium',
            'Austria', 'Switzerland', 'Ireland', 'Luxembourg'
        ],
        themes: ['individualism', 'social_welfare', 'class_mobility', 'secularism', 'work_life_balance'],
        culturalContext: 'Industrial heartland with strong social safety nets and democratic traditions'
    },
    southern_europe: {
        id: 'southern_europe',
        name: 'Southern Europe',
        countries: [
            'Italy', 'Spain', 'Portugal', 'Greece', 'Malta', 'Cyprus'
        ],
        themes: ['family_centrality', 'tradition', 'mediterranean_pace', 'religious_influence', 'hospitality'],
        culturalContext: 'Mediterranean cultures valuing family, leisure, and deep-rooted traditions'
    },
    northern_europe: {
        id: 'northern_europe',
        name: 'Northern Europe',
        countries: [
            'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'
        ],
        themes: ['egalitarianism', 'trust', 'welfare_state', 'nature_connection', 'innovation'],
        culturalContext: 'High-trust societies with comprehensive welfare and equality focus'
    },
    eastern_europe: {
        id: 'eastern_europe',
        name: 'Eastern Europe',
        countries: [
            'Russia', 'Poland', 'Ukraine', 'Czech_Republic', 'Hungary',
            'Romania', 'Bulgaria', 'Slovakia', 'Belarus', 'Moldova',
            'Slovenia', 'Croatia', 'Serbia', 'Bosnia_and_Herzegovina',
            'Montenegro', 'North_Macedonia', 'Albania', 'Kosovo', 'Estonia',
            'Latvia', 'Lithuania'
        ],
        themes: ['political_change', 'resilience', 'transition', 'collective_memory', 'resourcefulness'],
        culturalContext: 'Nations transformed by communism, transition, and rediscovering identity'
    },
    north_america: {
        id: 'north_america',
        name: 'North America',
        countries: ['USA', 'Canada'],
        themes: ['self_reliance', 'opportunity', 'diversity', 'frontier_spirit', 'entrepreneurship'],
        culturalContext: 'Immigrant nations emphasizing individual achievement and reinvention'
    },
    latin_america: {
        id: 'latin_america',
        name: 'Latin America',
        countries: [
            'Mexico', 'Brazil', 'Argentina', 'Colombia', 'Chile',
            'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay',
            'Uruguay', 'Cuba', 'Dominican_Republic', 'Costa_Rica',
            'Panama', 'Guatemala', 'Honduras', 'El_Salvador', 'Nicaragua',
            'Puerto_Rico', 'Haiti', 'Jamaica', 'Trinidad_and_Tobago'
        ],
        themes: ['family_centrality', 'economic_instability', 'resilience', 'passion', 'community'],
        culturalContext: 'Vibrant cultures blending indigenous, European, and African heritage'
    },
    middle_east: {
        id: 'middle_east',
        name: 'Middle East',
        countries: [
            'Saudi_Arabia', 'Iran', 'Iraq', 'Israel', 'Turkey',
            'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen',
            'Jordan', 'Lebanon', 'Syria', 'Palestine'
        ],
        themes: ['tradition_modernity', 'family_honor', 'oil_economy', 'religious_influence', 'hospitality'],
        culturalContext: 'Ancient crossroads where tradition and rapid modernization intersect'
    },
    north_africa: {
        id: 'north_africa',
        name: 'North Africa',
        countries: [
            'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan'
        ],
        themes: ['tradition', 'family_networks', 'youth_aspiration', 'migration_gateway', 'heritage'],
        culturalContext: 'Gateway between Africa, Europe, and the Middle East with rich heritage'
    },
    sub_saharan_africa: {
        id: 'sub_saharan_africa',
        name: 'Sub-Saharan Africa',
        countries: [
            'Nigeria', 'South_Africa', 'Kenya', 'Ghana', 'Ethiopia',
            'Tanzania', 'Uganda', 'Senegal', 'Cameroon', 'Ivory_Coast',
            'DR_Congo', 'Angola', 'Mozambique', 'Zimbabwe', 'Zambia',
            'Botswana', 'Namibia', 'Rwanda', 'Malawi', 'Mali',
            'Burkina_Faso', 'Niger', 'Chad', 'Mauritius', 'Madagascar'
        ],
        themes: ['community', 'colonial_legacy', 'rapid_change', 'entrepreneurship', 'ubuntu'],
        culturalContext: 'Diverse continent of rapid growth, strong communities, and emerging economies'
    },
    oceania: {
        id: 'oceania',
        name: 'Oceania',
        countries: [
            'Australia', 'New_Zealand', 'Fiji', 'Papua_New_Guinea',
            'Samoa', 'Tonga', 'Vanuatu', 'Solomon_Islands'
        ],
        themes: ['outdoor_lifestyle', 'indigenous_heritage', 'isolation', 'opportunity', 'environment'],
        culturalContext: 'Island nations valuing outdoor life, indigenous cultures, and community'
    },
    central_asia: {
        id: 'central_asia',
        name: 'Central Asia',
        countries: [
            'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'
        ],
        themes: ['silk_road', 'transition', 'nomadic_heritage', 'resource_wealth', 'identity'],
        culturalContext: 'Post-Soviet states rediscovering ancient Silk Road heritage'
    }
};

// Get regional cluster for a country
export function getRegionalCluster(countryId) {
    for (const [clusterId, cluster] of Object.entries(REGIONAL_CLUSTERS)) {
        if (cluster.countries.includes(countryId)) {
            return cluster;
        }
    }
    // Default to a generic cluster if not found
    return {
        id: 'global',
        name: 'Global',
        countries: [],
        themes: ['universal'],
        culturalContext: 'A citizen of the world'
    };
}

// Check if a country belongs to a specific region
export function isInRegion(countryId, regionId) {
    const cluster = REGIONAL_CLUSTERS[regionId];
    return cluster ? cluster.countries.includes(countryId) : false;
}

// Get all themes for a country (for event matching)
export function getRegionalThemes(countryId) {
    const cluster = getRegionalCluster(countryId);
    return cluster.themes || [];
}

// Get multiple regions (for countries that span cultures)
export function getCountryRegions(countryId) {
    const regions = [];
    for (const [clusterId, cluster] of Object.entries(REGIONAL_CLUSTERS)) {
        if (cluster.countries.includes(countryId)) {
            regions.push(cluster);
        }
    }
    return regions.length > 0 ? regions : [getRegionalCluster(countryId)];
}
