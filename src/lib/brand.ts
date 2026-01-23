import { headers } from 'next/headers';
import { BrandId, DOMAIN_MAP, getBrandIdFromHost } from './brand-utils';

export type { BrandId };
export { DOMAIN_MAP, getBrandIdFromHost };

/**
 * Get the brand ID dynamically.
 * Note: headers() is async in Next.js 15+.
 * This function is SERVER ONLY.
 */
export async function getBrandId(): Promise<BrandId> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    return getBrandIdFromHost(host);
}
