import dna from './dna.config.json';

export const siteConfig = {
    name: process.env.NEXT_PUBLIC_SITE_NAME || dna.identity.name,
    description: dna.identity.description,
    url: process.env.NEXT_PUBLIC_BASE_URL || `https://${dna.identity.domain}`,
    domain: dna.identity.domain,
    email: dna.identity.email,
    author: dna.identity.author,
    social: {
        line: process.env.NEXT_PUBLIC_LINE_URL || dna.identity.social.line,
    },
    theme: {
        primaryColor: dna.theme.primaryColor,
        accentColor: dna.theme.accentColor,
    }
};
