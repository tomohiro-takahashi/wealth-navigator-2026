import { SiteConfig } from './types/site';
import { siteConfig as wealth } from './config/sites/wealth';
import { siteConfig as kominka } from './config/sites/kominka';
import { siteConfig as flip } from './config/sites/flip';
import { siteConfig as legacy } from './config/sites/legacy';
import { siteConfig as subsidy } from './config/sites/subsidy';

const brand = process.env.NEXT_PUBLIC_BRAND || 'wealth';

const configs: Record<string, SiteConfig> = {
    wealth,
    kominka,
    flip,
    legacy,
    subsidy
};

export const siteConfig = configs[brand] || wealth;
