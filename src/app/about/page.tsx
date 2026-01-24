import React from 'react';
import { getSiteConfig } from '@/site.config';
import { getBrandId } from '@/lib/brand';
import { AboutFlip } from '@/components/about/AboutFlip';
import { AboutWealth } from '@/components/about/AboutWealth';
import { AboutKominka } from '@/components/about/AboutKominka';
import { AboutLegacy } from '@/components/about/AboutLegacy';
import { AboutSubsidy } from '@/components/about/AboutSubsidy';

export default async function About() {
    const brandId = await getBrandId();
    const siteConfig = await getSiteConfig(brandId);

    // Switch component based on brand for completely unique designs
    switch (brandId) {
        case 'flip':
            return <AboutFlip />;
        case 'kominka':
            return <AboutKominka siteConfig={siteConfig} />;
        case 'legacy':
            return <AboutLegacy siteConfig={siteConfig} />;
        case 'subsidy':
            return <AboutSubsidy siteConfig={siteConfig} />;
        case 'wealth':
        default:
            return <AboutWealth siteConfig={siteConfig} />;
    }
}
