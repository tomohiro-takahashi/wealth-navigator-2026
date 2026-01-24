export type BrandId = 'wealth' | 'flip' | 'subsidy' | 'kominka' | 'legacy';

export const DOMAIN_MAP: Record<string, BrandId> = {
    'wealth-navigator.com': 'wealth',
    'flip-logic.jp': 'flip',
    'subsidy-nav.jp': 'subsidy',
    'kominka.jp': 'kominka',
    'legacy-guard.jp': 'legacy',
    // Vercel Preview & Local Development
    'wealth-navigator-2026.vercel.app': 'wealth',
    'localhost': 'subsidy',
};

export function getBrandIdFromHost(host: string | null): BrandId {
    // Check for environment variable override (critical for local dev and specific builds)
    const envBrand = process.env.NEXT_PUBLIC_BRAND as BrandId;
    if (envBrand && ['wealth', 'flip', 'subsidy', 'kominka', 'legacy'].includes(envBrand)) {
        return envBrand;
    }

    if (!host) return 'wealth';
    
    // Remove port if present (e.g., localhost:3000 -> localhost)
    const hostname = host.split(':')[0];
    
    if (DOMAIN_MAP[hostname]) return DOMAIN_MAP[hostname];
    if (DOMAIN_MAP[host]) return DOMAIN_MAP[host]; 
    
    // Check for subdomains or specific strings in host
    if (host.includes('flip')) return 'flip';
    if (host.includes('subsidy')) return 'subsidy';
    if (host.includes('kominka')) return 'kominka';
    if (host.includes('legacy')) return 'legacy';
    
    return 'wealth';
}
