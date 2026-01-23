import { getSiteConfig } from '@/site.config';
import { getCategoryLabelSync } from './utils';

/**
 * Get the category label for the current site configuration.
 * This is a SERVER ONLY utility because it uses getSiteConfig().
 */
export async function getCategoryLabel(category: string): Promise<string> {
    const siteConfig = await getSiteConfig();
    return getCategoryLabelSync(category, siteConfig);
}
