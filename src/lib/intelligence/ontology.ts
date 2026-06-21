export const MOOD_GRAPH = {
    empowerment: {
        emotions: [
            "Confidence",
            "Self Belief",
            "Resilience",
        ],

        audiences: [
            "Ambitious Youth",
            "Entrepreneurs",
            "Athletes",
        ],

        culturalSignals: [
            "Success Culture",
            "Youth Culture",
        ],

        platforms: [
            "Instagram Reels",
            "TikTok",
        ],

        contentFormats: [
            "Storytelling Reel",
            "Motivation Clip",
            "Reaction Video",
        ]
    },

    inspiration: {
        emotions: [
            "Hope",
            "Motivation",
            "Optimism",
        ],

        audiences: [
            "Students",
            "Creators",
            "Professionals",
        ],

        culturalSignals: [
            "Growth Mindset",
            "Creator Economy",
        ],

        platforms: [
            "YouTube Shorts",
            "Instagram Reels",
        ],

        contentFormats: [
            "Motivation Clip",
            "Transformation Story",
            "Creator Journey",
        ]
    },

    nostalgia: {
        emotions: [
            "Reflection",
            "Sentimentality",
        ],

        audiences: [
            "Millennials",
            "Diaspora Audiences",
        ],

        culturalSignals: [
            "Memory Culture",
            "Community Identity",
        ],

        platforms: [
            "Spotify Playlists",
            "YouTube Shorts",
        ],

        contentFormats: [
            "Storytelling Reel",
            "Motivation Clip",
            "Reaction Video",
        ]
    },

    celebration: {
        emotions: [
            "Joy",
            "Energy",
            "Excitement",
        ],

        audiences: [
            "Party Goers",
            "Gen Z",
        ],

        culturalSignals: [
            "Social Sharing",
            "Lifestyle Culture",
        ],

        platforms: [
            "TikTok",
            "Instagram Reels",
            "Live Events",
        ],

        contentFormats: [
            "Reaction Video",
            "Dance Challenge",
            "Event Highlight",
        ]
    },

};

export const THEME_GRAPH = {
    identity: {
        archetypes: [
            "Identity Builders",
            "Creative Rebels",
        ],

        contentAngles: [
            "Self Expression",
            "Personal Story",
        ],

        culturalSignals: [
            "Youth Culture",
            "Self Expression",
        ],

        contentFormats: [
            "Personal Journey Reel",
            "Identity Story",
            "Creator POV",
        ],
    },

    friendship: {
        archetypes: [
            "Community Driven Fans",
        ],

        contentAngles: [
            "Friendship Stories",
            "Group Content",
        ],

        culturalSignals: [
            "Community Identity",
            "Belonging",
        ],

        contentFormats: [
            "Friendship Montage",
            "Group Challenge",
            "Best Friend Content",
        ],
    },

    ambition: {
        archetypes: [
            "High Performers",
            "Dream Chasers",
        ],

        contentAngles: [
            "Motivation",
            "Success Journey",
        ],

        culturalSignals: [
            "Success Culture",
            "Growth Mindset",
        ],

        contentFormats: [
            "Motivation Reel",
            "Transformation Story",
            "Success Journey",
        ],
    },

    love: {
        archetypes: [
            "Romantics",
            "Emotional Listeners",
        ],

        contentAngles: [
            "Relationship Stories",
            "Couple Content",
        ],

        culturalSignals: [
            "Lifestyle Culture",
            "Community Identity",
        ],

        contentFormats: [
            "Couple Reel",
            "Love Story",
            "Relationship POV",
        ],
    },

    heartbreak: {
        archetypes: [
            "Healing Seekers",
            "Reflective Listeners",
        ],

        contentAngles: [
            "Breakup Stories",
            "Personal Growth",
        ],

        culturalSignals: [
            "Memory Culture",
            "Reflection",
        ],

        contentFormats: [
            "Healing Journey",
            "Breakup Story",
            "Emotional Reflection",
        ],
    },
} as const;

export const PLATFORM_GRAPH = {
    "TikTok": {
        signals: [
            "energy",
            "celebration",
            "confidence",
            "humor",
        ],
    },

    "Instagram Reels": {
        signals: [
            "lifestyle",
            "identity",
            "motivation",
        ],
    },

    "YouTube Shorts": {
        signals: [
            "storytelling",
            "education",
            "motivation",
        ],
    },

    "Spotify Playlists": {
        signals: [
            "mood",
            "reflection",
            "ambient",
        ],
    },

    "Live Events": {
        signals: [
            "energy",
            "community",
            "celebration",
        ],
    },
};

export const AUDIENCE_GRAPH = {
    "High Performers": {
        interests: [
            "achievement",
            "performance",
            "success"
        ]
    },

    "Dream Chasers": {
        interests: [
            "ambition",
            "goals",
            "growth"
        ]
    },

    Romantics: {
        interests: [
            "relationships",
            "love",
            "connection"
        ]
    },

    "Emotional Listeners": {
        interests: [
            "feelings",
            "reflection",
            "storytelling"
        ]
    },

    "Healing Seekers": {
        interests: [
            "recovery",
            "growth",
            "wellbeing"
        ]
    },

    "Ambitious Youth": {
        interests: [
            "success",
            "self growth",
            "motivation",
        ],
    },

    "Identity Builders": {
        interests: [
            "self expression",
            "authenticity",
        ],
    },

    "Creative Rebels": {
        interests: [
            "creativity",
            "individuality",
        ],
    },

    "Community Driven Fans": {
        interests: [
            "belonging",
            "friendship",
        ],
    },

    "Reflective Listeners": {
        interests: [
            "nostalgia",
            "meaning",
        ],
    },

    Entrepreneurs: {
        interests: [
            "business",
            "leadership",
            "growth",
        ],
    },

    Athletes: {
        interests: [
            "performance",
            "discipline",
            "competition",
        ],
    },

    Students: {
        interests: [
            "learning",
            "career",
            "motivation",
        ],
    },

    Creators: {
        interests: [
            "content",
            "branding",
            "creativity",
        ],
    },

    Professionals: {
        interests: [
            "career growth",
            "productivity",
        ],
    },

    Millennials: {
        interests: [
            "nostalgia",
            "life milestones",
        ],
    },

    "Diaspora Audiences": {
        interests: [
            "heritage",
            "identity",
            "community",
        ],
    },

    "Party Goers": {
        interests: [
            "social experiences",
            "nightlife",
        ],
    },

    "Gen Z": {
        interests: [
            "identity",
            "trends",
            "digital culture",
        ],
    },

};

export const CULTURAL_GRAPH = {
    "Success Culture": [
        "Achievement Mindset",
        "Entrepreneurial Culture",
    ],

    "Youth Culture": [
        "Gen Z Identity",
        "Digital Native Culture",
    ],

    "Growth Mindset": [
        "Self Improvement",
        "Continuous Learning",
    ],

    "Creator Economy": [
        "Personal Branding",
        "Content Creation",
    ],

    "Community Identity": [
        "Belonging",
        "Shared Experience",
    ],

    "Memory Culture": [
        "Nostalgia",
        "Reflection",
    ],

    "Lifestyle Culture": [
        "Self Expression",
        "Status Signaling",
    ],
};