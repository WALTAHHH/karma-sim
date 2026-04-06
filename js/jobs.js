// Job categories and jobs data
// Jobs are organized into unlockable categories with era-specific availability

export const JOB_CATEGORY_UNLOCK_COST = 8;
export const DEFAULT_JOB_CATEGORIES = ['agriculture', 'labor'];

export const jobCategories = [
    // Default categories (unlocked at start)
    {
        id: 'agriculture',
        name: 'Agriculture',
        description: 'Working the land and raising livestock'
    },
    {
        id: 'labor',
        name: 'Labor',
        description: 'Manual and industrial work'
    },
    // Unlockable categories
    {
        id: 'services',
        name: 'Services',
        description: 'Trade, hospitality, and domestic work'
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Learned professions requiring education'
    },
    {
        id: 'creative',
        name: 'Creative & Arts',
        description: 'Arts, performance, and media'
    },
    {
        id: 'military',
        name: 'Military & Government',
        description: 'Service to state and nation'
    },
    {
        id: 'maritime',
        name: 'Maritime & Transport',
        description: 'Ships, roads, and moving goods'
    },
    {
        id: 'religious',
        name: 'Religious & Spiritual',
        description: 'Faith, healing, and contemplation'
    },
    {
        id: 'science',
        name: 'Science & Academia',
        description: 'Research, discovery, and knowledge'
    },
    {
        id: 'commerce',
        name: 'Commerce & Finance',
        description: 'Trade, banking, and enterprise'
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Healing and caring for others'
    },
    {
        id: 'law',
        name: 'Law & Justice',
        description: 'Maintaining order and justice'
    }
];

export const jobs = [
    // ============================================
    // AGRICULTURE (Default)
    // ============================================
    {
        id: 'farmer',
        name: 'Farmer',
        category: 'agriculture',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0, health: 0.05, connections: 0.05 },
        description: 'Working your own land'
    },
    {
        id: 'farm_laborer',
        name: 'Farm Laborer',
        category: 'agriculture',
        eras: ['all'],
        requirements: { wealth: '<3' },
        modifiers: { wealth: -0.05, health: 0.05 },
        description: 'Working others\' land'
    },
    {
        id: 'plantation_worker',
        name: 'Plantation Worker',
        category: 'agriculture',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: { wealth: '<3' },
        modifiers: { wealth: -0.10, health: -0.10 },
        description: 'Grueling agricultural labor'
    },
    {
        id: 'shepherd',
        name: 'Shepherd',
        category: 'agriculture',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: -0.05, health: 0.10, connections: -0.05 },
        description: 'Tending flocks in isolation'
    },
    {
        id: 'fisherman',
        name: 'Fisherman',
        category: 'agriculture',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0, health: 0.05 },
        description: 'Harvesting from the waters'
    },
    {
        id: 'rancher',
        name: 'Rancher',
        category: 'agriculture',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { wealth: '>2' },
        modifiers: { wealth: 0.10, health: 0.05 },
        description: 'Raising livestock on a large scale'
    },
    {
        id: 'vineyard_worker',
        name: 'Vineyard Worker',
        category: 'agriculture',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0, health: 0.05, connections: 0.05 },
        description: 'Cultivating grapes for wine'
    },
    {
        id: 'agricultural_scientist',
        name: 'Agricultural Scientist',
        category: 'agriculture',
        eras: ['cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.05, health: 0.05 },
        description: 'Improving farming through science'
    },

    // ============================================
    // LABOR (Default)
    // ============================================
    {
        id: 'factory_worker',
        name: 'Factory Worker',
        category: 'labor',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, health: -0.05 },
        description: 'Industrial manufacturing'
    },
    {
        id: 'craftsman',
        name: 'Craftsman',
        category: 'labor',
        eras: ['all'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.05, education: 0.05 },
        description: 'Skilled trade work'
    },
    {
        id: 'miner',
        name: 'Miner',
        category: 'labor',
        eras: ['industrial_revolution', 'early_modern', 'cold_war'],
        requirements: null,
        modifiers: { wealth: 0.05, health: -0.15 },
        description: 'Extracting resources from the earth'
    },
    {
        id: 'construction',
        name: 'Construction Worker',
        category: 'labor',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0.05, health: -0.05 },
        description: 'Building structures'
    },
    {
        id: 'blacksmith',
        name: 'Blacksmith',
        category: 'labor',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.10, health: -0.05, connections: 0.05 },
        description: 'Forging metal goods'
    },
    {
        id: 'weaver',
        name: 'Weaver',
        category: 'labor',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: null,
        modifiers: { wealth: 0, health: -0.05 },
        description: 'Creating textiles'
    },
    {
        id: 'mill_worker',
        name: 'Mill Worker',
        category: 'labor',
        eras: ['industrial_revolution', 'early_modern'],
        requirements: null,
        modifiers: { wealth: 0, health: -0.10 },
        description: 'Operating industrial mills'
    },
    {
        id: 'dockworker',
        name: 'Dockworker',
        category: 'labor',
        eras: ['all'],
        requirements: { health: '>2' },
        modifiers: { wealth: 0.05, health: -0.05, connections: 0.05 },
        description: 'Loading and unloading ships'
    },
    {
        id: 'electrician',
        name: 'Electrician',
        category: 'labor',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.10, education: 0.05 },
        description: 'Working with electrical systems'
    },
    {
        id: 'plumber',
        name: 'Plumber',
        category: 'labor',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.10, health: 0 },
        description: 'Installing and maintaining pipes'
    },
    {
        id: 'mechanic',
        name: 'Mechanic',
        category: 'labor',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.10, education: 0.05 },
        description: 'Repairing machines and vehicles'
    },

    // ============================================
    // SERVICES
    // ============================================
    {
        id: 'merchant',
        name: 'Merchant',
        category: 'services',
        eras: ['all'],
        requirements: { connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.05 },
        description: 'Buying and selling goods'
    },
    {
        id: 'domestic_servant',
        name: 'Domestic Servant',
        category: 'services',
        eras: ['pre_industrial', 'industrial_revolution', 'early_modern'],
        requirements: { wealth: '<3' },
        modifiers: { wealth: -0.05, connections: 0.05 },
        description: 'Service in a household'
    },
    {
        id: 'retail_worker',
        name: 'Retail Worker',
        category: 'services',
        eras: ['cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0, connections: 0.05 },
        description: 'Working in shops and stores'
    },
    {
        id: 'innkeeper',
        name: 'Innkeeper',
        category: 'services',
        eras: ['pre_industrial', 'industrial_revolution', 'early_modern'],
        requirements: { wealth: '>2' },
        modifiers: { wealth: 0.05, connections: 0.10 },
        description: 'Running a place of lodging'
    },
    {
        id: 'cook',
        name: 'Cook',
        category: 'services',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0, health: 0.05, connections: 0.05 },
        description: 'Preparing food for others'
    },
    {
        id: 'barber',
        name: 'Barber',
        category: 'services',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.10 },
        description: 'Cutting hair and grooming'
    },
    {
        id: 'tailor',
        name: 'Tailor',
        category: 'services',
        eras: ['all'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Making and altering clothing'
    },
    {
        id: 'hotel_worker',
        name: 'Hotel Worker',
        category: 'services',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0, connections: 0.05 },
        description: 'Hospitality industry work'
    },
    {
        id: 'restaurant_owner',
        name: 'Restaurant Owner',
        category: 'services',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { wealth: '>3', connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10, health: -0.05 },
        description: 'Running an eating establishment'
    },
    {
        id: 'tour_guide',
        name: 'Tour Guide',
        category: 'services',
        eras: ['cold_war', 'contemporary'],
        requirements: { education: '>2', connections: '>2' },
        modifiers: { wealth: 0.05, connections: 0.10 },
        description: 'Showing visitors around'
    },

    // ============================================
    // PROFESSIONAL
    // ============================================
    {
        id: 'doctor',
        name: 'Doctor',
        category: 'professional',
        eras: ['all'],
        requirements: { education: '>3', wealth: '>2' },
        modifiers: { wealth: 0.15, education: 0.10, health: 0.05 },
        description: 'Practicing medicine'
    },
    {
        id: 'lawyer',
        name: 'Lawyer',
        category: 'professional',
        eras: ['all'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.15, connections: 0.10 },
        description: 'Practicing law'
    },
    {
        id: 'teacher',
        name: 'Teacher',
        category: 'professional',
        eras: ['all'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0, education: 0.10, connections: 0.05 },
        description: 'Educating others'
    },
    {
        id: 'engineer',
        name: 'Engineer',
        category: 'professional',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.05 },
        description: 'Designing and building systems'
    },
    {
        id: 'software_developer',
        name: 'Software Developer',
        category: 'professional',
        eras: ['contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.15, health: -0.05 },
        description: 'Writing code'
    },
    {
        id: 'architect',
        name: 'Architect',
        category: 'professional',
        eras: ['all'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.05, connections: 0.05 },
        description: 'Designing buildings'
    },
    {
        id: 'accountant',
        name: 'Accountant',
        category: 'professional',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.10, education: 0.05 },
        description: 'Managing finances and records'
    },
    {
        id: 'journalist',
        name: 'Journalist',
        category: 'professional',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.05, connections: 0.10, education: 0.05 },
        description: 'Reporting news and stories'
    },
    {
        id: 'consultant',
        name: 'Consultant',
        category: 'professional',
        eras: ['cold_war', 'contemporary'],
        requirements: { education: '>3', connections: '>3' },
        modifiers: { wealth: 0.15, connections: 0.05 },
        description: 'Advising businesses and organizations'
    },

    // ============================================
    // CREATIVE & ARTS
    // ============================================
    {
        id: 'musician',
        name: 'Musician',
        category: 'creative',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: -0.05, connections: 0.10 },
        description: 'Making music'
    },
    {
        id: 'writer',
        name: 'Writer',
        category: 'creative',
        eras: ['all'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0, education: 0.05 },
        description: 'Writing stories and ideas'
    },
    {
        id: 'traveling_performer',
        name: 'Traveling Performer',
        category: 'creative',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: null,
        modifiers: { wealth: -0.10, connections: 0.10, health: -0.05 },
        description: 'Entertaining on the road'
    },
    {
        id: 'actor',
        name: 'Actor',
        category: 'creative',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.15 },
        description: 'Performing on stage or screen',
        historicalAnalogue: 'traveling_performer'
    },
    {
        id: 'content_creator',
        name: 'Content Creator',
        category: 'creative',
        eras: ['contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.10 },
        description: 'Creating digital media',
        historicalAnalogue: 'writer'
    },
    {
        id: 'painter',
        name: 'Painter',
        category: 'creative',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: -0.05, education: 0.05, connections: 0.05 },
        description: 'Creating visual art'
    },
    {
        id: 'sculptor',
        name: 'Sculptor',
        category: 'creative',
        eras: ['all'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0, education: 0.05, health: -0.05 },
        description: 'Shaping stone and metal'
    },
    {
        id: 'photographer',
        name: 'Photographer',
        category: 'creative',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Capturing images'
    },
    {
        id: 'film_director',
        name: 'Film Director',
        category: 'creative',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2', connections: '>3' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Creating motion pictures'
    },
    {
        id: 'dancer',
        name: 'Dancer',
        category: 'creative',
        eras: ['all'],
        requirements: { health: '>3' },
        modifiers: { wealth: 0, health: -0.05, connections: 0.10 },
        description: 'Performing through movement'
    },
    {
        id: 'composer',
        name: 'Composer',
        category: 'creative',
        eras: ['all'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.05, education: 0.05 },
        description: 'Writing music'
    },

    // ============================================
    // MILITARY & GOVERNMENT
    // ============================================
    {
        id: 'soldier',
        name: 'Soldier',
        category: 'military',
        eras: ['all'],
        requirements: { health: '>2' },
        modifiers: { health: -0.10, connections: 0.05 },
        description: 'Military service'
    },
    {
        id: 'officer',
        name: 'Military Officer',
        category: 'military',
        eras: ['all'],
        requirements: { education: '>2', connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10, health: -0.05 },
        description: 'Leading troops'
    },
    {
        id: 'civil_servant',
        name: 'Civil Servant',
        category: 'military',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Government administration'
    },
    {
        id: 'diplomat',
        name: 'Diplomat',
        category: 'military',
        eras: ['all'],
        requirements: { education: '>3', connections: '>3' },
        modifiers: { wealth: 0.10, connections: 0.15, education: 0.05 },
        description: 'Representing your nation abroad'
    },
    {
        id: 'spy',
        name: 'Intelligence Officer',
        category: 'military',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2', connections: '>2' },
        modifiers: { wealth: 0.05, connections: 0.10, health: -0.10 },
        description: 'Gathering secrets'
    },
    {
        id: 'naval_officer',
        name: 'Naval Officer',
        category: 'military',
        eras: ['all'],
        requirements: { education: '>2', health: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10, health: -0.05 },
        description: 'Commanding at sea'
    },
    {
        id: 'politician',
        name: 'Politician',
        category: 'military',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { connections: '>3', wealth: '>2' },
        modifiers: { wealth: 0.10, connections: 0.15 },
        description: 'Seeking and holding office'
    },

    // ============================================
    // MARITIME & TRANSPORT
    // ============================================
    {
        id: 'sailor',
        name: 'Sailor',
        category: 'maritime',
        eras: ['all'],
        requirements: { health: '>2' },
        modifiers: { wealth: 0.05, health: -0.10, connections: 0.05 },
        description: 'Working aboard ships'
    },
    {
        id: 'ship_captain',
        name: 'Ship Captain',
        category: 'maritime',
        eras: ['all'],
        requirements: { education: '>2', health: '>2' },
        modifiers: { wealth: 0.15, connections: 0.10, health: -0.05 },
        description: 'Commanding a vessel'
    },
    {
        id: 'coachman',
        name: 'Coachman',
        category: 'maritime',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Driving horse-drawn carriages'
    },
    {
        id: 'train_conductor',
        name: 'Train Conductor',
        category: 'maritime',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Operating trains'
    },
    {
        id: 'truck_driver',
        name: 'Truck Driver',
        category: 'maritime',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0.05, health: -0.05 },
        description: 'Hauling goods by road'
    },
    {
        id: 'pilot',
        name: 'Pilot',
        category: 'maritime',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3', health: '>3' },
        modifiers: { wealth: 0.15, health: 0.05 },
        description: 'Flying aircraft'
    },
    {
        id: 'longshoreman',
        name: 'Longshoreman',
        category: 'maritime',
        eras: ['all'],
        requirements: { health: '>2' },
        modifiers: { wealth: 0.05, health: -0.05 },
        description: 'Loading cargo at ports'
    },
    {
        id: 'taxi_driver',
        name: 'Taxi Driver',
        category: 'maritime',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: null,
        modifiers: { wealth: 0, connections: 0.05 },
        description: 'Driving passengers for hire'
    },

    // ============================================
    // RELIGIOUS & SPIRITUAL
    // ============================================
    {
        id: 'priest',
        name: 'Priest',
        category: 'religious',
        eras: ['all'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0, education: 0.05, connections: 0.15 },
        description: 'Leading religious services'
    },
    {
        id: 'monk',
        name: 'Monk',
        category: 'religious',
        eras: ['pre_industrial', 'industrial_revolution', 'early_modern'],
        requirements: null,
        modifiers: { wealth: -0.10, education: 0.10, health: 0.05, connections: -0.10 },
        description: 'Life of contemplation and prayer'
    },
    {
        id: 'missionary',
        name: 'Missionary',
        category: 'religious',
        eras: ['all'],
        requirements: { education: '>1' },
        modifiers: { wealth: -0.05, education: 0.05, connections: 0.10, health: -0.10 },
        description: 'Spreading faith to distant lands'
    },
    {
        id: 'healer',
        name: 'Folk Healer',
        category: 'religious',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: null,
        modifiers: { wealth: 0, health: 0.05, connections: 0.10 },
        description: 'Traditional medicine and remedies'
    },
    {
        id: 'chaplain',
        name: 'Chaplain',
        category: 'religious',
        eras: ['all'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.05, connections: 0.10, health: -0.05 },
        description: 'Spiritual guidance in institutions'
    },
    {
        id: 'theologian',
        name: 'Theologian',
        category: 'religious',
        eras: ['all'],
        requirements: { education: '>4' },
        modifiers: { wealth: 0.05, education: 0.15, connections: 0.05 },
        description: 'Studying religious texts and doctrine'
    },

    // ============================================
    // SCIENCE & ACADEMIA
    // ============================================
    {
        id: 'professor',
        name: 'Professor',
        category: 'science',
        eras: ['all'],
        requirements: { education: '>4' },
        modifiers: { wealth: 0.05, education: 0.15, connections: 0.10 },
        description: 'Teaching at a university'
    },
    {
        id: 'researcher',
        name: 'Researcher',
        category: 'science',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.05, education: 0.15 },
        description: 'Pursuing scientific discovery'
    },
    {
        id: 'naturalist',
        name: 'Naturalist',
        category: 'science',
        eras: ['pre_industrial', 'industrial_revolution', 'early_modern'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0, education: 0.10, health: 0.05 },
        description: 'Studying the natural world'
    },
    {
        id: 'astronomer',
        name: 'Astronomer',
        category: 'science',
        eras: ['all'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0, education: 0.15 },
        description: 'Studying the stars'
    },
    {
        id: 'chemist',
        name: 'Chemist',
        category: 'science',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.10, health: -0.05 },
        description: 'Working with chemicals and compounds'
    },
    {
        id: 'biologist',
        name: 'Biologist',
        category: 'science',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.05, education: 0.10 },
        description: 'Studying living things'
    },
    {
        id: 'physicist',
        name: 'Physicist',
        category: 'science',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>4' },
        modifiers: { wealth: 0.05, education: 0.15 },
        description: 'Understanding the laws of nature'
    },
    {
        id: 'data_scientist',
        name: 'Data Scientist',
        category: 'science',
        eras: ['contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.15, education: 0.05 },
        description: 'Analyzing large datasets'
    },
    {
        id: 'librarian',
        name: 'Librarian',
        category: 'science',
        eras: ['all'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0, education: 0.10, connections: 0.05 },
        description: 'Curating knowledge and books'
    },

    // ============================================
    // COMMERCE & FINANCE
    // ============================================
    {
        id: 'banker',
        name: 'Banker',
        category: 'commerce',
        eras: ['all'],
        requirements: { education: '>2', wealth: '>3' },
        modifiers: { wealth: 0.15, connections: 0.10 },
        description: 'Managing money and lending'
    },
    {
        id: 'trader',
        name: 'Trader',
        category: 'commerce',
        eras: ['all'],
        requirements: { connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Buying and selling for profit'
    },
    {
        id: 'investor',
        name: 'Investor',
        category: 'commerce',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { wealth: '>4' },
        modifiers: { wealth: 0.20, health: -0.05 },
        description: 'Making money work for you'
    },
    {
        id: 'entrepreneur',
        name: 'Entrepreneur',
        category: 'commerce',
        eras: ['all'],
        requirements: { connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10, health: -0.05 },
        description: 'Starting businesses'
    },
    {
        id: 'insurance_agent',
        name: 'Insurance Agent',
        category: 'commerce',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Selling protection against risk'
    },
    {
        id: 'real_estate',
        name: 'Real Estate Agent',
        category: 'commerce',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { connections: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Buying and selling property'
    },
    {
        id: 'stockbroker',
        name: 'Stockbroker',
        category: 'commerce',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2', connections: '>2' },
        modifiers: { wealth: 0.15, connections: 0.05, health: -0.05 },
        description: 'Trading on exchanges'
    },

    // ============================================
    // HEALTHCARE
    // ============================================
    {
        id: 'nurse',
        name: 'Nurse',
        category: 'healthcare',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.05, health: 0.05, connections: 0.05 },
        description: 'Caring for the sick'
    },
    {
        id: 'midwife',
        name: 'Midwife',
        category: 'healthcare',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0, connections: 0.10 },
        description: 'Helping bring life into the world'
    },
    {
        id: 'surgeon',
        name: 'Surgeon',
        category: 'healthcare',
        eras: ['all'],
        requirements: { education: '>4', health: '>2' },
        modifiers: { wealth: 0.20, education: 0.10, health: -0.05 },
        description: 'Operating to heal'
    },
    {
        id: 'pharmacist',
        name: 'Pharmacist',
        category: 'healthcare',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.05 },
        description: 'Dispensing medicines'
    },
    {
        id: 'dentist',
        name: 'Dentist',
        category: 'healthcare',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.15, education: 0.05 },
        description: 'Caring for teeth'
    },
    {
        id: 'paramedic',
        name: 'Paramedic',
        category: 'healthcare',
        eras: ['cold_war', 'contemporary'],
        requirements: { education: '>2', health: '>2' },
        modifiers: { wealth: 0.05, health: -0.05, connections: 0.05 },
        description: 'Emergency medical response'
    },
    {
        id: 'therapist',
        name: 'Therapist',
        category: 'healthcare',
        eras: ['early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, education: 0.05, connections: 0.05 },
        description: 'Healing minds'
    },
    {
        id: 'apothecary',
        name: 'Apothecary',
        category: 'healthcare',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: { education: '>1' },
        modifiers: { wealth: 0.05, education: 0.05, connections: 0.05 },
        description: 'Preparing medicines and remedies'
    },

    // ============================================
    // LAW & JUSTICE
    // ============================================
    {
        id: 'judge',
        name: 'Judge',
        category: 'law',
        eras: ['all'],
        requirements: { education: '>4', connections: '>3' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Administering justice'
    },
    {
        id: 'police_officer',
        name: 'Police Officer',
        category: 'law',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { health: '>2' },
        modifiers: { wealth: 0.05, connections: 0.05, health: -0.10 },
        description: 'Enforcing the law'
    },
    {
        id: 'detective',
        name: 'Detective',
        category: 'law',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { education: '>2' },
        modifiers: { wealth: 0.10, connections: 0.10, health: -0.05 },
        description: 'Investigating crimes'
    },
    {
        id: 'town_watchman',
        name: 'Town Watchman',
        category: 'law',
        eras: ['pre_industrial', 'industrial_revolution'],
        requirements: null,
        modifiers: { wealth: 0, connections: 0.05, health: -0.05 },
        description: 'Keeping the peace at night'
    },
    {
        id: 'prosecutor',
        name: 'Prosecutor',
        category: 'law',
        eras: ['all'],
        requirements: { education: '>3' },
        modifiers: { wealth: 0.10, connections: 0.10 },
        description: 'Seeking justice in court'
    },
    {
        id: 'prison_guard',
        name: 'Prison Guard',
        category: 'law',
        eras: ['industrial_revolution', 'early_modern', 'cold_war', 'contemporary'],
        requirements: { health: '>2' },
        modifiers: { wealth: 0.05, health: -0.05 },
        description: 'Watching over prisoners'
    },
    {
        id: 'bailiff',
        name: 'Bailiff',
        category: 'law',
        eras: ['all'],
        requirements: null,
        modifiers: { wealth: 0.05, connections: 0.05 },
        description: 'Court officer and enforcer'
    }
];

// Get a job by ID
export function getJobById(jobId) {
    return jobs.find(j => j.id === jobId);
}

// Get a category by ID
export function getCategoryById(categoryId) {
    return jobCategories.find(c => c.id === categoryId);
}

// Check if job meets requirements
function meetsJobRequirements(job, life) {
    if (!job.requirements) return true;

    for (const [stat, condition] of Object.entries(job.requirements)) {
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

// Get jobs available for a given era, unlocked categories, and life stats
export function getAvailableJobs(era, unlockedCategoryIds, life) {
    return jobs.filter(job => {
        // Check category is unlocked
        if (!unlockedCategoryIds.includes(job.category)) return false;

        // Check era availability
        if (job.eras[0] !== 'all' && !job.eras.includes(era.id)) return false;

        // Check requirements
        if (!meetsJobRequirements(job, life)) return false;

        return true;
    });
}

// Get historical analogue for a job in an earlier era
export function getHistoricalAnalogue(jobId, era) {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !job.historicalAnalogue) return null;

    const analogue = jobs.find(j => j.id === job.historicalAnalogue);
    if (analogue && (analogue.eras[0] === 'all' || analogue.eras.includes(era.id))) {
        return analogue;
    }
    return null;
}

// Get job modifiers
export function getJobModifiers(jobId) {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.modifiers : {};
}

// Get jobs count by category
export function getJobsCountByCategory(categoryId) {
    return jobs.filter(j => j.category === categoryId).length;
}

// Get contextual job categories based on birth circumstances
// These are "soft unlocks" that don't require karma - your circumstances open doors
export function getContextualJobCategories(life) {
    const contextual = [];
    
    // High wealth (4-5) opens commerce and services
    // Wealthy families have connections to business and can afford service careers
    if (life.wealth >= 4) {
        contextual.push('commerce', 'services');
    }
    
    // High education (4-5) opens professional and science careers
    // Education is required to enter learned professions
    if (life.education >= 4) {
        contextual.push('professional', 'science');
    }
    
    // Era-based unlocks - modern eras have more diverse job markets
    if (life.era && life.era.id) {
        const eraId = life.era.id;
        
        // Contemporary era - service economy dominates
        if (eraId === 'contemporary') {
            contextual.push('services', 'healthcare');
        }
        
        // Cold War era - growth of services and healthcare
        if (eraId === 'cold_war') {
            contextual.push('services');
        }
        
        // Early modern - some service sector growth
        if (eraId === 'early_modern') {
            contextual.push('services');
        }
        
        // Pre-industrial and industrial_revolution keep the default
        // agriculture/labor focus - no additional soft unlocks
    }
    
    // Moderate wealth (3) with connections (3+) opens services
    // Social connections help even without great wealth
    if (life.wealth >= 3 && life.connections >= 3) {
        contextual.push('services');
    }
    
    // Return unique categories
    return [...new Set(contextual)];
}
