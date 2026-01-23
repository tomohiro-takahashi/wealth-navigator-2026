import { SiteConfig } from './types/site';
import { siteConfig as wealth } from './config/sites/wealth';
import { siteConfig as kominka } from './config/sites/kominka';
import { siteConfig as flip } from './config/sites/flip';
import { siteConfig as legacy } from './config/sites/legacy';
import { siteConfig as subsidy } from './config/sites/subsidy';
import { getBrandId, BrandId } from './lib/brand';

const configs: Record<BrandId, SiteConfig> = {
    wealth,
    kominka,
    flip,
    legacy,
    subsidy
};

/**
 * Get the site configuration dynamically based on the current brand.
 * This can only be called in Server Components/Server Actions.
 */
export async function getSiteConfig(brandId?: BrandId): Promise<SiteConfig> {
    const id = brandId || await getBrandId();
    return configs[id] || wealth;
}

// Fallback for non-server contexts or build-time - renamed to prevent static usage
const defaultBrand = (process.env.NEXT_PUBLIC_BRAND as BrandId) || 'wealth';
export const FALLBACK_SITE_CONFIG = configs[defaultBrand] || wealth;
