// Country dataset with structural modifiers
// Each country has: id, name, incomeLevel, populationScale, baselineModifiers

// Country flavor data for birth narratives
export const COUNTRY_FLAVOR = {
    // Massive population countries
    China: {
        demonym: 'Chinese',
        culturalNotes: 'an ancient civilization of rich traditions',
        urbanCenters: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
        ruralCharacter: 'terraced rice paddies and mountain villages'
    },
    India: {
        demonym: 'Indian',
        culturalNotes: 'a land of diverse cultures and ancient wisdom',
        urbanCenters: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata'],
        ruralCharacter: 'farming villages and sacred rivers'
    },
    USA: {
        demonym: 'American',
        culturalNotes: 'a nation of opportunity and diversity',
        urbanCenters: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
        ruralCharacter: 'farmland and small towns'
    },
    Indonesia: {
        demonym: 'Indonesian',
        culturalNotes: 'an archipelago of thousands of islands',
        urbanCenters: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
        ruralCharacter: 'tropical villages and fishing communities'
    },
    // Large population countries
    Brazil: {
        demonym: 'Brazilian',
        culturalNotes: 'a vibrant nation of music and football',
        urbanCenters: ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador'],
        ruralCharacter: 'fazendas and rainforest settlements'
    },
    Russia: {
        demonym: 'Russian',
        culturalNotes: 'a vast nation spanning two continents',
        urbanCenters: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan'],
        ruralCharacter: 'snowy villages and endless steppes'
    },
    Japan: {
        demonym: 'Japanese',
        culturalNotes: 'where ancient traditions meet modern innovation',
        urbanCenters: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
        ruralCharacter: 'serene mountain villages and fishing towns'
    },
    Germany: {
        demonym: 'German',
        culturalNotes: 'a nation of industry and precision',
        urbanCenters: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
        ruralCharacter: 'picturesque villages and rolling farmland'
    },
    UK: {
        demonym: 'British',
        culturalNotes: 'an island nation steeped in history',
        urbanCenters: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
        ruralCharacter: 'green countryside and quaint villages'
    },
    France: {
        demonym: 'French',
        culturalNotes: 'the land of art, cuisine, and revolution',
        urbanCenters: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
        ruralCharacter: 'vineyards and provincial towns'
    },
    Italy: {
        demonym: 'Italian',
        culturalNotes: 'the cradle of the Renaissance',
        urbanCenters: ['Rome', 'Milan', 'Naples', 'Florence'],
        ruralCharacter: 'sun-drenched villages and olive groves'
    },
    Mexico: {
        demonym: 'Mexican',
        culturalNotes: 'where ancient civilizations meet Spanish heritage',
        urbanCenters: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla'],
        ruralCharacter: 'dusty pueblos and farming communities'
    },
    Republic_of_Korea: {
        demonym: 'Korean',
        culturalNotes: 'a tiger economy risen from war',
        urbanCenters: ['Seoul', 'Busan', 'Incheon', 'Daegu'],
        ruralCharacter: 'mountain villages and coastal towns'
    },
    Spain: {
        demonym: 'Spanish',
        culturalNotes: 'a land of passion and proud regions',
        urbanCenters: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
        ruralCharacter: 'dusty plains and hilltop villages'
    },
    Canada: {
        demonym: 'Canadian',
        culturalNotes: 'a vast and welcoming northern nation',
        urbanCenters: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
        ruralCharacter: 'prairies and wilderness settlements'
    },
    Australia: {
        demonym: 'Australian',
        culturalNotes: 'a sunburnt country of opportunity',
        urbanCenters: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
        ruralCharacter: 'the outback and coastal communities'
    },
    Nigeria: {
        demonym: 'Nigerian',
        culturalNotes: 'a diverse nation of many peoples',
        urbanCenters: ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
        ruralCharacter: 'villages and farming communities'
    },
    Egypt: {
        demonym: 'Egyptian',
        culturalNotes: 'heir to the pharaohs and pyramids',
        urbanCenters: ['Cairo', 'Alexandria', 'Giza', 'Luxor'],
        ruralCharacter: 'Nile Delta villages and desert oases'
    },
    South_Africa: {
        demonym: 'South African',
        culturalNotes: 'a rainbow nation of many cultures',
        urbanCenters: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
        ruralCharacter: 'townships and farming regions'
    },
    Argentina: {
        demonym: 'Argentine',
        culturalNotes: 'a land of tango and wide pampas',
        urbanCenters: ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza'],
        ruralCharacter: 'estancias and gaucho country'
    },
    Poland: {
        demonym: 'Polish',
        culturalNotes: 'a resilient nation at the heart of Europe',
        urbanCenters: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'],
        ruralCharacter: 'farmlands and traditional villages'
    },
    Netherlands: {
        demonym: 'Dutch',
        culturalNotes: 'a small nation of great maritime history',
        urbanCenters: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
        ruralCharacter: 'polders and windmill-dotted countryside'
    },
    Sweden: {
        demonym: 'Swedish',
        culturalNotes: 'a progressive Scandinavian nation',
        urbanCenters: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala'],
        ruralCharacter: 'forests and lakeside villages'
    },
    Switzerland: {
        demonym: 'Swiss',
        culturalNotes: 'a prosperous Alpine confederation',
        urbanCenters: ['Zurich', 'Geneva', 'Basel', 'Bern'],
        ruralCharacter: 'mountain villages and Alpine meadows'
    },
    Turkey: {
        demonym: 'Turkish',
        culturalNotes: 'where East meets West',
        urbanCenters: ['Istanbul', 'Ankara', 'Izmir', 'Bursa'],
        ruralCharacter: 'Anatolian villages and coastal towns'
    },
    Iran: {
        demonym: 'Iranian',
        culturalNotes: 'heir to Persian civilization',
        urbanCenters: ['Tehran', 'Isfahan', 'Mashhad', 'Shiraz'],
        ruralCharacter: 'mountain villages and desert oases'
    },
    Thailand: {
        demonym: 'Thai',
        culturalNotes: 'the Land of Smiles',
        urbanCenters: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
        ruralCharacter: 'rice paddies and Buddhist villages'
    },
    Vietnam: {
        demonym: 'Vietnamese',
        culturalNotes: 'a resilient nation of ancient heritage',
        urbanCenters: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong'],
        ruralCharacter: 'rice terraces and fishing villages'
    },
    Philippines: {
        demonym: 'Filipino',
        culturalNotes: 'an archipelago of warm hospitality',
        urbanCenters: ['Manila', 'Cebu', 'Davao', 'Quezon City'],
        ruralCharacter: 'island communities and rice terraces'
    },
    Malaysia: {
        demonym: 'Malaysian',
        culturalNotes: 'a multicultural crossroads of Asia',
        urbanCenters: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh'],
        ruralCharacter: 'plantations and kampung villages'
    },
    Singapore: {
        demonym: 'Singaporean',
        culturalNotes: 'a city-state of modern ambition',
        urbanCenters: ['Singapore'],
        ruralCharacter: 'a fully urban landscape'
    },
    Israel: {
        demonym: 'Israeli',
        culturalNotes: 'a young nation in an ancient land',
        urbanCenters: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beersheba'],
        ruralCharacter: 'kibbutzim and desert settlements'
    },
    Greece: {
        demonym: 'Greek',
        culturalNotes: 'birthplace of democracy and philosophy',
        urbanCenters: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'],
        ruralCharacter: 'whitewashed villages and island communities'
    },
    Portugal: {
        demonym: 'Portuguese',
        culturalNotes: 'a seafaring nation of explorers',
        urbanCenters: ['Lisbon', 'Porto', 'Braga', 'Coimbra'],
        ruralCharacter: 'fishing villages and vineyards'
    },
    Ireland: {
        demonym: 'Irish',
        culturalNotes: 'an emerald isle of poets and storytellers',
        urbanCenters: ['Dublin', 'Cork', 'Galway', 'Limerick'],
        ruralCharacter: 'green farmland and coastal villages'
    },
    Norway: {
        demonym: 'Norwegian',
        culturalNotes: 'a land of fjords and midnight sun',
        urbanCenters: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
        ruralCharacter: 'fjord villages and fishing communities'
    },
    Denmark: {
        demonym: 'Danish',
        culturalNotes: 'a happy Scandinavian kingdom',
        urbanCenters: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
        ruralCharacter: 'farmland and coastal villages'
    },
    Finland: {
        demonym: 'Finnish',
        culturalNotes: 'a land of lakes and saunas',
        urbanCenters: ['Helsinki', 'Espoo', 'Tampere', 'Turku'],
        ruralCharacter: 'forest cabins and lakeside communities'
    },
    New_Zealand: {
        demonym: 'New Zealander',
        culturalNotes: 'a land of natural beauty and Maori heritage',
        urbanCenters: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
        ruralCharacter: 'sheep stations and coastal settlements'
    },
    Chile: {
        demonym: 'Chilean',
        culturalNotes: 'a narrow nation of diverse landscapes',
        urbanCenters: ['Santiago', 'Valparaiso', 'Concepcion', 'La Serena'],
        ruralCharacter: 'vineyards and coastal villages'
    },
    Colombia: {
        demonym: 'Colombian',
        culturalNotes: 'a land of coffee and rich biodiversity',
        urbanCenters: ['Bogota', 'Medellin', 'Cali', 'Barranquilla'],
        ruralCharacter: 'coffee fincas and mountain villages'
    },
    Peru: {
        demonym: 'Peruvian',
        culturalNotes: 'heir to the Inca empire',
        urbanCenters: ['Lima', 'Arequipa', 'Cusco', 'Trujillo'],
        ruralCharacter: 'Andean villages and coastal communities'
    },
    Kenya: {
        demonym: 'Kenyan',
        culturalNotes: 'a land of wildlife and diverse peoples',
        urbanCenters: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
        ruralCharacter: 'farming villages and pastoral lands'
    },
    Ethiopia: {
        demonym: 'Ethiopian',
        culturalNotes: 'an ancient African kingdom',
        urbanCenters: ['Addis Ababa', 'Dire Dawa', 'Gondar', 'Mekelle'],
        ruralCharacter: 'highland villages and farming communities'
    },
    Pakistan: {
        demonym: 'Pakistani',
        culturalNotes: 'a nation of ancient Indus heritage',
        urbanCenters: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'],
        ruralCharacter: 'farming villages and mountain communities'
    },
    Bangladesh: {
        demonym: 'Bangladeshi',
        culturalNotes: 'a riverine nation of resilient people',
        urbanCenters: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi'],
        ruralCharacter: 'delta villages and rice paddies'
    },
    Saudi_Arabia: {
        demonym: 'Saudi',
        culturalNotes: 'guardian of Islam\'s holiest sites',
        urbanCenters: ['Riyadh', 'Jeddah', 'Mecca', 'Medina'],
        ruralCharacter: 'desert oases and Bedouin settlements'
    },
    UAE: {
        demonym: 'Emirati',
        culturalNotes: 'a desert transformed by oil wealth',
        urbanCenters: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
        ruralCharacter: 'oasis villages and coastal settlements'
    },
    Cuba: {
        demonym: 'Cuban',
        culturalNotes: 'an island of revolution and resilience',
        urbanCenters: ['Havana', 'Santiago de Cuba', 'Camaguey', 'Holguin'],
        ruralCharacter: 'tobacco farms and sugar plantations'
    }
};

// Get flavor for a country (returns default if not found)
export function getCountryFlavor(countryId) {
    return COUNTRY_FLAVOR[countryId] || {
        demonym: 'local',
        culturalNotes: 'a nation with its own unique character',
        urbanCenters: ['the capital'],
        ruralCharacter: 'villages and countryside'
    };
}

// Income levels affect wealth distribution
export const INCOME_LEVELS = {
    low: { wealthBias: -0.10, educationBias: -0.08, healthBias: -0.10 },
    'lower-middle': { wealthBias: -0.05, educationBias: -0.03, healthBias: -0.05 },
    'upper-middle': { wealthBias: 0.03, educationBias: 0.03, healthBias: 0.03 },
    high: { wealthBias: 0.08, educationBias: 0.08, healthBias: 0.08 }
};

// Population scale weights for birth selection
export const POPULATION_WEIGHTS = {
    tiny: 1,      // < 1M
    small: 5,     // 1-10M
    medium: 15,   // 10-50M
    large: 40,    // 50-200M
    massive: 100  // > 200M
};

// Full country list with metadata
export const countries = [
    // === MASSIVE POPULATION (>200M) ===
    { id: 'China', name: 'China', incomeLevel: 'upper-middle', populationScale: 'massive',
      baselineModifiers: { wealth: 0, education: 0.05, health: 0.03, connections: -0.02, volatility: 0.02 }},
    { id: 'India', name: 'India', incomeLevel: 'lower-middle', populationScale: 'massive',
      baselineModifiers: { wealth: -0.03, education: -0.02, health: -0.03, connections: 0.05, volatility: 0.05 }},
    { id: 'USA', name: 'United States', incomeLevel: 'high', populationScale: 'massive',
      baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.02, connections: 0.03, volatility: 0.08 }},
    { id: 'Indonesia', name: 'Indonesia', incomeLevel: 'lower-middle', populationScale: 'massive',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: -0.02, connections: 0.02, volatility: 0.03 }},

    // === LARGE POPULATION (50-200M) ===
    { id: 'Pakistan', name: 'Pakistan', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.05, connections: 0.03, volatility: 0.08 }},
    { id: 'Brazil', name: 'Brazil', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0, education: -0.02, health: 0, connections: 0.03, volatility: 0.10 }},
    { id: 'Nigeria', name: 'Nigeria', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.05, connections: 0.05, volatility: 0.12 }},
    { id: 'Bangladesh', name: 'Bangladesh', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.05, connections: 0.02, volatility: 0.05 }},
    { id: 'Russia', name: 'Russia', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0, education: 0.05, health: -0.03, connections: 0, volatility: 0.08 }},
    { id: 'Mexico', name: 'Mexico', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.05, volatility: 0.08 }},
    { id: 'Japan', name: 'Japan', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.05, education: 0.10, health: 0.10, connections: -0.03, volatility: -0.05 }},
    { id: 'Ethiopia', name: 'Ethiopia', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.08, connections: 0.03, volatility: 0.10 }},
    { id: 'Philippines', name: 'Philippines', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: 0, health: -0.02, connections: 0.08, volatility: 0.05 }},
    { id: 'Egypt', name: 'Egypt', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: -0.02, health: -0.02, connections: 0.03, volatility: 0.08 }},
    { id: 'Vietnam', name: 'Vietnam', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: 0.02, health: 0, connections: 0.02, volatility: 0.02 }},
    { id: 'DR_Congo', name: 'DR Congo', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.12, education: -0.10, health: -0.10, connections: 0.02, volatility: 0.15 }},
    { id: 'Turkey', name: 'Turkey', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0, education: 0, health: 0.02, connections: 0.03, volatility: 0.08 }},
    { id: 'Iran', name: 'Iran', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: 0.03, health: 0, connections: 0.02, volatility: 0.10 }},
    { id: 'Germany', name: 'Germany', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.08, education: 0.08, health: 0.08, connections: 0, volatility: -0.05 }},
    { id: 'Thailand', name: 'Thailand', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0, education: 0, health: 0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'UK', name: 'United Kingdom', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.05, connections: 0.03, volatility: 0 }},
    { id: 'France', name: 'France', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.08, connections: 0.02, volatility: 0.02 }},
    { id: 'Italy', name: 'Italy', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.05, connections: 0.05, volatility: 0.03 }},
    { id: 'South_Africa', name: 'South Africa', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: -0.03, health: -0.05, connections: 0.02, volatility: 0.12 }},
    { id: 'Tanzania', name: 'Tanzania', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.08, education: -0.05, health: -0.05, connections: 0.03, volatility: 0.05 }},
    { id: 'Myanmar', name: 'Myanmar', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.05, connections: 0.02, volatility: 0.12 }},
    { id: 'Kenya', name: 'Kenya', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.02, health: -0.03, connections: 0.05, volatility: 0.08 }},
    { id: 'Republic_of_Korea', name: 'South Korea', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.05, education: 0.12, health: 0.08, connections: -0.02, volatility: 0 }},
    { id: 'Colombia', name: 'Colombia', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.05, volatility: 0.10 }},
    { id: 'Spain', name: 'Spain', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.05, connections: 0.05, volatility: 0.05 }},
    { id: 'Argentina', name: 'Argentina', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0, education: 0.03, health: 0.02, connections: 0.05, volatility: 0.12 }},
    { id: 'Algeria', name: 'Algeria', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.02, volatility: 0.08 }},
    { id: 'Sudan', name: 'Sudan', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.08, connections: 0.02, volatility: 0.15 }},
    { id: 'Uganda', name: 'Uganda', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.08, education: -0.05, health: -0.05, connections: 0.05, volatility: 0.05 }},
    { id: 'Iraq', name: 'Iraq', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: -0.03, health: -0.05, connections: 0.03, volatility: 0.15 }},
    { id: 'Poland', name: 'Poland', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.03, connections: 0.02, volatility: 0 }},
    { id: 'Canada', name: 'Canada', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.08, education: 0.08, health: 0.08, connections: 0.02, volatility: -0.03 }},
    { id: 'Morocco', name: 'Morocco', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: -0.03, health: -0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Saudi_Arabia', name: 'Saudi Arabia', incomeLevel: 'high', populationScale: 'large',
      baselineModifiers: { wealth: 0.08, education: 0, health: 0.03, connections: -0.02, volatility: 0.05 }},
    { id: 'Uzbekistan', name: 'Uzbekistan', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: 0, health: -0.02, connections: 0.02, volatility: 0.03 }},
    { id: 'Peru', name: 'Peru', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.03, volatility: 0.08 }},
    { id: 'Angola', name: 'Angola', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.08, health: -0.08, connections: 0.02, volatility: 0.10 }},
    { id: 'Malaysia', name: 'Malaysia', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.03, connections: 0.02, volatility: 0 }},
    { id: 'Mozambique', name: 'Mozambique', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.08, connections: 0.02, volatility: 0.08 }},
    { id: 'Ghana', name: 'Ghana', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.03, education: -0.02, health: -0.03, connections: 0.05, volatility: 0.05 }},
    { id: 'Yemen', name: 'Yemen', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.10, connections: 0.03, volatility: 0.15 }},
    { id: 'Nepal', name: 'Nepal', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.03, connections: 0.03, volatility: 0.03 }},
    { id: 'Venezuela', name: 'Venezuela', incomeLevel: 'upper-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: 0, health: -0.03, connections: 0.03, volatility: 0.15 }},
    { id: 'Madagascar', name: 'Madagascar', incomeLevel: 'low', populationScale: 'large',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.08, connections: 0.02, volatility: 0.05 }},
    { id: 'Cameroon', name: 'Cameroon', incomeLevel: 'lower-middle', populationScale: 'large',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.05, connections: 0.03, volatility: 0.08 }},
    { id: 'Australia', name: 'Australia', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.10, education: 0.08, health: 0.10, connections: 0, volatility: -0.05 }},

    // === MEDIUM POPULATION (10-50M) ===
    { id: 'Taiwan', name: 'Taiwan', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.05, education: 0.10, health: 0.08, connections: 0, volatility: 0 }},
    { id: 'Sri_Lanka', name: 'Sri Lanka', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: 0.02, health: 0, connections: 0.03, volatility: 0.08 }},
    { id: 'Burkina_Faso', name: 'Burkina Faso', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.10, education: -0.10, health: -0.08, connections: 0.03, volatility: 0.10 }},
    { id: 'Mali', name: 'Mali', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.10, education: -0.10, health: -0.08, connections: 0.03, volatility: 0.12 }},
    { id: 'Chile', name: 'Chile', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.05, connections: 0.02, volatility: 0.05 }},
    { id: 'Romania', name: 'Romania', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.02, education: 0.03, health: 0.02, connections: 0.02, volatility: 0.03 }},
    { id: 'Malawi', name: 'Malawi', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.08, health: -0.08, connections: 0.03, volatility: 0.05 }},
    { id: 'Kazakhstan', name: 'Kazakhstan', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0.02, education: 0.03, health: 0, connections: 0, volatility: 0.03 }},
    { id: 'Zambia', name: 'Zambia', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.05, connections: 0.03, volatility: 0.05 }},
    { id: 'Ecuador', name: 'Ecuador', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.03, volatility: 0.08 }},
    { id: 'Syria', name: 'Syria', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.10, education: -0.05, health: -0.10, connections: 0.05, volatility: 0.15 }},
    { id: 'Netherlands', name: 'Netherlands', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.10, education: 0.10, health: 0.10, connections: 0.03, volatility: -0.05 }},
    { id: 'Senegal', name: 'Senegal', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.05, connections: 0.05, volatility: 0.03 }},
    { id: 'Guatemala', name: 'Guatemala', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.03, education: -0.05, health: -0.03, connections: 0.05, volatility: 0.10 }},
    { id: 'Chad', name: 'Chad', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.12, health: -0.10, connections: 0.02, volatility: 0.12 }},
    { id: 'Somalia', name: 'Somalia', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.12, health: -0.12, connections: 0.03, volatility: 0.15 }},
    { id: 'Zimbabwe', name: 'Zimbabwe', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.08, education: -0.02, health: -0.08, connections: 0.03, volatility: 0.12 }},
    { id: 'Cambodia', name: 'Cambodia', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.03, volatility: 0.05 }},
    { id: 'Rwanda', name: 'Rwanda', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.08, education: -0.03, health: -0.03, connections: 0.05, volatility: 0.05 }},
    { id: 'Benin', name: 'Benin', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.05, connections: 0.03, volatility: 0.03 }},
    { id: 'Burundi', name: 'Burundi', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.08, health: -0.08, connections: 0.03, volatility: 0.08 }},
    { id: 'Tunisia', name: 'Tunisia', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0, connections: 0.02, volatility: 0.05 }},
    { id: 'Belgium', name: 'Belgium', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.08, education: 0.08, health: 0.08, connections: 0.03, volatility: -0.03 }},
    { id: 'Bolivia', name: 'Bolivia', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.03, connections: 0.05, volatility: 0.08 }},
    { id: 'Cuba', name: 'Cuba', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.03, education: 0.05, health: 0.05, connections: 0.02, volatility: 0.03 }},
    { id: 'Haiti', name: 'Haiti', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.10, health: -0.10, connections: 0.03, volatility: 0.12 }},
    { id: 'South_Sudan', name: 'South Sudan', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.12, education: -0.12, health: -0.12, connections: 0.02, volatility: 0.15 }},
    { id: 'Dominican_Republic', name: 'Dominican Republic', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Czechia', name: 'Czechia', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.05, education: 0.08, health: 0.05, connections: 0.02, volatility: -0.03 }},
    { id: 'Greece', name: 'Greece', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.02, education: 0.03, health: 0.05, connections: 0.05, volatility: 0.05 }},
    { id: 'Jordan', name: 'Jordan', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: 0.02, health: 0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Portugal', name: 'Portugal', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.05, connections: 0.03, volatility: 0 }},
    { id: 'Azerbaijan', name: 'Azerbaijan', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0, connections: 0, volatility: 0.05 }},
    { id: 'Sweden', name: 'Sweden', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.10, education: 0.10, health: 0.10, connections: 0, volatility: -0.05 }},
    { id: 'Honduras', name: 'Honduras', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.05, volatility: 0.10 }},
    { id: 'UAE', name: 'United Arab Emirates', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.12, education: 0.03, health: 0.05, connections: -0.03, volatility: 0.02 }},
    { id: 'Hungary', name: 'Hungary', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.02, connections: 0.02, volatility: 0.02 }},
    { id: 'Tajikistan', name: 'Tajikistan', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.02, health: -0.03, connections: 0.03, volatility: 0.05 }},
    { id: 'Belarus', name: 'Belarus', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0, education: 0.05, health: 0, connections: 0, volatility: 0.05 }},
    { id: 'Austria', name: 'Austria', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.10, education: 0.08, health: 0.10, connections: 0.02, volatility: -0.05 }},
    { id: 'Papua_New_Guinea', name: 'Papua New Guinea', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.08, health: -0.05, connections: 0.05, volatility: 0.08 }},
    { id: 'Serbia', name: 'Serbia', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0, education: 0.03, health: 0, connections: 0.03, volatility: 0.03 }},
    { id: 'Israel', name: 'Israel', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.05, education: 0.08, health: 0.08, connections: 0.02, volatility: 0.08 }},
    { id: 'Switzerland', name: 'Switzerland', incomeLevel: 'high', populationScale: 'medium',
      baselineModifiers: { wealth: 0.15, education: 0.10, health: 0.12, connections: 0, volatility: -0.08 }},
    { id: 'Togo', name: 'Togo', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.08, education: -0.08, health: -0.08, connections: 0.03, volatility: 0.05 }},
    { id: 'Sierra_Leone', name: 'Sierra Leone', incomeLevel: 'low', populationScale: 'medium',
      baselineModifiers: { wealth: -0.10, education: -0.10, health: -0.10, connections: 0.03, volatility: 0.10 }},
    { id: 'Laos', name: 'Laos', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.02, volatility: 0.03 }},
    { id: 'Paraguay', name: 'Paraguay', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.02, education: -0.03, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Libya', name: 'Libya', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0, education: -0.03, health: -0.03, connections: 0.02, volatility: 0.15 }},
    { id: 'Bulgaria', name: 'Bulgaria', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0.02, education: 0.03, health: 0, connections: 0.02, volatility: 0.02 }},
    { id: 'Lebanon', name: 'Lebanon', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: 0.03, health: 0, connections: 0.05, volatility: 0.12 }},
    { id: 'Nicaragua', name: 'Nicaragua', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.03, volatility: 0.08 }},
    { id: 'Kyrgyzstan', name: 'Kyrgyzstan', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.03, education: 0, health: -0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'El_Salvador', name: 'El Salvador', incomeLevel: 'lower-middle', populationScale: 'medium',
      baselineModifiers: { wealth: -0.03, education: -0.03, health: -0.02, connections: 0.05, volatility: 0.10 }},
    { id: 'Turkmenistan', name: 'Turkmenistan', incomeLevel: 'upper-middle', populationScale: 'medium',
      baselineModifiers: { wealth: 0, education: 0, health: -0.02, connections: -0.02, volatility: 0.05 }},
    { id: 'Singapore', name: 'Singapore', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.15, education: 0.12, health: 0.12, connections: -0.02, volatility: -0.08 }},
    { id: 'Denmark', name: 'Denmark', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.12, education: 0.10, health: 0.10, connections: 0.02, volatility: -0.08 }},
    { id: 'Finland', name: 'Finland', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.10, education: 0.12, health: 0.10, connections: 0, volatility: -0.08 }},
    { id: 'Slovakia', name: 'Slovakia', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.03, connections: 0.02, volatility: 0 }},
    { id: 'Norway', name: 'Norway', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.15, education: 0.10, health: 0.12, connections: 0, volatility: -0.10 }},
    { id: 'Oman', name: 'Oman', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.05, education: 0.02, health: 0.03, connections: 0, volatility: 0 }},
    { id: 'State_of_Palestine', name: 'Palestine', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.08, education: 0, health: -0.05, connections: 0.05, volatility: 0.12 }},
    { id: 'Costa_Rica', name: 'Costa Rica', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0.03, connections: 0.03, volatility: 0.02 }},
    { id: 'Liberia', name: 'Liberia', incomeLevel: 'low', populationScale: 'small',
      baselineModifiers: { wealth: -0.10, education: -0.10, health: -0.10, connections: 0.03, volatility: 0.10 }},
    { id: 'Ireland', name: 'Ireland', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.10, education: 0.08, health: 0.08, connections: 0.05, volatility: 0 }},
    { id: 'Central_African_Republic', name: 'Central African Republic', incomeLevel: 'low', populationScale: 'small',
      baselineModifiers: { wealth: -0.12, education: -0.12, health: -0.12, connections: 0.02, volatility: 0.15 }},
    { id: 'New_Zealand', name: 'New Zealand', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.08, education: 0.08, health: 0.10, connections: 0.02, volatility: -0.05 }},
    { id: 'Mauritania', name: 'Mauritania', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.05, education: -0.08, health: -0.05, connections: 0.02, volatility: 0.08 }},
    { id: 'Panama', name: 'Panama', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0, health: 0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Kuwait', name: 'Kuwait', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.12, education: 0.03, health: 0.05, connections: -0.02, volatility: 0.03 }},
    { id: 'Croatia', name: 'Croatia', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.03, connections: 0.03, volatility: 0 }},
    { id: 'Moldova', name: 'Moldova', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.03, education: 0.02, health: -0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Georgia', name: 'Georgia', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.02, education: 0.03, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Eritrea', name: 'Eritrea', incomeLevel: 'low', populationScale: 'small',
      baselineModifiers: { wealth: -0.12, education: -0.10, health: -0.10, connections: 0.02, volatility: 0.12 }},
    { id: 'Uruguay', name: 'Uruguay', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.05, connections: 0.03, volatility: 0.02 }},
    { id: 'Bosnia_and_Herzegovina', name: 'Bosnia and Herzegovina', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0, connections: 0.03, volatility: 0.03 }},
    { id: 'Mongolia', name: 'Mongolia', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.03, education: 0.02, health: -0.02, connections: 0.02, volatility: 0.05 }},
    { id: 'Armenia', name: 'Armenia', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.02, education: 0.05, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Jamaica', name: 'Jamaica', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0, connections: 0.05, volatility: 0.08 }},
    { id: 'Qatar', name: 'Qatar', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.15, education: 0.03, health: 0.05, connections: -0.05, volatility: 0.02 }},
    { id: 'Albania', name: 'Albania', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Lithuania', name: 'Lithuania', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.02, connections: 0.02, volatility: 0 }},
    { id: 'Namibia', name: 'Namibia', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.03, education: -0.02, health: -0.03, connections: 0.02, volatility: 0.08 }},
    { id: 'Gambia', name: 'Gambia', incomeLevel: 'low', populationScale: 'small',
      baselineModifiers: { wealth: -0.10, education: -0.08, health: -0.08, connections: 0.05, volatility: 0.05 }},
    { id: 'Botswana', name: 'Botswana', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: 0, health: -0.03, connections: 0.02, volatility: 0.03 }},
    { id: 'Gabon', name: 'Gabon', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: -0.03, health: -0.02, connections: 0.02, volatility: 0.05 }},
    { id: 'Lesotho', name: 'Lesotho', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.08, education: -0.05, health: -0.10, connections: 0.03, volatility: 0.05 }},
    { id: 'North_Macedonia', name: 'North Macedonia', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0, connections: 0.03, volatility: 0.03 }},
    { id: 'Slovenia', name: 'Slovenia', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.05, education: 0.08, health: 0.05, connections: 0.02, volatility: -0.03 }},
    { id: 'Guinea_Bissau', name: 'Guinea-Bissau', incomeLevel: 'low', populationScale: 'small',
      baselineModifiers: { wealth: -0.12, education: -0.12, health: -0.10, connections: 0.03, volatility: 0.12 }},
    { id: 'Latvia', name: 'Latvia', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.02, connections: 0.02, volatility: 0 }},
    { id: 'Bahrain', name: 'Bahrain', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.08, education: 0.03, health: 0.05, connections: 0, volatility: 0.03 }},
    { id: 'Equatorial_Guinea', name: 'Equatorial Guinea', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0, education: -0.05, health: -0.05, connections: 0, volatility: 0.10 }},
    { id: 'Trinidad_and_Tobago', name: 'Trinidad and Tobago', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.02, education: 0.02, health: 0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Estonia', name: 'Estonia', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.05, education: 0.08, health: 0.03, connections: 0, volatility: -0.03 }},
    { id: 'Timor_Leste', name: 'Timor-Leste', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.08, education: -0.08, health: -0.05, connections: 0.03, volatility: 0.08 }},
    { id: 'Mauritius', name: 'Mauritius', incomeLevel: 'upper-middle', populationScale: 'small',
      baselineModifiers: { wealth: 0.02, education: 0.03, health: 0.03, connections: 0.02, volatility: 0 }},
    { id: 'Cyprus', name: 'Cyprus', incomeLevel: 'high', populationScale: 'small',
      baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.05, connections: 0.03, volatility: 0.03 }},
    { id: 'Eswatini', name: 'Eswatini', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.10, connections: 0.02, volatility: 0.05 }},
    { id: 'Djibouti', name: 'Djibouti', incomeLevel: 'lower-middle', populationScale: 'small',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.05, connections: 0.02, volatility: 0.05 }},
    { id: 'Fiji', name: 'Fiji', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Comoros', name: 'Comoros', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.08, education: -0.08, health: -0.05, connections: 0.05, volatility: 0.05 }},
    { id: 'Guyana', name: 'Guyana', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: 0, education: -0.02, health: -0.02, connections: 0.05, volatility: 0.08 }},
    { id: 'Bhutan', name: 'Bhutan', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.03, education: -0.03, health: 0, connections: 0.02, volatility: 0 }},
    { id: 'Solomon_Islands', name: 'Solomon Islands', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.05, volatility: 0.05 }},
    { id: 'Montenegro', name: 'Montenegro', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0.02, connections: 0.05, volatility: 0.02 }},
    { id: 'Luxembourg', name: 'Luxembourg', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.15, education: 0.08, health: 0.10, connections: 0.02, volatility: -0.08 }},
    { id: 'Suriname', name: 'Suriname', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: -0.02, connections: 0.05, volatility: 0.08 }},
    { id: 'Cabo_Verde', name: 'Cabo Verde', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.03, education: 0, health: 0, connections: 0.05, volatility: 0.02 }},
    { id: 'Maldives', name: 'Maldives', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: 0, education: 0.02, health: 0.02, connections: 0.03, volatility: 0.05 }},
    { id: 'Malta', name: 'Malta', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.05, education: 0.05, health: 0.08, connections: 0.05, volatility: -0.03 }},
    { id: 'Brunei', name: 'Brunei', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.10, education: 0.03, health: 0.05, connections: 0, volatility: -0.03 }},
    { id: 'Belize', name: 'Belize', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.02, education: -0.02, health: 0, connections: 0.05, volatility: 0.05 }},
    { id: 'Bahamas', name: 'Bahamas', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.05, education: 0.02, health: 0.03, connections: 0.03, volatility: 0.05 }},
    { id: 'Iceland', name: 'Iceland', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.10, education: 0.10, health: 0.12, connections: 0.05, volatility: -0.08 }},
    { id: 'Vanuatu', name: 'Vanuatu', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.05, education: -0.05, health: -0.03, connections: 0.08, volatility: 0.05 }},
    { id: 'Barbados', name: 'Barbados', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.03, education: 0.05, health: 0.05, connections: 0.05, volatility: 0.02 }},
    { id: 'Sao_Tome_and_Principe', name: 'Sao Tome and Principe', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.05, education: -0.03, health: -0.03, connections: 0.05, volatility: 0.03 }},
    { id: 'Samoa', name: 'Samoa', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.03, education: 0, health: 0, connections: 0.08, volatility: 0.02 }},
    { id: 'Saint_Lucia', name: 'Saint Lucia', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: 0, education: 0, health: 0.02, connections: 0.05, volatility: 0.03 }},
    { id: 'Kiribati', name: 'Kiribati', incomeLevel: 'lower-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.08, education: -0.05, health: -0.03, connections: 0.08, volatility: 0.08 }},
    { id: 'Grenada', name: 'Grenada', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: 0, education: 0, health: 0.02, connections: 0.08, volatility: 0.03 }},
    { id: 'Saint_Vincent_and_Grenadines', name: 'Saint Vincent', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0, connections: 0.08, volatility: 0.03 }},
    { id: 'Tonga', name: 'Tonga', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.03, education: 0, health: 0, connections: 0.10, volatility: 0.02 }},
    { id: 'Seychelles', name: 'Seychelles', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.03, education: 0.03, health: 0.05, connections: 0.05, volatility: 0.02 }},
    { id: 'Antigua_and_Barbuda', name: 'Antigua and Barbuda', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.03, education: 0.02, health: 0.03, connections: 0.05, volatility: 0.03 }},
    { id: 'Dominica', name: 'Dominica', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.02, education: 0, health: 0.02, connections: 0.08, volatility: 0.05 }},
    { id: 'Saint_Kitts_and_Nevis', name: 'Saint Kitts and Nevis', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.03, education: 0.02, health: 0.03, connections: 0.05, volatility: 0.02 }},
    { id: 'San_Marino', name: 'San Marino', incomeLevel: 'high', populationScale: 'tiny',
      baselineModifiers: { wealth: 0.10, education: 0.08, health: 0.10, connections: 0.08, volatility: -0.08 }},
    { id: 'Tuvalu', name: 'Tuvalu', incomeLevel: 'upper-middle', populationScale: 'tiny',
      baselineModifiers: { wealth: -0.05, education: -0.02, health: 0, connections: 0.12, volatility: 0.05 }}
];

// Get country by ID
export function getCountryById(id) {
    return countries.find(c => c.id === id);
}

// Get all countries with a specific income level
export function getCountriesByIncomeLevel(level) {
    return countries.filter(c => c.incomeLevel === level);
}

// Select a random country weighted by population
export function selectWeightedCountry(countryList) {
    if (!countryList || countryList.length === 0) return null;

    // Calculate total weight
    let totalWeight = 0;
    const weights = countryList.map(country => {
        const weight = POPULATION_WEIGHTS[country.populationScale] || 1;
        totalWeight += weight;
        return weight;
    });

    // Select randomly based on weight
    let random = Math.random() * totalWeight;
    for (let i = 0; i < countryList.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return countryList[i];
        }
    }

    return countryList[countryList.length - 1];
}

// Get baseline modifiers adjusted by income level
export function getCountryModifiers(country) {
    const incomeModifiers = INCOME_LEVELS[country.incomeLevel] || {};
    const baseModifiers = country.baselineModifiers || {};

    return {
        wealth: (baseModifiers.wealth || 0) + (incomeModifiers.wealthBias || 0),
        education: (baseModifiers.education || 0) + (incomeModifiers.educationBias || 0),
        health: (baseModifiers.health || 0) + (incomeModifiers.healthBias || 0),
        connections: baseModifiers.connections || 0,
        volatility: baseModifiers.volatility || 0
    };
}

// Validate all countries have required fields
export function validateCountries() {
    const warnings = [];

    countries.forEach(country => {
        if (!country.id) warnings.push(`Country missing id`);
        if (!country.name) warnings.push(`Country ${country.id} missing name`);
        if (!country.incomeLevel) warnings.push(`Country ${country.id} missing incomeLevel`);
        if (!country.populationScale) warnings.push(`Country ${country.id} missing populationScale`);
        if (!country.baselineModifiers) warnings.push(`Country ${country.id} missing baselineModifiers`);

        // Check modifier bounds
        if (country.baselineModifiers) {
            const mods = country.baselineModifiers;
            Object.entries(mods).forEach(([key, value]) => {
                if (Math.abs(value) > 0.15) {
                    warnings.push(`Country ${country.id} has ${key} modifier ${value} outside bounds`);
                }
            });
        }
    });

    // Check UK is present
    if (!getCountryById('UK')) {
        warnings.push('UK must be present in country list');
    }

    if (warnings.length > 0) {
        console.warn('Country validation warnings:', warnings);
    }

    return warnings.length === 0;
}
