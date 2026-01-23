import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSiteConfig } from '@/site.config';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import { SiteConfig } from "@/types/site";

export function getCategoryLabelSync(category: string, config: SiteConfig): string {
    const found = config.categoryNav.find(c => c.id === category);
    return found ? found.label : category;
}

export async function getCategoryLabel(category: string): Promise<string> {
    const siteConfig = await getSiteConfig();
    return getCategoryLabelSync(category, siteConfig);
}
