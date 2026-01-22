import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "空き家錬金術",
    tagline: "放置された空き家を、年間利回り15%の資産に変える。",
    description: "眠れる古民家に、新たな命と価値を。夢を語れる建築家と、数字に厳しい投資家の視点を融合した、古民家再生投資の決定版。",

    theme: {
        colors: {
            primary: "#1a1a1a",
            background: "#191919",
            accent: "#A68A56",
            text: {
                main: "#FFFFFF",
                sub: "#A68A56",
                inverse: "#1a1a1a"
            },
            link: "#A68A56",
            border: "#2D3222"
        },

        typography: {
            fontFamily: "serif",
            h2: "text-4xl md:text-5xl font-bold italic serif-heading text-[#A68A56]"
        },

        rounded: "lg"
    },

    hero: {
        title: "Preserving Heritage, Engineering Value",
        subtitle: "Transforming centuries-old Japanese timber estates into high-yield, luxury architectural masterpieces for global investors.",
        heroImage: "/assets/hero-kominka.jpg",
        primaryButton: {
            text: "Explore Investments",
            url: "/simulation"
        },
        secondaryButton: {
            text: "The Process",
            url: "/about"
        }
    },

    premium: {
        title: "Featured Transformations",
        btnText: "View Full Portfolio"
    },

    features: [
        {
            title: "Traditional Craft x Modern Alchemy",
            description: "We breathe new life into aged wood and thatch, respecting the soul of the original structure while integrating 21st-century luxury."
        },
        {
            title: "Investment Rating A+",
            description: "Total Asset Value $450M. Seismic retrofitting & thermal efficiency combined with high-yield rental strategies."
        },
        {
            title: "Across 12 Prefectures",
            description: "Kyoto, Nagano, Kanazawa. Over 120 properties successfully renovated and occupied."
        }
    ],

    philosophy: {
        title: "古き良きものに、新しい価値を。",
        description: "ただの古い家ではない。それは地域の歴史であり、文化である。適切なリノベーションと戦略があれば、それは高い利回りを生む最強の資産に変わる。"
    },

    bridge: {
        title: "The Alchemy of Traditional Craft",
        description: "We breathe new life into aged wood and thatch, creating architectural masterpieces that stand the test of time.",
        buttonText: "Request Private Access",
        url: "/inquiry"
    },

    cta: {
        type: "lead_magnet",
        title: "Invest in the Future of Japanese Heritage",
        description: "Join an exclusive group of investors redefining the landscape of high-end real estate in Japan.",
        buttonText: "Request Private Access",
        url: "#"
    },

    categoryNav: [
        { id: "heritage", label: "Heritage", icon: "history" },
        { id: "process", label: "Process", icon: "architecture" },
        { id: "portfolio", label: "Portfolio", icon: "collections" }
    ]
};
