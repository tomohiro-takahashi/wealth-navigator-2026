export type SiteTheme = {
    colors: {
        primary: string;
        background: string;
        accent: string;
        text: {
            main: string;
            sub: string;
            inverse: string;
        };
        link: string;
        border: string;
    };
    typography: {
        fontFamily: "serif" | "sans";
        h2: string; // Tailwind class, e.g. "text-4xl font-bold"
    };
    rounded: "none" | "sm" | "md" | "lg" | "2xl";
};

export type SiteHero = {
    title: string;
    subtitle: string;
    primaryButton: {
        text: string;
        url: string;
    };
    secondaryButton: {
        text: string;
        url: string;
    };
    imageQuery?: string;
    heroImage?: string;
};

export type SiteFeature = {
    title: string;
    description: string;
};

export type SitePhilosophy = {
    title: string;
    description: string;
};

export type SiteBridge = {
    title: string;
    description: string;
    buttonText: string;
    url: string;
    image?: string;
};

export type SiteCTA = {
    type: "lead_magnet" | "consultation" | "tool_download" | "line_quiz" | "line_simple";
    title: string;
    description: string;
    buttonText: string;
    assetUrl?: string;
    lineUrl?: string; // or url
    image?: string;
    label?: string;
    url?: string;
};

export type SiteCategory = {
    id: string;
    label: string;
    icon: string; // Material Symbol name
    description?: string;
};

export type SiteConfig = {
    name: string;
    tagline: string;
    description: string;
    email: string;
    site_id: string;
    pinnedSlug: string;
    theme: SiteTheme;
    hero: SiteHero;
    premium: {
        title: string;
        btnText: string;
    };
    features: SiteFeature[];
    philosophy: SitePhilosophy;
    bridge: SiteBridge;
    cta: SiteCTA;
    categoryNav: SiteCategory[];
    filters?: string[]; // article filters
    homepageLayout?: 'list' | 'grid';
};
