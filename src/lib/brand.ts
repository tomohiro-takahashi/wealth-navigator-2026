import { headers } from 'next/headers';

export type BrandId = 'wealth' | 'flip' | 'subsidy' | 'kominka' | 'legacy';

export const DOMAIN_MAP: Record<string, BrandId> = {
    'wealth-navigator.com': 'wealth',
    'flip-logic.jp': 'flip',
    'subsidy-nav.jp': 'subsidy',
    'kominka.jp': 'kominka',
    'legacy-guard.jp': 'legacy',
    // Vercel Preview & Local Development
    'wealth-navigator-2026.vercel.app': 'wealth',
    'localhost': 'wealth',
};

/**
 * Get the brand ID dynamically.
 * Note: headers() is async in Next.js 15+.
 */
export async function getBrandId(): Promise<BrandId> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    // Check for exact matches
    if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];

    // Check for subdomains (e.g., *.vercel.app)
    if (host.includes('flip')) return 'flip';
    if (host.includes('subsidy')) return 'subsidy';
    if (host.includes('kominka')) return 'kominka';
    if (host.includes('legacy')) return 'legacy';
    
    // Default fallback via ENV or wealth
    return (process.env.NEXT_PUBLIC_BRAND as BrandId) || 'wealth';
}

export function getBrandIdFromHost(host: string | null): BrandId {
    if (!host) return 'wealth';
    
    if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];
    if (host.includes('flip')) return 'flip';
    if (host.includes('subsidy')) return 'subsidy';
    if (host.includes('kominka')) return 'kominka';
    if (host.includes('legacy')) return 'legacy';
    
    return 'wealth';
}
